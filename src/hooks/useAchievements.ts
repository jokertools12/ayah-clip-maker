import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { triggerAchievementNotification } from '@/components/AchievementUnlockNotification';

interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  threshold: number;
  points: number;
}

interface UserAchievement {
  achievement_id: string;
  unlocked_at: string;
}

export function useAchievements() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlocked, setUnlocked] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  const totalPoints = unlocked.reduce((sum, ua) => {
    const a = achievements.find(x => x.id === ua.achievement_id);
    return sum + (a?.points || 0);
  }, 0);

  const fetchAll = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const [{ data: allAch }, { data: userAch }] = await Promise.all([
      supabase.from('achievements').select('*').order('threshold'),
      supabase.from('user_achievements').select('achievement_id, unlocked_at').eq('user_id', user.id),
    ]);
    setAchievements((allAch as Achievement[]) || []);
    setUnlocked((userAch as UserAchievement[]) || []);
    setLoading(false);
  }, [user]);

  const checkAndUnlock = useCallback(async () => {
    if (!user) return;

    // Fetch current stats
    const [{ count: videoCount }, { count: favCount }, { data: videos }] = await Promise.all([
      supabase.from('saved_videos').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('favorite_surahs').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('saved_videos').select('reciter_name, surah_name').eq('user_id', user.id),
    ]);

    const uniqueReciters = new Set((videos || []).map((v: any) => v.reciter_name)).size;
    const uniqueSurahs = new Set((videos || []).map((v: any) => v.surah_name)).size;

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    // Also count from daily_video_usage for total created videos (not just saved)
    const { data: usageData } = await supabase
      .from('daily_video_usage')
      .select('count')
      .eq('user_id', user.id);
    const totalCreated = (usageData || []).reduce((s: number, r: any) => s + (r.count || 0), 0);

    // Use max of saved and usage-tracked counts
    const effectiveVideoCount = Math.max(videoCount || 0, totalCreated);

    const statsMap: Record<string, number> = {
      first_video: effectiveVideoCount,
      five_videos: effectiveVideoCount,
      twenty_videos: effectiveVideoCount,
      fifty_videos: effectiveVideoCount,
      hundred_videos: effectiveVideoCount,
      first_favorite: favCount || 0,
      five_favorites: favCount || 0,
      five_reciters: uniqueReciters,
      ten_surahs: uniqueSurahs,
      premium_member: (sub as any)?.plan && (sub as any).plan !== 'free' ? 1 : 0,
    };

    // Check each achievement
    for (const ach of achievements) {
      const alreadyUnlocked = unlocked.some(u => u.achievement_id === ach.id);
      if (alreadyUnlocked) continue;

      const currentValue = statsMap[ach.key] ?? 0;
      if (currentValue >= ach.threshold) {
        const { error } = await supabase
          .from('user_achievements')
          .insert({ user_id: user.id, achievement_id: ach.id });

        if (!error) {
          // Trigger animated notification
          triggerAchievementNotification({
            id: ach.id,
            title: ach.title,
            description: ach.description,
            points: ach.points,
          });
          setUnlocked(prev => [...prev, { achievement_id: ach.id, unlocked_at: new Date().toISOString() }]);
        }
      }
    }
  }, [user, achievements, unlocked]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return { achievements, unlocked, totalPoints, loading, checkAndUnlock, refetch: fetchAll };
}
