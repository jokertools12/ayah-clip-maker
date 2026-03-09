import { useRef, useEffect, forwardRef, useImperativeHandle, useCallback, useState } from 'react';
import { BackgroundItem } from '@/data/backgrounds';

// Font family mapping for canvas
const FONT_MAP: Record<string, string> = {
  '"Noto Naskh Arabic", serif': 'Noto Naskh Arabic',
  '"Amiri", serif': 'Amiri',
  '"Amiri Quran", serif': 'Amiri Quran',
  '"Cairo", sans-serif': 'Cairo',
  '"Scheherazade New", serif': 'Scheherazade New',
  '"Aref Ruqaa", serif': 'Aref Ruqaa',
  '"Reem Kufi", sans-serif': 'Reem Kufi',
  '"Lateef", serif': 'Lateef',
  '"El Messiri", sans-serif': 'El Messiri',
  '"Tajawal", sans-serif': 'Tajawal',
  '"Mada", sans-serif': 'Mada',
};

// Slideshow configuration
const SLIDESHOW_TRANSITION_DURATION = 1800; // 1.8s smooth transition
const SLIDESHOW_DISPLAY_DURATION = 5000; // 5 seconds per image
const SLIDESHOW_TRANSITIONS = ['crossfade', 'slideLeft', 'slideRight', 'slideUp', 'zoomThrough', 'wipe'] as const;
type SlideshowTransition = typeof SLIDESHOW_TRANSITIONS[number];
const DEFAULT_TARGET_FPS = 30;
const FRAME_INTERVAL_DEFAULT = 1000 / DEFAULT_TARGET_FPS;

interface VideoPreviewProps {
  background: BackgroundItem | null;
  customBackground?: string | null;
  surahName: string;
  reciterName: string;
  currentAyah: { numberInSurah: number; text: string } | null;
  currentAyahWords?: string[];
  highlightedWordIndex?: number | null;
  highlightWordProgress?: number;
  aspectRatio: '9:16' | '16:9';
  textSettings: {
    fontSize: number;
    fontFamily: string;
    textColor: string;
    shadowIntensity: number;
    overlayOpacity: number;
  };
  displaySettings?: {
    showSurahName: boolean;
    showReciterName: boolean;
    showAyahText: boolean;
    showAyahNumber: boolean;
    highlightStyle: 'none' | 'solid' | 'glow' | 'underline' | 'shadow';
    frameStyle: 'none' | 'simple' | 'ornate' | 'golden' | 'geometric' | 'modern' | 'minimal';
    ayahNumberStyle: 'circle' | 'star' | 'diamond' | 'octagon' | 'flower' | 'square' | 'hexagon';
    ayahNumberColor?: 'gold' | 'white' | 'silver' | 'emerald' | 'royal';
    verseDisplayMode?: 'full' | 'twoWords' | 'threeTwo' | 'wordByWord';
    surahNamePosition?: 'top' | 'bottom' | 'topLeft' | 'topRight';
    surahNameStyle?: 'classic' | 'banner' | 'calligraphy' | 'circle' | 'diamond' | 'ribbon';
    reciterNameStyle?: 'simple' | 'elegant' | 'badge' | 'tag' | 'glow';
    textShadowStyle?: 'soft' | 'strong' | 'none' | 'glow';
    decorationStyle?: 'none' | 'sideBorder' | 'separator' | 'both';
    ayahTransition?: 'none' | 'fade' | 'slide' | 'zoom' | 'blur' | 'rise' | 'rotate' | 'cinematic' | 'elastic' | 'random';
    particleDensity?: 'off' | 'low' | 'medium' | 'high';
    watermarkEnabled?: boolean;
    watermarkText?: string;
    watermarkPosition?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight' | 'bottomCenter';
    performanceMode?: 'economy' | 'balanced' | 'pro';
    glowStyle?: 'none' | 'golden' | 'soft' | 'neon' | 'pulse';
    lyricsDisplayStyle?: 'scroll' | 'single' | 'karaoke' | 'fade';
    slideshowTransition?: 'crossfade' | 'slideLeft' | 'slideRight' | 'slideUp' | 'zoomThrough' | 'wipe' | 'mixed';
  };
  isPlaying: boolean;
  isRecording?: boolean;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
  onBackgroundLoadMethod?: (method: 'direct' | 'proxy' | 'fallback') => void;
  motionSpeed?: number; // 1-10, default 3
  /** Ibtahalat lyrics mode: show all lines with current line glowing */
  ibtahalatLyricsMode?: boolean;
  /** All lyrics lines for ibtahalat mode */
  allLyricsLines?: string[];
  /** Index of currently active lyrics line */
  currentLyricsIndex?: number;
}

export interface VideoPreviewRef {
  getContainer: () => HTMLDivElement | null;
  getCanvas: () => HTMLCanvasElement | null;
  isBackgroundReady: () => boolean;
  ensureBackgroundPlayback: () => Promise<void>;
  getRecordingDimensions: () => { width: number; height: number };
  getRecommendedRecordingFps: () => number;
  drawFrame: (targetCanvas?: HTMLCanvasElement, renderMode?: 'preview' | 'recording' | 'recordingLite') => void;
}

const DEFAULT_DISPLAY_SETTINGS = {
  showSurahName: true,
  showReciterName: true,
  showAyahText: true,
  showAyahNumber: true,
  highlightStyle: 'none' as const,
  frameStyle: 'none' as const,
  ayahNumberStyle: 'circle' as const,
  ayahNumberColor: 'gold' as const,
  verseDisplayMode: 'full' as const,
  surahNamePosition: 'top' as const,
  surahNameStyle: 'classic' as const,
  reciterNameStyle: 'simple' as const,
  textShadowStyle: 'soft' as const,
  decorationStyle: 'separator' as const,
  ayahTransition: 'fade' as const,
  particleDensity: 'off' as const,
  watermarkEnabled: false,
  watermarkText: '',
  watermarkPosition: 'bottomRight' as const,
  performanceMode: 'balanced' as const,
  glowStyle: 'golden' as const,
  lyricsDisplayStyle: 'scroll' as const,
  slideshowTransition: 'crossfade' as const,
};

