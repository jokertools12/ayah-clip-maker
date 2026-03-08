import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type PlanType = 'free' | 'monthly' | 'yearly';

export interface Subscription {
  id: string;
  user_id: string;
  plan: PlanType;
  status: string;
  starts_at: string;
  expires_at: string | null;
  created_at: string;
}

export interface DailyUsage {
  count: number;
  limit: number;
}

// Premium features list
export const PREMIUM_FEATURES = {
  pexelsVideos: true,
  slideshowBackgrounds: true,
  premiumFonts: true,
  audioFingerprint: true,
  advancedExport: true,
  customWatermark: true,
  motionSpeed: true,
  presets: true,
} as const;

export const FREE_FONTS = [
  '"Noto Naskh Arabic", serif',
  '"Amiri", serif',
  '"Cairo", sans-serif',
];

export function useSubscription() {
  const { user, isAuthenticated } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [dailyUsage, setDailyUsage] = useState<DailyUsage>({ count: 0, limit: 3 });

  const isPremium = subscription?.plan === 'monthly' || subscription?.plan === 'yearly';
  const videoLimit = isPremium ? 100 : 3;

  const fetchSubscription = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setSubscription(data as unknown as Subscription);
    }
    setLoading(false);
  }, [user]);

  const fetchDailyUsage = useCallback(async () => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    
    const { data } = await supabase
      .from('daily_video_usage')
      .select('count')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();

    setDailyUsage({
      count: (data as any)?.count || 0,
      limit: videoLimit,
    });
  }, [user, videoLimit]);

  const incrementUsage = useCallback(async () => {
    if (!user) return false;
    const today = new Date().toISOString().split('T')[0];
    
    // Re-fetch from DB to get the REAL current count (avoid stale state)
    const { data: freshUsage } = await supabase
      .from('daily_video_usage')
      .select('id, count')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();

    const currentCount = (freshUsage as any)?.count || 0;

    // Enforce limit strictly
    if (currentCount >= videoLimit) {
      // Update local state to reflect reality
      setDailyUsage({ count: currentCount, limit: videoLimit });
      return false;
    }

    if (freshUsage) {
      await supabase
        .from('daily_video_usage')
        .update({ count: currentCount + 1 })
        .eq('id', (freshUsage as any).id);
    } else {
      await supabase
        .from('daily_video_usage')
        .insert({ user_id: user.id, date: today, count: 1 });
    }

    setDailyUsage({ count: currentCount + 1, limit: videoLimit });
    return true;
  }, [user, videoLimit]);

  const canUseFeature = useCallback((feature: keyof typeof PREMIUM_FEATURES): boolean => {
    if (!PREMIUM_FEATURES[feature]) return true;
    return isPremium;
  }, [isPremium]);

  const isFreeFont = useCallback((fontFamily: string): boolean => {
    return FREE_FONTS.includes(fontFamily);
  }, []);

  useEffect(() => {
    fetchSubscription();
    fetchDailyUsage();
  }, [fetchSubscription, fetchDailyUsage]);

  return {
    subscription,
    loading,
    isPremium,
    dailyUsage,
    videoLimit,
    incrementUsage,
    canUseFeature,
    isFreeFont,
    refetch: fetchSubscription,
  };
}
