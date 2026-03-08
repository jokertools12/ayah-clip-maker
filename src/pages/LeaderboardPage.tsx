import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Trophy, Medal, Star, Video, Crown, Loader2, User,
} from 'lucide-react';

interface LeaderboardEntry {
  user_id: string;
  display_name: string | null;
  points: number;
  achievement_count: number;
  video_count: number;
  rank: number;
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'points' | 'videos'>('points');

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      // Fetch all user achievements with points
      const { data: allUserAch } = await supabase
        .from('user_achievements')
        .select('user_id, achievement_id');

      const { data: allAch } = await supabase
        .from('achievements')
        .select('id, points');

      // Fetch video counts per user (public videos only for privacy)
      const { data: publicVideos } = await supabase
        .from('saved_videos')
        .select('user_id')
        .eq('is_public', true);

      // Fetch profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name');

      // Build points map
      const achPointsMap: Record<string, number> = {};
      (allAch || []).forEach((a: any) => { achPointsMap[a.id] = a.points; });

      const userPointsMap: Record<string, { points: number; achCount: number }> = {};
      (allUserAch || []).forEach((ua: any) => {
        if (!userPointsMap[ua.user_id]) userPointsMap[ua.user_id] = { points: 0, achCount: 0 };
        userPointsMap[ua.user_id].points += achPointsMap[ua.achievement_id] || 0;
        userPointsMap[ua.user_id].achCount += 1;
      });

      // Video counts
      const videoCountMap: Record<string, number> = {};
      (publicVideos || []).forEach((v: any) => {
        videoCountMap[v.user_id] = (videoCountMap[v.user_id] || 0) + 1;
      });

      // Profile map
      const profileMap: Record<string, string | null> = {};
      (profiles || []).forEach((p: any) => { profileMap[p.user_id] = p.display_name; });

      // Combine all user IDs
      const allUserIds = new Set([
        ...Object.keys(userPointsMap),
        ...Object.keys(videoCountMap),
      ]);

      const list: LeaderboardEntry[] = [...allUserIds].map(uid => ({
        user_id: uid,
        display_name: profileMap[uid] || null,
        points: userPointsMap[uid]?.points || 0,
        achievement_count: userPointsMap[uid]?.achCount || 0,
        video_count: videoCountMap[uid] || 0,
        rank: 0,
      }));

      // Sort
      if (tab === 'points') {
        list.sort((a, b) => b.points - a.points);
      } else {
        list.sort((a, b) => b.video_count - a.video_count);
      }

      list.forEach((e, i) => { e.rank = i + 1; });

      setEntries(list.slice(0, 50));
      setLoading(false);
    };
    load();
  }, [tab]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-700" />;
    return <span className="text-sm font-bold text-muted-foreground w-6 text-center">{rank}</span>;
  };

  const myRank = entries.find(e => e.user_id === user?.id);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Trophy className="h-8 w-8 text-primary" />
            لوحة المتصدرين
          </h1>
          <p className="text-muted-foreground mt-1">أكثر المستخدمين نشاطاً وإنجازات</p>
        </motion.div>

        {/* My Rank Card */}
        {myRank && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="mb-6 border-primary/30 bg-primary/5">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold">ترتيبك الحالي</p>
                    <p className="text-sm text-muted-foreground">
                      #{myRank.rank} • {myRank.points} نقطة • {myRank.achievement_count} إنجاز
                    </p>
                  </div>
                </div>
                {getRankIcon(myRank.rank)}
              </CardContent>
            </Card>
          </motion.div>
        )}

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="points" className="gap-1">
              <Star className="h-4 w-4" />
              بالنقاط
            </TabsTrigger>
            <TabsTrigger value="videos" className="gap-1">
              <Video className="h-4 w-4" />
              بالفيديوهات
            </TabsTrigger>
          </TabsList>

          <TabsContent value={tab}>
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : entries.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center text-muted-foreground">
                  لا توجد بيانات بعد. كن أول من يحصل على إنجاز!
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {entries.map((entry, i) => {
                  const isMe = entry.user_id === user?.id;
                  return (
                    <motion.div key={entry.user_id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                      <Card className={`${isMe ? 'border-primary/50 bg-primary/5' : ''} ${entry.rank <= 3 ? 'shadow-md' : ''}`}>
                        <CardContent className="p-3 flex items-center gap-3">
                          <div className="w-8 flex justify-center shrink-0">
                            {getRankIcon(entry.rank)}
                          </div>
                          <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              <Link to={`/profile?id=${entry.user_id}`} className="hover:text-primary transition-colors">
                                {entry.display_name || 'مستخدم'}
                              </Link>
                              {isMe && <Badge variant="secondary" className="mr-2 text-xs">أنت</Badge>}
                            </p>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {entry.achievement_count} إنجاز • {entry.video_count} فيديو عام
                            </p>
                          </div>
                          <div className="text-left shrink-0">
                            <p className="font-bold text-primary">{tab === 'points' ? entry.points : entry.video_count}</p>
                            <p className="text-xs text-muted-foreground">{tab === 'points' ? 'نقطة' : 'فيديو'}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
