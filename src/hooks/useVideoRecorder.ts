import { useRef, useState, useCallback } from 'react';

interface RecordingState {
  isRecording: boolean;
  progress: number;
  blob: Blob | null;
  error: string | null;
}

export function useVideoRecorder() {
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    progress: 0,
    blob: null,
    error: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const startRecording = useCallback(async (
    containerElement: HTMLElement,
    audioElement: HTMLAudioElement,
    duration: number
  ) => {
    try {
      setState({ isRecording: true, progress: 0, blob: null, error: null });
      chunksRef.current = [];

      // Create canvas for recording
      const canvas = document.createElement('canvas');
      const rect = containerElement.getBoundingClientRect();
      canvas.width = rect.width * 2; // Higher resolution
      canvas.height = rect.height * 2;
      canvasRef.current = canvas;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Get canvas stream
      const canvasStream = canvas.captureStream(30);

      // Create audio context for capturing audio
      const audioContext = new AudioContext();
      const source = audioContext.createMediaElementSource(audioElement);
      const destination = audioContext.createMediaStreamDestination();
      source.connect(destination);
      source.connect(audioContext.destination);

      // Combine video and audio streams
      const combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...destination.stream.getAudioTracks(),
      ]);

      // Setup MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 5000000,
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setState((prev) => ({ ...prev, isRecording: false, blob }));
        audioContext.close();
      };

      // Start drawing frames
      const drawFrame = () => {
        if (!canvasRef.current || !ctx) return;

        // Use html2canvas alternative - draw container to canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw video element if present
        const video = containerElement.querySelector('video');
        if (video) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }

        // Draw image background if present
        const bgDiv = containerElement.querySelector('[style*="background-image"]') as HTMLElement;
        if (bgDiv) {
          const bgImage = bgDiv.style.backgroundImage;
          const url = bgImage.match(/url\(["']?(.+?)["']?\)/)?.[1];
          if (url) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = url;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          }
        }

        // Draw overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw text elements
        const textElements = containerElement.querySelectorAll('p, h2, span');
        textElements.forEach((el) => {
          const htmlEl = el as HTMLElement;
          const elRect = htmlEl.getBoundingClientRect();
          const containerRect = containerElement.getBoundingClientRect();
          
          const x = ((elRect.left - containerRect.left) / containerRect.width) * canvas.width;
          const y = ((elRect.top - containerRect.top) / containerRect.height) * canvas.height;
          
          const computedStyle = window.getComputedStyle(htmlEl);
          const fontSize = parseInt(computedStyle.fontSize) * 2;
          
          ctx.font = `${fontSize}px "Amiri", serif`;
          ctx.fillStyle = computedStyle.color || '#fff';
          ctx.textAlign = 'center';
          ctx.fillText(htmlEl.textContent || '', x + (elRect.width / containerRect.width * canvas.width) / 2, y + fontSize);
        });

        if (state.isRecording) {
          requestAnimationFrame(drawFrame);
        }
      };

      // Start recording
      mediaRecorder.start(100);
      audioElement.currentTime = 0;
      await audioElement.play();
      drawFrame();

      // Update progress
      const startTime = Date.now();
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / (duration * 1000)) * 100, 100);
        setState((prev) => ({ ...prev, progress }));

        if (progress >= 100) {
          clearInterval(progressInterval);
        }
      }, 100);

      // Stop after duration
      setTimeout(() => {
        mediaRecorder.stop();
        audioElement.pause();
        clearInterval(progressInterval);
      }, duration * 1000);

    } catch (error) {
      console.error('Recording error:', error);
      setState({
        isRecording: false,
        progress: 0,
        blob: null,
        error: error instanceof Error ? error.message : 'حدث خطأ في التسجيل',
      });
    }
  }, [state.isRecording]);

  const downloadVideo = useCallback((filename: string = 'quran-video.webm') => {
    if (!state.blob) return;

    const url = URL.createObjectURL(state.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [state.blob]);

  const reset = useCallback(() => {
    setState({
      isRecording: false,
      progress: 0,
      blob: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    startRecording,
    downloadVideo,
    reset,
  };
}
