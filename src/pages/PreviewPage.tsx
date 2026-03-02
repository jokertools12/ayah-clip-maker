import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { getTrackById } from '@/data/ibtahalat';
import { transcribeFullAudio } from '@/lib/chunkedTranscribe';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { VideoPreview, VideoPreviewRef } from '@/components/VideoPreview';
import { AudioEffectsPanel } from '@/components/AudioEffectsPanel';
import { DisplaySettingsPanel, DisplaySettings } from '@/components/DisplaySettingsPanel';
import { CustomBackgroundUploader } from '@/components/CustomBackgroundUploader';
import { AudioTrimControl } from '@/components/AudioTrimControl';
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
import { useVideoRecorder, ExportQuality, getQualityDimensions } from '@/hooks/useVideoRecorder';
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
  Scissors,
  Trash2,
  Pencil,
  X,
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
  particleDensity: 'off',
  watermarkEnabled: false,
  watermarkText: '',
  watermarkPosition: 'bottomRight',
  performanceMode: 'balanced',
  glowStyle: 'golden',
  lyricsDisplayStyle: 'scroll',
};

// Note: frameStyle defaults to 'none' — user must explicitly select a frame

const DEFAULT_EXPORT_SETTINGS: ExportSettings = {
  format: 'mp4',
  quality: 'high',
  motionSpeed: 1.5,
  recordingMethod: 'auto',
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
  const pageMode = searchParams.get('mode') || 'quran'; // 'quran' | 'ibtahalat'
  const isIbtahalatMode = pageMode === 'ibtahalat';

  // Quran params
  const surahNumber = parseInt(searchParams.get('surah') || '1');
  const reciterId = searchParams.get('reciter') || 'mishary_alafasy';
  const startAyah = parseInt(searchParams.get('start') || '1');
  const endAyah = parseInt(searchParams.get('end') || '5');

  // Ibtahalat params
  const ibtTrackTitle = searchParams.get('trackTitle') || '';
  const ibtPerformerName = searchParams.get('performerName') || '';
  const ibtAudioUrl = searchParams.get('audioUrl') || '';

  // Shared params
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
      // Carry over slideImages from the original background data for animated slideshows
      slideImages: fallbackBackground.slideImages,
    };
  }, [backgroundUrlParam, fallbackBackground, backgroundId, backgroundType, backgroundThumbParam]);
  const totalAyahsInSurah = surah?.numberOfAyahs ?? endAyah;

  // ── Settings state ──────────────────────────────────────────────────────────
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>(DEFAULT_DISPLAY_SETTINGS);
  const [customBackground, setCustomBackground] = useState<string | null>(null);
  const [backgroundLoadMethod, setBackgroundLoadMethod] = useState<'direct' | 'proxy' | 'fallback' | null>(null);
  const [exportSettings, setExportSettings] = useState<ExportSettings>(DEFAULT_EXPORT_SETTINGS);
  const [selectedPresetId, setSelectedPresetId] = useState<string | undefined>(undefined);

  // ── Audio trimming state ────────────────────────────────────────────────────
  const [trimEnabled, setTrimEnabled] = useState(false);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);

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

  // ── Transcription state (ibtahalat) ─────────────────────────────────────────
  const [transcribedLines, setTranscribedLines] = useState<{ text: string; start: number; end: number }[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState(false);
  const [transcriptionProgress, setTranscriptionProgress] = useState<{ completed: number; total: number } | null>(null);
  const transcribedLinesRef = useRef<{ text: string; start: number; end: number }[]>([]);
  const [isEditingLyrics, setIsEditingLyrics] = useState(false);
  const [editingLyricsText, setEditingLyricsText] = useState('');

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
  const currentAyahIndexRef = useRef(0);
  const ayahsRef = useRef<{ numberInSurah: number; text: string }[]>([]);
  const recordingUiLastUpdateRef = useRef(0);

  // ── Load ayah texts (Quran mode) / Transcribe audio (Ibtahalat mode) ───────
  useEffect(() => {
    if (isIbtahalatMode) {
      // Start with title, then transcribe
      setAyahs([{ numberInSurah: 1, text: ibtTrackTitle }]);
      
      // Transcribe audio using chunked client-side processing (with cache)
      if (ibtAudioUrl && !isTranscribing && transcribedLines.length === 0 && !transcriptionError) {
        // Check cache first
        const cacheKey = `transcription_cache_${btoa(ibtAudioUrl).slice(0, 64)}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          try {
            const data = JSON.parse(cached) as { lines: { text: string; start: number; end: number }[] };
            if (data?.lines?.length > 0) {
              setTranscribedLines(data.lines);
              transcribedLinesRef.current = data.lines;
              setAyahs(data.lines.map((line, i) => ({ numberInSurah: i + 1, text: line.text })));
              toast.success(`تم تحميل ${data.lines.length} سطر من الذاكرة المؤقتة`);
              return;
            }
          } catch { /* ignore bad cache */ }
        }

        setIsTranscribing(true);
        setTranscriptionProgress(null);
        
        transcribeFullAudio(ibtAudioUrl, (completed, total) => {
          setTranscriptionProgress({ completed, total });
          console.log(`📝 Transcription progress: ${completed}/${total} chunks`);
        })
          .then(data => {
            if (data?.lines && data.lines.length > 0) {
              setTranscribedLines(data.lines);
              transcribedLinesRef.current = data.lines;
              const transcribedAyahs = data.lines.map((line, i) => ({
                numberInSurah: i + 1,
                text: line.text,
              }));
              setAyahs(transcribedAyahs);
              // Save to cache
              try { localStorage.setItem(cacheKey, JSON.stringify({ lines: data.lines })); } catch { /* quota */ }
              toast.success(`تم نسخ ${data.lines.length} سطر من الابتهال بنجاح`);
            } else {
              console.warn('No lines in transcription result');
              setTranscriptionError(true);
            }
          })
          .catch(err => {
            const message = err instanceof Error ? err.message : 'Unknown error';
            console.error('Transcription failed:', message);
            setTranscriptionError(true);
            toast.error('تعذر نسخ كلمات الابتهال تلقائياً');
          })
          .finally(() => {
            setIsTranscribing(false);
            setTranscriptionProgress(null);
          });
      }
      return;
    }
    const loadData = async () => {
      const data = await fetchAyahs(surahNumber, startAyah, endAyah);
      if (data) {
        const processedAyahs = data.map((ayah, index) => {
          let text = ayah.text;
          if (index === 0 && startAyah <= 1 && surahNumber !== 1 && surahNumber !== 9) {
            const words = text.split(/\s+/).filter(Boolean);
            const normalize = (w: string) => w
              .replace(/[^\u0621-\u064A\u0671-\u06FF]/g, '')
              .replace(/[\u06E1\u06E4\u0640]/g, '')
              .replace(/\u0671/g, '\u0627')
              .replace(/\u06CC/g, '\u064A');
            let cutAfter = -1;
            for (let wi = 0; wi < Math.min(words.length, 8); wi++) {
              const clean = normalize(words[wi]);
              if (clean === 'الرحيم') { cutAfter = wi; break; }
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
  }, [isIbtahalatMode, ibtTrackTitle, ibtAudioUrl, surahNumber, startAyah, endAyah, fetchAyahs]);

  useEffect(() => {
    currentAyahIndexRef.current = currentAyahIndex;
  }, [currentAyahIndex]);

  useEffect(() => {
    ayahsRef.current = ayahs;
  }, [ayahs]);

  const currentAyahWords = useMemo(() => {
    const text = ayahs[currentAyahIndex]?.text ?? '';
    return text.split(' ').filter(Boolean);
  }, [ayahs, currentAyahIndex]);

  // ── Load audio strategy ─────────────────────────────────────────────────────
  useEffect(() => {
    // Ibtahalat mode: simple direct audio URL, no complex sync
    if (isIbtahalatMode) {
      setAudioUrl(ibtAudioUrl);
      setPlaybackMode('fallback');
      setTimingsLoading(false);
      setAudioLoaded(false);
      setAyahTimings([]);
      setRangeMs(null);
      return;
    }

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
  }, [isIbtahalatMode, ibtAudioUrl, reciter?.id, reciter?.quranFoundationId, reciter?.everyAyahSubfolder, surahNumber, startAyah, endAyah]);

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
      if (isIbtahalatMode) {
        // Ibtahalat: play entire file, no range estimation needed
        setDuration(totalDur);
        setRangeMs(null);
        console.log(`🎵 Ibtahalat mode – full audio ${totalDur.toFixed(1)}s`);
      } else if (totalAyahsInSurah > 0 && totalDur > 0) {
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
      const isRecordingNow = videoRecorder.isRecording;

      const updateTimeline = (timeSec: number, percent: number) => {
        if (isRecordingNow) {
          const ts = performance.now();
          if (ts - recordingUiLastUpdateRef.current < 250) return;
          recordingUiLastUpdateRef.current = ts;
        }
        setCurrentTime(timeSec);
        setProgress(percent);
      };

      // ── Ibtahalat trim mode ─────────────────────────────────────────────
      if (isIbtahalatMode && trimEnabled && trimEnd > trimStart) {
        if (nowSec >= trimEnd) {
          audio.pause();
          audio.currentTime = trimStart;
          setIsPlaying(false);
          setCurrentTime(0);
          setProgress(0);
          return;
        }
        const relativeSec = Math.max(nowSec - trimStart, 0);
        const totalSec = Math.max(trimEnd - trimStart, 0.001);
        updateTimeline(relativeSec, Math.min((relativeSec / totalSec) * 100, 100));
        // Use transcribed timestamps if available
        const tLines = transcribedLinesRef.current;
        if (tLines.length > 0) {
          let foundIdx = 0;
          for (let i = tLines.length - 1; i >= 0; i--) {
            if (nowSec >= tLines[i].start) { foundIdx = i; break; }
          }
          if (foundIdx !== currentAyahIndexRef.current) setCurrentAyahIndex(foundIdx);
        } else {
          const lyricsCount = ayahsRef.current.length;
          if (lyricsCount > 0) {
            const lineIndex = Math.min(Math.floor((relativeSec / totalSec) * lyricsCount), lyricsCount - 1);
            if (lineIndex !== currentAyahIndexRef.current) setCurrentAyahIndex(lineIndex);
          }
        }
        return;
      }

      // ── Ibtahalat full mode (no trim) ───────────────────────────────────
      if (isIbtahalatMode && !trimEnabled) {
        const totalSec = Math.max(audio.duration, 0.001);
        updateTimeline(nowSec, Math.min((nowSec / totalSec) * 100, 100));
        // Use transcribed timestamps if available for accurate sync
        const tLines = transcribedLinesRef.current;
        if (tLines.length > 0) {
          let foundIdx = 0;
          for (let i = tLines.length - 1; i >= 0; i--) {
            if (nowSec >= tLines[i].start) { foundIdx = i; break; }
          }
          if (foundIdx !== currentAyahIndexRef.current) setCurrentAyahIndex(foundIdx);
        } else {
          const lyricsCount = ayahsRef.current.length;
          if (lyricsCount > 0) {
            const lineIndex = Math.min(Math.floor((nowSec / totalSec) * lyricsCount), lyricsCount - 1);
            if (lineIndex !== currentAyahIndexRef.current) setCurrentAyahIndex(lineIndex);
          }
        }
        return;
      }

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
        updateTimeline(relativeSec, Math.min((relativeSec / totalSec) * 100, 100));

        // Find current verse
        for (let i = ayahTimings.length - 1; i >= 0; i--) {
          const t = ayahTimings[i];
          if (!t) continue;
          if (nowMs >= t.timestamp_from && nowMs < t.timestamp_to) {
            if (i !== currentAyahIndexRef.current) setCurrentAyahIndex(i);

            // Disable expensive word-by-word highlight updates during recording
            if (isRecordingNow) {
              setHighlightWordIndex(null);
              setHighlightWordProgress(0);
            } else if (t.segments && t.segments.length > 0) {
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

        updateTimeline(nowSec, Math.min((nowSec / totalSec) * 100, 100));

        // Find current ayah based on exact timestamps
        for (let i = everyAyahTimestamps.length - 1; i >= 0; i--) {
          if (nowSec >= everyAyahTimestamps[i].from) {
            if (i !== currentAyahIndexRef.current) {
              setCurrentAyahIndex(i);
            }

            // Disable expensive word-by-word highlight updates during recording
            if (isRecordingNow) {
              setHighlightWordIndex(null);
              setHighlightWordProgress(0);
              break;
            }

            // Word highlighting follows current ayah timeline (not fixed-speed animation)
            const ts = everyAyahTimestamps[i];
            const ayahDur = ts.to - ts.from;
            const posInAyah = nowSec - ts.from;
            const wordCount = (ayahsRef.current[i]?.text ?? '').split(' ').filter(Boolean).length;
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
        updateTimeline(relativeSec, Math.min((relativeSec / totalSec) * 100, 100));

        const ayahsCount = ayahsRef.current.length;
        if (ayahsCount > 0) {
          const ayahDuration = totalSec / ayahsCount;
          const estimatedIndex = Math.min(Math.floor(relativeSec / ayahDuration), ayahsCount - 1);
          if (estimatedIndex !== currentAyahIndexRef.current) setCurrentAyahIndex(estimatedIndex);

          // Disable expensive word-by-word highlight updates during recording
          if (isRecordingNow) {
            setHighlightWordIndex(null);
            setHighlightWordProgress(0);
            return;
          }

          const wordCount = (ayahsRef.current[estimatedIndex]?.text ?? '').split(' ').filter(Boolean).length;
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
        updateTimeline(nowSec, audio.duration > 0 ? (nowSec / audio.duration) * 100 : 0);
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
    playbackMode, rangeMs, ayahTimings,
    rangeStartSec, rangeEndSec,
    totalAyahsInSurah, startAyah, endAyah,
    everyAyahTimestamps,
    videoRecorder.isRecording,
    isIbtahalatMode, trimEnabled, trimStart, trimEnd,
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

    // If trim is enabled (ibtahalat mode), use trim range
    if (trimEnabled && isIbtahalatMode && trimStart >= 0 && trimEnd > trimStart) {
      if (audio.currentTime < trimStart || audio.currentTime >= trimEnd) {
        audio.currentTime = trimStart;
      }
      audio.play().catch((err) => {
        console.error('Audio play error:', err);
        toast.error('حدث خطأ في تشغيل الصوت');
      });
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
  }, [isPlaying, audioEffects, rangeMs, rangeStartSec, rangeEndSec, playbackMode, trimEnabled, isIbtahalatMode, trimStart, trimEnd]);

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

    // Ibtahalat mode: skip by proportional time
    if (isIbtahalatMode) {
      const totalDur = trimEnabled && trimEnd > trimStart ? trimEnd - trimStart : audio.duration;
      const baseTime = trimEnabled && trimEnd > trimStart ? trimStart : 0;
      const lyricsCount = ayahs.length;
      if (lyricsCount <= 0) return;
      const newIndex = direction === 'forward'
        ? Math.min(currentAyahIndex + 1, lyricsCount - 1)
        : Math.max(currentAyahIndex - 1, 0);
      const targetTime = baseTime + (newIndex / lyricsCount) * totalDur;
      audio.currentTime = targetTime;
      setCurrentAyahIndex(newIndex);
      return;
    }

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
    if (!previewApi) {
      toast.error('حدث خطأ في تجهيز التسجيل');
      return;
    }

    if (!previewApi.isBackgroundReady()) {
      toast.error('يرجى الانتظار حتى اكتمال تحميل الخلفية قبل التسجيل');
      return;
    }

    try {
      await audioEffects.resumeContext();
      await previewApi.ensureBackgroundPlayback();

      // Determine recording duration based on playback mode
      const audio = audioRef.current;
      let recordingDuration: number;
      let recordingStartAt = 0;

      // Ibtahalat trim mode
      if (isIbtahalatMode && trimEnabled && trimEnd > trimStart) {
        recordingDuration = trimEnd - trimStart;
        recordingStartAt = trimStart;
      } else if (playbackMode === 'everyayah') {
        recordingDuration = audio && audio.duration > 0 ? audio.duration : 60;
        recordingStartAt = 0;
      } else if (rangeMs) {
        recordingDuration = Math.max((rangeMs.to - rangeMs.from) / 1000, 1);
        recordingStartAt = rangeMs.from / 1000;
      } else {
        recordingDuration = audio && audio.duration > 0 ? audio.duration : 60;
        recordingStartAt = 0;
      }

      const isLongRecording = recordingDuration >= 45;
      const isVeryLongRecording = recordingDuration >= 90;
      const longRecordingFpsCap = isVeryLongRecording ? 18 : isLongRecording ? 20 : 30;
      const clampQualityForDuration = (quality: ExportQuality): ExportQuality => {
        if (isVeryLongRecording) return 'low';
        if (!isLongRecording) return quality;
        if (quality === 'ultra' || quality === 'high') return 'medium';
        return quality;
      };

      type RecordingAttemptKey = 'smooth' | 'compatibility' | 'quality';
      type RecordingAttempt = {
        id: RecordingAttemptKey;
        label: string;
        renderMode: 'recording' | 'recordingLite';
        fps: number;
        quality: ExportQuality;
        recorderOptions: {
          strategy: 'smooth' | 'compatibility' | 'quality';
          bitrateMultiplier: number;
          timesliceMs: number;
          mimeTypeCandidates: string[];
          captureStreamFps: number;
        };
      };

      const baseFps = previewApi.getRecommendedRecordingFps();
      const selectedQuality = clampQualityForDuration(exportSettings.quality);
      const compatibilityQuality: ExportQuality = clampQualityForDuration(
        exportSettings.quality === 'ultra'
          ? 'medium'
          : exportSettings.quality === 'high'
          ? 'medium'
          : exportSettings.quality
      );

      const attemptsByMode: Record<RecordingAttemptKey, RecordingAttempt> = {
        smooth: {
          id: 'smooth',
          label: 'سلس',
          renderMode: isLongRecording ? 'recordingLite' : 'recording',
          fps: Math.max(18, Math.min(baseFps, isLongRecording ? 22 : 26, longRecordingFpsCap)),
          quality: selectedQuality,
          recorderOptions: {
            strategy: 'smooth',
            bitrateMultiplier: isLongRecording ? 0.82 : 0.9,
            timesliceMs: isLongRecording ? 2600 : 1800,
            mimeTypeCandidates: ['video/webm;codecs=vp8,opus', 'video/webm;codecs=vp9,opus', 'video/webm'],
            captureStreamFps: Math.max(18, Math.min(baseFps, isLongRecording ? 22 : 26, longRecordingFpsCap)),
          },
        },
        compatibility: {
          id: 'compatibility',
          label: 'توافق عالي',
          renderMode: 'recordingLite',
          fps: Math.max(16, Math.min(baseFps - 2, isLongRecording ? 20 : 22, longRecordingFpsCap)),
          quality: compatibilityQuality,
          recorderOptions: {
            strategy: 'compatibility',
            bitrateMultiplier: isVeryLongRecording ? 0.6 : 0.72,
            timesliceMs: isLongRecording ? 2800 : 2200,
            mimeTypeCandidates: ['video/webm;codecs=vp8,opus', 'video/webm'],
            captureStreamFps: Math.max(16, Math.min(baseFps - 2, isLongRecording ? 20 : 22, longRecordingFpsCap)),
          },
        },
        quality: {
          id: 'quality',
          label: 'جودة قصوى',
          renderMode: isLongRecording ? 'recordingLite' : 'recording',
          fps: Math.max(20, Math.min(baseFps + 1, isLongRecording ? 24 : 30, longRecordingFpsCap)),
          quality: selectedQuality,
          recorderOptions: {
            strategy: isLongRecording ? 'smooth' : 'quality',
            bitrateMultiplier: isLongRecording ? 0.86 : 1,
            timesliceMs: isLongRecording ? 2200 : 1400,
            mimeTypeCandidates: isLongRecording
              ? ['video/webm;codecs=vp8,opus', 'video/webm']
              : ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'],
            captureStreamFps: Math.max(20, Math.min(baseFps + 1, isLongRecording ? 24 : 30, longRecordingFpsCap)),
          },
        },
      };

      // Start with compatibility for auto mode (least CPU), only try heavier if it fails
      const selectedMode: RecordingAttemptKey = exportSettings.recordingMethod === 'auto' ? 'compatibility' : exportSettings.recordingMethod;
      const attempts = exportSettings.recordingMethod === 'auto'
        ? [attemptsByMode.compatibility, attemptsByMode.smooth, attemptsByMode.quality]
        : [attemptsByMode[selectedMode]];

      if (isLongRecording) {
        toast.info('تم تفعيل وضع التسجيل الطويل تلقائيًا لتجنب التهنيج.');
      }

      let lastError: unknown = null;

      for (let i = 0; i < attempts.length; i++) {
        const attempt = attempts[i];
        let stopIsolatedLoop: (() => void) | null = null;

        try {
          const recordingCanvas = document.createElement('canvas');
          // Use quality-based dimensions; for lite mode, scale down once here
          const recordingDimensions = getQualityDimensions(attempt.quality, aspectRatio);
          const liteScale = attempt.renderMode === 'recordingLite' ? 0.67 : 1;
          recordingCanvas.width = Math.round(recordingDimensions.width * liteScale);
          recordingCanvas.height = Math.round(recordingDimensions.height * liteScale);

          const frameInterval = Math.max(1000 / attempt.fps, 16);
          let rafId: number | null = null;
          let lastFrameTime = 0;
          let stopped = false;

          const drawIsolatedFrame = () => {
            const livePreviewApi = videoPreviewRef.current;
            const draw = livePreviewApi?.drawFrame ?? previewApi.drawFrame;
            draw(recordingCanvas, attempt.renderMode);
          };

          const renderIsolatedFrame = (now: number) => {
            if (stopped) return;
            rafId = requestAnimationFrame(renderIsolatedFrame);
            if (now - lastFrameTime < frameInterval) return;
            lastFrameTime = now;
            drawIsolatedFrame();
          };

          drawIsolatedFrame();
          rafId = requestAnimationFrame(renderIsolatedFrame);

          stopIsolatedLoop = () => {
            stopped = true;
            if (rafId !== null) {
              cancelAnimationFrame(rafId);
              rafId = null;
            }
          };

          // Warm up isolated canvas before captureStream starts
          await new Promise((resolve) => setTimeout(resolve, 120));
          drawIsolatedFrame();

          if (audio) {
            audio.pause();
            audio.currentTime = recordingStartAt;
          }

          toast.info(
            exportSettings.recordingMethod === 'auto'
              ? `بدء التسجيل (${attempt.label})...`
              : 'بدء التسجيل...'
          );

          const blob = await videoRecorder.startRecording(
            recordingCanvas,
            audio,
            recordingDuration,
            audioEffects.getRecordingStream(),
            attempt.quality,
            attempt.fps,
            attempt.recorderOptions
          );

          if (blob) {
            toast.success('تم إنشاء الفيديو بنجاح!');
            return;
          }

          lastError = new Error('لم يتم إنشاء ملف فيديو');
        } catch (error) {
          lastError = error;

          if (i < attempts.length - 1) {
            videoRecorder.reset();
            toast.warning(`فشل وضع "${attempt.label}"، سيتم تجربة وضع بديل...`);
            await previewApi.ensureBackgroundPlayback();
          }
        } finally {
          stopIsolatedLoop?.();
        }
      }

      throw lastError instanceof Error ? lastError : new Error('حدث خطأ في التسجيل');
    } catch (error) {
      console.error('Recording error:', error);
      toast.error('فشل التسجيل على هذا الوضع. جرّب طريقة توافق أعلى أو جودة أقل.');
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
    const base = isIbtahalatMode
      ? `ibtahal-${ibtTrackTitle.slice(0, 30)}`
      : `${surah?.englishName || surah?.name || 'quran'}-${reciter?.id || 'reciter'}`;
    return `${toSafeFilename(base)}.mp4`;
  }, [isIbtahalatMode, ibtTrackTitle, surah?.englishName, surah?.name, reciter?.id, toSafeFilename]);

  // ── Export ──────────────────────────────────────────────────────────────────
  const handleExport = useCallback((format: ExportFormat) => {
    const baseFilename = toSafeFilename(
      isIbtahalatMode
        ? `ibtahal-${ibtTrackTitle.slice(0, 30)}`
        : `${surah?.englishName || surah?.name || 'quran'}-${reciter?.id || 'reciter'}`
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
        surah_number: isIbtahalatMode ? 0 : surahNumber,
        surah_name: isIbtahalatMode ? `ابتهال: ${ibtTrackTitle}` : (surah?.name || ''),
        reciter_id: isIbtahalatMode ? 'ibtahalat' : reciterId,
        reciter_name: isIbtahalatMode ? ibtPerformerName : (reciter?.name || ''),
        start_ayah: isIbtahalatMode ? 0 : startAyah,
        end_ayah: isIbtahalatMode ? 0 : endAyah,
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
    if (isIbtahalatMode) return null; // Ibtahalat uses direct URL, no sync warning needed
    if (playbackMode === 'qf') return null; // perfect – no warning
    if (playbackMode === 'everyayah') return '✅ تزامن دقيق (تشغيل متصل بدون تقطيع)';
    return '⚠️ يتم استخدام الملف الصوتي الكامل (التزامن تقديري)';
  })();

  const canSkip = playbackMode === 'qf' || playbackMode === 'everyayah' || isIbtahalatMode;

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
          <Link to={isIbtahalatMode ? "/ibtahalat" : "/create"} className="hover:text-primary transition-colors">
            {isIbtahalatMode ? 'ابتهالات وتواشيح' : 'إنشاء فيديو'}
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
              surahName={isIbtahalatMode ? ibtTrackTitle : (surah?.name || '')}
              reciterName={isIbtahalatMode ? ibtPerformerName : (reciter?.name || '')}
              currentAyah={ayahs[currentAyahIndex] || null}
              currentAyahWords={currentAyahWords}
              highlightedWordIndex={highlightWordIndex}
              highlightWordProgress={highlightWordProgress}
              aspectRatio={aspectRatio}
              textSettings={textSettings}
              displaySettings={isIbtahalatMode ? { ...displaySettings, showAyahNumber: false } : displaySettings}
              isPlaying={isPlaying}
              isRecording={videoRecorder.isRecording}
              motionSpeed={exportSettings.motionSpeed}
              onBackgroundLoadMethod={setBackgroundLoadMethod}
              ibtahalatLyricsMode={isIbtahalatMode && transcribedLines.length > 1}
              allLyricsLines={isIbtahalatMode && transcribedLines.length > 1 ? transcribedLines.map(l => l.text) : []}
              currentLyricsIndex={currentAyahIndex}
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
                <h3 className="text-xl font-bold">{isIbtahalatMode ? ibtTrackTitle : surah?.name}</h3>
                <p className="text-muted-foreground text-sm">
                  {isIbtahalatMode
                    ? ibtPerformerName
                    : `الآيات ${startAyah} - ${endAyah} | ${reciter?.name}`}
                </p>
                {modeLabel && (
                  <p className={`text-xs mt-1 ${playbackMode === 'everyayah' ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                    {modeLabel}
                  </p>
                )}
                {isIbtahalatMode && isTranscribing && (
                  <div className="mt-2 space-y-1.5">
                    <div className="flex items-center gap-1 text-xs text-amber-500">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      {transcriptionProgress
                        ? `جارٍ نسخ الجزء ${transcriptionProgress.completed} من ${transcriptionProgress.total}...`
                        : 'جارٍ تحميل الصوت وتحضيره للنسخ...'}
                    </div>
                    {transcriptionProgress && transcriptionProgress.total > 0 && (
                      <Progress
                        value={(transcriptionProgress.completed / transcriptionProgress.total) * 100}
                        className="h-2"
                      />
                    )}
                  </div>
                )}
                {isIbtahalatMode && transcribedLines.length > 0 && !isEditingLyrics && (
                  <div className="mt-2 space-y-2">
                    <p className="text-xs text-green-600 dark:text-green-400">
                      ✅ تم نسخ {transcribedLines.length} سطر — مزامنة دقيقة مع الصوت
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={() => {
                          setIsEditingLyrics(true);
                          setEditingLyricsText(transcribedLines.map(l => l.text).join('\n'));
                        }}
                      >
                        <Pencil className="h-3 w-3" />
                        تعديل الكلمات
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1 text-destructive hover:text-destructive"
                        onClick={() => {
                          const cacheKey = `transcription_cache_${btoa(ibtAudioUrl).slice(0, 64)}`;
                          localStorage.removeItem(cacheKey);
                          setTranscribedLines([]);
                          transcribedLinesRef.current = [];
                          setTranscriptionError(false);
                          setAyahs([{ numberInSurah: 1, text: ibtTrackTitle }]);
                          toast.success('تم مسح الكاش، سيتم إعادة النسخ تلقائياً');
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                        إعادة النسخ
                      </Button>
                    </div>
                  </div>
                )}
                {isIbtahalatMode && isEditingLyrics && (
                  <div className="mt-2 space-y-2">
                    <p className="text-xs font-medium">تعديل الكلمات يدوياً (سطر لكل جملة):</p>
                    <textarea
                      className="w-full min-h-[120px] text-sm rounded-md border border-input bg-background px-3 py-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      dir="rtl"
                      value={editingLyricsText}
                      onChange={(e) => setEditingLyricsText(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={() => {
                          const newLines = editingLyricsText.split('\n').filter(l => l.trim());
                          if (newLines.length === 0) {
                            toast.error('لا يمكن حفظ كلمات فارغة');
                            return;
                          }
                          // Redistribute timings evenly across new lines
                          const totalDur = transcribedLines.length > 0
                            ? transcribedLines[transcribedLines.length - 1].end
                            : duration || 60;
                          const segDur = totalDur / newLines.length;
                          const updated = newLines.map((text, i) => ({
                            text: text.trim(),
                            start: i * segDur,
                            end: (i + 1) * segDur,
                          }));
                          setTranscribedLines(updated);
                          transcribedLinesRef.current = updated;
                          setAyahs(updated.map((l, i) => ({ numberInSurah: i + 1, text: l.text })));
                          // Update cache
                          const cacheKey = `transcription_cache_${btoa(ibtAudioUrl).slice(0, 64)}`;
                          try { localStorage.setItem(cacheKey, JSON.stringify({ lines: updated })); } catch {}
                          setIsEditingLyrics(false);
                          toast.success(`تم حفظ ${updated.length} سطر`);
                        }}
                      >
                        <Check className="h-3 w-3" />
                        حفظ
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={() => setIsEditingLyrics(false)}
                      >
                        <X className="h-3 w-3" />
                        إلغاء
                      </Button>
                    </div>
                  </div>
                )}
                {isIbtahalatMode && transcriptionError && (
                  <p className="text-xs mt-1 text-muted-foreground">
                    ⚠️ يتم عرض عنوان الابتهال فقط
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-3 sm:grid-cols-6 gap-0.5 h-auto p-1">
                <TabsTrigger value="presets" className="gap-1 text-xs px-2 py-2">
                  <Palette className="h-3.5 w-3.5" />
                  قوالب
                </TabsTrigger>
                <TabsTrigger value="controls" className="gap-1 text-xs px-2 py-2">
                  <Settings className="h-3.5 w-3.5" />
                  التحكم
                </TabsTrigger>
                <TabsTrigger value="display" className="gap-1 text-xs px-2 py-2">
                  <Eye className="h-3.5 w-3.5" />
                  العرض
                </TabsTrigger>
                <TabsTrigger value="effects" className="gap-1 text-xs px-2 py-2">
                  <Music className="h-3.5 w-3.5" />
                  الصوت
                </TabsTrigger>
                <TabsTrigger value="background" className="gap-1 text-xs px-2 py-2">
                  <Upload className="h-3.5 w-3.5" />
                  خلفية
                </TabsTrigger>
                <TabsTrigger value="quality" className="gap-1 text-xs px-2 py-2">
                  <Video className="h-3.5 w-3.5" />
                  جودة
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
                          disabled={currentAyahIndex === 0 || audioError || (!canSkip && !isIbtahalatMode)}
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
                          disabled={currentAyahIndex === ayahs.length - 1 || audioError || (!canSkip && !isIbtahalatMode)}
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
                          {isIbtahalatMode ? 'السطر' : 'الآية'}{' '}
                          <span className="font-bold text-foreground">{isIbtahalatMode ? currentAyahIndex + 1 : (ayahs[currentAyahIndex]?.numberInSurah || startAyah)}</span>{' '}
                          من {ayahs.length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Audio Trim Control - shown for ibtahalat mode */}
                {isIbtahalatMode && (
                  <AudioTrimControl
                    totalDuration={duration}
                    onTrimChange={(start, end) => {
                      setTrimStart(start);
                      setTrimEnd(end);
                    }}
                    trimEnabled={trimEnabled}
                    onTrimEnabledChange={setTrimEnabled}
                    disabled={!audioLoaded || audioError}
                  />
                )}
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
