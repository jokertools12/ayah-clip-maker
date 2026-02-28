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
import { reciters, getAudioUrl, getEveryAyahUrl } from '@/data/reciters';
import { backgroundVideos, backgroundImages, slideshowBackgrounds, BackgroundItem } from '@/data/backgrounds';
import { useQuranApi } from '@/hooks/useQuranApi';
import { useAuth } from '@/hooks/useAuth';
import { useAudioEffects } from '@/hooks/useAudioEffects';
import { useVideoRecorder, ExportQuality } from '@/hooks/useVideoRecorder';
import {
  fetchChapterRecitationAudioById,
  QuranFoundationTimestamp,
} from '@/lib/quranFoundationApi';
import { concatenateAudioUrls } from '@/lib/audioConcat';
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

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/** How we play the ayahs */
type PlaybackMode =
  | 'qf'          // Quran Foundation single-file + word timestamps (best)
  | 'everyayah'   // EveryAyah.com – one MP3 per ayah (perfect verse clipping, no word highlight)
  | 'fallback';   // Full-surah mp3quran file with proportional estimation (last resort)

const DEFAULT_DISPLAY_SETTINGS: DisplaySettings = {
  showSurahName: true,
  showReciterName: true,
  showAyahText: true,
  showAyahNumber: true,
  highlightStyle: 'none',
  frameStyle: 'none',
  ayahNumberStyle: 'circle',
  surahNamePosition: 'top',
  surahNameStyle: 'classic',
  reciterNameStyle: 'simple',
  textShadowStyle: 'soft',
  decorationStyle: 'none',
  ayahTransition: 'fade',
  particleDensity: 'medium',
  watermarkEnabled: false,
  watermarkText: '',
  watermarkPosition: 'bottomRight',
};

