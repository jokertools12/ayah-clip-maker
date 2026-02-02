import { useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BackgroundItem } from '@/data/backgrounds';

interface VideoPreviewProps {
  background: BackgroundItem | null;
  surahName: string;
  reciterName: string;
  currentAyah: { numberInSurah: number; text: string } | null;
  aspectRatio: '9:16' | '16:9';
  textSettings: {
    fontSize: number;
    fontFamily: string;
    textColor: string;
    shadowIntensity: number;
    overlayOpacity: number;
  };
  isPlaying: boolean;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}

export interface VideoPreviewRef {
  getContainer: () => HTMLDivElement | null;
  getCanvas: () => HTMLCanvasElement | null;
  drawFrame: () => void;
}

export const VideoPreview = forwardRef<VideoPreviewRef, VideoPreviewProps>(({
  background,
  surahName,
  reciterName,
  currentAyah,
  aspectRatio,
  textSettings,
  isPlaying,
  onCanvasReady,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

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
    if (background?.type === 'video' && videoRef.current && videoRef.current.readyState >= 2) {
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
      // Gradient fallback
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(1, '#16213e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw overlay
    ctx.fillStyle = `rgba(0, 0, 0, ${textSettings.overlayOpacity})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw top gradient
    const topGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.2);
    topGradient.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
    topGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = topGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.2);

    // Draw bottom gradient
    const bottomGradient = ctx.createLinearGradient(0, canvas.height * 0.8, 0, canvas.height);
    bottomGradient.addColorStop(0, 'transparent');
    bottomGradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
    ctx.fillStyle = bottomGradient;
    ctx.fillRect(0, canvas.height * 0.8, canvas.width, canvas.height * 0.2);

    // Text settings
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = `rgba(0, 0, 0, ${textSettings.shadowIntensity})`;
    ctx.shadowBlur = textSettings.shadowIntensity * 20;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    // Draw surah name badge
    const badgeY = canvas.height * 0.15;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.roundRect(canvas.width / 2 - 150, badgeY - 40, 300, 80, 40);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = `bold ${textSettings.fontSize * 2}px ${textSettings.fontFamily}`;
    ctx.fillStyle = textSettings.textColor;
    ctx.fillText(surahName, canvas.width / 2, badgeY);

    // Draw reciter name
    ctx.font = `${textSettings.fontSize * 1.2}px ${textSettings.fontFamily}`;
    ctx.fillStyle = textSettings.textColor;
    ctx.globalAlpha = 0.8;
    ctx.fillText(`بصوت ${reciterName}`, canvas.width / 2, badgeY + 60);
    ctx.globalAlpha = 1;

    // Draw decorative line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 100, badgeY + 100);
    ctx.lineTo(canvas.width / 2 + 100, badgeY + 100);
    ctx.stroke();

    // Draw current ayah
    if (currentAyah) {
      const ayahY = canvas.height / 2;
      const maxWidth = canvas.width * 0.85;
      const lineHeight = textSettings.fontSize * 3;
      
      ctx.font = `${textSettings.fontSize * 2}px ${textSettings.fontFamily}`;
      ctx.fillStyle = textSettings.textColor;
      
      // Word wrap for Arabic text
      const words = currentAyah.text.split(' ');
      const lines: string[] = [];
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);

      // Draw ayah text lines
      const totalHeight = lines.length * lineHeight;
      const startY = ayahY - totalHeight / 2;
      
      lines.forEach((line, i) => {
        ctx.fillText(line, canvas.width / 2, startY + i * lineHeight + lineHeight / 2);
      });

      // Draw ayah number badge
      const badgeBottom = startY + totalHeight + 60;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.arc(canvas.width / 2, badgeBottom, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = `bold ${textSettings.fontSize * 1.5}px Arial`;
      ctx.fillStyle = textSettings.textColor;
      ctx.fillText(String(currentAyah.numberInSurah), canvas.width / 2, badgeBottom);
    }
  }, [background, surahName, reciterName, currentAyah, textSettings, dimensions]);

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