export const VideoPreview = forwardRef<VideoPreviewRef, VideoPreviewProps>(({
  background,
  customBackground,
  surahName,
  reciterName,
  currentAyah,
  currentAyahWords,
  highlightedWordIndex,
  highlightWordProgress = 0,
  aspectRatio,
  textSettings,
  displaySettings = DEFAULT_DISPLAY_SETTINGS,
  isPlaying,
  isRecording = false,
  onCanvasReady,
  onBackgroundLoadMethod,
  motionSpeed = 3,
  ibtahalatLyricsMode = false,
  allLyricsLines = [],
  currentLyricsIndex = 0,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const drawFrameRuntimeRef = useRef<(targetCanvas?: HTMLCanvasElement, renderMode?: 'preview' | 'recording' | 'recordingLite') => void>(() => {});
  const [imageLoaded, setImageLoaded] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  // Slideshow state
  const slideshowImagesRef = useRef<HTMLImageElement[]>([]);
  const [slideshowReady, setSlideshowReady] = useState(false);
  const slideshowStartTimeRef = useRef<number>(Date.now());

  // Per-image Ken Burns motion presets for smooth, varied transitions
  const kenBurnsPresetsRef = useRef<Array<{
    zoomStart: number; zoomEnd: number;
    panXStart: number; panXEnd: number;
    panYStart: number; panYEnd: number;
    transition: SlideshowTransition;
  }>>([]);

  // Smooth chunk cycling counter for non-full verse modes
  const chunkCounterRef = useRef<number>(0);
  const lastChunkTimeRef = useRef<number>(Date.now());
  // Fade transition between chunks
  const prevChunkIndexRef = useRef<number>(-1);
  const chunkFadeRef = useRef<number>(1);
  const chunkFadeStartRef = useRef<number>(0);
  const currentAyahIdRef = useRef<number>(-1);

  // ── Text layout cache ───────────────────────────────────────────────────
  const textLayoutCacheRef = useRef<{
    key: string;
    lines: string[][];
    spaceWidth: number;
    totalHeight: number;
    startY: number;
    lineHeight: number;
  } | null>(null);

  // Verse transition state
  const prevAyahRef = useRef<{ numberInSurah: number; text: string } | null>(null);
  const transitionStartRef = useRef<number>(0);
  const isTransitioningRef = useRef(false);
  const VERSE_TRANSITION_DURATION = 800; // ms
  // For random transition: pick a random effect per verse change
  const RANDOM_TRANSITIONS: Array<'fade' | 'slide' | 'zoom' | 'blur' | 'rise' | 'rotate' | 'cinematic' | 'elastic'> = ['fade', 'slide', 'zoom', 'blur', 'rise', 'rotate', 'cinematic', 'elastic'];
  const currentRandomTransitionRef = useRef<string>('fade');

  // Base dimensions for final recording quality (used as reference for scaling)
  const getRecordingDimensions = useCallback(() => {
    if (aspectRatio === '9:16') {
      return { width: 1080, height: 1920 };
    }
    return { width: 1920, height: 1080 };
  }, [aspectRatio]);

  const getRecommendedRecordingFps = useCallback(() => {
    const perfMode = displaySettings.performanceMode || 'balanced';
    if (perfMode === 'economy') return 24;
    if (perfMode === 'pro') return 30;
    return 27;
  }, [displaySettings.performanceMode]);

  const ensureBackgroundPlayback = useCallback(async () => {
    if ((background?.type || 'image') !== 'video') return;

    const video = videoRef.current;
    if (!video) return;

    if (video.readyState < 2) {
      await new Promise<void>((resolve) => {
        let timeoutId: number | null = null;

        const cleanup = () => {
          video.removeEventListener('loadeddata', onReady);
          video.removeEventListener('canplay', onReady);
          video.removeEventListener('error', onDone);
          if (timeoutId !== null) window.clearTimeout(timeoutId);
        };

        const onDone = () => {
          cleanup();
          resolve();
        };

        const onReady = () => {
          cleanup();
          resolve();
        };

        video.addEventListener('loadeddata', onReady, { once: true });
        video.addEventListener('canplay', onReady, { once: true });
        video.addEventListener('error', onDone, { once: true });
        timeoutId = window.setTimeout(onDone, 1200);
      });
    }

    if (video.paused) {
      try {
        await video.play();
      } catch (err) {
        console.warn('Could not resume background video before recording:', err);
      }
    }
  }, [background?.type]);

  // Get the actual font name for canvas
  const getCanvasFontFamily = useCallback((fontFamily: string): string => {
    return FONT_MAP[fontFamily] || 'Noto Naskh Arabic';
  }, []);

  // Load background (image or video)
  useEffect(() => {
    const bgUrl = customBackground || background?.url;
    const bgType = background?.type || 'image';
    const slideImages = background?.slideImages;
    const fallbackThumb = background?.thumbnail;

    if (!bgUrl) return;

    setImageLoaded(false);
    setVideoReady(false);
    setSlideshowReady(false);
    slideshowImagesRef.current = [];

    let cancelled = false;
    let localBlobUrl: string | null = null;

    if (bgType === 'animated' && slideImages && slideImages.length > 1) {
      // Preload all slideshow images
      const loadedImages: HTMLImageElement[] = [];
      let loadedCount = 0;

      slideImages.forEach((url, index) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = url;
        img.onload = () => {
          if (cancelled) return;
          loadedImages[index] = img;
          loadedCount++;
          if (loadedCount === slideImages.length) {
            slideshowImagesRef.current = loadedImages;
            slideshowStartTimeRef.current = Date.now();
            // Generate unique Ken Burns presets per image for variety
            kenBurnsPresetsRef.current = loadedImages.map((_, i) => {
              const zoomIn = Math.random() > 0.5;
              const zoomStart = zoomIn ? 1.0 : 1.15;
              const zoomEnd = zoomIn ? 1.15 : 1.0;
              const angle = Math.random() * Math.PI * 2;
              const panRange = 25 + Math.random() * 15;
              // Pick transition based on user setting
              const userTransitionPref = displaySettings.slideshowTransition || 'crossfade';
              const transition: SlideshowTransition = userTransitionPref === 'mixed'
                ? SLIDESHOW_TRANSITIONS[Math.floor(Math.random() * SLIDESHOW_TRANSITIONS.length)]
                : (userTransitionPref as SlideshowTransition);
              return {
                zoomStart, zoomEnd,
                panXStart: Math.cos(angle) * panRange,
                panXEnd: -Math.cos(angle) * panRange,
                panYStart: Math.sin(angle) * panRange * 0.6,
                panYEnd: -Math.sin(angle) * panRange * 0.6,
                transition,
              };
            });
            setSlideshowReady(true);
          }
        };
        img.onerror = () => {
          loadedCount++;
          console.error('Failed to load slideshow image:', url);
        };
      });
    } else if (bgType === 'video') {
      // Strategy: Try direct CORS load first (Pexels supports CORS headers).
      // Only fall back to proxy if direct load taints canvas.
      const createVideoEl = (): HTMLVideoElement => {
        const video = document.createElement('video');
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.preload = 'auto';
        video.autoplay = true;
        video.setAttribute('playsinline', 'true');
        return video;
      };

      const activateVideo = (video: HTMLVideoElement, successLog: string, method: 'direct' | 'proxy' | 'fallback') => {
        if (cancelled) return;
        videoRef.current = video;
        setVideoReady(true);
        video.play().catch((err) => console.warn('Video play warning:', err));
        console.log(successLog);
        onBackgroundLoadMethod?.(method);
      };

      const loadViaProxy = async () => {
        try {
          const projectUrl = import.meta.env.VITE_SUPABASE_URL as string;
          const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
          if (!projectUrl || !publishableKey) throw new Error('No proxy config');

          const resp = await fetch(`${projectUrl}/functions/v1/video-proxy`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              apikey: publishableKey,
              Authorization: `Bearer ${publishableKey}`,
            },
            body: JSON.stringify({ url: bgUrl }),
          });
          if (!resp.ok) throw new Error(`Proxy ${resp.status}`);

          const blob = await resp.blob();
          if (cancelled || !blob.size) return;

          localBlobUrl = URL.createObjectURL(blob);
          const video = createVideoEl();
          video.src = localBlobUrl;
          video.onloadeddata = () => activateVideo(video, '✅ Video loaded via proxy blob', 'proxy');
          video.onerror = () => { onBackgroundLoadMethod?.('fallback'); loadImage(fallbackThumb || bgUrl); };
        } catch {
          loadImage(fallbackThumb || bgUrl);
        }
      };

      const loadDirectVideo = () => {
        const video = createVideoEl();
        video.crossOrigin = 'anonymous';
        video.src = bgUrl;

        video.onloadeddata = () => {
          if (cancelled) return;
          // Test if canvas stays clean
          try {
            const tc = document.createElement('canvas');
            tc.width = 2;
            tc.height = 2;
            const tctx = tc.getContext('2d');
            tctx?.drawImage(video, 0, 0, 2, 2);
            tc.toDataURL(); // Throws if tainted
            activateVideo(video, '✅ Video loaded directly with CORS', 'direct');
          } catch {
            console.warn('Direct video taints canvas, trying proxy…');
            video.pause();
            video.src = '';
            loadViaProxy();
          }
        };

        video.onerror = () => {
          console.warn('Direct video load failed, trying proxy…');
          loadViaProxy();
        };
      };

      loadDirectVideo();
    } else {
      loadImage(bgUrl);
    }

    function loadImage(url: string) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = url;
      img.onload = () => {
        if (cancelled) return;
        imageRef.current = img;
        setImageLoaded(true);
      };
      img.onerror = () => {
        console.error('Failed to load image:', url);
        imageRef.current = null;
        setImageLoaded(false);
      };
    }

    return () => {
      cancelled = true;
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current = null;
      }
      if (localBlobUrl) {
        URL.revokeObjectURL(localBlobUrl);
      }
      slideshowImagesRef.current = [];
      kenBurnsPresetsRef.current = [];
    };
  }, [customBackground, background?.url, background?.type, background?.thumbnail, background?.slideImages]);

  const getTokenHsl = useCallback((token: string, fallback: string) => {
    try {
      const v = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
      return v ? `hsl(${v})` : fallback;
    } catch {
      return fallback;
    }
  }, []);

  // Convert Arabic number to Eastern Arabic numerals
  const toArabicNumber = (num: number): string => {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().split('').map(d => arabicNumerals[parseInt(d)] || d).join('');
  };

  // Draw decorative ayah number badge with different styles
  const drawAyahBadge = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, num: number, size: number, style: string, colorScheme?: string) => {
    const arabicNum = toArabicNumber(num);
    
    // Color map based on ayahNumberColor setting
    const colorMap: Record<string, { main: string; glow: string; fill: string }> = {
      gold: { main: 'rgba(212, 175, 55, 0.7)', glow: 'rgba(212, 175, 55, 0.4)', fill: '#D4AF37' },
      white: { main: 'rgba(255, 255, 255, 0.7)', glow: 'rgba(255, 255, 255, 0.3)', fill: '#FFFFFF' },
      silver: { main: 'rgba(192, 192, 192, 0.7)', glow: 'rgba(192, 192, 192, 0.3)', fill: '#C0C0C0' },
      emerald: { main: 'rgba(80, 200, 120, 0.7)', glow: 'rgba(80, 200, 120, 0.3)', fill: '#50C878' },
      royal: { main: 'rgba(123, 104, 238, 0.7)', glow: 'rgba(123, 104, 238, 0.3)', fill: '#7B68EE' },
    };
    const colors = colorMap[colorScheme || 'gold'] || colorMap.gold;
    
    ctx.save();
    
    // Draw shape based on style
    switch (style) {
      case 'star':
        drawStar(ctx, x, y, size, 8);
        break;
      case 'diamond':
        drawDiamond(ctx, x, y, size);
        break;
      case 'octagon':
        drawPolygon(ctx, x, y, size, 8);
        break;
      case 'flower':
        drawFlower(ctx, x, y, size);
        break;
      case 'hexagon':
        drawPolygon(ctx, x, y, size, 6);
        break;
      case 'square':
        ctx.beginPath();
        ctx.roundRect(x - size, y - size, size * 2, size * 2, size * 0.2);
        break;
      default: // circle
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
    }
    
    // Fill with gradient
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
    gradient.addColorStop(0, colors.glow);
    gradient.addColorStop(0.7, colors.glow.replace('0.4', '0.2').replace('0.3', '0.15'));
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Draw border
    ctx.strokeStyle = colors.main;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Inner decoration
    if (style === 'circle') {
      ctx.beginPath();
      ctx.arc(x, y, size * 0.75, 0, Math.PI * 2);
      ctx.strokeStyle = colors.main.replace('0.7', '0.4');
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    
    // Draw number
    ctx.font = `bold ${size * 1.1}px "Noto Naskh Arabic", "Amiri", serif`;
    ctx.fillStyle = colors.fill;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 4;
    ctx.fillText(arabicNum, x, y + 2);
    ctx.restore();
  }, []);

  // Helper functions for shapes
  const drawStar = (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, points: number) => {
    const outerRadius = size;
    const innerRadius = size * 0.5;
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / points - Math.PI / 2;
      if (i === 0) {
        ctx.moveTo(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
      } else {
        ctx.lineTo(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
      }
    }
    ctx.closePath();
  };

  const drawDiamond = (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) => {
    ctx.beginPath();
    ctx.moveTo(cx, cy - size);
    ctx.lineTo(cx + size, cy);
    ctx.lineTo(cx, cy + size);
    ctx.lineTo(cx - size, cy);
    ctx.closePath();
  };

  const drawPolygon = (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, sides: number) => {
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
      const x = cx + size * Math.cos(angle);
      const y = cy + size * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  };

  const drawFlower = (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) => {
    const petals = 8;
    ctx.beginPath();
    for (let i = 0; i < petals; i++) {
      const angle = (i * 2 * Math.PI) / petals;
      const nextAngle = ((i + 1) * 2 * Math.PI) / petals;
      const midAngle = (angle + nextAngle) / 2;
      
      const x1 = cx + size * Math.cos(angle);
      const y1 = cy + size * Math.sin(angle);
      const cpX = cx + size * 1.3 * Math.cos(midAngle);
      const cpY = cy + size * 1.3 * Math.sin(midAngle);
      const x2 = cx + size * Math.cos(nextAngle);
      const y2 = cy + size * Math.sin(nextAngle);
      
      if (i === 0) ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(cpX, cpY, x2, y2);
    }
    ctx.closePath();
  };

  // Draw Islamic decorative frame
  const drawIslamicFrame = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, style: string) => {
    if (style === 'none') return;
    
    ctx.save();
    
    const cornerSize = Math.min(width, height) * 0.1;
    const goldColor = 'rgba(212, 175, 55, 0.6)';
    const goldLight = 'rgba(212, 175, 55, 0.3)';
    
    switch (style) {
      case 'simple':
        // Simple elegant border
        ctx.strokeStyle = goldColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        
        // Inner border
        ctx.strokeStyle = goldLight;
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 6, y + 6, width - 12, height - 12);
        break;
        
      case 'ornate':
        // Ornate Islamic frame with corner decorations
        ctx.strokeStyle = goldColor;
        ctx.lineWidth = 3;
        
        // Main frame
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 10);
        ctx.stroke();
        
        // Corner ornaments
        drawCornerOrnament(ctx, x, y, cornerSize, 0);
        drawCornerOrnament(ctx, x + width, y, cornerSize, 90);
        drawCornerOrnament(ctx, x + width, y + height, cornerSize, 180);
        drawCornerOrnament(ctx, x, y + height, cornerSize, 270);
        
        // Side decorations
        drawSideDecoration(ctx, x + width / 2, y, cornerSize * 0.6);
        drawSideDecoration(ctx, x + width / 2, y + height, cornerSize * 0.6);
        break;
        
      case 'golden':
        // Luxurious golden frame with glow
        ctx.shadowColor = 'rgba(212, 175, 55, 0.5)';
        ctx.shadowBlur = 15;
        
        // Outer glow border
        ctx.strokeStyle = goldColor;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 15);
        ctx.stroke();
        
        ctx.shadowBlur = 0;
        
        // Inner decorative line
        ctx.strokeStyle = goldLight;
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 5]);
        ctx.beginPath();
        ctx.roundRect(x + 10, y + 10, width - 20, height - 20, 10);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Corner flourishes
        drawGoldenCorner(ctx, x, y, cornerSize);
        drawGoldenCorner(ctx, x + width, y, cornerSize, true);
        drawGoldenCorner(ctx, x + width, y + height, cornerSize, true, true);
        drawGoldenCorner(ctx, x, y + height, cornerSize, false, true);
        break;
        
      case 'geometric':
        // Islamic geometric pattern frame
        ctx.strokeStyle = goldColor;
        ctx.lineWidth = 2;
        
        // Outer border
        ctx.strokeRect(x, y, width, height);
        
        // Geometric corner patterns
        drawGeometricCorner(ctx, x, y, cornerSize);
        drawGeometricCorner(ctx, x + width - cornerSize, y, cornerSize);
        drawGeometricCorner(ctx, x + width - cornerSize, y + height - cornerSize, cornerSize);
        drawGeometricCorner(ctx, x, y + height - cornerSize, cornerSize);
        
        // Connecting geometric lines
        ctx.beginPath();
        ctx.moveTo(x + cornerSize, y + cornerSize / 2);
        ctx.lineTo(x + width - cornerSize, y + cornerSize / 2);
        ctx.moveTo(x + cornerSize, y + height - cornerSize / 2);
        ctx.lineTo(x + width - cornerSize, y + height - cornerSize / 2);
        ctx.strokeStyle = goldLight;
        ctx.stroke();
        break;
    }
    
    ctx.restore();
  }, []);

  // Helper for corner ornament
  const drawCornerOrnament = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rotation * Math.PI) / 180);
    
    ctx.fillStyle = 'rgba(212, 175, 55, 0.4)';
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(size * 0.2, size * 0.2);
    ctx.quadraticCurveTo(size * 0.5, 0, size * 0.2, -size * 0.2);
    ctx.stroke();
    
    ctx.restore();
  };

  const drawSideDecoration = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    ctx.save();
    ctx.translate(x, y);
    
    ctx.fillStyle = 'rgba(212, 175, 55, 0.5)';
    ctx.beginPath();
    ctx.ellipse(0, 0, size, size * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.7)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.restore();
  };

  const drawGoldenCorner = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, flipX = false, flipY = false) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
    
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.7)';
    ctx.lineWidth = 2;
    
    // Curved flourish
    ctx.beginPath();
    ctx.moveTo(5, 5);
    ctx.bezierCurveTo(size * 0.5, 5, size, size * 0.5, size, size);
    ctx.stroke();
    
    // Inner accent
    ctx.beginPath();
    ctx.arc(size * 0.3, size * 0.3, size * 0.15, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(212, 175, 55, 0.4)';
    ctx.fill();
    
    ctx.restore();
  };

  const drawGeometricCorner = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.5)';
    ctx.lineWidth = 1;
    
    // Create 8-pointed star pattern
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(size / 2, 0);
      ctx.lineTo(size, size / 2);
      ctx.lineTo(size / 2, size);
      ctx.lineTo(0, size / 2);
      ctx.closePath();
      ctx.stroke();
      ctx.translate(size / 2, size / 2);
      ctx.rotate(Math.PI / 4);
      ctx.translate(-size / 2, -size / 2);
    }
    
    ctx.restore();
  };

  // Draw frame on canvas
  const drawFrame = useCallback((targetCanvas?: HTMLCanvasElement, renderMode: 'preview' | 'recording' | 'recordingLite' = 'preview') => {
    const canvas = targetCanvas || canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const base = getRecordingDimensions();
    const previewPerfMode = displaySettings.performanceMode || 'balanced';
    const previewScale = previewPerfMode === 'economy' ? 0.3 : previewPerfMode === 'pro' ? 0.5 : 0.38;
    const isPreviewRender = renderMode === 'preview';
    const isLiteRecording = renderMode === 'recordingLite';
    const recordingScale = isLiteRecording ? 0.67 : 1;

    // For recording: the canvas dimensions are set by the caller (PreviewPage)
    // based on quality preset. We only resize for preview mode.
    // IMPORTANT: Never resize during recording/recordingLite — the caller sets
    // the canvas dimensions once before captureStream(). Resizing mid-stream
    // clears the canvas and produces a static/blank video.
    if (isPreviewRender) {
      const width = Math.round(base.width * previewScale);
      const height = Math.round(base.height * previewScale);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    }
    // else: recording / recordingLite — canvas dimensions are set once by PreviewPage

    // Scale factor: all hardcoded sizes were designed for ~1080px width canvas.
    // Scale them relative to actual canvas width so they look right at all sizes.
    const S = canvas.width / 1080;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw background motion (lighter in recordingLite)
    const motionFactor = isLiteRecording ? 0.55 : 1;
    const t = (Date.now() / 1000) * motionSpeed * motionFactor;
    const scale = 1.04 + Math.sin(t * 0.2) * (0.03 * motionFactor);
    const offsetX = Math.sin(t * 0.12) * (20 * motionFactor);
    const offsetY = Math.cos(t * 0.1) * (16 * motionFactor);
    
    // Handle slideshow backgrounds
    if (slideshowReady && slideshowImagesRef.current.length > 1) {
      const images = slideshowImagesRef.current;
      const presets = kenBurnsPresetsRef.current;
      const elapsed = Date.now() - slideshowStartTimeRef.current;
      const cycleDuration = SLIDESHOW_DISPLAY_DURATION + SLIDESHOW_TRANSITION_DURATION;
      const totalCycle = cycleDuration * images.length;
      const cyclePosition = elapsed % totalCycle;
      
      const currentIndex = Math.floor(cyclePosition / cycleDuration) % images.length;
      const nextIndex = (currentIndex + 1) % images.length;
      const positionInCycle = cyclePosition % cycleDuration;
      
      // Smooth ease function
      const easeInOut = (p: number) => p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;

      // Cover-fit: draw image filling canvas without black bars
      const drawImageCover = (img: HTMLImageElement, cw: number, ch: number) => {
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const canvasRatio = cw / ch;
        let sw = img.naturalWidth, sh = img.naturalHeight, sx = 0, sy = 0;
        if (imgRatio > canvasRatio) {
          sw = img.naturalHeight * canvasRatio;
          sx = (img.naturalWidth - sw) / 2;
        } else {
          sh = img.naturalWidth / canvasRatio;
          sy = (img.naturalHeight - sh) / 2;
        }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
      };

      // Use absolute elapsed time for Ken Burns so motion is continuous
      const elapsedSec = elapsed / 1000;
      const getKenBurns = (imgIndex: number) => {
        const preset = presets[imgIndex] || { zoomStart: 1.0, zoomEnd: 1.1, panXStart: 0, panXEnd: 0, panYStart: 0, panYEnd: 0 };
        const speedFactor = motionSpeed / 3;
        // Continuous slow oscillation based on absolute time + per-image phase offset
        const phase = imgIndex * 1.7; // unique phase per image
        const period = 12 / speedFactor; // full cycle in seconds
        const p = ((elapsedSec + phase) % period) / period; // 0→1 continuous
        const wave = 0.5 - 0.5 * Math.cos(p * Math.PI * 2); // smooth 0→1→0
        const zoom = preset.zoomStart + (preset.zoomEnd - preset.zoomStart) * wave;
        const panX = preset.panXStart + (preset.panXEnd - preset.panXStart) * wave;
        const panY = preset.panYStart + (preset.panYEnd - preset.panYStart) * wave;
        return { zoom: Math.max(zoom, 1.0), panX, panY };
      };

      const curKB = getKenBurns(currentIndex);
      const currentImg = images[currentIndex];

      // Check transition type
      const isInTransition = positionInCycle > SLIDESHOW_DISPLAY_DURATION;
      const transType = (presets[currentIndex] || {}).transition || 'crossfade';
      const isOverlayTransition = !isInTransition || transType === 'crossfade' || transType === 'zoomThrough';

      // Draw with Ken Burns helper
      const drawWithKB = (img: HTMLImageElement | undefined, kb: { zoom: number; panX: number; panY: number }) => {
        if (!img) return;
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(kb.zoom, kb.zoom);
        ctx.translate(-canvas.width / 2 + kb.panX, -canvas.height / 2 + kb.panY);
        drawImageCover(img, canvas.width, canvas.height);
      };

      if (isOverlayTransition) {
        ctx.save();
        drawWithKB(currentImg, curKB);
        ctx.restore();
      }

      // Transition to next image
      if (isInTransition) {
        const rawProgress = (positionInCycle - SLIDESHOW_DISPLAY_DURATION) / SLIDESHOW_TRANSITION_DURATION;
        const fadeProgress = easeInOut(Math.min(rawProgress, 1));
        const nextKB = getKenBurns(nextIndex);
        const nextImg = images[nextIndex];

        switch (transType) {
          case 'slideLeft': {
            const offset = canvas.width * fadeProgress;
            ctx.save();
            ctx.translate(-offset, 0);
            drawWithKB(currentImg, curKB);
            ctx.restore();
            ctx.save();
            ctx.translate(canvas.width - offset, 0);
            drawWithKB(nextImg, nextKB);
            ctx.restore();
            break;
          }
          case 'slideRight': {
            const offset = canvas.width * fadeProgress;
            ctx.save();
            ctx.translate(offset, 0);
            drawWithKB(currentImg, curKB);
            ctx.restore();
            ctx.save();
            ctx.translate(-canvas.width + offset, 0);
            drawWithKB(nextImg, nextKB);
            ctx.restore();
            break;
          }
          case 'slideUp': {
            const offset = canvas.height * fadeProgress;
            ctx.save();
            ctx.translate(0, -offset);
            drawWithKB(currentImg, curKB);
            ctx.restore();
            ctx.save();
            ctx.translate(0, canvas.height - offset);
            drawWithKB(nextImg, nextKB);
            ctx.restore();
            break;
          }
          case 'zoomThrough': {
            const zoomMul = 1 + fadeProgress * 0.3;
            ctx.save();
            ctx.globalAlpha = 1 - fadeProgress;
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.scale(curKB.zoom * zoomMul, curKB.zoom * zoomMul);
            ctx.translate(-canvas.width / 2 + curKB.panX, -canvas.height / 2 + curKB.panY);
            if (currentImg) drawImageCover(currentImg, canvas.width, canvas.height);
            ctx.restore();
            ctx.save();
            ctx.globalAlpha = fadeProgress;
            const nextZoomMul = 1.2 - fadeProgress * 0.2;
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.scale(nextKB.zoom * nextZoomMul, nextKB.zoom * nextZoomMul);
            ctx.translate(-canvas.width / 2 + nextKB.panX, -canvas.height / 2 + nextKB.panY);
            if (nextImg) drawImageCover(nextImg, canvas.width, canvas.height);
            ctx.restore();
            break;
          }
          case 'wipe': {
            const wipeX = canvas.width * fadeProgress;
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, 0, wipeX, canvas.height);
            ctx.clip();
            drawWithKB(nextImg, nextKB);
            ctx.restore();
            break;
          }
          default: {
            ctx.save();
            ctx.globalAlpha = fadeProgress;
            drawWithKB(nextImg, nextKB);
            ctx.restore();
            break;
          }
        }
      }
    } else if (videoReady && videoRef.current) {
      // Draw video frame — NO Ken Burns for video backgrounds to prevent lag
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    } else if (imageRef.current && imageLoaded) {
      // Draw single image with Ken Burns + cover-fit
      const img = imageRef.current;
      const imgRatio = img.naturalWidth / img.naturalHeight;
      const canvasRatio = canvas.width / canvas.height;
      let sw = img.naturalWidth, sh = img.naturalHeight, sx = 0, sy = 0;
      if (imgRatio > canvasRatio) {
        sw = img.naturalHeight * canvasRatio;
        sx = (img.naturalWidth - sw) / 2;
      } else {
        sh = img.naturalWidth / canvasRatio;
        sy = (img.naturalHeight - sh) / 2;
      }
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(scale, scale);
      ctx.translate(-canvas.width / 2 + offsetX, -canvas.height / 2 + offsetY);
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    } else {
      // Gradient fallback
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(0.5, '#16213e');
      gradient.addColorStop(1, '#0f3460');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw overlay
    ctx.fillStyle = `rgba(0, 0, 0, ${textSettings.overlayOpacity})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw top gradient
    const topGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.25);
    topGradient.addColorStop(0, 'rgba(0, 0, 0, 0.5)');
    topGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = topGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.25);

    // Draw bottom gradient
    const bottomGradient = ctx.createLinearGradient(0, canvas.height * 0.75, 0, canvas.height);
    bottomGradient.addColorStop(0, 'transparent');
    bottomGradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
    ctx.fillStyle = bottomGradient;
    ctx.fillRect(0, canvas.height * 0.75, canvas.width, canvas.height * 0.25);

    // (Particles removed for performance — particleDensity defaults to 'off')

    // ── Subtle vignette effect (skip during recording to save GPU) ──────
    if (isPreviewRender && isPlaying) {
      const vignetteGrad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, canvas.width * 0.3,
        canvas.width / 2, canvas.height / 2, canvas.width * 0.9
      );
      vignetteGrad.addColorStop(0, 'transparent');
      vignetteGrad.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
      ctx.fillStyle = vignetteGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Get the font family for canvas
    const fontName = getCanvasFontFamily(textSettings.fontFamily);

    // Text settings — apply textShadowStyle and reduce shadow cost during recording
    const isAnyRecording = !isPreviewRender;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Apply textShadowStyle setting
    const textShadowStyle = displaySettings.textShadowStyle || 'soft';
    if (textShadowStyle === 'none') {
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    } else if (textShadowStyle === 'soft') {
      ctx.shadowColor = `rgba(0, 0, 0, ${isAnyRecording ? 0.3 : 0.4})`;
      ctx.shadowBlur = isAnyRecording ? 4 : 6 * S;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
    } else if (textShadowStyle === 'strong') {
      ctx.shadowColor = `rgba(0, 0, 0, ${isAnyRecording ? 0.5 : 0.8})`;
      ctx.shadowBlur = isAnyRecording ? 8 : 16 * S;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
    } else if (textShadowStyle === 'glow') {
      ctx.shadowColor = 'rgba(212, 175, 55, 0.6)';
      ctx.shadowBlur = isAnyRecording ? 10 : 20 * S;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }

    // Draw surah name badge (if enabled) based on surahNameStyle
    if (displaySettings.showSurahName) {
      const badgeY = canvas.height * 0.11;
      const nameStyle = displaySettings.surahNameStyle || 'classic';

      ctx.save();

      switch (nameStyle) {
        case 'banner': {
          const bw = 500 * S, bh = 90 * S;
          const grad = ctx.createLinearGradient(canvas.width / 2 - bw / 2, badgeY, canvas.width / 2 + bw / 2, badgeY);
          grad.addColorStop(0, 'rgba(212, 175, 55, 0)');
          grad.addColorStop(0.2, 'rgba(212, 175, 55, 0.25)');
          grad.addColorStop(0.5, 'rgba(212, 175, 55, 0.35)');
          grad.addColorStop(0.8, 'rgba(212, 175, 55, 0.25)');
          grad.addColorStop(1, 'rgba(212, 175, 55, 0)');
          ctx.fillStyle = grad;
          ctx.fillRect(canvas.width / 2 - bw / 2, badgeY - bh / 2, bw, bh);
          ctx.strokeStyle = 'rgba(212, 175, 55, 0.5)';
          ctx.lineWidth = 1.5 * S;
          ctx.beginPath();
          ctx.moveTo(canvas.width / 2 - bw / 2 + 40 * S, badgeY - bh / 2);
          ctx.lineTo(canvas.width / 2 + bw / 2 - 40 * S, badgeY - bh / 2);
          ctx.moveTo(canvas.width / 2 - bw / 2 + 40 * S, badgeY + bh / 2);
          ctx.lineTo(canvas.width / 2 + bw / 2 - 40 * S, badgeY + bh / 2);
          ctx.stroke();
          break;
        }
        case 'calligraphy': {
          ctx.fillStyle = 'rgba(212, 175, 55, 0.5)';
          [-100, -60, 60, 100].forEach(dx => {
            ctx.beginPath();
            ctx.arc(canvas.width / 2 + dx * S, badgeY - 35 * S, 3 * S, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(canvas.width / 2 + dx * S, badgeY + 35 * S, 3 * S, 0, Math.PI * 2);
            ctx.fill();
          });
          break;
        }
        case 'circle': {
          const radius = 75 * S;
          ctx.beginPath();
          ctx.arc(canvas.width / 2, badgeY, radius, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
          ctx.lineWidth = 3 * S;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(canvas.width / 2, badgeY, radius - 8 * S, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
          ctx.lineWidth = 1 * S;
          ctx.stroke();
          break;
        }
        case 'diamond': {
          const s = 80 * S;
          ctx.beginPath();
          ctx.moveTo(canvas.width / 2, badgeY - s);
          ctx.lineTo(canvas.width / 2 + s * 1.8, badgeY);
          ctx.lineTo(canvas.width / 2, badgeY + s);
          ctx.lineTo(canvas.width / 2 - s * 1.8, badgeY);
          ctx.closePath();
          ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
          ctx.lineWidth = 2.5 * S;
          ctx.stroke();
          break;
        }
        case 'ribbon': {
          const rw = 420 * S, rh = 70 * S;
          const rx = canvas.width / 2 - rw / 2;
          ctx.beginPath();
          ctx.moveTo(rx + 20 * S, badgeY - rh / 2);
          ctx.lineTo(rx + rw - 20 * S, badgeY - rh / 2);
          ctx.lineTo(rx + rw, badgeY);
          ctx.lineTo(rx + rw - 20 * S, badgeY + rh / 2);
          ctx.lineTo(rx + 20 * S, badgeY + rh / 2);
          ctx.lineTo(rx, badgeY);
          ctx.closePath();
          ctx.fillStyle = 'rgba(212, 175, 55, 0.2)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
          ctx.lineWidth = 2 * S;
          ctx.stroke();
          break;
        }
        default: {
          const badgeWidth = 360 * S;
          const badgeHeight = 100 * S;
          ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
          ctx.beginPath();
          ctx.roundRect(canvas.width / 2 - badgeWidth / 2, badgeY - badgeHeight / 2, badgeWidth, badgeHeight, 50 * S);
          ctx.fill();
          ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
          ctx.lineWidth = 3 * S;
          ctx.stroke();
          ctx.strokeStyle = 'rgba(212, 175, 55, 0.25)';
          ctx.lineWidth = 1 * S;
          ctx.beginPath();
          ctx.roundRect(canvas.width / 2 - (badgeWidth - 10 * S) / 2, badgeY - (badgeHeight - 10 * S) / 2, badgeWidth - 10 * S, badgeHeight - 10 * S, 46 * S);
          ctx.stroke();
          break;
        }
      }

      // Draw surah name text — scaled
      ctx.font = `bold ${textSettings.fontSize * 2.5 * S}px "Amiri", "Scheherazade New", serif`;
      ctx.fillStyle = textSettings.textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(212, 175, 55, 0.35)';
      ctx.shadowBlur = 8 * S;
      ctx.fillText(surahName, canvas.width / 2, badgeY);
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // Draw reciter name (if enabled) with style — scaled
    if (displaySettings.showReciterName) {
      const reciterY = displaySettings.showSurahName ? canvas.height * 0.175 : canvas.height * 0.12;
      const reciterText = `بصوت ${reciterName}`;
      const reciterStyle = displaySettings.reciterNameStyle || 'simple';
      
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      switch (reciterStyle) {
        case 'elegant': {
          ctx.font = `italic ${textSettings.fontSize * 1.1 * S}px "Amiri", "Scheherazade New", serif`;
          ctx.shadowColor = 'rgba(212, 175, 55, 0.4)';
          ctx.shadowBlur = 6 * S;
          ctx.fillStyle = '#D4AF37';
          ctx.fillText(reciterText, canvas.width / 2, reciterY);
          break;
        }
        case 'badge': {
          ctx.font = `${textSettings.fontSize * 1.0 * S}px "${fontName}", "Noto Naskh Arabic", serif`;
          const tw = ctx.measureText(reciterText).width;
          const bw = tw + 60 * S, bh = 44 * S;
          ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
          ctx.beginPath();
          ctx.roundRect(canvas.width / 2 - bw / 2, reciterY - bh / 2, bw, bh, 22 * S);
          ctx.fill();
          ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
          ctx.lineWidth = 1.5 * S;
          ctx.stroke();
          ctx.fillStyle = textSettings.textColor;
          ctx.globalAlpha = 0.85;
          ctx.fillText(reciterText, canvas.width / 2, reciterY);
          break;
        }
        case 'tag': {
          ctx.font = `bold ${textSettings.fontSize * 0.9 * S}px "${fontName}", "Noto Naskh Arabic", serif`;
          const tw = ctx.measureText(reciterText).width;
          const pw = 50 * S, ph = 36 * S;
          // Tag shape with pointed left edge
          const tx = canvas.width / 2 - (tw + pw) / 2;
          ctx.fillStyle = 'rgba(212, 175, 55, 0.18)';
          ctx.beginPath();
          ctx.moveTo(tx + 16 * S, reciterY - ph / 2);
          ctx.lineTo(tx + tw + pw, reciterY - ph / 2);
          ctx.lineTo(tx + tw + pw, reciterY + ph / 2);
          ctx.lineTo(tx + 16 * S, reciterY + ph / 2);
          ctx.lineTo(tx, reciterY);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = 'rgba(212, 175, 55, 0.5)';
          ctx.lineWidth = 1 * S;
          ctx.stroke();
          ctx.fillStyle = textSettings.textColor;
          ctx.globalAlpha = 0.9;
          ctx.fillText(reciterText, canvas.width / 2 + 8 * S, reciterY);
          break;
        }
        case 'glow': {
          ctx.font = `${textSettings.fontSize * 1.0 * S}px "${fontName}", "Noto Naskh Arabic", serif`;
          ctx.shadowColor = '#D4AF37';
          ctx.shadowBlur = 18 * S;
          ctx.fillStyle = '#FFD700';
          ctx.fillText(reciterText, canvas.width / 2, reciterY);
          // Second pass for stronger glow
          ctx.shadowBlur = 8 * S;
          ctx.fillText(reciterText, canvas.width / 2, reciterY);
          break;
        }
        default: { // simple
          ctx.font = `${textSettings.fontSize * 1.0 * S}px "${fontName}", "Noto Naskh Arabic", serif`;
          ctx.fillStyle = textSettings.textColor;
          ctx.globalAlpha = 0.7;
          ctx.fillText(reciterText, canvas.width / 2, reciterY);
          break;
        }
      }
      ctx.restore();
    }

    // Draw decorative separator (waveform-inspired) - Minimal ornate line
    if (displaySettings.showSurahName || displaySettings.showReciterName) {
      const lineY = displaySettings.showReciterName ? canvas.height * 0.21 : canvas.height * 0.17;
      const lineHalf = 120 * S;

      // Draw small circles on ends + center dot
      ctx.save();
      ctx.fillStyle = 'rgba(212, 175, 55, 0.5)';
      ctx.beginPath();
      ctx.arc(canvas.width / 2, lineY, 5 * S, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(canvas.width / 2 - lineHalf, lineY, 3 * S, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(canvas.width / 2 + lineHalf, lineY, 3 * S, 0, Math.PI * 2);
      ctx.fill();

      // Lines
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
      ctx.lineWidth = 1.5 * S;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - lineHalf + 6, lineY);
      ctx.lineTo(canvas.width / 2 - 10, lineY);
      ctx.moveTo(canvas.width / 2 + 10, lineY);
      ctx.lineTo(canvas.width / 2 + lineHalf - 6, lineY);
      ctx.stroke();

      // Side ornaments (symmetric little arrows)
      drawSideOrnament(ctx, canvas.width / 2 - lineHalf - 20 * S, lineY, 12 * S, false);
      drawSideOrnament(ctx, canvas.width / 2 + lineHalf + 20 * S, lineY, 12 * S, true);
      ctx.restore();
    }

    // Helper for side ornaments
    function drawSideOrnament(c: CanvasRenderingContext2D, x: number, y: number, size: number, flip: boolean) {
      c.save();
      c.translate(x, y);
      if (flip) c.scale(-1, 1);
      c.fillStyle = 'rgba(212, 175, 55, 0.45)';
      c.beginPath();
      c.moveTo(0, -size / 2);
      c.quadraticCurveTo(-size, 0, 0, size / 2);
      c.quadraticCurveTo(-size / 2, 0, 0, -size / 2);
      c.fill();
      c.restore();
    }

    // Detect ayah change and start transition
    if (currentAyah && prevAyahRef.current && 
        currentAyah.numberInSurah !== prevAyahRef.current.numberInSurah) {
      transitionStartRef.current = Date.now();
      isTransitioningRef.current = true;
      currentRandomTransitionRef.current = RANDOM_TRANSITIONS[Math.floor(Math.random() * RANDOM_TRANSITIONS.length)];
      // Reset chunk counter for new verse
      chunkCounterRef.current = 0;
      lastChunkTimeRef.current = Date.now();
      prevChunkIndexRef.current = -1;
      chunkFadeRef.current = 1;
    }
    if (currentAyah) {
      prevAyahRef.current = currentAyah;
    }

    // Calculate transition progress
    const rawTransitionType = displaySettings.ayahTransition || 'fade';
    const transitionType = rawTransitionType === 'random' ? currentRandomTransitionRef.current : rawTransitionType;
    let transitionProgress = 1; // 1 = fully visible
    if (isTransitioningRef.current && transitionType !== 'none') {
      const elapsed = Date.now() - transitionStartRef.current;
      transitionProgress = Math.min(elapsed / VERSE_TRANSITION_DURATION, 1);
      if (transitionProgress >= 1) {
        isTransitioningRef.current = false;
      }
    }

    // Ease function for smooth transitions
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    const easedProgress = easeOutCubic(transitionProgress);

    // ── Ibtahalat Lyrics Mode: Show multiple lines with golden glow on current ──
    if (ibtahalatLyricsMode && allLyricsLines.length > 0 && displaySettings.showAyahText) {
      const centerY = canvas.height * 0.52;
      const lyricsFontSize = textSettings.fontSize * 1.6 * S;
      const lyricsLineHeight = lyricsFontSize * 2.2;
      const lyricsStyle = displaySettings.lyricsDisplayStyle || 'scroll';
      const glowStyle = displaySettings.glowStyle || 'golden';
      const fontName = getCanvasFontFamily(textSettings.fontFamily);

      // ── Helper: draw glow for current line based on glowStyle ──
      const drawCurrentLineGlow = (ctx: CanvasRenderingContext2D, line: string, x: number, y: number, fontSize: number) => {
        if (glowStyle === 'none') {
          // No glow - just draw text in normal color
          ctx.font = `bold ${fontSize * 1.1}px "${fontName}", "Noto Naskh Arabic", serif`;
          ctx.fillStyle = textSettings.textColor;
          ctx.shadowColor = `rgba(0, 0, 0, ${textSettings.shadowIntensity})`;
          ctx.shadowBlur = 6 * S;
          ctx.fillText(line, x, y);
          return;
        }

        const pulse = 0.6 + Math.sin(Date.now() / 400) * 0.4;
        let glowColor: string;
        let glowBlur: number;
        let textColor: string;

        switch (glowStyle) {
          case 'soft':
            glowColor = 'rgba(255, 255, 255, 0.6)';
            glowBlur = (12 + pulse * 8) * S;
            textColor = '#FFFFFF';
            break;
          case 'neon':
            glowColor = '#00FFFF';
            glowBlur = (20 + pulse * 20) * S;
            textColor = '#00FFFF';
            break;
          case 'pulse':
            glowColor = `rgba(212, 175, 55, ${0.3 + pulse * 0.7})`;
            glowBlur = (8 + pulse * 30) * S;
            textColor = `rgba(255, 215, 0, ${0.7 + pulse * 0.3})`;
            break;
          default: // golden
            glowColor = '#FFD700';
            glowBlur = (20 + pulse * 15) * S;
            textColor = '#FFD700';
            break;
        }

        // Background highlight for current line
        ctx.save();
        ctx.shadowBlur = 0;
        const tw = ctx.measureText(line).width;
        const padX = 30 * S;
        const padY = 14 * S;
        const gradient = ctx.createLinearGradient(x - tw / 2 - padX, y, x + tw / 2 + padX, y);
        const baseAlpha = glowStyle === 'neon' ? 0.1 : 0.15;
        gradient.addColorStop(0, `rgba(212, 175, 55, 0)`);
        gradient.addColorStop(0.15, `rgba(212, 175, 55, ${baseAlpha * 0.8})`);
        gradient.addColorStop(0.5, `rgba(212, 175, 55, ${baseAlpha})`);
        gradient.addColorStop(0.85, `rgba(212, 175, 55, ${baseAlpha * 0.8})`);
        gradient.addColorStop(1, `rgba(212, 175, 55, 0)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(x - tw / 2 - padX, y - padY - fontSize * 0.5, tw + padX * 2, fontSize + padY * 2);
        ctx.restore();

        // Draw text with glow
        ctx.font = `bold ${fontSize * 1.15}px "${fontName}", "Noto Naskh Arabic", serif`;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = glowBlur;
        ctx.fillStyle = textColor;
        ctx.fillText(line, x, y);
        // Double pass for stronger glow
        ctx.shadowBlur = glowBlur * 0.5;
        ctx.fillText(line, x, y);
      };

      // ── SCROLL mode (default): multiple lines, scrolling ──
      if (lyricsStyle === 'scroll') {
        const maxVisibleLines = Math.min(7, allLyricsLines.length);
        const halfVisible = Math.floor(maxVisibleLines / 2);
        
        let startLine = Math.max(0, currentLyricsIndex - halfVisible);
        let endLine = Math.min(allLyricsLines.length, startLine + maxVisibleLines);
        if (endLine - startLine < maxVisibleLines) {
          startLine = Math.max(0, endLine - maxVisibleLines);
        }
        
        const totalVisibleHeight = (endLine - startLine) * lyricsLineHeight;
        const baseY = centerY - totalVisibleHeight / 2 + lyricsLineHeight / 2;

        // Draw frame if user selected one (not hardcoded)
        if (displaySettings.frameStyle !== 'none') {
          const framePad = 40 * S;
          const frameX = canvas.width * 0.06;
          const frameY2 = baseY - lyricsLineHeight / 2 - framePad;
          const frameW = canvas.width * 0.88;
          const frameH = totalVisibleHeight + framePad * 2;
          drawIslamicFrame(ctx, frameX, frameY2, frameW, frameH, displaySettings.frameStyle);
        }

        // Draw lyrics lines
        ctx.save();
        ctx.direction = 'rtl';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        for (let i = startLine; i < endLine; i++) {
          const line = allLyricsLines[i];
          const y = baseY + (i - startLine) * lyricsLineHeight;
          const isCurrent = i === currentLyricsIndex;
          const distFromCurrent = Math.abs(i - currentLyricsIndex);
          
          ctx.save();
          
          if (isCurrent) {
            drawCurrentLineGlow(ctx, line, canvas.width / 2, y, lyricsFontSize);
          } else {
            const alpha = Math.max(0.2, 0.7 - distFromCurrent * 0.2);
            ctx.globalAlpha = alpha;
            ctx.font = `${lyricsFontSize}px "${fontName}", "Noto Naskh Arabic", serif`;
            ctx.fillStyle = textSettings.textColor;
            ctx.shadowColor = `rgba(0, 0, 0, ${textSettings.shadowIntensity * 0.5})`;
            ctx.shadowBlur = 4 * S;
            ctx.fillText(line, canvas.width / 2, y);
          }
          
          ctx.restore();
        }
        
        // Scroll indicator dots
        if (allLyricsLines.length > maxVisibleLines) {
          const dotY = centerY + totalVisibleHeight / 2 + 30 * S;
          const dotSpacing = 8 * S;
          const numDots = Math.min(allLyricsLines.length, 15);
          const dotsWidth = numDots * dotSpacing;
          
          ctx.save();
          for (let i = 0; i < numDots; i++) {
            const dotX = canvas.width / 2 - dotsWidth / 2 + i * dotSpacing + dotSpacing / 2;
            const mappedIndex = Math.round((i / numDots) * allLyricsLines.length);
            const isCurrDot = Math.abs(mappedIndex - currentLyricsIndex) <= 1;
            ctx.beginPath();
            ctx.arc(dotX, dotY, isCurrDot ? 3 * S : 1.5 * S, 0, Math.PI * 2);
            ctx.fillStyle = isCurrDot ? 'rgba(212, 175, 55, 0.8)' : 'rgba(255, 255, 255, 0.3)';
            ctx.fill();
          }
          ctx.restore();
        }
        
        ctx.restore();
      }
      // ── SINGLE mode: only current line, large and centered ──
      else if (lyricsStyle === 'single') {
        const singleFontSize = lyricsFontSize * 1.3;

        // Draw frame if selected
        if (displaySettings.frameStyle !== 'none') {
          const framePad = 50 * S;
          const maxW = canvas.width * 0.85;
          const frameX = (canvas.width - maxW) / 2;
          const frameY2 = centerY - singleFontSize - framePad;
          const frameH = singleFontSize * 2 + framePad * 2;
          drawIslamicFrame(ctx, frameX, frameY2, maxW, frameH, displaySettings.frameStyle);
        }

        ctx.save();
        ctx.direction = 'rtl';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const line = allLyricsLines[currentLyricsIndex] || '';
        drawCurrentLineGlow(ctx, line, canvas.width / 2, centerY, singleFontSize);
        
        // Line counter
        ctx.save();
        ctx.font = `${14 * S}px "${fontName}", sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.shadowBlur = 0;
        ctx.fillText(`${currentLyricsIndex + 1} / ${allLyricsLines.length}`, canvas.width / 2, centerY + singleFontSize * 1.5);
        ctx.restore();
        
        ctx.restore();
      }
      // ── KARAOKE mode: 3 lines visible, current bold and highlighted ──
      else if (lyricsStyle === 'karaoke') {
        const visibleCount = 3;
        const startIdx = Math.max(0, Math.min(currentLyricsIndex - 1, allLyricsLines.length - visibleCount));
        const endIdx = Math.min(allLyricsLines.length, startIdx + visibleCount);
        
        const totalH = (endIdx - startIdx) * lyricsLineHeight;
        const baseY = centerY - totalH / 2 + lyricsLineHeight / 2;

        if (displaySettings.frameStyle !== 'none') {
          const framePad = 40 * S;
          const frameX = canvas.width * 0.08;
          const frameY2 = baseY - lyricsLineHeight / 2 - framePad;
          const frameW = canvas.width * 0.84;
          const frameH = totalH + framePad * 2;
          drawIslamicFrame(ctx, frameX, frameY2, frameW, frameH, displaySettings.frameStyle);
        }

        ctx.save();
        ctx.direction = 'rtl';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        for (let i = startIdx; i < endIdx; i++) {
          const line = allLyricsLines[i];
          const y = baseY + (i - startIdx) * lyricsLineHeight;
          const isCurrent = i === currentLyricsIndex;
          
          ctx.save();
          if (isCurrent) {
            drawCurrentLineGlow(ctx, line, canvas.width / 2, y, lyricsFontSize);
          } else {
            ctx.globalAlpha = 0.35;
            ctx.font = `${lyricsFontSize * 0.9}px "${fontName}", "Noto Naskh Arabic", serif`;
            ctx.fillStyle = textSettings.textColor;
            ctx.shadowColor = `rgba(0, 0, 0, 0.4)`;
            ctx.shadowBlur = 3 * S;
            ctx.fillText(line, canvas.width / 2, y);
          }
          ctx.restore();
        }
        ctx.restore();
      }
      // ── FADE mode: only current line with fade transition ──
      else if (lyricsStyle === 'fade') {
        const fadeFontSize = lyricsFontSize * 1.2;

        if (displaySettings.frameStyle !== 'none') {
          const framePad = 50 * S;
          const maxW = canvas.width * 0.85;
          const frameX = (canvas.width - maxW) / 2;
          const frameY2 = centerY - fadeFontSize - framePad;
          const frameH = fadeFontSize * 2 + framePad * 2;
          drawIslamicFrame(ctx, frameX, frameY2, maxW, frameH, displaySettings.frameStyle);
        }

        ctx.save();
        ctx.direction = 'rtl';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Apply transition effect
        if (isTransitioningRef.current) {
          ctx.globalAlpha = easedProgress;
        }
        
        const line = allLyricsLines[currentLyricsIndex] || '';
        drawCurrentLineGlow(ctx, line, canvas.width / 2, centerY, fadeFontSize);
        
        ctx.restore();
      }
    }
    // Draw current ayah (if enabled) — standard Quran mode
    else if (currentAyah && displaySettings.showAyahText) {
      const ayahY = canvas.height * 0.52;
      const maxWidth = canvas.width * 0.85;
      
      // Apply verse display mode - chunk words differently
      const verseMode = displaySettings.verseDisplayMode || 'full';
      
      // Dynamic font scaling based on verse display mode
      const modeScales: Record<string, number> = {
        wordByWord: 3.5,
        twoWords: 2.8,
        threeTwo: 2.4,
        full: 2.0,
      };
      const fontScale = modeScales[verseMode] || 2.0;
      const lineHeight = textSettings.fontSize * (verseMode === 'full' ? 3.2 : fontScale * 1.6) * S;
      
      ctx.font = `${textSettings.fontSize * fontScale * S}px "${fontName}", "Noto Naskh Arabic", serif`;
      ctx.fillStyle = textSettings.textColor;
      
      // Word wrap — with layout cache to avoid measureText every frame
      const allWords = (currentAyahWords?.length ? currentAyahWords : currentAyah.text.split(' ')).filter(Boolean);
      
      let displayWords: string[];
      
      // Smooth chunk cycling: use a counter that advances at fixed intervals
      const now = Date.now();
      const chunkInterval = verseMode === 'wordByWord' ? 800 : verseMode === 'twoWords' ? 1500 : 1800;
      if (now - lastChunkTimeRef.current > chunkInterval) {
        chunkCounterRef.current += 1;
        lastChunkTimeRef.current = now;
      }
      
      let currentChunkIndex = 0;
      if (verseMode === 'full') {
        displayWords = allWords;
        currentChunkIndex = 0;
      } else if (verseMode === 'wordByWord') {
        const wordIdx = highlightedWordIndex != null ? highlightedWordIndex : (chunkCounterRef.current % allWords.length);
        displayWords = allWords[wordIdx] ? [allWords[wordIdx]] : allWords.slice(0, 1);
        currentChunkIndex = wordIdx;
      } else if (verseMode === 'twoWords') {
        const chunkSize = 2;
        const totalChunks = Math.ceil(allWords.length / chunkSize);
        const chunkIdx = highlightedWordIndex != null
          ? Math.floor(highlightedWordIndex / chunkSize)
          : (chunkCounterRef.current % totalChunks);
        const start = chunkIdx * chunkSize;
        displayWords = allWords.slice(start, start + chunkSize);
        currentChunkIndex = chunkIdx;
      } else if (verseMode === 'threeTwo') {
        const pattern = [3, 2];
        let pos = 0, chunkIndex = 0;
        const chunks: string[][] = [];
        while (pos < allWords.length) {
          const size = pattern[chunkIndex % pattern.length];
          chunks.push(allWords.slice(pos, pos + size));
          pos += size;
          chunkIndex++;
        }
        const cIdx = highlightedWordIndex != null
          ? (() => { let p = 0; for (let i = 0; i < chunks.length; i++) { if (highlightedWordIndex < p + chunks[i].length) return i; p += chunks[i].length; } return chunks.length - 1; })()
          : (chunkCounterRef.current % chunks.length);
        displayWords = chunks[cIdx] || allWords.slice(0, 3);
        currentChunkIndex = cIdx;
      } else {
        displayWords = allWords;
      }

      // Fade transition between chunks
      if (verseMode !== 'full' && currentChunkIndex !== prevChunkIndexRef.current) {
        prevChunkIndexRef.current = currentChunkIndex;
        chunkFadeRef.current = 0;
        chunkFadeStartRef.current = Date.now();
      }
      if (verseMode !== 'full' && chunkFadeRef.current < 1) {
        const fadeElapsed = Date.now() - chunkFadeStartRef.current;
        chunkFadeRef.current = Math.min(fadeElapsed / 300, 1);
      }
      
      const words = displayWords;
      const cacheKey = `${currentAyah.numberInSurah}|${canvas.width}|${textSettings.fontSize}|${fontName}|${words.join('|')}|${verseMode}`;

      let lines: string[][];
      let spaceWidth: number;
      let totalHeight: number;
      let startY: number;

      if (textLayoutCacheRef.current && textLayoutCacheRef.current.key === cacheKey) {
        // Use cached layout
        lines = textLayoutCacheRef.current.lines;
        spaceWidth = textLayoutCacheRef.current.spaceWidth;
        totalHeight = textLayoutCacheRef.current.totalHeight;
        startY = textLayoutCacheRef.current.startY;
      } else {
        // Compute and cache
        // For word-by-word/chunk modes, use larger font
        const adjustedMaxWidth = verseMode !== 'full' ? canvas.width * 0.9 : maxWidth;
        spaceWidth = ctx.measureText(' ').width;
        lines = [];
        let line: string[] = [];
        let lw = 0;

        for (const word of words) {
          const w = ctx.measureText(word).width;
          const add = line.length ? spaceWidth + w : w;
          if (lw + add > adjustedMaxWidth && line.length) {
            lines.push(line);
            line = [word];
            lw = w;
          } else {
            line.push(word);
            lw += add;
          }
        }
        if (line.length) lines.push(line);

        totalHeight = lines.length * lineHeight;
        startY = ayahY - totalHeight / 2;

        textLayoutCacheRef.current = { key: cacheKey, lines, spaceWidth, totalHeight, startY, lineHeight };
      }

      // Draw decoration (side borders or separator) based on decorationStyle
      const decoStyle = displaySettings.decorationStyle || 'none';

      // Draw side ornaments (left & right of ayah area)
      if (decoStyle === 'sideBorder' || decoStyle === 'both') {
        drawAyahSideOrnaments(ctx, canvas.width * 0.05, ayahY, totalHeight);
        drawAyahSideOrnaments(ctx, canvas.width * 0.95, ayahY, totalHeight, true);
      }

      // Draw separator line above the ayah
      if (decoStyle === 'separator' || decoStyle === 'both') {
        drawAyahSeparator(ctx, canvas.width / 2, startY - 40 * S, 180 * S);
      }

      // Draw frame around ayah text - centered properly
      if (displaySettings.frameStyle !== 'none') {
        const framePadding = 40 * S;
        // Center the frame horizontally
        const frameWidth = maxWidth + framePadding * 2;
        const frameX = (canvas.width - frameWidth) / 2;
        const frameY = startY - lineHeight / 2 - framePadding;
        const frameHeight = totalHeight + framePadding * 2;
        
        drawIslamicFrame(ctx, frameX, frameY, frameWidth, frameHeight, displaySettings.frameStyle);
      }

    // Helper: draw decorative vertical ornament on side
    function drawAyahSideOrnaments(c: CanvasRenderingContext2D, x: number, centerY: number, h: number, flipX = false) {
      c.save();
      c.translate(x, centerY);
      if (flipX) c.scale(-1, 1);
      c.strokeStyle = 'rgba(212, 175, 55, 0.4)';
      c.lineWidth = 2 * S;
      c.beginPath();
      c.moveTo(0, -h / 2);
      c.bezierCurveTo(30 * S, -h / 4, 30 * S, h / 4, 0, h / 2);
      c.stroke();

      // Small end circles
      c.fillStyle = 'rgba(212, 175, 55, 0.5)';
      c.beginPath();
      c.arc(0, -h / 2, 4 * S, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.arc(0, h / 2, 4 * S, 0, Math.PI * 2);
      c.fill();
      c.restore();
    }

    // Helper: draw horizontal separator line (subtle wave-like)
    function drawAyahSeparator(c: CanvasRenderingContext2D, cx: number, cy: number, width: number) {
      c.save();
      c.strokeStyle = 'rgba(212, 175, 55, 0.35)';
      c.lineWidth = 1.5 * S;
      const hw = width / 2;
      c.beginPath();
      c.moveTo(cx - hw, cy);
      c.bezierCurveTo(cx - hw + 30 * S, cy - 6 * S, cx - 30 * S, cy + 6 * S, cx, cy);
      c.bezierCurveTo(cx + 30 * S, cy - 6 * S, cx + hw - 30 * S, cy + 6 * S, cx + hw, cy);
      c.stroke();

      // End dots
      c.fillStyle = 'rgba(212, 175, 55, 0.5)';
      c.beginPath();
      c.arc(cx - hw - 5 * S, cy, 3 * S, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.arc(cx + hw + 5 * S, cy, 3 * S, 0, Math.PI * 2);
      c.fill();
      c.restore();
    }

      // Apply verse transition effects
      ctx.save();
      if (isTransitioningRef.current && transitionType !== 'none') {
        switch (transitionType) {
          case 'fade':
            ctx.globalAlpha = easedProgress;
            break;
          case 'slide':
            ctx.translate(0, (1 - easedProgress) * 80 * S);
            ctx.globalAlpha = easedProgress;
            break;
          case 'zoom': {
            const scaleVal = 0.85 + easedProgress * 0.15;
            ctx.translate(canvas.width / 2 * (1 - scaleVal), canvas.height * 0.52 * (1 - scaleVal));
            ctx.scale(scaleVal, scaleVal);
            ctx.globalAlpha = easedProgress;
            break;
          }
          case 'blur':
            ctx.globalAlpha = easedProgress;
            break;
          case 'rise': {
            const yOffset = (1 - easedProgress) * 120 * S;
            const scaleVal = 0.96 + easedProgress * 0.04;
            ctx.translate(canvas.width / 2, canvas.height * 0.52 + yOffset);
            ctx.scale(scaleVal, scaleVal);
            ctx.translate(-canvas.width / 2, -canvas.height * 0.52);
            ctx.globalAlpha = easedProgress;
            break;
          }
          case 'rotate': {
            const rotate = (1 - easedProgress) * 0.05;
            ctx.translate(canvas.width / 2, canvas.height * 0.52);
            ctx.rotate(rotate);
            ctx.translate(-canvas.width / 2, -canvas.height * 0.52);
            ctx.globalAlpha = easedProgress;
            break;
          }
          case 'cinematic': {
            const xOffset = (1 - easedProgress) * 60 * S;
            const yOffset = (1 - easedProgress) * 30 * S;
            const scaleVal = 1.05 - easedProgress * 0.05;
            ctx.translate(canvas.width / 2 + xOffset, canvas.height * 0.52 + yOffset);
            ctx.scale(scaleVal, scaleVal);
            ctx.translate(-canvas.width / 2, -canvas.height * 0.52);
            ctx.globalAlpha = Math.min(1, easedProgress * 1.15);
            break;
          }
          case 'elastic': {
            const elastic = Math.sin(easedProgress * Math.PI * 1.5) * (1 - easedProgress) * 0.08;
            const scaleVal = 0.9 + easedProgress * 0.1 + elastic;
            ctx.translate(canvas.width / 2, canvas.height * 0.52);
            ctx.scale(scaleVal, scaleVal);
            ctx.translate(-canvas.width / 2, -canvas.height * 0.52);
            ctx.globalAlpha = easedProgress;
            break;
          }
        }
      }

      // Apply chunk fade for non-full modes
      if (verseMode !== 'full') {
        ctx.globalAlpha = (ctx.globalAlpha || 1) * chunkFadeRef.current;
      }

      // RTL text direction
      ctx.direction = 'rtl';
      ctx.textAlign = 'right';

      const primaryRaw = (() => {
        try {
          return getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
        } catch {
          return '';
        }
      })();
      
      // Different highlight styles
      let highlightBg: string;
      let highlightText: string;
      const highlightEnabled = displaySettings.highlightStyle !== 'none';
      
      switch (displaySettings.highlightStyle) {
        case 'none':
          highlightBg = 'transparent';
          highlightText = textSettings.textColor;
          break;
        case 'glow':
          highlightBg = 'transparent';
          highlightText = '#FFD700';
          break;
        case 'underline':
          highlightBg = 'transparent';
          highlightText = textSettings.textColor;
          break;
        default: // solid
          highlightBg = primaryRaw ? `hsl(${primaryRaw} / 0.28)` : 'rgba(212, 175, 55, 0.28)';
          highlightText = getTokenHsl('--primary-foreground', '#FFD700');
      }

      let globalIndex = 0;
      lines.forEach((wordsInLine, i) => {
        const lineTotal = wordsInLine.reduce((sum, w) => sum + ctx.measureText(w).width, 0) +
          Math.max(wordsInLine.length - 1, 0) * spaceWidth;

        let cursorX = canvas.width / 2 + lineTotal / 2;
        const y = startY + i * lineHeight + lineHeight / 2;

        wordsInLine.forEach((w) => {
          const wWidth = ctx.measureText(w).width;
          const isWordHighlighted = highlightEnabled && highlightedWordIndex != null && globalIndex === highlightedWordIndex;

          if (isWordHighlighted) {
            ctx.save();
            ctx.shadowBlur = 0;
            
            if (displaySettings.highlightStyle === 'solid') {
              const padX = 20 * S;
              const padY = 12 * S;
              ctx.fillStyle = highlightBg;
              const left = cursorX - wWidth - padX;
              const top = y - (textSettings.fontSize * 1.3 * S) - padY;
              const width = wWidth + padX * 2;
              const height = textSettings.fontSize * 2.4 * S + padY * 2;
              ctx.beginPath();
              ctx.roundRect(left, top, width, height, 24 * S);
              ctx.fill();
            } else if (displaySettings.highlightStyle === 'glow') {
              const glowPulse = 0.35 + Math.sin(Math.PI * Math.min(Math.max(highlightWordProgress, 0), 1)) * 0.65;
              ctx.shadowColor = '#FFD700';
              ctx.shadowBlur = (14 + glowPulse * 24) * S;
            } else if (displaySettings.highlightStyle === 'underline') {
              ctx.strokeStyle = '#FFD700';
              ctx.lineWidth = 3 * S;
              ctx.beginPath();
              ctx.moveTo(cursorX - wWidth, y + textSettings.fontSize * 0.8 * S);
              ctx.lineTo(cursorX, y + textSettings.fontSize * 0.8 * S);
              ctx.stroke();
            }
            
            ctx.restore();
          }

          ctx.save();
          if (isWordHighlighted) {
            // Subtle scale-up effect for the highlighted word
            const scalePulse = 1.0 + 0.12 * Math.sin(Math.PI * Math.min(Math.max(highlightWordProgress ?? 0, 0), 1));
            ctx.translate(cursorX - wWidth / 2, y);
            ctx.scale(scalePulse, scalePulse);
            ctx.translate(-(cursorX - wWidth / 2), -y);

            if (displaySettings.highlightStyle === 'glow') {
              const glowPulse = 0.35 + Math.sin(Math.PI * Math.min(Math.max(highlightWordProgress ?? 0, 0), 1)) * 0.65;
              ctx.shadowColor = '#FFD700';
              ctx.shadowBlur = (18 + glowPulse * 28) * S;
            }
          }
          ctx.fillStyle = isWordHighlighted ? highlightText : textSettings.textColor;
          ctx.fillText(w, cursorX, y);
          ctx.restore();

          cursorX -= wWidth + spaceWidth;
          globalIndex += 1;
        });
      });

      // Draw ayah number badge (if enabled) — position adapts to verse mode
      if (displaySettings.showAyahNumber) {
        let badgeSize = 36 * S;
        let badgeGap = 40 * S;
        if (verseMode !== 'full') {
          badgeSize = 28 * S;
          badgeGap = 24 * S; // Closer to text in chunk modes
        }
        let badgeY = startY + totalHeight + badgeGap;
        // Clamp: stay on screen but close to text
        badgeY = Math.min(badgeY, canvas.height * 0.88);
        badgeY = Math.max(badgeY, startY + totalHeight + 16 * S);
        drawAyahBadge(ctx, canvas.width / 2, badgeY, currentAyah.numberInSurah, badgeSize, displaySettings.ayahNumberStyle, displaySettings.ayahNumberColor);
      }
      ctx.restore(); // End verse transition transform
    }

    // ── Watermark ──────────────────────────────────────────────────────────
    if (displaySettings.watermarkEnabled && displaySettings.watermarkText) {
      ctx.save();
      const wmText = displaySettings.watermarkText;
      const wmPos = displaySettings.watermarkPosition || 'bottomRight';
      const wmFontSize = 18 * S;
      ctx.font = `${wmFontSize}px "Noto Naskh Arabic", sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 4 * S;
      ctx.textBaseline = 'bottom';

      const padding = 30 * S;
      let wmX: number, wmY: number;

      switch (wmPos) {
        case 'bottomLeft':
          ctx.textAlign = 'left';
          wmX = padding;
          wmY = canvas.height - padding;
          break;
        case 'bottomCenter':
          ctx.textAlign = 'center';
          wmX = canvas.width / 2;
          wmY = canvas.height - padding;
          break;
        case 'topLeft':
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          wmX = padding;
          wmY = padding;
          break;
        case 'topRight':
          ctx.textAlign = 'right';
          ctx.textBaseline = 'top';
          wmX = canvas.width - padding;
          wmY = padding;
          break;
        default: // bottomRight
          ctx.textAlign = 'right';
          wmX = canvas.width - padding;
          wmY = canvas.height - padding;
          break;
      }

      ctx.fillText(wmText, wmX, wmY);
      ctx.restore();
    }
  }, [background, customBackground, imageLoaded, videoReady, slideshowReady, surahName, reciterName, currentAyah, currentAyahWords, highlightedWordIndex, highlightWordProgress, textSettings, displaySettings, getRecordingDimensions, getTokenHsl, drawAyahBadge, getCanvasFontFamily, drawIslamicFrame, motionSpeed, isPlaying, ibtahalatLyricsMode, allLyricsLines, currentLyricsIndex]);

  useEffect(() => {
    drawFrameRuntimeRef.current = drawFrame;
  }, [drawFrame]);

  // Animation loop for preview canvas — lighter while idle and fully paused during isolated recording
  useEffect(() => {
    if (isRecording) {
      drawFrameRuntimeRef.current();
      return;
    }

    const hasAnimatedBackground =
      ((background?.type || 'image') === 'video' && videoReady) ||
      ((background?.type || 'image') === 'animated' && slideshowReady);

    if (!isPlaying && !hasAnimatedBackground) {
      drawFrameRuntimeRef.current();
      return;
    }

    const perfMode = displaySettings.performanceMode || 'balanced';
    const targetFps = perfMode === 'economy' ? 10 : perfMode === 'pro' ? 18 : 14;
    const frameInterval = 1000 / targetFps;
    let lastFrameTime = 0;

    const animate = (now: number) => {
      animationFrameRef.current = requestAnimationFrame(animate);
      if (now - lastFrameTime < frameInterval) return;
      lastFrameTime = now;
      drawFrameRuntimeRef.current();
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [background?.type, displaySettings.performanceMode, isPlaying, isRecording, videoReady, slideshowReady]);

  // Notify when canvas is ready
  useEffect(() => {
    if (canvasRef.current && onCanvasReady) {
      onCanvasReady(canvasRef.current);
    }
  }, [onCanvasReady]);

  useImperativeHandle(ref, () => ({
    getContainer: () => containerRef.current,
    getCanvas: () => canvasRef.current,
    isBackgroundReady: () => {
      if ((background?.type || 'image') === 'video') return videoReady;
      if ((background?.type || 'image') === 'animated') return slideshowReady || imageLoaded;
      return imageLoaded || Boolean(customBackground);
    },
    ensureBackgroundPlayback,
    getRecordingDimensions,
    getRecommendedRecordingFps,
    // Always route through the live draw function ref to avoid stale closure
    drawFrame: (targetCanvas?: HTMLCanvasElement, renderMode?: 'preview' | 'recording' | 'recordingLite') =>
      drawFrameRuntimeRef.current(targetCanvas, renderMode),
  }));

  const containerClass = aspectRatio === '9:16'
    ? 'aspect-[9/16] max-w-[360px]'
    : 'aspect-video max-w-[640px]';

  return (
    <div
      ref={containerRef}
      className={`${containerClass} w-full mx-auto relative rounded-2xl overflow-hidden shadow-2xl bg-black`}
    >
      {/* Visible preview canvas (recording uses an isolated off-screen canvas) */}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: 'block' }}
      />
    </div>
  );
});

VideoPreview.displayName = 'VideoPreview';