const DEFAULT_EXPORT_SETTINGS: ExportSettings = {
  format: 'mp4',
  quality: 'high',
  motionSpeed: 1.5,
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function PreviewPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { fetchAyahs } = useQuranApi();
  const audioEffects = useAudioEffects();
  const videoRecorder = useVideoRecorder();

  // ── URL params ──────────────────────────────────────────────────────────────
  const surahNumber = parseInt(searchParams.get('surah') || '1');
  const reciterId = searchParams.get('reciter') || 'mishary_alafasy';
  const startAyah = parseInt(searchParams.get('start') || '1');
  const endAyah = parseInt(searchParams.get('end') || '5');
  const backgroundId = searchParams.get('background') || '';
  const backgroundType = searchParams.get('backgroundType') || 'video';
  const backgroundUrlParam = searchParams.get('backgroundUrl') || '';
  const backgroundThumbParam = searchParams.get('backgroundThumb') || '';
  const aspectRatio = (searchParams.get('ratio') || '9:16') as '9:16' | '16:9';

  const textSettings: TextSettings = {
    fontSize: parseInt(searchParams.get('fontSize') || '28'),
    fontFamily: searchParams.get('fontFamily') || '"Noto Naskh Arabic", serif',
    textColor: searchParams.get('textColor') || '#ffffff',
    shadowIntensity: parseFloat(searchParams.get('shadowIntensity') || '0.5'),
    overlayOpacity: parseFloat(searchParams.get('overlayOpacity') || '0.4'),
  };

  // ── Static derived data ─────────────────────────────────────────────────────
  const surah = surahs.find((s) => s.number === surahNumber);
  const reciter = reciters.find((r) => r.id === reciterId);
  const fallbackBackground = useMemo(
    () => [...backgroundVideos, ...backgroundImages, ...slideshowBackgrounds].find((bg) => bg.id === backgroundId) || backgroundImages[0],
    [backgroundId]
  );
  const background: BackgroundItem | null = useMemo(() => {
    if (!backgroundUrlParam) return fallbackBackground;

    return {
      id: backgroundId || `external-bg-${backgroundUrlParam}`,
      type: (backgroundType as BackgroundItem['type']) || 'video',
      url: backgroundUrlParam,
      thumbnail: backgroundThumbParam || backgroundUrlParam,
      name: 'خلفية مختارة',
      category: fallbackBackground.category,
    };
  }, [backgroundUrlParam, fallbackBackground, backgroundId, backgroundType, backgroundThumbParam]);
  const totalAyahsInSurah = surah?.numberOfAyahs ?? endAyah;

  // ── Settings state ──────────────────────────────────────────────────────────
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>(DEFAULT_DISPLAY_SETTINGS);
  const [customBackground, setCustomBackground] = useState<string | null>(null);
  const [exportSettings, setExportSettings] = useState<ExportSettings>(DEFAULT_EXPORT_SETTINGS);
  const [selectedPresetId, setSelectedPresetId] = useState<string | undefined>(undefined);

  const applyPreset = useCallback((preset: VideoPreset) => {
    setSelectedPresetId(preset.id);
    setDisplaySettings((prev) => ({ ...prev, ...preset.displaySettings }));
    setExportSettings((prev) => ({ ...prev, quality: preset.exportQuality }));
    toast.success(`تم تطبيق قالب "${preset.name}"`);
  }, []);

  // ── Ayah data ───────────────────────────────────────────────────────────────
  const [ayahs, setAyahs] = useState<{ numberInSurah: number; text: string }[]>([]);
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const [highlightWordIndex, setHighlightWordIndex] = useState<number | null>(null);
  const [highlightWordProgress, setHighlightWordProgress] = useState(0);

  // ── Playback state ──────────────────────────────────────────────────────────
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [activeTab, setActiveTab] = useState('controls');

  // ── Audio / timing data ─────────────────────────────────────────────────────
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>('fallback');

  // QF mode
  const [ayahTimings, setAyahTimings] = useState<(QuranFoundationTimestamp | null)[]>([]);
  const [audioUrl, setAudioUrl] = useState('');
  const [rangeMs, setRangeMs] = useState<{ from: number; to: number } | null>(null);

  // EveryAyah mode – exact timestamps from concatenated audio
  const [everyAyahUrls, setEveryAyahUrls] = useState<string[]>([]);
  const everyAyahIndexRef = useRef(0);
  // Exact timestamps from concatenated audio buffer
  const [everyAyahTimestamps, setEveryAyahTimestamps] = useState<{from: number; to: number}[]>([]);

  const [timingsLoading, setTimingsLoading] = useState(false);

  // ── Refs ────────────────────────────────────────────────────────────────────
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoPreviewRef = useRef<VideoPreviewRef>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // ── Load ayah texts ─────────────────────────────────────────────────────────
  useEffect(() => {
    const loadData = async () => {
      const data = await fetchAyahs(surahNumber, startAyah, endAyah);
      if (data) {
        const processedAyahs = data.map((ayah, index) => {
          let text = ayah.text;
          // Always strip bismillah from ayah 1 for all surahs except Al-Fatiha (1) & At-Tawbah (9)
          if (index === 0 && startAyah <= 1 && surahNumber !== 1 && surahNumber !== 9) {
            // Split and normalize each word to base Arabic letters only
            const words = text.split(/\s+/).filter(Boolean);
            const normalize = (w: string) => w
              .replace(/[^\u0621-\u064A\u0671-\u06FF]/g, '') // strip diacritics
              .replace(/[\u06E1\u06E4\u0640]/g, '') // strip sukun variants & tatweel
              .replace(/\u0671/g, '\u0627') // ٱ → ا
              .replace(/\u06CC/g, '\u064A'); // ی (farsi yeh) → ي
            
            let cutAfter = -1;
            for (let wi = 0; wi < Math.min(words.length, 8); wi++) {
              const clean = normalize(words[wi]);
              if (clean === 'الرحيم') {
                cutAfter = wi;
                break;
              }
            }
            if (cutAfter >= 0 && cutAfter < words.length - 1) {
              text = words.slice(cutAfter + 1).join(' ');
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

  // ── Load audio strategy ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!reciter) return;
    let cancelled = false;

    const load = async () => {
      setTimingsLoading(true);
      setAudioError(false);
      setAudioLoaded(false);
      setIsPlaying(false);
      setCurrentAyahIndex(0);
      setHighlightWordIndex(null);
      setHighlightWordProgress(0);
      setProgress(0);
      setCurrentTime(0);
      setDuration(0);
      setEveryAyahUrls([]);
      setEveryAyahTimestamps([]);
      everyAyahIndexRef.current = 0;

      // ── Strategy 1: Quran Foundation (word-level sync) ──────────────────────
      if (reciter.quranFoundationId) {
        try {
          const audioFile = await fetchChapterRecitationAudioById(reciter.quranFoundationId, surahNumber, true);
          const all = audioFile.timestamps ?? [];

          const byIndex: (QuranFoundationTimestamp | null)[] = Array.from(
            { length: endAyah - startAyah + 1 },
            (_, i) => {
              const key = `${surahNumber}:${startAyah + i}`;
              return all.find((t) => t.verse_key === key) ?? null;
            }
          );

          const existing = byIndex.filter(Boolean) as QuranFoundationTimestamp[];

          if (existing.length > 0 && !cancelled) {
            const from = existing[0].timestamp_from;
            const to = existing[existing.length - 1].timestamp_to;
            setAudioUrl(audioFile.audio_url);
            setAyahTimings(byIndex);
            setRangeMs({ from, to });
            setDuration(Math.max((to - from) / 1000, 0));
            setPlaybackMode('qf');
            console.log(`✅ QF mode – word-level sync, range ${from}–${to}ms`);
            setTimingsLoading(false);
            return;
          }
        } catch (e) {
          console.warn('QF failed, trying EveryAyah…', e);
        }
      }

      // ── Strategy 2: EveryAyah – concatenate individual files into one seamless audio ──
      if (reciter.everyAyahSubfolder && !cancelled) {
        const urls: string[] = [];
        for (let n = startAyah; n <= endAyah; n++) {
          urls.push(getEveryAyahUrl(reciter, surahNumber, n));
        }
        try {
          console.log(`⏳ Concatenating ${urls.length} ayah files into seamless audio…`);
          const result = await concatenateAudioUrls(urls, (loaded, total) => {
            console.log(`  📥 Downloaded ${loaded}/${total} ayah files`);
          });
          if (cancelled) return;

          setEveryAyahUrls(urls);
          setEveryAyahTimestamps(result.timestamps);
          setAudioUrl(result.blobUrl);
          setRangeMs(null); // No range needed – the blob IS the exact range
          setDuration(result.totalDuration);
          setPlaybackMode('everyayah');
          everyAyahIndexRef.current = 0;
          console.log(`✅ EveryAyah mode – seamless concatenated audio, ${urls.length} ayahs, total ${result.totalDuration.toFixed(1)}s`);
          setTimingsLoading(false);
          return;
        } catch (e) {
          console.warn('EveryAyah concatenation failed, falling back…', e);
        }
      }

      // ── Strategy 3: Full-surah mp3 with proportional estimate ───────────────
      if (!cancelled) {
        const url = getAudioUrl(reciter, surahNumber);
        setAudioUrl(url);
        setAyahTimings([]);
        setRangeMs(null);
        setPlaybackMode('fallback');
        console.log(`⚠️ Fallback mode – full surah mp3 with proportional estimation`);
      }

      if (!cancelled) setTimingsLoading(false);
    };

    load();
    return () => { cancelled = true; };
  }, [reciter?.id, reciter?.quranFoundationId, reciter?.everyAyahSubfolder, surahNumber, startAyah, endAyah]);

  // ── Audio effects init ──────────────────────────────────────────────────────
  useEffect(() => {
    if (audioRef.current && audioLoaded && !audioError) {
      audioEffects.initializeAudio(audioRef.current);
    }
  }, [audioLoaded, audioError]);

  // ── Derived range helpers (QF / fallback only) ──────────────────────────────
  const rangeStartSec = rangeMs ? rangeMs.from / 1000 : 0;
  const rangeEndSec = rangeMs ? rangeMs.to / 1000 : 0;

  // ── Audio event handlers ────────────────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // ── loadedmetadata ──────────────────────────────────────────────────────
    const handleLoadedMetadata = () => {
      if (playbackMode === 'qf' && rangeMs) {
        setDuration(Math.max((rangeMs.to - rangeMs.from) / 1000, 0));
        setAudioLoaded(true);
        setAudioError(false);
        return;
      }

      if (playbackMode === 'everyayah') {
        // Concatenated audio – duration is exact, no mapping needed
        setDuration(audio.duration);
        setAudioLoaded(true);
        setAudioError(false);
        return;
      }

      // Fallback: proportional estimation
      const totalDur = audio.duration;
      if (totalAyahsInSurah > 0 && totalDur > 0) {
        const estFrom = ((startAyah - 1) / totalAyahsInSurah) * totalDur;
        const estTo = (endAyah / totalAyahsInSurah) * totalDur;
        setRangeMs({ from: estFrom * 1000, to: estTo * 1000 });
        setDuration(Math.max(estTo - estFrom, 1));
        console.log(`📐 Fallback estimate: ${estFrom.toFixed(1)}s–${estTo.toFixed(1)}s of ${totalDur.toFixed(1)}s`);
      } else {
        setDuration(totalDur);
      }
      setAudioLoaded(true);
      setAudioError(false);
    };

    // ── timeupdate ───────────────────────────────────────────────────────────
    const handleTimeUpdate = () => {
      const nowSec = audio.currentTime;
      const nowMs = nowSec * 1000;

      // ── QF mode ─────────────────────────────────────────────────────────
      if (playbackMode === 'qf' && rangeMs) {
        const totalSec = Math.max((rangeMs.to - rangeMs.from) / 1000, 0.001);

        if (nowSec >= rangeEndSec) {
          audio.pause();
          audio.currentTime = rangeStartSec;
          setIsPlaying(false);
          setCurrentAyahIndex(0);
          setHighlightWordIndex(null);
          setHighlightWordProgress(0);
          setCurrentTime(0);
          setProgress(0);
          return;
        }

        const relativeSec = Math.max(nowSec - rangeStartSec, 0);
        setCurrentTime(relativeSec);
        setProgress(Math.min((relativeSec / totalSec) * 100, 100));

        // Find current verse
        for (let i = ayahTimings.length - 1; i >= 0; i--) {
          const t = ayahTimings[i];
          if (!t) continue;
          if (nowMs >= t.timestamp_from && nowMs < t.timestamp_to) {
            if (i !== currentAyahIndex) setCurrentAyahIndex(i);
            if (t.segments && t.segments.length > 0) {
              const seg = t.segments.find((s) => nowMs >= s[1] && nowMs < s[2]);
              if (seg) {
                setHighlightWordIndex(seg[0] - 1);
                const segDuration = Math.max(seg[2] - seg[1], 1);
                setHighlightWordProgress(Math.min(Math.max((nowMs - seg[1]) / segDuration, 0), 1));
              } else {
                setHighlightWordIndex(null);
                setHighlightWordProgress(0);
              }
            } else {
              setHighlightWordIndex(null);
              setHighlightWordProgress(0);
            }
            break;
          }
        }
        return;
      }

      // ── EveryAyah mode (concatenated seamless audio) ──────────────────────
      if (playbackMode === 'everyayah' && everyAyahTimestamps.length > 0) {
        const totalSec = Math.max(audio.duration, 0.001);

        if (nowSec >= totalSec - 0.05) {
          audio.pause();
          audio.currentTime = 0;
          setIsPlaying(false);
          setCurrentAyahIndex(0);
          setHighlightWordIndex(null);
          setHighlightWordProgress(0);
          setCurrentTime(0);
          setProgress(0);
          return;
        }

        setCurrentTime(nowSec);
        setProgress(Math.min((nowSec / totalSec) * 100, 100));

        // Find current ayah based on exact timestamps
        for (let i = everyAyahTimestamps.length - 1; i >= 0; i--) {
          if (nowSec >= everyAyahTimestamps[i].from) {
            if (i !== currentAyahIndex) {
              setCurrentAyahIndex(i);
            }
            // Word highlighting follows current ayah timeline (not fixed-speed animation)
            const ts = everyAyahTimestamps[i];
            const ayahDur = ts.to - ts.from;
            const posInAyah = nowSec - ts.from;
            const wordCount = (ayahs[i]?.text ?? '').split(' ').filter(Boolean).length;
            if (wordCount > 0 && ayahDur > 0) {
              const ratio = Math.min(Math.max(posInAyah / ayahDur, 0), 1);
              const wordIdx = Math.min(Math.floor(ratio * wordCount), wordCount - 1);
              setHighlightWordIndex(wordIdx);
              const perWord = 1 / wordCount;
              const localProgress = Math.min(Math.max((ratio - wordIdx * perWord) / Math.max(perWord, 0.0001), 0), 1);
              setHighlightWordProgress(localProgress);
            } else {
              setHighlightWordIndex(null);
              setHighlightWordProgress(0);
            }
            break;
          }
        }
        return;
      }

      // ── Fallback mode ────────────────────────────────────────────────────
      if (rangeMs) {
        const estStartSec = rangeMs.from / 1000;
        const estEndSec = rangeMs.to / 1000;
        const totalSec = Math.max(estEndSec - estStartSec, 0.001);

        if (nowSec >= estEndSec) {
          audio.pause();
          audio.currentTime = estStartSec;
          setIsPlaying(false);
          setCurrentAyahIndex(0);
          setHighlightWordIndex(null);
          setHighlightWordProgress(0);
          setCurrentTime(0);
          setProgress(0);
          return;
        }

        const relativeSec = Math.max(nowSec - estStartSec, 0);
        setCurrentTime(relativeSec);
        setProgress(Math.min((relativeSec / totalSec) * 100, 100));

        if (ayahs.length > 0) {
          const ayahDuration = totalSec / ayahs.length;
          const estimatedIndex = Math.min(Math.floor(relativeSec / ayahDuration), ayahs.length - 1);
          if (estimatedIndex !== currentAyahIndex) setCurrentAyahIndex(estimatedIndex);

          const wordCount = (ayahs[estimatedIndex]?.text ?? '').split(' ').filter(Boolean).length;
          if (wordCount > 0) {
            const posInAyah = Math.max(relativeSec - estimatedIndex * ayahDuration, 0);
            const ratio = Math.min(Math.max(posInAyah / Math.max(ayahDuration, 0.001), 0), 1);
            const wordIdx = Math.min(Math.floor(ratio * wordCount), wordCount - 1);
            setHighlightWordIndex(wordIdx);
            const perWord = 1 / wordCount;
            const localProgress = Math.min(Math.max((ratio - wordIdx * perWord) / Math.max(perWord, 0.0001), 0), 1);
            setHighlightWordProgress(localProgress);
          } else {
            setHighlightWordIndex(null);
            setHighlightWordProgress(0);
          }
        }
      } else {
        setCurrentTime(nowSec);
        setProgress(audio.duration > 0 ? (nowSec / audio.duration) * 100 : 0);
      }
    };

    // ── ended ────────────────────────────────────────────────────────────────
    const handleEnded = () => {
      // EveryAyah now uses ranged single-file, so handled by timeupdate range check.
      // QF / fallback / everyayah all reset the same way.
      setIsPlaying(false);
      setCurrentAyahIndex(0);
      setHighlightWordIndex(null);
      setHighlightWordProgress(0);
      setCurrentTime(0);
      setProgress(0);
      if (rangeMs) audio.currentTime = rangeMs.from / 1000;
      else audio.currentTime = 0;
    };

    const handleError = () => {
      console.error('Audio error for', audio.src);
      setAudioError(true);
      setAudioLoaded(true);
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
  }, [
    playbackMode, rangeMs, ayahTimings, currentAyahIndex,
    rangeStartSec, rangeEndSec, ayahs.length,
    totalAyahsInSurah, startAyah, endAyah,
    everyAyahTimestamps,
  ]);

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ── Play / Pause ────────────────────────────────────────────────────────────
  const togglePlay = useCallback(async () => {
    if (!audioRef.current) return;
    await audioEffects.resumeContext();

    const audio = audioRef.current;

    if (isPlaying) {
      audio.pause();
      return;
    }

    // EveryAyah: concatenated blob, play from start (no range)
    if (playbackMode === 'everyayah') {
      // If at end, restart
      if (audio.currentTime >= audio.duration - 0.1) {
        audio.currentTime = 0;
      }
    } else if (rangeMs) {
      if (audio.currentTime < rangeStartSec || audio.currentTime >= rangeEndSec) {
        audio.currentTime = rangeStartSec;
      }
    }
    audio.play().catch((err) => {
      console.error('Audio play error:', err);
      toast.error('حدث خطأ في تشغيل الصوت');
    });
  }, [isPlaying, audioEffects, rangeMs, rangeStartSec, rangeEndSec, playbackMode]);

  // ── Mute ───────────────────────────────────────────────────────────────────
  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  // ── Skip ayah (QF + EveryAyah) ─────────────────────────────────────────────
  const skipAyah = (direction: 'forward' | 'backward') => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playbackMode === 'everyayah' && everyAyahTimestamps.length > 0) {
      const newIndex = direction === 'forward'
        ? Math.min(currentAyahIndex + 1, ayahs.length - 1)
        : Math.max(currentAyahIndex - 1, 0);
      const ts = everyAyahTimestamps[newIndex];
      if (ts) {
        audio.currentTime = ts.from;
        setCurrentAyahIndex(newIndex);
      }
      return;
    }

    if (playbackMode === 'qf' && ayahTimings.length > 0) {
      const newIndex = direction === 'forward'
        ? Math.min(currentAyahIndex + 1, ayahs.length - 1)
        : Math.max(currentAyahIndex - 1, 0);
      const timing = ayahTimings[newIndex];
      if (timing) {
        audio.currentTime = timing.timestamp_from / 1000;
        setCurrentAyahIndex(newIndex);
        setHighlightWordIndex(null);
        setHighlightWordProgress(0);
      }
    }
  };

  // ── Video recording ─────────────────────────────────────────────────────────
  const handleStartRecording = async () => {
    const previewApi = videoPreviewRef.current;
    const canvas = previewApi?.getCanvas();
    if (!canvas || !previewApi) {
      toast.error('حدث خطأ في تجهيز التسجيل');
      return;
    }

    if (!previewApi.isBackgroundReady()) {
      toast.error('يرجى الانتظار حتى اكتمال تحميل الخلفية قبل التسجيل');
      return;
    }

    try {
      await audioEffects.resumeContext();

      // Warm up canvas with a fresh frame right before recording starts
      previewApi.drawFrame();
      await new Promise((resolve) => setTimeout(resolve, 80));
      previewApi.drawFrame();

      // Determine recording duration based on mode
      const audio = audioRef.current;
      let recordingDuration: number;

      if (playbackMode === 'everyayah') {
        // Concatenated blob – play from start, duration is exact
        recordingDuration = audio && audio.duration > 0 ? audio.duration : 60;
        if (audio) audio.currentTime = 0;
      } else if (rangeMs) {
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

      if (blob) toast.success('تم إنشاء الفيديو بنجاح!');
    } catch (error) {
      console.error('Recording error:', error);
      toast.error('حدث خطأ في التسجيل');
    }
  };

  // ── Filename helpers ────────────────────────────────────────────────────────
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

  // ── Export ──────────────────────────────────────────────────────────────────
  const handleExport = useCallback((format: ExportFormat) => {
    const baseFilename = toSafeFilename(
      `${surah?.englishName || surah?.name || 'quran'}-${reciter?.id || 'reciter'}`
    );
    switch (format) {
      case 'mp4':
        if (videoRecorder.mp4Blob) videoRecorder.downloadMp4(`${baseFilename}.mp4`);
        else toast.error('ملف MP4 غير جاهز بعد');
        break;
      case 'webm':
        if (videoRecorder.videoBlob) videoRecorder.downloadWebm(`${baseFilename}.webm`);
        else toast.error('لا يوجد فيديو للتحميل');
        break;
      case 'gif':
        toast.info('تحميل GIF غير متاح حالياً');
        break;
    }
  }, [surah, reciter, toSafeFilename, videoRecorder]);

  // ── Save to library ─────────────────────────────────────────────────────────
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

  // ── Mode label ──────────────────────────────────────────────────────────────
  const modeLabel = (() => {
    if (playbackMode === 'qf') return null; // perfect – no warning
    if (playbackMode === 'everyayah') return '✅ تزامن دقيق (تشغيل متصل بدون تقطيع)';
    return '⚠️ يتم استخدام الملف الصوتي الكامل (التزامن تقديري)';
  })();

  const canSkip = playbackMode === 'qf' || playbackMode === 'everyayah';

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-muted-foreground mb-6"
        >
          <Link to="/create" className="hover:text-primary transition-colors">إنشاء فيديو</Link>
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
              highlightWordProgress={highlightWordProgress}
              aspectRatio={aspectRatio}
              textSettings={textSettings}
              displaySettings={displaySettings}
              isPlaying={isPlaying}
              motionSpeed={exportSettings.motionSpeed}
            />

            <audio ref={audioRef} src={audioUrl} preload="auto" crossOrigin="anonymous" />
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
                  {`الآيات ${startAyah} - ${endAyah} | ${reciter?.name}`}
                </p>
                {modeLabel && (
                  <p className={`text-xs mt-1 ${playbackMode === 'everyayah' ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                    {modeLabel}
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

              <TabsContent value="presets" className="mt-4">
                <PresetSelector selectedPresetId={selectedPresetId} onSelectPreset={applyPreset} />
              </TabsContent>

              <TabsContent value="controls" className="mt-4">
                <Card>
                  <CardContent className="p-4 space-y-4">
                    {audioError && (
                      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-destructive">تعذر تحميل الصوت</p>
                          <p className="text-xs text-muted-foreground">قد يكون الملف غير متوفر لهذه السورة</p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => skipAyah('backward')}
                          disabled={currentAyahIndex === 0 || audioError || !canSkip}
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
                          disabled={currentAyahIndex === ayahs.length - 1 || audioError || !canSkip}
                        >
                          <SkipBack className="h-5 w-5" />
                        </Button>

                        <Button variant="ghost" size="icon" onClick={toggleMute}>
                          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Progress value={progress} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      </div>

                      <div className="text-center p-2 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">
                          الآية <span className="font-bold text-foreground">{ayahs[currentAyahIndex]?.numberInSurah || startAyah}</span> من {ayahs.length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="display" className="mt-4">
                <DisplaySettingsPanel settings={displaySettings} onChange={setDisplaySettings} />
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
                          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
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
                    disabled={!audioLoaded || audioError || timingsLoading}
                    className="w-full gap-2"
                    size="lg"
                  >
                    {timingsLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        جاري تحميل بيانات الصوت...
                      </>
                    ) : (
                      <>
                        <Video className="h-5 w-5" />
                        إنشاء الفيديو
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
