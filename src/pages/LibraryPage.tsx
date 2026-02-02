import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Video, 
  Trash2, 
  Play, 
  Calendar,
  Loader2,
  Library as LibraryIcon,
  Plus,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';

interface SavedVideo {
  id: string;
  surah_name: string;
  surah_number: number;
  reciter_id: string;
  reciter_name: string;
  start_ayah: number;
  end_ayah: number;
  aspect_ratio: string;
  background_type: string;
  created_at: string;
  video_url?: string;
  thumbnail_url?: string;
}

export default function LibraryPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [videos, setVideos] = useState<SavedVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth');
      return;
    }

    const fetchVideos = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('saved_videos')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setVideos(data || []);
      } catch (err) {
        console.error('Error fetching videos:', err);
        toast.error('حدث خطأ في تحميل الفيديوهات');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user) {
      fetchVideos();
    }
  }, [isAuthenticated, authLoading, navigate, user]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_videos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setVideos((prev) => prev.filter((v) => v.id !== id));
      toast.success('تم حذف الفيديو');
    } catch (err) {
      console.error('Error deleting video:', err);
      toast.error('حدث خطأ في حذف الفيديو');
    }
  };

  // Open the saved video in preview page to regenerate
  const handleOpenInPreview = (video: SavedVideo) => {
    const params = new URLSearchParams({
      surah: video.surah_number.toString(),
      reciter: video.reciter_id,
      start: video.start_ayah.toString(),
      end: video.end_ayah.toString(),
      backgroundType: video.background_type,
      ratio: video.aspect_ratio,
    });
    
    navigate(`/preview?${params.toString()}`);
  };

  // Re-create the video (open in preview)
  const handleRecreate = (video: SavedVideo) => {
    toast.info('جاري فتح المعاينة لإعادة إنشاء الفيديو...');
    handleOpenInPreview(video);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
              <LibraryIcon className="h-8 w-8 text-primary" />
              مكتبتي
            </h1>
            <p className="text-muted-foreground">
              {videos.length} فيديو محفوظ
            </p>
          </div>

          <Button asChild>
            <Link to="/create" className="gap-2">
              <Plus className="h-4 w-4" />
              إنشاء فيديو جديد
            </Link>
          </Button>
        </motion.div>

        {/* Videos Grid */}
        {videos.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {videos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-quran-gold/20">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-2xl font-bold font-quran">{video.surah_name}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {video.reciter_name}
                        </p>
                      </div>
                    </div>
                    <div className="absolute top-2 left-2 bg-foreground/60 text-background text-xs px-2 py-1 rounded">
                      {video.aspect_ratio}
                    </div>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute bottom-2 left-2 h-10 w-10 rounded-full"
                      onClick={() => handleOpenInPreview(video)}
                    >
                      <Play className="h-5 w-5" />
                    </Button>
                  </div>

                  <CardContent className="p-4">
                    {/* Info */}
                    <div className="mb-4">
                      <h3 className="font-bold text-lg">{video.surah_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        الآيات {video.start_ayah} - {video.end_ayah}
                      </p>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(video.created_at)}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenInPreview(video)}
                        className="flex-1 gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        فتح
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRecreate(video)}
                        className="flex-1 gap-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                        إعادة إنشاء
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(video.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
              <Video className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">لا توجد فيديوهات بعد</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              ابدأ بإنشاء أول مقطع قرآني لك وسيظهر هنا
            </p>
            <Button asChild size="lg">
              <Link to="/create" className="gap-2">
                <Plus className="h-5 w-5" />
                إنشاء فيديو جديد
              </Link>
            </Button>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
