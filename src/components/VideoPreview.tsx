import { useRef, useEffect, forwardRef, useImperativeHandle, useCallback, useState } from 'react';
import { BackgroundItem } from '@/data/backgrounds';

interface VideoPreviewProps {
  background: BackgroundItem | null;
  surahName: string;
  reciterName: string;
  currentAyah: { numberInSurah: number; text: string } | null;
  currentAyahWords?: string[];
  highlightedWordIndex?: number | null;
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
    highlightStyle: 'solid' | 'glow' | 'underline';
  };
  isPlaying: boolean;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
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
  highlightStyle: 'solid' as const,
};

export const VideoPreview = forwardRef<VideoPreviewRef, VideoPreviewProps>(({
  background,
  surahName,
  reciterName,
  currentAyah,
  currentAyahWords,
  highlightedWordIndex,
  aspectRatio,
  textSettings,
  displaySettings = DEFAULT_DISPLAY_SETTINGS,
  isPlaying,
  onCanvasReady,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [videoReady, setVideoReady] = useState(false);

  // Get dimensions based on aspect ratio
  const getDimensions = () => {
    if (aspectRatio === '9:16') {
      return { width: 360, height: 640 };
    }
    return { width: 640, height: 360 };
  };

  const dimensions = getDimensions();

  // Load background image
  useEffect(() => {
    if (background?.type === 'image') {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = background.url;
      img.onload = () => {
        imageRef.current = img;
      };
    }
  }, [background]);

  // Handle video ready state
  useEffect(() => {
    const video = videoRef.current;
    if (!video || background?.type !== 'video') return;

    const handleCanPlay = () => setVideoReady(true);
    const handleError = () => {
      console.error('Video load error, falling back to image');
      setVideoReady(false);
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    // Force load
    video.load();

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, [background]);

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

  // Draw decorative ayah number badge
  const drawAyahBadge = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, num: number, size: number) => {
    const arabicNum = toArabicNumber(num);
    
    // Outer decorative circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
    gradient.addColorStop(0, 'rgba(212, 175, 55, 0.3)');
    gradient.addColorStop(0.7, 'rgba(212, 175, 55, 0.15)');
    gradient.addColorStop(1, 'rgba(212, 175, 55, 0.05)');
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Inner circle border
    ctx.beginPath();
    ctx.arc(x, y, size * 0.85, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Inner decorative ring
    ctx.beginPath();
    ctx.arc(x, y, size * 0.7, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw number with Noto Naskh Arabic for consistency
    ctx.font = `bold ${size * 1.1}px "Noto Naskh Arabic", "Amiri", serif`;
    ctx.fillStyle = '#D4AF37';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 4;
    ctx.fillText(arabicNum, x, y + 2);
    ctx.restore();
  }, []);

  // Draw frame on canvas
  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const { width, height } = dimensions;
    canvas.width = width * 2; // 2x for retina
    canvas.height = height * 2;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw background
    if (background?.type === 'video' && videoRef.current && videoReady && videoRef.current.readyState >= 2) {
      // Draw video frame
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    } else if (background?.type === 'image' && imageRef.current) {
      // Ken Burns effect - subtle scale and position animation
      const time = Date.now() / 1000;
      const scale = 1 + Math.sin(time * 0.1) * 0.05;
      const offsetX = Math.sin(time * 0.05) * 20;
      const offsetY = Math.cos(time * 0.05) * 20;
      
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(scale, scale);
      ctx.translate(-canvas.width / 2 + offsetX, -canvas.height / 2 + offsetY);
      ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    } else {
      // Gradient fallback with Islamic pattern hint
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

    // Text settings
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = `rgba(0, 0, 0, ${textSettings.shadowIntensity})`;
    ctx.shadowBlur = textSettings.shadowIntensity * 20;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    // Draw surah name badge (if enabled)
    if (displaySettings.showSurahName) {
      const badgeY = canvas.height * 0.12;
      
      // Elegant badge background
      const badgeWidth = 320;
      const badgeHeight = 90;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.roundRect(canvas.width / 2 - badgeWidth / 2, badgeY - badgeHeight / 2, badgeWidth, badgeHeight, 45);
      ctx.fill();
      
      // Golden border
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Surah name with Noto Naskh Arabic
      ctx.font = `bold ${textSettings.fontSize * 2.2}px "Noto Naskh Arabic", "Amiri", serif`;
      ctx.fillStyle = textSettings.textColor;
      ctx.fillText(surahName, canvas.width / 2, badgeY);
    }

    // Draw reciter name (if enabled)
    if (displaySettings.showReciterName) {
      const reciterY = displaySettings.showSurahName ? canvas.height * 0.19 : canvas.height * 0.12;
      ctx.font = `${textSettings.fontSize * 1.1}px "Noto Naskh Arabic", "Amiri", serif`;
      ctx.fillStyle = textSettings.textColor;
      ctx.globalAlpha = 0.75;
      ctx.fillText(`بصوت ${reciterName}`, canvas.width / 2, reciterY);
      ctx.globalAlpha = 1;
    }

    // Draw decorative separator line
    if (displaySettings.showSurahName || displaySettings.showReciterName) {
      const lineY = canvas.height * 0.24;
      const lineWidth = 150;
      
      // Center ornament
      ctx.fillStyle = 'rgba(212, 175, 55, 0.5)';
      ctx.beginPath();
      ctx.arc(canvas.width / 2, lineY, 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Lines on both sides
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - lineWidth, lineY);
      ctx.lineTo(canvas.width / 2 - 15, lineY);
      ctx.moveTo(canvas.width / 2 + 15, lineY);
      ctx.lineTo(canvas.width / 2 + lineWidth, lineY);
      ctx.stroke();
    }

    // Draw current ayah (if enabled)
    if (currentAyah && displaySettings.showAyahText) {
      const ayahY = canvas.height * 0.52;
      const maxWidth = canvas.width * 0.88;
      const lineHeight = textSettings.fontSize * 3.2;
      
      // Use Noto Naskh Arabic for consistent rendering
      ctx.font = `${textSettings.fontSize * 2}px "Noto Naskh Arabic", "Amiri", serif`;
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
      
      switch (displaySettings.highlightStyle) {
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
          const isWordHighlighted = highlightedWordIndex != null && globalIndex === highlightedWordIndex;

          if (isWordHighlighted) {
            ctx.save();
            ctx.shadowBlur = 0;
            
            if (displaySettings.highlightStyle === 'solid') {
              const padX = 20;
              const padY = 12;
              ctx.fillStyle = highlightBg;
              const left = cursorX - wWidth - padX;
              const top = y - (textSettings.fontSize * 1.3) - padY;
              const width = wWidth + padX * 2;
              const height = textSettings.fontSize * 2.4 + padY * 2;
              ctx.beginPath();
              ctx.roundRect(left, top, width, height, 24);
              ctx.fill();
            } else if (displaySettings.highlightStyle === 'glow') {
              ctx.shadowColor = '#FFD700';
              ctx.shadowBlur = 20;
            } else if (displaySettings.highlightStyle === 'underline') {
              ctx.strokeStyle = '#FFD700';
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.moveTo(cursorX - wWidth, y + textSettings.fontSize * 0.8);
              ctx.lineTo(cursorX, y + textSettings.fontSize * 0.8);
              ctx.stroke();
            }
            
            ctx.restore();
          }

          ctx.save();
          if (isWordHighlighted && displaySettings.highlightStyle === 'glow') {
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 25;
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
        const badgeY = startY + totalHeight + 70;
        drawAyahBadge(ctx, canvas.width / 2, badgeY, currentAyah.numberInSurah, 36);
      }
    }
  }, [background, videoReady, surahName, reciterName, currentAyah, currentAyahWords, highlightedWordIndex, textSettings, displaySettings, dimensions, getTokenHsl, drawAyahBadge]);

  // Animation loop for canvas
  useEffect(() => {
    const animate = () => {
      drawFrame();
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [drawFrame]);

  // Control video playback
  useEffect(() => {
    if (videoRef.current && background?.type === 'video') {
      if (isPlaying) {
        videoRef.current.play().catch(console.error);
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, background]);

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
      {/* Hidden video element for background */}
      {background?.type === 'video' && (
        <video
          ref={videoRef}
          src={background.url}
          className="hidden"
          loop
          muted
          playsInline
          crossOrigin="anonymous"
          preload="auto"
        />
      )}

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