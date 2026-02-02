import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { surahs } from '@/data/surahs';
import { reciters, getAudioUrl } from '@/data/reciters';
import { useQuranApi } from '@/hooks/useQuranApi';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Download, 
  Share2, 
  RotateCcw, 
  Loader2, 
  Play, 
  Pause,
  Volume2,
  VolumeX,
  Save,
  Check,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

// Nature background videos from Pexels (free to use)
const backgroundVideos = [
  'https://videos.pexels.com/video-files/2491284/2491284-uhd_2560_1440_24fps.mp4',
  'https://videos.pexels.com/video-files/1409899/1409899-uhd_2560_1440_25fps.mp4',
  'https://videos.pexels.com/video-files/3571264/3571264-uhd_2560_1440_30fps.mp4',
  'https://videos.pexels.com/video-files/856973/856973-hd_1920_1080_30fps.mp4',
];

const backgroundImages = [
  'https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg',
  'https://images.pexels.com/photos/1743165/pexels-photo-1743165.jpeg',
  'https://images.pexels.com/photos/1671325/pexels-photo-1671325.jpeg',
  'https://images.pexels.com/photos/1366909/pexels-photo-1366909.jpeg',
];

export default function PreviewPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { fetchAyahs } = useQuranApi();

  // Get params
  const surahNumber = parseInt(searchParams.get('surah') || '1');
  const reciterId = searchParams.get('reciter') || 'mishary_alafasy';
  const startAyah = parseInt(searchParams.get('start') || '1');
  const endAyah = parseInt(searchParams.get('end') || '5');
  const backgroundType = searchParams.get('background') || 'video';
  const aspectRatio = searchParams.get('ratio') || '9:16';

  // Data
  const surah = surahs.find((s) => s.number === surahNumber);
  const reciter = reciters.find((r) => r.id === reciterId);

  // State
  const [ayahs, setAyahs] = useState<{ numberInSurah: number; text: string }[]>([]);
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Random background
  const [bgIndex] = useState(() => Math.floor(Math.random() * 4));
  const backgroundSrc = backgroundType === 'video' 
    ? backgroundVideos[bgIndex] 
    : backgroundImages[bgIndex];

  // Load ayahs
  useEffect(() => {
    const loadData = async () => {
      const data = await fetchAyahs(surahNumber, startAyah, endAyah);
      if (data) {
        setAyahs(data);
      }
    };
    loadData();
  }, [surahNumber, startAyah, endAyah, fetchAyahs]);

  // Audio URL
  const audioUrl = reciter ? getAudioUrl(reciter, surahNumber) : '';

  // Handle play/pause
  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      if (videoRef.current) videoRef.current.pause();
    } else {
      audioRef.current.play();
      if (videoRef.current) videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  // Handle mute
  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  // Simulate verse sync (in real app, would use audio timing data)
  useEffect(() => {
    if (!isPlaying || ayahs.length === 0) return;

    const totalDuration = 30; // Estimated 30 seconds for the clip
    const verseInterval = (totalDuration * 1000) / ayahs.length;

    const interval = setInterval(() => {
      setCurrentAyahIndex((prev) => {
        if (prev < ayahs.length - 1) {
          return prev + 1;
        }
        setIsPlaying(false);
        return prev;
      });
    }, verseInterval);

    return () => clearInterval(interval);
  }, [isPlaying, ayahs.length]);

  // Progress update
  useEffect(() => {
    if (!audioRef.current) return;

    const updateProgress = () => {
      if (audioRef.current) {
        const current = audioRef.current.currentTime;
        const duration = audioRef.current.duration || 1;
        setProgress((current / duration) * 100);
      }
    };

    const audio = audioRef.current;
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentAyahIndex(0);
    });

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
    };
  }, []);

  // Generate video (simulation)
  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(0);

    // Simulate generation progress
    for (let i = 0; i <= 100; i += 5) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      setProgress(i);
    }

    setIsGenerating(false);
    setIsGenerated(true);
    toast.success('تم إنشاء الفيديو بنجاح!');
  };

  // Download video
  const handleDownload = () => {
    toast.success('جاري تحميل الفيديو...');
    // In real implementation, would download the generated video
  };

  // Save to library
  const handleSave = async () => {
    if (!isAuthenticated || !user) {
      toast.error('الرجاء تسجيل الدخول لحفظ الفيديو');
      navigate('/auth');
      return;
    }

    setIsSaving(true);
    
    try {
      const { error } = await supabase.from('saved_videos').insert({
        user_id: user.id,
        surah_number: surahNumber,
        surah_name: surah?.name || '',
        reciter_id: reciterId,
        reciter_name: reciter?.name || '',
        start_ayah: startAyah,
        end_ayah: endAyah,
        background_type: backgroundType,
        aspect_ratio: aspectRatio,
      });

      if (error) throw error;
      
      toast.success('تم حفظ الفيديو في مكتبتك!');
    } catch (err) {
      console.error('Error saving video:', err);
      toast.error('حدث خطأ في حفظ الفيديو');
    } finally {
      setIsSaving(false);
    }
  };

  // Share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${surah?.name} - قرآن ريلز`,
          text: `استمع لتلاوة ${surah?.name} بصوت ${reciter?.name}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('تم نسخ الرابط!');
    }
  };

  const containerClass = aspectRatio === '9:16' 
    ? 'aspect-[9/16] max-w-[360px]' 
    : 'aspect-video max-w-[640px]';

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-muted-foreground mb-6"
        >
          <Link to="/create" className="hover:text-primary transition-colors">
            إنشاء فيديو
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span>المعاينة</span>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Video Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${containerClass} mx-auto lg:mx-0 w-full relative rounded-2xl overflow-hidden shadow-2xl`}
          >
            {/* Background */}
            {backgroundType === 'video' ? (
              <video
                ref={videoRef}
                src={backgroundSrc}
                className="absolute inset-0 w-full h-full object-cover"
                loop
                muted
                playsInline
              />
            ) : (
              <div 
                className="absolute inset-0 w-full h-full bg-cover bg-center animate-float"
                style={{ 
                  backgroundImage: `url(${backgroundSrc})`,
                  animation: 'kenburns 20s ease-in-out infinite'
                }}
              />
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-foreground/40" />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
              {/* Surah Name */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-background text-shadow-strong font-quran">
                  {surah?.name}
                </h2>
                <p className="text-background/80 mt-2">بصوت {reciter?.name}</p>
              </motion.div>

              {/* Current Ayah */}
              <motion.div
                key={currentAyahIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center px-4"
              >
                <p className="text-2xl md:text-3xl lg:text-4xl text-background font-quran leading-loose text-shadow-strong">
                  {ayahs[currentAyahIndex]?.text}
                </p>
                <span className="inline-flex items-center justify-center mt-4 h-8 w-8 rounded-full bg-background/20 text-background text-sm">
                  {ayahs[currentAyahIndex]?.numberInSurah}
                </span>
              </motion.div>
            </div>

            {/* Audio */}
            <audio ref={audioRef} src={audioUrl} preload="auto" />
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1 w-full max-w-md mx-auto lg:mx-0"
          >
            <Card>
              <CardContent className="p-6 space-y-6">
                {/* Info */}
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">{surah?.name}</h3>
                  <p className="text-muted-foreground">
                    الآيات {startAyah} - {endAyah} | {reciter?.name}
                  </p>
                </div>

                {/* Playback Controls */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={togglePlay}
                      className="h-12 w-12"
                    >
                      {isPlaying ? (
                        <Pause className="h-6 w-6" />
                      ) : (
                        <Play className="h-6 w-6" />
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleMute}
                    >
                      {isMuted ? (
                        <VolumeX className="h-5 w-5" />
                      ) : (
                        <Volume2 className="h-5 w-5" />
                      )}
                    </Button>

                    <div className="flex-1">
                      <Progress value={progress} className="h-2" />
                    </div>
                  </div>

                  {/* Ayah Progress */}
                  <p className="text-sm text-muted-foreground text-center">
                    الآية {currentAyahIndex + 1} من {ayahs.length}
                  </p>
                </div>

                {/* Generation */}
                {!isGenerated ? (
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full gap-2"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        جاري الإنشاء... {Math.round(progress)}%
                      </>
                    ) : (
                      <>
                        <Play className="h-5 w-5" />
                        إنشاء الفيديو
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 text-primary mb-4">
                      <Check className="h-5 w-5" />
                      <span>تم إنشاء الفيديو بنجاح!</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button onClick={handleDownload} className="gap-2">
                        <Download className="h-4 w-4" />
                        تحميل
                      </Button>
                      <Button onClick={handleShare} variant="outline" className="gap-2">
                        <Share2 className="h-4 w-4" />
                        مشاركة
                      </Button>
                    </div>

                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      variant="secondary"
                      className="w-full gap-2"
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      حفظ في المكتبة
                    </Button>
                  </div>
                )}

                {/* Restart */}
                <Button
                  variant="ghost"
                  onClick={() => navigate('/create')}
                  className="w-full gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  إنشاء فيديو جديد
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <style>{`
        @keyframes kenburns {
          0% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.1) translate(-2%, -2%); }
          100% { transform: scale(1) translate(0, 0); }
        }
      `}</style>
    </Layout>
  );
}
