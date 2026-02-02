import { useRef, useState, useCallback } from 'react';
import { convertWebmToMp4 } from '@/lib/ffmpeg';

export interface VideoRecorderState {
  isRecording: boolean;
  progress: number;
  videoBlob: Blob | null;
  mp4Blob: Blob | null;
  isConverting: boolean;
  convertProgress: number;
  error: string | null;
  stage: string;
}

export function useVideoRecorder() {
  const [state, setState] = useState<VideoRecorderState>({
    isRecording: false,
    progress: 0,
    videoBlob: null,
    mp4Blob: null,
    isConverting: false,
    convertProgress: 0,
    error: null,
    stage: '',
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  const startRecording = useCallback(async (
    canvas: HTMLCanvasElement,
    audioElement: HTMLAudioElement,
    duration: number = 30,
    audioStream?: MediaStream | null
  ): Promise<Blob | null> => {
    return new Promise(async (resolve, reject) => {
      try {
        setState({
          isRecording: true,
          progress: 0,
          videoBlob: null,
          mp4Blob: null,
          isConverting: false,
          convertProgress: 0,
          error: null,
          stage: 'جاري تجهيز التسجيل...',
        });
        chunksRef.current = [];

        // Get canvas stream at 30fps
        const canvasStream = canvas.captureStream(30);

        // Combine video + audio tracks.
        // IMPORTANT: We should not call createMediaElementSource here because the audio element
        // is already connected to a WebAudio graph for effects (calling it twice throws).
        const tracks = [...canvasStream.getVideoTracks()];
        if (audioStream && audioStream.getAudioTracks().length) {
          tracks.push(...audioStream.getAudioTracks());
        } else {
          // Fallback: try capturing audio directly from the <audio> element if supported.
          const anyAudio = audioElement as unknown as { captureStream?: () => MediaStream; mozCaptureStream?: () => MediaStream };
          const elStream = anyAudio.captureStream?.() ?? anyAudio.mozCaptureStream?.();
          if (elStream?.getAudioTracks().length) {
            tracks.push(...elStream.getAudioTracks());
          }
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
            mp4Blob: null,
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
        // Caller should set audioElement.currentTime to the desired start.
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
          mp4Blob: null,
          isConverting: false,
          convertProgress: 0,
          error: error instanceof Error ? error.message : 'حدث خطأ في التسجيل',
          stage: '',
        });
        reject(error);
      }
    });
  }, []);

  const downloadWebm = useCallback((filename: string = 'quran-reel.webm') => {
    if (!state.videoBlob) return;
    const url = URL.createObjectURL(state.videoBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.webm') ? filename : `${filename}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [state.videoBlob]);

  const convertToMp4 = useCallback(async (): Promise<Blob | null> => {
    if (!state.videoBlob) return null;

    try {
      setState((prev) => ({
        ...prev,
        isConverting: true,
        convertProgress: 0,
        stage: 'جاري تحويل الفيديو إلى MP4...',
        error: null,
      }));

      const mp4 = await convertWebmToMp4(state.videoBlob, {
        onProgress: (ratio) => {
          setState((prev) => ({
            ...prev,
            convertProgress: Math.round(Math.min(Math.max(ratio, 0), 1) * 100),
          }));
        },
      });

      setState((prev) => ({
        ...prev,
        isConverting: false,
        mp4Blob: mp4,
        stage: 'جاهز للتحميل بصيغة MP4',
      }));

      return mp4;
    } catch (e) {
      console.error('MP4 conversion failed:', e);
      setState((prev) => ({
        ...prev,
        isConverting: false,
        error: 'تعذر تحويل الفيديو إلى MP4 على هذا الجهاز/المتصفح',
        stage: 'يمكنك تنزيل WebM كبديل',
      }));
      return null;
    }
  }, [state.videoBlob]);

  const downloadMp4 = useCallback(async (filename: string = 'quran-reel.mp4') => {
    let blob = state.mp4Blob;
    if (!blob) {
      blob = await convertToMp4();
    }

    if (!blob) {
      // fallback
      downloadWebm(filename.replace(/\.mp4$/i, '.webm'));
      return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.mp4') ? filename : `${filename}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [state.mp4Blob, convertToMp4, downloadWebm]);

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
      mp4Blob: null,
      isConverting: false,
      convertProgress: 0,
      error: null,
      stage: '',
    });
    chunksRef.current = [];
  }, [stopRecording]);

  return {
    ...state,
    startRecording,
    stopRecording,
    downloadMp4,
    downloadWebm,
    convertToMp4,
    reset,
  };
}
