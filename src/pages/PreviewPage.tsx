import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { VideoPreview, VideoPreviewRef } from '@/components/VideoPreview';
import { AudioEffectsPanel } from '@/components/AudioEffectsPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { surahs } from '@/data/surahs';
import { reciters, getAudioUrl } from '@/data/reciters';
import { backgroundVideos, backgroundImages, BackgroundItem } from '@/data/backgrounds';
import { useQuranApi } from '@/hooks/useQuranApi';
import { useAuth } from '@/hooks/useAuth';
import { useAudioEffects, AudioEffects } from '@/hooks/useAudioEffects';
import { useVideoRecorder } from '@/hooks/useVideoRecorder';
import { supabase } from '@/integrations/supabase/client';
import { TextSettings } from '@/components/TextSettingsPanel';
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
  ChevronRight,
  AlertCircle,
  SkipBack,
  SkipForward,
  Video,
  Settings,
  Music,
} from 'lucide-react';
import { toast } from 'sonner';

export default function PreviewPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { fetchAyahs } = useQuranApi();
  const audioEffects = useAudioEffects();
  const videoRecorder = useVideoRecorder();

  // Get params
  const surahNumber = parseInt(searchParams.get('surah') || '1');
  const reciterId = searchParams.get('reciter') || 'mishary_alafasy';
  const startAyah = parseInt(searchParams.get('start') || '1');
  const endAyah = parseInt(searchParams.get('end') || '5');
  const backgroundId = searchParams.get('background') || '';
  const backgroundType = searchParams.get('backgroundType') || 'video';
  const aspectRatio = (searchParams.get('ratio') || '9:16') as '9:16' | '16:9';

  // Text settings from params
  const textSettings: TextSettings = {
    fontSize: parseInt(searchParams.get('fontSize') || '28'),
    fontFamily: searchParams.get('fontFamily') || '"Amiri", serif',
    textColor: searchParams.get('textColor') || '#ffffff',
    shadowIntensity: parseFloat(searchParams.get('shadowIntensity') || '0.5'),
    overlayOpacity: parseFloat(searchParams.get('overlayOpacity') || '0.4'),
  };

  // Data
  const surah = surahs.find((s) => s.number === surahNumber);
  const reciter = reciters.find((r) => r.id === reciterId);
  const background: BackgroundItem | null =
    [...backgroundVideos, ...backgroundImages].find((bg) => bg.id === backgroundId) ||
    (backgroundType === 'video' ? backgroundVideos[0] : backgroundImages[0]);

  // State
  const [ayahs, setAyahs] = useState<{ numberInSurah: number; text: string }[]>([]);
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [activeTab, setActiveTab] = useState('controls');

  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoPreviewRef = useRef<VideoPreviewRef>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const ayahTimestampsRef = useRef<number[]>([]);

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

  // Initialize audio effects when audio is loaded
  useEffect(() => {
    if (audioRef.current && audioLoaded && !audioError) {
      audioEffects.initializeAudio(audioRef.current);
    }
  }, [audioLoaded, audioError]);

  // Calculate ayah timestamps based on audio duration
  useEffect(() => {
    if (duration > 0 && ayahs.length > 0) {
      const timePerAyah = duration / ayahs.length;
      const timestamps = ayahs.map((_, index) => index * timePerAyah);
      ayahTimestampsRef.current = timestamps;
    }
  }, [duration, ayahs.length]);

  // Handle play/pause
  const togglePlay = useCallback(async () => {
    if (!audioRef.current) return;

    await audioEffects.resumeContext();

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => {
        console.error('Audio play error:', err);
        toast.error('حدث خطأ في تشغيل الصوت');
      });
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, audioEffects]);

  // Handle mute
  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  // Skip forward/backward
  const skipAyah = (direction: 'forward' | 'backward') => {
    if (!audioRef.current || ayahTimestampsRef.current.length === 0) return;

    const newIndex =
      direction === 'forward'
        ? Math.min(currentAyahIndex + 1, ayahs.length - 1)
        : Math.max(currentAyahIndex - 1, 0);

    const timestamp = ayahTimestampsRef.current[newIndex];
    if (timestamp !== undefined) {
      audioRef.current.currentTime = timestamp;
      setCurrentAyahIndex(newIndex);
    }
  };

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setAudioLoaded(true);
      setAudioError(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100);

      const timestamps = ayahTimestampsRef.current;
      if (timestamps.length > 0) {
        for (let i = timestamps.length - 1; i >= 0; i--) {
          if (audio.currentTime >= timestamps[i]) {
            if (i !== currentAyahIndex) {
              setCurrentAyahIndex(i);
            }
            break;
          }
        }
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentAyahIndex(0);
      audio.currentTime = 0;
    };

    const handleError = () => {
      console.error('Audio load error');
      setAudioError(true);
      setAudioLoaded(true);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [currentAyahIndex]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Start video recording
  const handleStartRecording = async () => {
    const container = previewContainerRef.current;
    const audio = audioRef.current;

    if (!container || !audio) {
      toast.error('حدث خطأ في تجهيز التسجيل');
      return;
    }

    try {
      await audioEffects.resumeContext();

      // Calculate recording duration based on ayahs
      const recordingDuration = Math.min(duration || 30, 60); // Max 60 seconds

      toast.info('بدء التسجيل... لا تغلق هذه الصفحة');

      const blob = await videoRecorder.startRecording(container, audio, recordingDuration);

      if (blob) {
        toast.success('تم إنشاء الفيديو بنجاح!');
      }
    } catch (error) {
      console.error('Recording error:', error);
      toast.error('حدث خطأ في التسجيل');
    }
  };

  // Download recorded video
  const handleDownload = () => {
    if (videoRecorder.videoBlob) {
      const filename = `${surah?.name || 'quran'}-${reciter?.name || 'reciter'}.webm`;
      videoRecorder.downloadVideo(filename);
      toast.success('تم تحميل الفيديو!');
    } else {
      toast.error('لا يوجد فيديو للتحميل، قم بإنشاء الفيديو أولاً');
    }
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
    const shareData = {
      title: `${surah?.name} - قرآن ريلز`,
      text: `استمع لتلاوة ${surah?.name} بصوت ${reciter?.name}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('تم نسخ الرابط!');
    }
  };

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
            className="flex-1 flex justify-center"
            ref={previewContainerRef}
          >
            <VideoPreview
              ref={videoPreviewRef}
              background={background}
              surahName={surah?.name || ''}
              reciterName={reciter?.name || ''}
              currentAyah={ayahs[currentAyahIndex] || null}
              aspectRatio={aspectRatio}
              textSettings={textSettings}
              isPlaying={isPlaying}
            />

            {/* Audio Element */}
            <audio ref={audioRef} src={audioUrl} preload="metadata" crossOrigin="anonymous" />
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-md mx-auto lg:mx-0 space-y-4"
          >
            {/* Info Card */}
            <Card>
              <CardContent className="p-4">
                <h3 className="text-xl font-bold">{surah?.name}</h3>
                <p className="text-muted-foreground text-sm">
                  الآيات {startAyah} - {endAyah} | {reciter?.name}
                </p>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger value="controls" className="flex-1 gap-2">
                  <Settings className="h-4 w-4" />
                  التحكم
                </TabsTrigger>
                <TabsTrigger value="effects" className="flex-1 gap-2">
                  <Music className="h-4 w-4" />
                  المؤثرات
                </TabsTrigger>
              </TabsList>

              <TabsContent value="controls" className="mt-4">
                <Card>
                  <CardContent className="p-4 space-y-4">
                    {/* Audio Error Message */}
                    {audioError && (
                      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-destructive">تعذر تحميل الصوت</p>
                          <p className="text-xs text-muted-foreground">
                            قد يكون الملف غير متوفر لهذه السورة
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Playback Controls */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => skipAyah('backward')}
                          disabled={currentAyahIndex === 0 || audioError}
                        >
                          <SkipForward className="h-5 w-5" />
                        </Button>

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={togglePlay}
                          disabled={!audioLoaded || audioError}
                          className="h-14 w-14"
                        >
                          {!audioLoaded ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                          ) : isPlaying ? (
                            <Pause className="h-6 w-6" />
                          ) : (
                            <Play className="h-6 w-6" />
                          )}
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => skipAyah('forward')}
                          disabled={currentAyahIndex === ayahs.length - 1 || audioError}
                        >
                          <SkipBack className="h-5 w-5" />
                        </Button>

                        <Button variant="ghost" size="icon" onClick={toggleMute}>
                          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                        </Button>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-2">
                        <Progress value={progress} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      </div>

                      {/* Ayah Progress */}
                      <div className="text-center p-2 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">
                          الآية <span className="font-bold text-foreground">{currentAyahIndex + 1}</span> من{' '}
                          {ayahs.length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="effects" className="mt-4">
                <AudioEffectsPanel
                  effects={audioEffects.effects}
                  onChange={audioEffects.setEffects}
                  disabled={!audioLoaded || audioError}
                />
              </TabsContent>
            </Tabs>

            {/* Recording / Actions */}
            <Card>
              <CardContent className="p-4 space-y-3">
                {videoRecorder.isRecording ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-primary">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="font-medium">{videoRecorder.stage}</span>
                    </div>
                    <Progress value={videoRecorder.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground text-center">
                      {Math.round(videoRecorder.progress)}% مكتمل
                    </p>
                  </div>
                ) : videoRecorder.videoBlob ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 text-primary p-3 rounded-lg bg-primary/10">
                      <Check className="h-5 w-5" />
                      <span className="font-medium">تم إنشاء الفيديو بنجاح!</span>
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
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      حفظ في المكتبة
                    </Button>

                    <Button onClick={videoRecorder.reset} variant="ghost" className="w-full gap-2">
                      <RotateCcw className="h-4 w-4" />
                      إنشاء فيديو جديد
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleStartRecording}
                    disabled={!audioLoaded || audioError}
                    className="w-full gap-2"
                    size="lg"
                  >
                    <Video className="h-5 w-5" />
                    تسجيل وإنشاء الفيديو
                  </Button>
                )}

                {videoRecorder.error && (
                  <p className="text-sm text-destructive text-center">{videoRecorder.error}</p>
                )}
              </CardContent>
            </Card>

            {/* Back Button */}
            <Button variant="ghost" onClick={() => navigate('/create')} className="w-full gap-2">
              <RotateCcw className="h-4 w-4" />
              العودة للإعدادات
            </Button>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
