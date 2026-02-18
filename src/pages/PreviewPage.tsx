import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { VideoPreview, VideoPreviewRef } from '@/components/VideoPreview';
import { AudioEffectsPanel } from '@/components/AudioEffectsPanel';
import { DisplaySettingsPanel, DisplaySettings } from '@/components/DisplaySettingsPanel';
import { CustomBackgroundUploader } from '@/components/CustomBackgroundUploader';
import { ExportFormatSelector, ExportSettings, ExportFormat } from '@/components/ExportFormatSelector';
import { MotionSpeedControl } from '@/components/MotionSpeedControl';
import { PresetSelector } from '@/components/PresetSelector';
import { SocialShareButtons } from '@/components/SocialShareButtons';
import { VIDEO_PRESETS, VideoPreset } from '@/data/videoPresets';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { surahs } from '@/data/surahs';
import { reciters, getAudioUrl } from '@/data/reciters';
import { backgroundVideos, backgroundImages, slideshowBackgrounds, BackgroundItem } from '@/data/backgrounds';
import { useQuranApi } from '@/hooks/useQuranApi';
import { useAuth } from '@/hooks/useAuth';
import { useAudioEffects } from '@/hooks/useAudioEffects';
import { useVideoRecorder, ExportQuality } from '@/hooks/useVideoRecorder';
import {
  fetchChapterRecitationAudioById,
  QuranFoundationTimestamp,
} from '@/lib/quranFoundationApi';
import { validateAudioUrl } from '@/lib/quranYousefApi';
import { supabase } from '@/integrations/supabase/client';
import { TextSettings } from '@/components/TextSettingsPanel';
import {
  Download,
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
  Upload,
  Palette,
  Gauge,
} from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_DISPLAY_SETTINGS: DisplaySettings = {
  showSurahName: true,
  showReciterName: true,
  showAyahText: true,
  showAyahNumber: true,
  highlightStyle: 'glow',
  frameStyle: 'none',
  ayahNumberStyle: 'circle',
  surahNamePosition: 'top',
  surahNameStyle: 'classic',
  textShadowStyle: 'soft',
  decorationStyle: 'separator',
  ayahTransition: 'fade',
};

const DEFAULT_EXPORT_SETTINGS: ExportSettings = {
  format: 'mp4',
  quality: 'high',
  motionSpeed: 3,
};

