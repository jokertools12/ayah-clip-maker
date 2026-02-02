import { useRef, useState, useCallback } from 'react';

export interface VideoRecorderState {
  isRecording: boolean;
  progress: number;
  videoBlob: Blob | null;
  error: string | null;
  stage: string;
}

export function useVideoRecorder() {
  const [state, setState] = useState<VideoRecorderState>({
    isRecording: false,
    progress: 0,
    videoBlob: null,
    error: null,
    stage: '',
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  const startRecording = useCallback(async (
    previewContainer: HTMLElement,
    audioElement: HTMLAudioElement,
    duration: number = 30
  ): Promise<Blob | null> => {
    return new Promise((resolve, reject) => {
      try {
        setState({
          isRecording: true,
          progress: 0,
          videoBlob: null,
          error: null,
          stage: 'جاري تجهيز التسجيل...',
        });
        chunksRef.current = [];

        // Get container dimensions
        const rect = previewContainer.getBoundingClientRect();
        const width = Math.floor(rect.width) * 2;
        const height = Math.floor(rect.height) * 2;

        // Create offscreen canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { alpha: false });
        
        if (!ctx) {
          throw new Error('Could not create canvas context');
        }

        // Get canvas stream
        const canvasStream = canvas.captureStream(30);

        // Create audio stream from audio element
        let audioStream: MediaStream | null = null;
        try {
          const audioCtx = new AudioContext();
          const source = audioCtx.createMediaElementSource(audioElement);
          const destination = audioCtx.createMediaStreamDestination();
          source.connect(destination);
          source.connect(audioCtx.destination); // Also play through speakers
          audioStream = destination.stream;
        } catch (audioError) {
          console.warn('Could not capture audio:', audioError);
        }

        // Combine streams
        const tracks = [...canvasStream.getVideoTracks()];
        if (audioStream) {
          tracks.push(...audioStream.getAudioTracks());
        }
        const combinedStream = new MediaStream(tracks);

        // Setup MediaRecorder with best available codec
        const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
          ? 'video/webm;codecs=vp9,opus'
          : MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
          ? 'video/webm;codecs=vp8,opus'
          : 'video/webm';

        const mediaRecorder = new MediaRecorder(combinedStream, {
          mimeType,
          videoBitsPerSecond: 8000000, // 8 Mbps for high quality
        });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
          }

          const blob = new Blob(chunksRef.current, { type: mimeType });
          setState((prev) => ({
            ...prev,
            isRecording: false,
            progress: 100,
            videoBlob: blob,
            stage: 'اكتمل التسجيل!',
          }));
          resolve(blob);
        };

        mediaRecorder.onerror = (e) => {
          console.error('MediaRecorder error:', e);
          setState((prev) => ({
            ...prev,
            isRecording: false,
            error: 'حدث خطأ في التسجيل',
          }));
          reject(new Error('Recording failed'));
        };

        // Drawing function
        const drawFrame = () => {
          if (!ctx) return;

          // Fill with black background
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, width, height);

          // Draw video element if exists
          const video = previewContainer.querySelector('video') as HTMLVideoElement;
          if (video && video.readyState >= 2) {
            ctx.drawImage(video, 0, 0, width, height);
          } else {
            // Draw background image if exists
            const bgDiv = previewContainer.querySelector('[style*="background-image"]') as HTMLElement;
            if (bgDiv) {
              const bgStyle = window.getComputedStyle(bgDiv);
              const bgImage = bgStyle.backgroundImage;
              const match = bgImage.match(/url\(["']?(.+?)["']?\)/);
              if (match) {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.src = match[1];
                if (img.complete) {
                  // Apply Ken Burns effect
                  const transform = bgStyle.transform;
                  ctx.save();
                  if (transform && transform !== 'none') {
                    // Simple scale approximation
                    const scaleMatch = transform.match(/matrix\(([^,]+)/);
                    if (scaleMatch) {
                      const scale = parseFloat(scaleMatch[1]) || 1;
                      ctx.translate(width / 2, height / 2);
                      ctx.scale(scale, scale);
                      ctx.translate(-width / 2, -height / 2);
                    }
                  }
                  ctx.drawImage(img, 0, 0, width, height);
                  ctx.restore();
                }
              }
            }
          }

          // Draw overlay
          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.fillRect(0, 0, width, height);

          // Draw text elements
          const textElements = previewContainer.querySelectorAll('h2, p:not(.text-xs)');
          textElements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            const elRect = htmlEl.getBoundingClientRect();
            const containerRect = previewContainer.getBoundingClientRect();
            
            const relX = (elRect.left - containerRect.left) / containerRect.width;
            const relY = (elRect.top - containerRect.top) / containerRect.height;
            
            const x = relX * width + (elRect.width / containerRect.width * width) / 2;
            const y = relY * height + (elRect.height / containerRect.height * height);
            
            const computedStyle = window.getComputedStyle(htmlEl);
            const fontSize = parseFloat(computedStyle.fontSize) * 2;
            
            ctx.save();
            ctx.font = `${fontSize}px "Amiri", "Cairo", serif`;
            ctx.fillStyle = computedStyle.color || '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Add text shadow
            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            
            // Handle RTL text
            ctx.direction = 'rtl';
            
            const text = htmlEl.textContent || '';
            ctx.fillText(text, x, y - fontSize / 2);
            ctx.restore();
          });

          // Draw ayah number badge
          const badge = previewContainer.querySelector('.rounded-full span');
          if (badge) {
            const badgeEl = badge as HTMLElement;
            const badgeRect = badgeEl.getBoundingClientRect();
            const containerRect = previewContainer.getBoundingClientRect();
            
            const x = ((badgeRect.left - containerRect.left) / containerRect.width) * width + 
                      ((badgeRect.width / containerRect.width) * width) / 2;
            const y = ((badgeRect.top - containerRect.top) / containerRect.height) * height +
                      ((badgeRect.height / containerRect.height) * height) / 2;
            
            ctx.save();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.arc(x, y, 30, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.font = 'bold 24px Arial';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(badgeEl.textContent || '', x, y);
            ctx.restore();
          }

          if (state.isRecording) {
            animationFrameRef.current = requestAnimationFrame(drawFrame);
          }
        };

        // Start recording
        setState((prev) => ({ ...prev, stage: 'جاري بدء التسجيل...' }));
        mediaRecorder.start(100);

        // Reset and play audio
        audioElement.currentTime = 0;
        audioElement.play().catch(console.error);

        // Start drawing
        drawFrame();

        // Progress tracking
        const startTime = Date.now();
        const progressInterval = setInterval(() => {
          const elapsed = (Date.now() - startTime) / 1000;
          const progress = Math.min((elapsed / duration) * 100, 100);
          
          let stage = 'جاري التسجيل...';
          if (progress < 25) stage = 'جاري تسجيل الخلفية...';
          else if (progress < 50) stage = 'جاري تسجيل الصوت...';
          else if (progress < 75) stage = 'جاري معالجة الآيات...';
          else stage = 'جاري إنهاء الفيديو...';

          setState((prev) => ({ ...prev, progress, stage }));

          if (elapsed >= duration) {
            clearInterval(progressInterval);
            mediaRecorder.stop();
            audioElement.pause();
          }
        }, 100);

      } catch (error) {
        console.error('Recording error:', error);
        setState({
          isRecording: false,
          progress: 0,
          videoBlob: null,
          error: error instanceof Error ? error.message : 'حدث خطأ في التسجيل',
          stage: '',
        });
        reject(error);
      }
    });
  }, [state.isRecording]);

  const downloadVideo = useCallback((filename: string = 'quran-reel.webm') => {
    if (!state.videoBlob) {
      console.error('No video to download');
      return;
    }

    const url = URL.createObjectURL(state.videoBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [state.videoBlob]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  const reset = useCallback(() => {
    stopRecording();
    setState({
      isRecording: false,
      progress: 0,
      videoBlob: null,
      error: null,
      stage: '',
    });
    chunksRef.current = [];
  }, [stopRecording]);

  return {
    ...state,
    startRecording,
    stopRecording,
    downloadVideo,
    reset,
  };
}
