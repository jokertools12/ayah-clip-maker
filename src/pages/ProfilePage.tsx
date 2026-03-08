import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  User, Trophy, Video, Star, BookOpen, Mic, Share2, Loader2, UserPlus, UserCheck, Users,
} from 'lucide-react';
import { toast } from 'sonner';

interface ProfileData {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

interface PublicVideo {
  id: string;
  surah_name: string;
  reciter_name: string;
  start_ayah: number;
  end_ayah: number;
  created_at: string;
}

interface AchievementData {
  id: string;
  title: string;
  points: number;
}

export default function ProfilePage() {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('id');
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [videos, setVideos] = useState<PublicVideo[]>([]);
  const [achievements, setAchievements] = useState<AchievementData[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      setLoading(true);
      const [{ data: profileData }, { data: videosData }, { data: userAch }, { data: allAch }] = await Promise.all([
        supabase.from('profiles').select('user_id, display_name, avatar_url, bio, created_at').eq('user_id', userId).maybeSingle(),
        supabase.from('saved_videos').select('id, surah_name, reciter_name, start_ayah, end_ayah, created_at').eq('user_id', userId).eq('is_public', true).order('created_at', { ascending: false }).limit(20),
        supabase.from('user_achievements').select('achievement_id').eq('user_id', userId),
        supabase.from('achievements').select('id, title, points'),
      ]);

      setProfile(profileData as ProfileData | null);
      setVideos((videosData || []) as PublicVideo[]);

      const achMap = new Map((allAch || []).map((a: any) => [a.id, a]));
      const mapped = (userAch || []).map((ua: any) => achMap.get(ua.achievement_id)).filter(Boolean) as AchievementData[];
      setAchievements(mapped);
      setTotalPoints(mapped.reduce((s, a) => s + a.points, 0));
      setLoading(false);
    };
    load();
  }, [userId]);

  const shareProfile = () => {
    const url = `${window.location.origin}/profile?id=${userId}`;
    if (navigator.share) {
      navigator.share({ title: profile?.display_name || 'ملف شخصي', url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success('تم نسخ رابط الملف الشخصي');
    }
  };

  if (loading) {
    return <Layout><div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;
  }

  if (!profile) {
    return <Layout><div className="flex justify-center items-center min-h-[60vh] text-muted-foreground">لم يتم العثور على الملف الشخصي</div></Layout>;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Profile Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="mb-8 overflow-hidden">
            <div className="bg-gradient-to-br from-primary/20 to-accent/10 p-8 text-center">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 border-4 border-background shadow-lg overflow-hidden">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-10 w-10 text-muted-foreground" />
                )}
              </div>
              <h1 className="text-2xl font-bold">{profile.display_name || 'مستخدم'}</h1>
              {profile.bio && <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">{profile.bio}</p>}
              <p className="text-xs text-muted-foreground mt-1">
                انضم {new Date(profile.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' })}
              </p>

              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{totalPoints}</p>
                  <p className="text-xs text-muted-foreground">نقطة</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{achievements.length}</p>
                  <p className="text-xs text-muted-foreground">إنجاز</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{videos.length}</p>
                  <p className="text-xs text-muted-foreground">فيديو عام</p>
                </div>
              </div>

              <Button size="sm" variant="outline" onClick={shareProfile} className="mt-4 gap-1">
                <Share2 className="h-4 w-4" />
                مشاركة
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Achievements */}
        {achievements.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              الإنجازات ({achievements.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {achievements.map(ach => (
                <Badge key={ach.id} variant="secondary" className="gap-1 px-3 py-1.5">
                  <Star className="h-3 w-3 text-primary" />
                  {ach.title}
                </Badge>
              ))}
            </div>
          </motion.div>
        )}

        {/* Public Videos */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            الفيديوهات العامة ({videos.length})
          </h2>
          {videos.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                لا توجد فيديوهات عامة
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {videos.map(v => (
                <Card key={v.id} className="overflow-hidden">
                  <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-4 text-center">
                    <BookOpen className="h-8 w-8 text-primary mx-auto mb-1" />
                    <h3 className="font-bold">{v.surah_name}</h3>
                    <p className="text-xs text-muted-foreground">آية {v.start_ayah} - {v.end_ayah}</p>
                  </div>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Mic className="h-3.5 w-3.5" />
                      <span>{v.reciter_name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(v.created_at).toLocaleDateString('ar-EG')}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
