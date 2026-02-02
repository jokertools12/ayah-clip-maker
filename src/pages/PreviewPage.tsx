import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { VideoPreview, VideoPreviewRef } from '@/components/VideoPreview';
import { AudioEffectsPanel } from '@/components/AudioEffectsPanel';
import { DisplaySettingsPanel, DisplaySettings } from '@/components/DisplaySettingsPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { surahs } from '@/data/surahs';
import { reciters, getAudioUrl } from '@/data/reciters';
import { backgroundVideos, backgroundImages, BackgroundItem } from '@/data/backgrounds';
import { useQuranApi } from '@/hooks/useQuranApi';
import { useAuth } from '@/hooks/useAuth';
import { useAudioEffects } from '@/hooks/useAudioEffects';
import { useVideoRecorder } from '@/hooks/useVideoRecorder';
import {
  fetchChapterRecitationAudioById,
  QuranFoundationTimestamp,
} from '@/lib/quranFoundationApi';
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
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_DISPLAY_SETTINGS: DisplaySettings = {
  showSurahName: true,
  showReciterName: true,
  showAyahText: true,
  showAyahNumber: true,
  highlightStyle: 'glow', // Default to golden glow
};

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
    fontFamily: searchParams.get('fontFamily') || '"Noto Naskh Arabic", serif',
    textColor: searchParams.get('textColor') || '#ffffff',
    shadowIntensity: parseFloat(searchParams.get('shadowIntensity') || '0.5'),
    overlayOpacity: parseFloat(searchParams.get('overlayOpacity') || '0.4'),
  };

  // Display settings state
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>(DEFAULT_DISPLAY_SETTINGS);

  // Data
  const surah = surahs.find((s) => s.number === surahNumber);
  const reciter = reciters.find((r) => r.id === reciterId);
  const background: BackgroundItem | null =
    [...backgroundVideos, ...backgroundImages].find((bg) => bg.id === backgroundId) ||
    (backgroundType === 'video' ? backgroundVideos[0] : backgroundImages[0]);

  // State
  const [ayahs, setAyahs] = useState<{ numberInSurah: number; text: string }[]>([]);
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const [highlightWordIndex, setHighlightWordIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [activeTab, setActiveTab] = useState('controls');

  // Accurate timings (ms) for the selected range
  const [ayahTimings, setAyahTimings] = useState<(QuranFoundationTimestamp | null)[]>([]);
  const [audioUrl, setAudioUrl] = useState('');
  const [rangeMs, setRangeMs] = useState<{ from: number; to: number } | null>(null);
  const [timingsLoading, setTimingsLoading] = useState(false);
  const [useQuranFoundation, setUseQuranFoundation] = useState(true);

  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoPreviewRef = useRef<VideoPreviewRef>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

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

  const currentAyahWords = useMemo(() => {
    const text = ayahs[currentAyahIndex]?.text ?? '';
    return text.split(' ').filter(Boolean);
  }, [ayahs, currentAyahIndex]);

  // Load accurate audio + timestamps for recitation (so we can play only selected ayahs)
  useEffect(() => {
    let cancelled = false;

    const loadTimings = async () => {
      if (!reciter) return;
      setTimingsLoading(true);
      setAudioError(false);
      setAudioLoaded(false);
      setHighlightWordIndex(null);

      try {
        // Use the reciter's known Quran Foundation ID if available
        const recitationId = reciter.quranFoundationId;
        
        if (!recitationId) {
          throw new Error('Reciter not found in Quran Foundation');
        }

        console.log(`Loading audio for reciter: ${reciter.englishName}, recitationId: ${recitationId}`);
        
        const audioFile = await fetchChapterRecitationAudioById(recitationId, surahNumber, true);
        const all = audioFile.timestamps ?? [];

        // Build stable array by index so it matches [startAyah..endAyah]
        const byIndex: (QuranFoundationTimestamp | null)[] = Array.from(
          { length: endAyah - startAyah + 1 },
          (_, i) => {
            const ayahNo = startAyah + i;
            const key = `${surahNumber}:${ayahNo}`;
            return all.find((t) => t.verse_key === key) ?? null;
          }
        );

        const existing = byIndex.filter(Boolean) as QuranFoundationTimestamp[];
        if (!audioFile.audio_url || existing.length === 0) {
          throw new Error('No timestamps available');
        }

        const from = existing[0].timestamp_from;
        const to = existing[existing.length - 1].timestamp_to;

        if (!cancelled) {
          setAudioUrl(audioFile.audio_url);
          setAyahTimings(byIndex);
          setRangeMs({ from, to });
          setDuration(Math.max((to - from) / 1000, 0));
          setUseQuranFoundation(true);
          console.log(`Loaded audio: ${audioFile.audio_url}`);
        }
      } catch (e) {
        console.warn('Quran Foundation API failed, falling back to mp3quran:', e);
        
        // Fallback to mp3quran.net with the reciter's specific server
        if (!cancelled && reciter) {
          const fallbackUrl = getAudioUrl(reciter, surahNumber);
          console.log(`Fallback audio URL: ${fallbackUrl}`);
          setAudioUrl(fallbackUrl);
          setAyahTimings([]);
          setRangeMs(null);
          setUseQuranFoundation(false);
          // Duration will be set when audio loads
        }
      } finally {
        if (!cancelled) setTimingsLoading(false);
      }
    };

    loadTimings();
    return () => {
      cancelled = true;
    };
  }, [reciter?.id, reciter?.quranFoundationId, surahNumber, startAyah, endAyah]);

  // Initialize audio effects when audio is loaded
  useEffect(() => {
    if (audioRef.current && audioLoaded && !audioError) {
      audioEffects.initializeAudio(audioRef.current);
    }
  }, [audioLoaded, audioError]);

  const rangeStartSec = rangeMs ? rangeMs.from / 1000 : 0;
  const rangeEndSec = rangeMs ? rangeMs.to / 1000 : 0;

  // Handle play/pause
  const togglePlay = useCallback(async () => {
    if (!audioRef.current) return;

    await audioEffects.resumeContext();

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // If using Quran Foundation, ensure we start inside the selected range
      if (useQuranFoundation && rangeMs) {
        if (audioRef.current.currentTime < rangeStartSec || audioRef.current.currentTime >= rangeEndSec) {
          audioRef.current.currentTime = rangeStartSec;
        }
      }
      audioRef.current.play().catch((err) => {
        console.error('Audio play error:', err);
        toast.error('حدث خطأ في تشغيل الصوت');
      });
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, audioEffects, rangeMs, rangeStartSec, rangeEndSec, useQuranFoundation]);

  // Handle mute
  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  // Skip forward/backward
  const skipAyah = (direction: 'forward' | 'backward') => {
    if (!audioRef.current || ayahTimings.length === 0) return;

    const newIndex =
      direction === 'forward'
        ? Math.min(currentAyahIndex + 1, ayahs.length - 1)
        : Math.max(currentAyahIndex - 1, 0);

    const timing = ayahTimings[newIndex];
    if (timing && rangeMs) {
      audioRef.current.currentTime = timing.timestamp_from / 1000;
      setCurrentAyahIndex(newIndex);
      setHighlightWordIndex(null);
    }
  };

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (useQuranFoundation && rangeMs) {
        setDuration(Math.max((rangeMs.to - rangeMs.from) / 1000, 0));
      } else {
        setDuration(audio.duration);
      }
      setAudioLoaded(true);
      setAudioError(false);
    };

    const handleTimeUpdate = () => {
      const nowSec = audio.currentTime;
      const nowMs = nowSec * 1000;

      if (useQuranFoundation && rangeMs) {
        const totalSec = Math.max((rangeMs.to - rangeMs.from) / 1000, 0.001);

        // Stop at the end of the selected range
        if (nowSec >= rangeEndSec) {
          audio.pause();
          audio.currentTime = rangeStartSec;
          setIsPlaying(false);
          setCurrentAyahIndex(0);
          setHighlightWordIndex(null);
          setCurrentTime(0);
          setProgress(0);
          return;
        }

        const relativeSec = Math.max(nowSec - rangeStartSec, 0);
        setCurrentTime(relativeSec);
        setProgress(Math.min((relativeSec / totalSec) * 100, 100));

        // Find current verse by timestamps
        for (let i = ayahTimings.length - 1; i >= 0; i--) {
          const t = ayahTimings[i];
          if (!t) continue;
          if (nowMs >= t.timestamp_from && nowMs < t.timestamp_to) {
            if (i !== currentAyahIndex) setCurrentAyahIndex(i);

            if (t.segments && t.segments.length > 0) {
              const seg = t.segments.find((s) => nowMs >= s[1] && nowMs < s[2]);
              setHighlightWordIndex(seg ? seg[0] - 1 : null);
            } else {
              setHighlightWordIndex(null);
            }
            break;
          }
        }
      } else {
        // Fallback mode - simple progress tracking
        setCurrentTime(nowSec);
        setProgress(audio.duration > 0 ? (nowSec / audio.duration) * 100 : 0);
        
        // Simple ayah estimation based on equal distribution
        if (ayahs.length > 0 && audio.duration > 0) {
          const ayahDuration = audio.duration / ayahs.length;
          const estimatedIndex = Math.min(Math.floor(nowSec / ayahDuration), ayahs.length - 1);
          if (estimatedIndex !== currentAyahIndex) {
            setCurrentAyahIndex(estimatedIndex);
          }
        }
      }
    };

    const handleError = () => {
      console.error('Audio load error');
      setAudioError(true);
      setAudioLoaded(true);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentAyahIndex(0);
      setHighlightWordIndex(null);
      setCurrentTime(0);
      setProgress(0);
      if (useQuranFoundation && rangeMs) {
        audio.currentTime = rangeStartSec;
      } else {
        audio.currentTime = 0;
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [rangeMs, ayahTimings, currentAyahIndex, rangeStartSec, rangeEndSec, useQuranFoundation, ayahs.length]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Start video recording
  const handleStartRecording = async () => {
    const canvas = videoPreviewRef.current?.getCanvas();
    const audio = audioRef.current;

    if (!canvas || !audio) {
      toast.error('حدث خطأ في تجهيز التسجيل');
      return;
    }

    try {
      await audioEffects.resumeContext();

      let recordingDuration: number;
      
      if (useQuranFoundation && rangeMs) {
        recordingDuration = Math.max((rangeMs.to - rangeMs.from) / 1000, 1);
        audio.currentTime = rangeMs.from / 1000;
      } else {
        // For fallback mode, record the full audio or estimate
        recordingDuration = audio.duration > 0 ? audio.duration : 60;
        audio.currentTime = 0;
      }

      toast.info('بدء التسجيل... لا تغلق هذه الصفحة');

      const blob = await videoRecorder.startRecording(
        canvas,
        audio,
        recordingDuration,
        audioEffects.getRecordingStream()
      );

      if (blob) {
        toast.success('تم إنشاء الفيديو بنجاح!');
      }
    } catch (error) {
      console.error('Recording error:', error);
      toast.error('حدث خطأ في التسجيل');
    }
  };

  // Download recorded video as MP4 (converted)
  const handleDownload = async () => {
    if (!videoRecorder.videoBlob) {
      toast.error('لا يوجد فيديو للتحميل، قم بإنشاء الفيديو أولاً');
      return;
    }
    const filename = `${surah?.name || 'quran'}-${reciter?.name || 'reciter'}.mp4`;
    toast.info('جاري تجهيز الفيديو...');
    await videoRecorder.downloadMp4(filename);
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
              currentAyahWords={currentAyahWords}
              highlightedWordIndex={highlightWordIndex}
              aspectRatio={aspectRatio}
              textSettings={textSettings}
              displaySettings={displaySettings}
              isPlaying={isPlaying}
            />

            {/* Audio Element */}
            <audio
              ref={audioRef}
              src={audioUrl}
              preload="auto"
              crossOrigin="anonymous"
            />
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
                {!useQuranFoundation && (
                  <p className="text-xs text-amber-500 mt-1">
                    ⚠️ يتم استخدام الملف الصوتي الكامل (التزامن تقديري)
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger value="controls" className="flex-1 gap-2">
                  <Settings className="h-4 w-4" />
                  التحكم
                </TabsTrigger>
                <TabsTrigger value="display" className="flex-1 gap-2">
                  <Eye className="h-4 w-4" />
                  العرض
                </TabsTrigger>
                <TabsTrigger value="effects" className="flex-1 gap-2">
                  <Music className="h-4 w-4" />
                  الصوت
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
                          disabled={currentAyahIndex === 0 || audioError || !useQuranFoundation}
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
                          disabled={currentAyahIndex === ayahs.length - 1 || audioError || !useQuranFoundation}
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
                          الآية <span className="font-bold text-foreground">{ayahs[currentAyahIndex]?.numberInSurah || startAyah}</span> من{' '}
                          {ayahs.length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="display" className="mt-4">
                <DisplaySettingsPanel
                  settings={displaySettings}
                  onChange={setDisplaySettings}
                />
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
                    {videoRecorder.isConverting ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-primary">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span className="font-medium">جاري تجهيز الفيديو...</span>
                        </div>
                        <Progress value={videoRecorder.convertProgress} className="h-2" />
                        <p className="text-xs text-muted-foreground text-center">
                          {Math.round(videoRecorder.convertProgress)}% مكتمل
                        </p>
                      </div>
                    ) : (
                      <>
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
                          {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          حفظ في المكتبة
                        </Button>

                        <Button onClick={videoRecorder.reset} variant="ghost" className="w-full gap-2">
                          <RotateCcw className="h-4 w-4" />
                          إنشاء فيديو جديد
                        </Button>
                      </>
                    )}
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