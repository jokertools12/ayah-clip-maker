import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Activity, Video, Trophy, User, Loader2, Users, Clock,
  Heart, MessageCircle, BookOpen,
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'video' | 'achievement' | 'follow';
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  data: any;
}

export default function ActivityFeedPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    loadActivities();
  }, [user]);

  const loadActivities = async () => {
    if (!user) return;
    setLoading(true);

    // Get users I follow
    const { data: followsData } = await supabase
      .from('user_follows')
      .select('following_id')
      .eq('follower_id', user.id);

    const followingIds = (followsData || []).map((f: any) => f.following_id);
    setFollowingCount(followingIds.length);

    if (followingIds.length === 0) {
      setActivities([]);
      setLoading(false);
      return;
    }

    // Fetch recent videos from followed users
    const { data: videosData } = await supabase
      .from('saved_videos')
      .select('id, surah_name, surah_number, reciter_name, created_at, user_id, start_ayah, end_ayah')
      .in('user_id', followingIds)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(20);

    // Fetch recent achievements from followed users
    const { data: achievementsData } = await supabase
      .from('user_achievements')
      .select('id, achievement_id, unlocked_at, user_id')
      .in('user_id', followingIds)
      .order('unlocked_at', { ascending: false })
      .limit(10);

    // Get achievement details
    const achievementIds = [...new Set((achievementsData || []).map((a: any) => a.achievement_id))];
    const { data: achievementDetails } = achievementIds.length > 0
      ? await supabase.from('achievements').select('id, title, icon').in('id', achievementIds)
      : { data: [] };

    const achievementMap: Record<string, any> = {};
    (achievementDetails || []).forEach((a: any) => { achievementMap[a.id] = a; });

    // Get profiles
    const userIds = [...new Set([
      ...(videosData || []).map((v: any) => v.user_id),
      ...(achievementsData || []).map((a: any) => a.user_id),
    ])];

    const { data: profilesData } = userIds.length > 0
      ? await supabase.from('profiles').select('user_id, display_name, avatar_url').in('user_id', userIds)
      : { data: [] };

    const profileMap: Record<string, any> = {};
    (profilesData || []).forEach((p: any) => { profileMap[p.user_id] = p; });

    // Build activity items
    const items: ActivityItem[] = [];

    (videosData || []).forEach((v: any) => {
      const profile = profileMap[v.user_id] || {};
      items.push({
        id: `video-${v.id}`,
        type: 'video',
        user_id: v.user_id,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        created_at: v.created_at,
        data: { surah_name: v.surah_name, reciter_name: v.reciter_name, start_ayah: v.start_ayah, end_ayah: v.end_ayah },
      });
    });

    (achievementsData || []).forEach((a: any) => {
      const profile = profileMap[a.user_id] || {};
      const achievement = achievementMap[a.achievement_id] || {};
      items.push({
        id: `achievement-${a.id}`,
        type: 'achievement',
        user_id: a.user_id,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        created_at: a.unlocked_at,
        data: { title: achievement.title, icon: achievement.icon },
      });
    });

    // Sort by date
    items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setActivities(items.slice(0, 30));
    setLoading(false);
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `منذ ${mins} دقيقة`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `منذ ${days} يوم`;
    return `منذ ${Math.floor(days / 30)} شهر`;
  };

  if (authLoading || loading) {
    return <Layout><div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;
  }
  if (!isAuthenticated) return <Navigate to="/auth" replace />;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" />
            نشاط المتابَعين
          </h1>
          <p className="text-muted-foreground mt-1">
            آخر نشاطات {followingCount} مستخدم تتابعهم
          </p>
        </motion.div>

        {followingCount === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">لم تتابع أحداً بعد</p>
              <p className="text-sm text-muted-foreground mb-4">تابع مستخدمين آخرين لرؤية نشاطاتهم هنا</p>
              <Button asChild>
                <Link to="/discover">اكتشف المستخدمين</Link>
              </Button>
            </CardContent>
          </Card>
        ) : activities.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">لا توجد نشاطات حديثة</p>
              <p className="text-sm text-muted-foreground">سيظهر هنا نشاط المستخدمين الذين تتابعهم</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {activities.map((activity, i) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <Link to={`/profile?id=${activity.user_id}`}>
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                          {activity.avatar_url ? (
                            <img src={activity.avatar_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <User className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </Link>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link to={`/profile?id=${activity.user_id}`} className="font-medium hover:text-primary transition-colors">
                            {activity.display_name || 'مستخدم'}
                          </Link>
                          {activity.type === 'video' && (
                            <Badge variant="secondary" className="gap-1 text-xs">
                              <Video className="h-3 w-3" />
                              فيديو جديد
                            </Badge>
                          )}
                          {activity.type === 'achievement' && (
                            <Badge className="gap-1 text-xs bg-amber-500 hover:bg-amber-600">
                              <Trophy className="h-3 w-3" />
                              إنجاز
                            </Badge>
                          )}
                        </div>

                        {activity.type === 'video' && (
                          <p className="text-sm text-muted-foreground mt-1">
                            أنشأ فيديو لسورة <span className="text-foreground font-medium">{activity.data.surah_name}</span>
                            {' '}بصوت <span className="text-foreground">{activity.data.reciter_name}</span>
                            {' '}(آية {activity.data.start_ayah}-{activity.data.end_ayah})
                          </p>
                        )}

                        {activity.type === 'achievement' && (
                          <p className="text-sm text-muted-foreground mt-1">
                            حصل على إنجاز: <span className="text-foreground font-medium">{activity.data.title}</span>
                          </p>
                        )}

                        <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {timeAgo(activity.created_at)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
