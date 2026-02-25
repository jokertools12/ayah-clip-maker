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
const SLIDESHOW_TRANSITION_DURATION = 2000; // 2s smooth crossfade
const SLIDESHOW_DISPLAY_DURATION = 5000; // 5 seconds per image
const TARGET_FPS = 30; // Cap animation at 30fps to reduce CPU load
const FRAME_INTERVAL = 1000 / TARGET_FPS;

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
    surahNamePosition?: 'top' | 'bottom' | 'topLeft' | 'topRight';
    surahNameStyle?: 'classic' | 'banner' | 'calligraphy' | 'circle' | 'diamond' | 'ribbon';
    textShadowStyle?: 'soft' | 'strong' | 'none' | 'glow';
    decorationStyle?: 'none' | 'sideBorder' | 'separator' | 'both';
    ayahTransition?: 'none' | 'fade' | 'slide' | 'zoom' | 'blur' | 'rise' | 'rotate' | 'cinematic' | 'elastic' | 'random';
  };
  isPlaying: boolean;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
  motionSpeed?: number; // 1-10, default 3
}

export interface VideoPreviewRef {
  getContainer: () => HTMLDivElement | null;
  getCanvas: () => HTMLCanvasElement | null;
  drawFrame: () => void;
}

const DEFAULT_DISPLAY_SETTINGS = {
  showSurahName: true,
  showReciterName: true,
  showAyahText: true,
  showAyahNumber: true,
  highlightStyle: 'none' as const,
  frameStyle: 'none' as const,
  ayahNumberStyle: 'circle' as const,
  surahNamePosition: 'top' as const,
  surahNameStyle: 'classic' as const,
  textShadowStyle: 'soft' as const,
  decorationStyle: 'separator' as const,
  ayahTransition: 'fade' as const,
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
  onCanvasReady,
  motionSpeed = 3,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  // Slideshow state
  const slideshowImagesRef = useRef<HTMLImageElement[]>([]);
  const [slideshowReady, setSlideshowReady] = useState(false);
  const slideshowStartTimeRef = useRef<number>(Date.now());

  // Floating particles state (golden dust)
  const particlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; size: number; alpha: number; life: number }>>([]);

  // Verse transition state
  const prevAyahRef = useRef<{ numberInSurah: number; text: string } | null>(null);
  const transitionStartRef = useRef<number>(0);
  const isTransitioningRef = useRef(false);
  const VERSE_TRANSITION_DURATION = 800; // ms
  // For random transition: pick a random effect per verse change
  const RANDOM_TRANSITIONS: Array<'fade' | 'slide' | 'zoom' | 'blur' | 'rise' | 'rotate' | 'cinematic' | 'elastic'> = ['fade', 'slide', 'zoom', 'blur', 'rise', 'rotate', 'cinematic', 'elastic'];
  const currentRandomTransitionRef = useRef<string>('fade');

  // Canvas renders at high resolution for sharp text, CSS scales it down for display
  const getDimensions = () => {
    if (aspectRatio === '9:16') {
      return { width: 1080, height: 1920 };
    }
    return { width: 1920, height: 1080 };
  };

  const dimensions = getDimensions();

  // Get the actual font name for canvas
  const getCanvasFontFamily = useCallback((fontFamily: string): string => {
    return FONT_MAP[fontFamily] || 'Noto Naskh Arabic';
  }, []);

  // Load background (image or video)
  useEffect(() => {
    const bgUrl = customBackground || background?.url;
    const bgType = background?.type || 'image';
    const slideImages = background?.slideImages;
    
    if (!bgUrl) return;
    
    setImageLoaded(false);
    setVideoReady(false);
    setSlideshowReady(false);
    slideshowImagesRef.current = [];
    
    // Handle slideshow backgrounds (animated type with slideImages)
    let cancelled = false;

    if (bgType === 'animated' && slideImages && slideImages.length > 1) {
      // Preload all slideshow images
      const loadedImages: HTMLImageElement[] = [];
      let loadedCount = 0;

      slideImages.forEach((url, index) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = url;
        img.onload = () => {
          loadedImages[index] = img;
          loadedCount++;
          if (loadedCount === slideImages.length) {
            slideshowImagesRef.current = loadedImages;
            slideshowStartTimeRef.current = Date.now();
            setSlideshowReady(true);
          }
        };
        img.onerror = () => {
          console.error('Failed to load slideshow image:', url);
          loadedCount++;
        };
      });
    } else if (bgType === 'video') {
      // Load video directly – Pexels CDN supports CORS headers
      const video = document.createElement('video');
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = 'auto';
      video.crossOrigin = 'anonymous';
      video.src = bgUrl;

      video.onloadeddata = () => {
        if (cancelled) return;
        videoRef.current = video;
        setVideoReady(true);
        video.play().catch(console.error);
      };

      video.onerror = () => {
        console.warn('Direct video load failed, trying proxy…');
        // Fallback: try via proxy for non-CORS CDNs
        const proxyVideo = async () => {
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

            const blobUrl = URL.createObjectURL(blob);
            const v2 = document.createElement('video');
            v2.muted = true;
            v2.loop = true;
            v2.playsInline = true;
            v2.preload = 'auto';
            v2.src = blobUrl;
            v2.onloadeddata = () => {
              if (cancelled) { URL.revokeObjectURL(blobUrl); return; }
              videoRef.current = v2;
              setVideoReady(true);
              v2.play().catch(console.error);
            };
            v2.onerror = () => {
              URL.revokeObjectURL(blobUrl);
              loadImage(background?.thumbnail || bgUrl);
            };
          } catch {
            loadImage(background?.thumbnail || bgUrl);
          }
        };
        proxyVideo();
      };
    } else {
      loadImage(bgUrl);
    }

    function loadImage(url: string) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = url;
      img.onload = () => {
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
        if (videoRef.current.src.startsWith('blob:')) {
          URL.revokeObjectURL(videoRef.current.src);
        }
        videoRef.current = null;
      }
      slideshowImagesRef.current = [];
    };
  }, [background, customBackground]);

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
  const drawAyahBadge = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, num: number, size: number, style: string) => {
    const arabicNum = toArabicNumber(num);
    
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
      default: // circle
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
    }
    
    // Fill with gradient
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
    gradient.addColorStop(0, 'rgba(212, 175, 55, 0.4)');
    gradient.addColorStop(0.7, 'rgba(212, 175, 55, 0.2)');
    gradient.addColorStop(1, 'rgba(212, 175, 55, 0.1)');
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Draw border
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Inner decoration
    if (style === 'circle') {
      ctx.beginPath();
      ctx.arc(x, y, size * 0.75, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    
    // Draw number
    ctx.font = `bold ${size * 1.1}px "Noto Naskh Arabic", "Amiri", serif`;
    ctx.fillStyle = '#D4AF37';
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
  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const { width, height } = dimensions;
    // Use 1x resolution — retina 2x is unnecessary and doubles GPU/CPU cost
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw background with Ken Burns effect - use prop motionSpeed
    const t = (Date.now() / 1000) * motionSpeed;
    const scale = 1.06 + Math.sin(t * 0.2) * 0.04; // gentler motion
    const offsetX = Math.sin(t * 0.12) * 20;
    const offsetY = Math.cos(t * 0.1) * 16;
    
    // Handle slideshow backgrounds
    if (slideshowReady && slideshowImagesRef.current.length > 1) {
      const images = slideshowImagesRef.current;
      // Don't multiply elapsed by motionSpeed for slideshow timing — it makes transitions jerky.
      // motionSpeed only affects the Ken Burns pan/zoom intensity.
      const elapsed = Date.now() - slideshowStartTimeRef.current;
      const cycleDuration = SLIDESHOW_DISPLAY_DURATION + SLIDESHOW_TRANSITION_DURATION;
      const totalCycle = cycleDuration * images.length;
      const cyclePosition = elapsed % totalCycle;
      
      const currentIndex = Math.floor(cyclePosition / cycleDuration) % images.length;
      const nextIndex = (currentIndex + 1) % images.length;
      const positionInCycle = cyclePosition % cycleDuration;
      
      // Smooth ease-in-out for crossfade
      const easeInOut = (p: number) => p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      
      // Draw current image with Ken Burns
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(scale, scale);
      ctx.translate(-canvas.width / 2 + offsetX, -canvas.height / 2 + offsetY);
      
      const currentImg = images[currentIndex];
      if (currentImg) {
        ctx.drawImage(currentImg, 0, 0, canvas.width, canvas.height);
      }
      ctx.restore();
      
      // Pure smooth crossfade (no jarring slide)
      if (positionInCycle > SLIDESHOW_DISPLAY_DURATION) {
        const rawProgress = (positionInCycle - SLIDESHOW_DISPLAY_DURATION) / SLIDESHOW_TRANSITION_DURATION;
        const fadeProgress = easeInOut(Math.min(rawProgress, 1));
        
        ctx.save();
        ctx.globalAlpha = fadeProgress;
        
        // Gentle independent Ken Burns for next image
        const nextT = t + 3; // offset so it looks different
        const nextScale = 1.06 + Math.sin(nextT * 0.18) * 0.04;
        const nextOffsetX = Math.cos(nextT * 0.14) * 18;
        const nextOffsetY = Math.sin(nextT * 0.11) * 14;
        
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(nextScale, nextScale);
        ctx.translate(-canvas.width / 2 + nextOffsetX, -canvas.height / 2 + nextOffsetY);
        
        const nextImg = images[nextIndex];
        if (nextImg) {
          ctx.drawImage(nextImg, 0, 0, canvas.width, canvas.height);
        }
        ctx.restore();
      }
    } else if (videoReady && videoRef.current) {
      // Draw video frame
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(scale, scale);
      ctx.translate(-canvas.width / 2 + offsetX, -canvas.height / 2 + offsetY);
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    } else if (imageRef.current && imageLoaded) {
      // Draw image with Ken Burns
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(scale, scale);
      ctx.translate(-canvas.width / 2 + offsetX, -canvas.height / 2 + offsetY);
      ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
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

    // ── Floating golden particles ──────────────────────────────────────────
    if (particlesRef.current.length < 20) {
      particlesRef.current.push({
        x: Math.random() * canvas.width,
        y: canvas.height + 10,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -(0.3 + Math.random() * 0.7),
        size: 1.5 + Math.random() * 3,
        alpha: 0.15 + Math.random() * 0.35,
        life: 0,
      });
    }
    ctx.save();
    particlesRef.current = particlesRef.current.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life += 1;
      p.alpha *= 0.997;
      if (p.y < -20 || p.alpha < 0.01) return false;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * S, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212, 175, 55, ${p.alpha})`;
      ctx.fill();
      return true;
    });
    ctx.restore();

    // ── Subtle vignette effect ────────────────────────────────────────────
    const vignetteGrad = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, canvas.width * 0.3,
      canvas.width / 2, canvas.height / 2, canvas.width * 0.9
    );
    vignetteGrad.addColorStop(0, 'transparent');
    vignetteGrad.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
    ctx.fillStyle = vignetteGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Get the font family for canvas
    const fontName = getCanvasFontFamily(textSettings.fontFamily);

    // Text settings
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = `rgba(0, 0, 0, ${textSettings.shadowIntensity})`;
    ctx.shadowBlur = textSettings.shadowIntensity * 20;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    // Scale factor: all hardcoded sizes were designed for ~1080px width canvas.
    // Scale them relative to actual canvas width so they look right at 360px too.
    const S = canvas.width / 1080;

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

    // Draw reciter name (if enabled) — scaled
    if (displaySettings.showReciterName) {
      const reciterY = displaySettings.showSurahName ? canvas.height * 0.175 : canvas.height * 0.12;
      ctx.font = `${textSettings.fontSize * 1.0 * S}px "${fontName}", "Noto Naskh Arabic", serif`;
      ctx.fillStyle = textSettings.textColor;
      ctx.globalAlpha = 0.7;
      ctx.fillText(`بصوت ${reciterName}`, canvas.width / 2, reciterY);
      ctx.globalAlpha = 1;
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
      // Pick a random transition for this verse change
      currentRandomTransitionRef.current = RANDOM_TRANSITIONS[Math.floor(Math.random() * RANDOM_TRANSITIONS.length)];
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

    // Draw current ayah (if enabled)
    if (currentAyah && displaySettings.showAyahText) {
      const ayahY = canvas.height * 0.52;
      const maxWidth = canvas.width * 0.85;
      const lineHeight = textSettings.fontSize * 3.2 * S;
      
      ctx.font = `${textSettings.fontSize * 2 * S}px "${fontName}", "Noto Naskh Arabic", serif`;
      ctx.fillStyle = textSettings.textColor;
      
      // Word wrap
      const words = (currentAyahWords?.length ? currentAyahWords : currentAyah.text.split(' ')).filter(Boolean);

      const spaceWidth = ctx.measureText(' ').width;
      const lines: string[][] = [];
      let line: string[] = [];
      let lineWidth = 0;

      for (const word of words) {
        const w = ctx.measureText(word).width;
        const add = line.length ? spaceWidth + w : w;
        if (lineWidth + add > maxWidth && line.length) {
          lines.push(line);
          line = [word];
          lineWidth = w;
        } else {
          line.push(word);
          lineWidth += add;
        }
      }
      if (line.length) lines.push(line);

      const totalHeight = lines.length * lineHeight;
      const startY = ayahY - totalHeight / 2;

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
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(0, -h / 2);
      c.bezierCurveTo(30, -h / 4, 30, h / 4, 0, h / 2);
      c.stroke();

      // Small end circles
      c.fillStyle = 'rgba(212, 175, 55, 0.5)';
      c.beginPath();
      c.arc(0, -h / 2, 4, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.arc(0, h / 2, 4, 0, Math.PI * 2);
      c.fill();
      c.restore();
    }

    // Helper: draw horizontal separator line (subtle wave-like)
    function drawAyahSeparator(c: CanvasRenderingContext2D, cx: number, cy: number, width: number) {
      c.save();
      c.strokeStyle = 'rgba(212, 175, 55, 0.35)';
      c.lineWidth = 1.5;
      const hw = width / 2;
      c.beginPath();
      c.moveTo(cx - hw, cy);
      c.bezierCurveTo(cx - hw + 30, cy - 6, cx - 30, cy + 6, cx, cy);
      c.bezierCurveTo(cx + 30, cy - 6, cx + hw - 30, cy + 6, cx + hw, cy);
      c.stroke();

      // End dots
      c.fillStyle = 'rgba(212, 175, 55, 0.5)';
      c.beginPath();
      c.arc(cx - hw - 5, cy, 3, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.arc(cx + hw + 5, cy, 3, 0, Math.PI * 2);
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
          if (isWordHighlighted && displaySettings.highlightStyle === 'glow') {
            const glowPulse = 0.35 + Math.sin(Math.PI * Math.min(Math.max(highlightWordProgress, 0), 1)) * 0.65;
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = (18 + glowPulse * 28) * S;
          }
          ctx.fillStyle = isWordHighlighted ? highlightText : textSettings.textColor;
          ctx.fillText(w, cursorX, y);
          ctx.restore();

          cursorX -= wWidth + spaceWidth;
          globalIndex += 1;
        });
      });

      // Draw ayah number badge (if enabled)
      if (displaySettings.showAyahNumber) {
        const badgeY = startY + totalHeight + 70 * S;
        drawAyahBadge(ctx, canvas.width / 2, badgeY, currentAyah.numberInSurah, 36 * S, displaySettings.ayahNumberStyle);
      }
      ctx.restore(); // End verse transition transform
    }
  }, [background, customBackground, imageLoaded, videoReady, slideshowReady, surahName, reciterName, currentAyah, currentAyahWords, highlightedWordIndex, highlightWordProgress, textSettings, displaySettings, dimensions, getTokenHsl, drawAyahBadge, getCanvasFontFamily, drawIslamicFrame, motionSpeed]);

  // Animation loop for canvas — throttled to TARGET_FPS
  useEffect(() => {
    let lastFrameTime = 0;
    const animate = (now: number) => {
      animationFrameRef.current = requestAnimationFrame(animate);
      if (now - lastFrameTime < FRAME_INTERVAL) return;
      lastFrameTime = now;
      drawFrame();
    };
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [drawFrame]);

  // Notify when canvas is ready
  useEffect(() => {
    if (canvasRef.current && onCanvasReady) {
      onCanvasReady(canvasRef.current);
    }
  }, [onCanvasReady]);

  useImperativeHandle(ref, () => ({
    getContainer: () => containerRef.current,
    getCanvas: () => canvasRef.current,
    drawFrame,
  }));

  const containerClass = aspectRatio === '9:16'
    ? 'aspect-[9/16] max-w-[360px]'
    : 'aspect-video max-w-[640px]';

  return (
    <div
      ref={containerRef}
      className={`${containerClass} w-full mx-auto relative rounded-2xl overflow-hidden shadow-2xl bg-black`}
    >
      {/* Main Canvas - This is what gets recorded */}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: 'block' }}
      />
    </div>
  );
});

VideoPreview.displayName = 'VideoPreview';
