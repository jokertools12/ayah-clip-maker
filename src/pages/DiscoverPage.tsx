import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Compass, Heart, Share2, Video, Mic, BookOpen, Loader2, Clock,
} from 'lucide-react';
import { toast } from 'sonner';

interface PublicVideo {
  id: string;
  surah_name: string;
  surah_number: number;
  start_ayah: number;
  end_ayah: number;
  reciter_name: string;
  background_type: string;
  aspect_ratio: string;
  created_at: string;
  user_id: string;
  likes_count: number;
  is_liked: boolean;
}

export default function DiscoverPage() {
  const { user, isAuthenticated } = useAuth();
  const [videos, setVideos] = useState<PublicVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');

  const fetchVideos = async () => {
    setLoading(true);

    const { data: publicVideos } = await supabase
      .from('saved_videos')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!publicVideos || publicVideos.length === 0) {
      setVideos([]);
      setLoading(false);
      return;
    }

    const videoIds = publicVideos.map(v => v.id);

    // Fetch like counts
    const { data: likesData } = await supabase
      .from('video_likes')
      .select('video_id')
      .in('video_id', videoIds);

    const likeCounts: Record<string, number> = {};
    (likesData || []).forEach((l: any) => {
      likeCounts[l.video_id] = (likeCounts[l.video_id] || 0) + 1;
    });

    // Fetch user's likes
    let userLikes = new Set<string>();
    if (user) {
      const { data: myLikes } = await supabase
        .from('video_likes')
        .select('video_id')
        .eq('user_id', user.id)
        .in('video_id', videoIds);
      userLikes = new Set((myLikes || []).map((l: any) => l.video_id));
    }

    const mapped: PublicVideo[] = publicVideos.map(v => ({
      ...v,
      likes_count: likeCounts[v.id] || 0,
      is_liked: userLikes.has(v.id),
    }));

    if (sortBy === 'popular') {
      mapped.sort((a, b) => b.likes_count - a.likes_count);
    }

    setVideos(mapped);
    setLoading(false);
  };

  useEffect(() => { fetchVideos(); }, [user, sortBy]);

  const toggleLike = async (videoId: string) => {
    if (!isAuthenticated || !user) {
      toast.error('سجل دخول أولاً للإعجاب');
      return;
    }

    const video = videos.find(v => v.id === videoId);
    if (!video) return;

    if (video.is_liked) {
      await supabase.from('video_likes').delete().eq('user_id', user.id).eq('video_id', videoId);
      setVideos(prev => prev.map(v => v.id === videoId ? { ...v, is_liked: false, likes_count: v.likes_count - 1 } : v));
    } else {
      await supabase.from('video_likes').insert({ user_id: user.id, video_id: videoId });
      setVideos(prev => prev.map(v => v.id === videoId ? { ...v, is_liked: true, likes_count: v.likes_count + 1 } : v));
    }
  };

  const shareVideo = (video: PublicVideo) => {
    const text = `🎬 ${video.surah_name} | القارئ: ${video.reciter_name} | آيات ${video.start_ayah}-${video.end_ayah}`;
    if (navigator.share) {
      navigator.share({ title: 'قرآن ريلز', text, url: window.location.origin });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('تم نسخ معلومات الفيديو');
    }
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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Compass className="h-8 w-8 text-primary" />
            اكتشف
          </h1>
          <p className="text-muted-foreground mt-1">استعرض أحدث وأشهر الفيديوهات من المجتمع</p>
        </motion.div>

        {/* Sort Buttons */}
        <div className="flex gap-2 mb-6">
          <Button size="sm" variant={sortBy === 'latest' ? 'default' : 'outline'} onClick={() => setSortBy('latest')} className="gap-1">
            <Clock className="h-4 w-4" />
            الأحدث
          </Button>
          <Button size="sm" variant={sortBy === 'popular' ? 'default' : 'outline'} onClick={() => setSortBy('popular')} className="gap-1">
            <Heart className="h-4 w-4" />
            الأكثر إعجاباً
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : videos.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">لا توجد فيديوهات عامة بعد</p>
              <p className="text-sm text-muted-foreground">كن أول من يشارك فيديو مع المجتمع!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video, i) => (
              <motion.div key={video.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Video Header */}
                  <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-6 text-center">
                    <BookOpen className="h-10 w-10 text-primary mx-auto mb-2" />
                    <h3 className="font-bold text-lg">{video.surah_name}</h3>
                    <p className="text-sm text-muted-foreground">آية {video.start_ayah} - {video.end_ayah}</p>
                  </div>

                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Mic className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{video.reciter_name}</span>
                    </div>

                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <Badge variant="secondary" className="text-xs">{video.aspect_ratio}</Badge>
                      <Badge variant="outline" className="text-xs">{video.background_type}</Badge>
                    </div>

                    <p className="text-xs text-muted-foreground mb-4">{timeAgo(video.created_at)}</p>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={video.is_liked ? 'default' : 'outline'}
                        onClick={() => toggleLike(video.id)}
                        className="gap-1 flex-1"
                      >
                        <Heart className={`h-4 w-4 ${video.is_liked ? 'fill-current' : ''}`} />
                        {video.likes_count}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => shareVideo(video)} className="gap-1">
                        <Share2 className="h-4 w-4" />
                      </Button>
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
