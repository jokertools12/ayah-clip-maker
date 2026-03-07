import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const checkedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Don't do anything while auth is still loading
    if (authLoading) {
      setLoading(true);
      return;
    }

    // No user = not admin
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    // Already checked this user
    if (checkedUserId === user.id) return;

    let cancelled = false;
    setLoading(true);
    
    const checkAdmin = async () => {
      try {
        const { data } = await supabase
          .rpc('has_role', { _user_id: user.id, _role: 'admin' });

        if (!cancelled) {
          setIsAdmin(data === true);
          setCheckedUserId(user.id);
          setLoading(false);
        }
      } catch (e) {
        console.error('Admin check error:', e);
        if (!cancelled) { setIsAdmin(false); setLoading(false); }
      }
    };
    checkAdmin();
    
    return () => { cancelled = true; };
  }, [user, authLoading, checkedUserId]);

  const fetchPaymentRequests = useCallback(async (status?: string) => {
    let query = supabase.from('payment_requests').select('*').order('created_at', { ascending: false });
    if (status && status !== 'all') query = query.eq('status', status);
    const { data, error } = await query;
    return { data: data || [], error };
  }, []);

  const approvePayment = useCallback(async (requestId: string, userId: string, plan: string) => {
    // Update payment request
    await supabase
      .from('payment_requests')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', requestId);

    // Calculate expiry
    const now = new Date();
    const expiresAt = new Date(now);
    if (plan === 'yearly') expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    else expiresAt.setMonth(expiresAt.getMonth() + 1);

    // Deactivate old subscriptions
    await supabase
      .from('subscriptions')
      .update({ status: 'expired' })
      .eq('user_id', userId)
      .eq('status', 'active');

    // Create new subscription
    await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan: plan as any,
        status: 'active',
        starts_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      });

    // Send email notification
    try {
      await supabase.functions.invoke('notify-subscription', {
        body: { userId, status: 'approved', plan },
      });
    } catch (e) {
      console.error('Failed to send notification:', e);
    }

    return { success: true };
  }, []);

  const rejectPayment = useCallback(async (requestId: string, note?: string) => {
    const { data: reqData } = await supabase
      .from('payment_requests')
      .select('user_id, plan')
      .eq('id', requestId)
      .single();

    await supabase
      .from('payment_requests')
      .update({ status: 'rejected', admin_note: note || 'تم الرفض', updated_at: new Date().toISOString() })
      .eq('id', requestId);

    // Send email notification
    if (reqData) {
      try {
        await supabase.functions.invoke('notify-subscription', {
          body: { userId: reqData.user_id, status: 'rejected', plan: reqData.plan, adminNote: note || 'تم الرفض' },
        });
      } catch (e) {
        console.error('Failed to send notification:', e);
      }
    }

    return { success: true };
  }, []);

  const fetchAllUsers = useCallback(async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    return data || [];
  }, []);

  const fetchStats = useCallback(async () => {
    const [{ count: totalUsers }, { count: totalVideos }, { data: subs }, { data: pendingReqs }] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('saved_videos').select('*', { count: 'exact', head: true }),
      supabase.from('subscriptions').select('plan').eq('status', 'active'),
      supabase.from('payment_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    ]);

    const premiumCount = subs?.filter((s: any) => s.plan !== 'free').length || 0;

    return {
      totalUsers: totalUsers || 0,
      totalVideos: totalVideos || 0,
      premiumUsers: premiumCount,
      pendingRequests: pendingReqs?.length || 0,
    };
  }, []);

  return { isAdmin, loading, fetchPaymentRequests, approvePayment, rejectPayment, fetchAllUsers, fetchStats };
}