export default function PreviewPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { fetchAyahs } = useQuranApi();
  const audioEffects = useAudioEffects();
  const videoRecorder = useVideoRecorder();

  // Note: download uses a fresh ObjectURL at click time for maximum reliability across browsers/iframes.

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
  
  // Custom background and export settings
  const [customBackground, setCustomBackground] = useState<string | null>(null);
  const [exportSettings, setExportSettings] = useState<ExportSettings>(DEFAULT_EXPORT_SETTINGS);
  const [selectedPresetId, setSelectedPresetId] = useState<string | undefined>(undefined);

  // Handler to apply a preset
  const applyPreset = useCallback((preset: VideoPreset) => {
    setSelectedPresetId(preset.id);
    setDisplaySettings((prev) => ({
      ...prev,
      ...preset.displaySettings,
    }));
    setExportSettings((prev) => ({
      ...prev,
      quality: preset.exportQuality,
    }));
    toast.success(`تم تطبيق قالب "${preset.name}"`);
  }, []);

  // Data
  const surah = surahs.find((s) => s.number === surahNumber);
  const reciter = reciters.find((r) => r.id === reciterId);
  const background: BackgroundItem | null =
    [...backgroundVideos, ...backgroundImages, ...slideshowBackgrounds].find((bg) => bg.id === backgroundId) ||
    backgroundImages[0];

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
        const processedAyahs = data.map((ayah, index) => {
          let text = ayah.text;
          const bismillah = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';
          const bismillahAlt = 'بسم الله الرحمن الرحيم';
          
          if (index === 0 && startAyah === 1 && surahNumber !== 1 && surahNumber !== 9) {
            if (text.startsWith(bismillah)) {
              text = text.replace(bismillah, '').trim();
            } else if (text.startsWith(bismillahAlt)) {
              text = text.replace(bismillahAlt, '').trim();
            }
          }
          return { ...ayah, text };
        });
        setAyahs(processedAyahs);
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

      const mp3quranUrl = getAudioUrl(reciter, surahNumber);

      try {
        // Try Quran Foundation for accurate timestamps AND matching audio
        const recitationId = reciter.quranFoundationId;
        
        if (recitationId) {
          const audioFile = await fetchChapterRecitationAudioById(recitationId, surahNumber, true);
          const all = audioFile.timestamps ?? [];

          const byIndex: (QuranFoundationTimestamp | null)[] = Array.from(
            { length: endAyah - startAyah + 1 },
            (_, i) => {
              const ayahNo = startAyah + i;
              const key = `${surahNumber}:${ayahNo}`;
              return all.find((t) => t.verse_key === key) ?? null;
            }
          );

          const existing = byIndex.filter(Boolean) as QuranFoundationTimestamp[];
          
          if (existing.length > 0 && audioFile.audio_url) {
            const from = existing[0].timestamp_from;
            const to = existing[existing.length - 1].timestamp_to;

            if (!cancelled) {
              // CRITICAL: Use QF audio URL so timestamps match the audio perfectly
              setAudioUrl(audioFile.audio_url);
              setAyahTimings(byIndex);
              setRangeMs({ from, to });
              setDuration(Math.max((to - from) / 1000, 0));
              setUseQuranFoundation(true);
              console.log(`Using QF audio + timestamps for perfect sync`);
            }
            return;
          }
        }
        
        throw new Error('No timestamps available');
      } catch (e) {
        console.warn('QF unavailable, falling back to mp3quran (no word sync):', e);
        
        if (!cancelled) {
          const isValid = await validateAudioUrl(mp3quranUrl);
          if (!isValid) {
            console.warn('mp3quran URL also failed:', mp3quranUrl);
          }
          
          setAudioUrl(mp3quranUrl);
          setAyahTimings([]);
          setRangeMs(null);
          setUseQuranFoundation(false);
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

    if (!canvas) {
      toast.error('حدث خطأ في تجهيز التسجيل');
      return;
    }

    try {
      await audioEffects.resumeContext();

      let recordingDuration: number;
      
      if (useQuranFoundation && rangeMs) {
        recordingDuration = Math.max((rangeMs.to - rangeMs.from) / 1000, 1);
        if (audio) audio.currentTime = rangeMs.from / 1000;
      } else {
        recordingDuration = audio && audio.duration > 0 ? audio.duration : 60;
        if (audio) audio.currentTime = 0;
      }

      toast.info('بدء التسجيل... لا تغلق هذه الصفحة');

      const blob = await videoRecorder.startRecording(
        canvas,
        audio,
        recordingDuration,
        audioEffects.getRecordingStream(),
        exportSettings.quality
      );

      if (blob) {
        toast.success('تم إنشاء الفيديو بنجاح!');
      }
    } catch (error) {
      console.error('Recording error:', error);
      toast.error('حدث خطأ في التسجيل');
    }
  };

  const toSafeFilename = useCallback((input: string) => {
    const s = input
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w.-]+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');
    return (s || 'quran-reel').slice(0, 80);
  }, []);

  const downloadFilename = useMemo(() => {
    const base = `${surah?.englishName || surah?.name || 'quran'}-${reciter?.id || 'reciter'}`;
    return `${toSafeFilename(base)}.mp4`;
  }, [surah?.englishName, surah?.name, reciter?.id, toSafeFilename]);

  // MP4 conversion removed - using WebM directly

  // Handle export based on format
  const handleExport = useCallback((format: ExportFormat) => {
    const baseFilename = toSafeFilename(
      `${surah?.englishName || surah?.name || 'quran'}-${reciter?.id || 'reciter'}`
    );

    switch (format) {
      case 'mp4':
        if (videoRecorder.mp4Blob) {
          videoRecorder.downloadMp4(`${baseFilename}.mp4`);
        } else {
          toast.error('ملف MP4 غير جاهز بعد');
        }
        break;
      case 'webm':
        if (videoRecorder.videoBlob) {
          videoRecorder.downloadWebm(`${baseFilename}.webm`);
        } else {
          toast.error('لا يوجد فيديو للتحميل');
        }
        break;
      case 'gif':
        toast.info('تحميل GIF غير متاح حالياً - جاري العمل عليه');
        break;
    }
  }, [surah, reciter, toSafeFilename, videoRecorder]);

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

  // Share functionality is now handled by SocialShareButtons component

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
              customBackground={customBackground}
              surahName={surah?.name || ''}
              reciterName={reciter?.name || ''}
              currentAyah={ayahs[currentAyahIndex] || null}
              currentAyahWords={currentAyahWords}
              highlightedWordIndex={highlightWordIndex}
              aspectRatio={aspectRatio}
              textSettings={textSettings}
              displaySettings={displaySettings}
              isPlaying={isPlaying}
              motionSpeed={exportSettings.motionSpeed}
            />

            {/* Audio Element - for both Quran and Islamic TTS mode */}
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
                <h3 className="text-xl font-bold">
                  {surah?.name}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {`الآيات ${startAyah} - ${endAyah} | ${reciter?.name}`}
                </p>
                {!useQuranFoundation && (
                  <p className="text-xs text-muted-foreground mt-1">
                    ⚠️ يتم استخدام الملف الصوتي الكامل (التزامن تقديري)
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-6">
                <TabsTrigger value="presets" className="gap-1">
                  <Palette className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs">قوالب</span>
                </TabsTrigger>
                <TabsTrigger value="controls" className="gap-1">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs">التحكم</span>
                </TabsTrigger>
                <TabsTrigger value="display" className="gap-1">
                  <Eye className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs">العرض</span>
                </TabsTrigger>
                <TabsTrigger value="effects" className="gap-1">
                  <Music className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs">الصوت</span>
                </TabsTrigger>
                <TabsTrigger value="background" className="gap-1">
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs">خلفية</span>
                </TabsTrigger>
                <TabsTrigger value="quality" className="gap-1">
                  <Video className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs">جودة</span>
                </TabsTrigger>
              </TabsList>

              {/* Presets Tab */}
              <TabsContent value="presets" className="mt-4">
                <PresetSelector
                  selectedPresetId={selectedPresetId}
                  onSelectPreset={applyPreset}
                />
              </TabsContent>

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
                  onToggleCopyrightProtection={audioEffects.toggleCopyrightProtection}
                />
              </TabsContent>

              <TabsContent value="background" className="mt-4">
                <CustomBackgroundUploader
                  currentBackground={customBackground}
                  onUpload={(url) => setCustomBackground(url || null)}
                />
              </TabsContent>

              <TabsContent value="quality" className="mt-4">
                <div className="space-y-4">
                  <ExportFormatSelector
                    settings={exportSettings}
                    onChange={setExportSettings}
                    onExport={handleExport}
                    videoBlob={videoRecorder.videoBlob}
                    mp4Blob={videoRecorder.mp4Blob}
                    isConverting={videoRecorder.isConverting}
                    isRecording={videoRecorder.isRecording}
                  />
                  <MotionSpeedControl
                    speed={exportSettings.motionSpeed}
                    onChange={(speed) => setExportSettings((prev) => ({ ...prev, motionSpeed: speed }))}
                  />
                </div>
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
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-center gap-2 text-primary p-3 rounded-lg bg-primary/10">
                          <Check className="h-5 w-5" />
                          <span className="font-medium">تم إنشاء الفيديو بنجاح!</span>
                        </div>

                        {/* Primary download - WebM (always works) */}
                        <Button
                          onClick={() => {
                            const baseFilename = toSafeFilename(
                              `${surah?.englishName || surah?.name || 'quran'}-${reciter?.id || 'reciter'}`
                            );
                            videoRecorder.downloadWebm(`${baseFilename}.webm`);
                          }}
                          className="w-full gap-2"
                          size="lg"
                        >
                          <Download className="h-5 w-5" />
                          تحميل الفيديو (WebM)
                        </Button>


                        {/* Social Share Buttons */}
                        <SocialShareButtons
                          videoBlob={videoRecorder.videoBlob}
                          title={`${surah?.name} - قرآن ريلز`}
                          text={`استمع لتلاوة ${surah?.name} بصوت ${reciter?.name}`}
                          filename={downloadFilename}
                        />

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