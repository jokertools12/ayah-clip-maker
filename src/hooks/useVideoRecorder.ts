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
  const audioContextRef = useRef<AudioContext | null>(null);

  const startRecording = useCallback(async (
    canvas: HTMLCanvasElement,
    audioElement: HTMLAudioElement,
    duration: number = 30
  ): Promise<Blob | null> => {
    return new Promise(async (resolve, reject) => {
      try {
        setState({
          isRecording: true,
          progress: 0,
          videoBlob: null,
          error: null,
          stage: 'جاري تجهيز التسجيل...',
        });
        chunksRef.current = [];

        // Get canvas stream at 30fps
        const canvasStream = canvas.captureStream(30);

        // Create audio stream from audio element
        let combinedStream: MediaStream;
        try {
          // Close previous context if exists
          if (audioContextRef.current) {
            await audioContextRef.current.close();
          }
          
          const audioCtx = new AudioContext();
          audioContextRef.current = audioCtx;
          
          const source = audioCtx.createMediaElementSource(audioElement);
          const destination = audioCtx.createMediaStreamDestination();
          source.connect(destination);
          source.connect(audioCtx.destination); // Also play through speakers
          
          // Combine video and audio tracks
          const tracks = [
            ...canvasStream.getVideoTracks(),
            ...destination.stream.getAudioTracks()
          ];
          combinedStream = new MediaStream(tracks);
        } catch (audioError) {
          console.warn('Could not capture audio, recording video only:', audioError);
          combinedStream = canvasStream;
        }

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

        // Start recording
        setState((prev) => ({ ...prev, stage: 'جاري بدء التسجيل...' }));
        mediaRecorder.start(100);

        // Reset and play audio
        audioElement.currentTime = 0;
        await audioElement.play();

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
  }, []);

  const downloadVideo = useCallback((filename: string = 'quran-reel.mp4') => {
    if (!state.videoBlob) {
      console.error('No video to download');
      return;
    }

    // Note: Browser records as WebM but we name it .mp4 for compatibility
    // Most modern players can handle WebM with .mp4 extension
    const url = URL.createObjectURL(state.videoBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.replace('.webm', '.mp4');
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
