import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
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
}

export interface VideoPreviewRef {
  getContainer: () => HTMLDivElement | null;
}

export const VideoPreview = forwardRef<VideoPreviewRef, VideoPreviewProps>(({
  background,
  surahName,
  reciterName,
  currentAyah,
  aspectRatio,
  textSettings,
  isPlaying,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useImperativeHandle(ref, () => ({
    getContainer: () => containerRef.current,
  }));

  useEffect(() => {
    if (videoRef.current && background?.type === 'video') {
      if (isPlaying) {
        videoRef.current.play().catch(console.error);
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, background]);

  const containerClass = aspectRatio === '9:16'
    ? 'aspect-[9/16] max-w-[360px]'
    : 'aspect-video max-w-[640px]';

  const fontSizeClass = {
    small: 'text-xl md:text-2xl',
    medium: 'text-2xl md:text-3xl',
    large: 'text-3xl md:text-4xl',
    xlarge: 'text-4xl md:text-5xl',
  }[
    textSettings.fontSize <= 20 ? 'small' :
    textSettings.fontSize <= 28 ? 'medium' :
    textSettings.fontSize <= 36 ? 'large' : 'xlarge'
  ];

  const textShadow = `0 2px ${textSettings.shadowIntensity * 4}px rgba(0,0,0,${textSettings.shadowIntensity})`;

  return (
    <div
      ref={containerRef}
      className={`${containerClass} mx-auto relative rounded-2xl overflow-hidden shadow-2xl`}
    >
      {/* Background */}
      {background?.type === 'video' ? (
        <video
          ref={videoRef}
          src={background.url}
          className="absolute inset-0 w-full h-full object-cover"
          loop
          muted
          playsInline
          crossOrigin="anonymous"
        />
      ) : background?.type === 'image' ? (
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url(${background.url})`,
            animation: 'kenburns 20s ease-in-out infinite',
          }}
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary/80 to-secondary/80" />
      )}

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: `rgba(0,0,0,${textSettings.overlayOpacity})` }}
      />

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/30 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
        {/* Surah Name */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="inline-block px-6 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-3">
            <h2
              className="text-2xl md:text-3xl font-bold"
              style={{
                color: textSettings.textColor,
                fontFamily: textSettings.fontFamily,
                textShadow,
              }}
            >
              {surahName}
            </h2>
          </div>
          <p
            className="text-sm"
            style={{ color: textSettings.textColor, opacity: 0.8, textShadow }}
          >
            بصوت {reciterName}
          </p>
        </motion.div>

        {/* Bismillah decoration */}
        <div className="w-24 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent mb-8" />

        {/* Current Ayah */}
        <AnimatePresence mode="wait">
          {currentAyah && (
            <motion.div
              key={currentAyah.numberInSurah}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="text-center px-4 max-w-full"
            >
              <p
                className={`${fontSizeClass} leading-loose`}
                style={{
                  color: textSettings.textColor,
                  fontFamily: textSettings.fontFamily,
                  textShadow,
                }}
              >
                {currentAyah.text}
              </p>
              
              {/* Ayah number badge */}
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="inline-flex items-center justify-center mt-4 h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30"
                style={{ color: textSettings.textColor }}
              >
                <span className="text-lg font-bold">{currentAyah.numberInSurah}</span>
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes kenburns {
          0% { transform: scale(1) translate(0, 0); }
          25% { transform: scale(1.05) translate(-1%, -1%); }
          50% { transform: scale(1.1) translate(-2%, 1%); }
          75% { transform: scale(1.05) translate(1%, -1%); }
          100% { transform: scale(1) translate(0, 0); }
        }
      `}</style>
    </div>
  );
});

VideoPreview.displayName = 'VideoPreview';
