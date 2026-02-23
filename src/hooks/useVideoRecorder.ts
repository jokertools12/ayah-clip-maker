import { useRef, useState, useCallback } from 'react';
import { convertWebmToMp4 } from '@/lib/ffmpeg';
import fixWebmDuration from 'fix-webm-duration';

export type ExportQuality = 'low' | 'medium' | 'high' | 'ultra';

export interface QualitySettings {
  label: string;
  resolution: string;
  bitrate: number;
}

export const QUALITY_PRESETS: Record<ExportQuality, QualitySettings> = {
  low: { label: '480p - سريع', resolution: '854x480', bitrate: 2000000 },
  medium: { label: '720p HD', resolution: '1280x720', bitrate: 5000000 },
  high: { label: '1080p Full HD', resolution: '1920x1080', bitrate: 8000000 },
  ultra: { label: '4K Ultra HD', resolution: '3840x2160', bitrate: 15000000 },
};

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

  // Used to coordinate async conversion across callbacks without stale closures.
  const conversionInProgressRef = useRef<boolean>(false);
  const mp4BlobRef = useRef<Blob | null>(null);

  const startRecording = useCallback(async (
    canvas: HTMLCanvasElement,
    audioElement: HTMLAudioElement | null,
    duration: number = 30,
    audioStream?: MediaStream | null,
    quality: ExportQuality = 'high'
  ): Promise<Blob | null> => {
    return new Promise(async (resolve, reject) => {
      try {
        const qualitySettings = QUALITY_PRESETS[quality];
        
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
      conversionInProgressRef.current = false;

        // Capture at 24fps — matches typical cinematic framerate and reduces CPU load
        const canvasStream = canvas.captureStream(24);

        // Combine video + audio tracks.
        const tracks = [...canvasStream.getVideoTracks()];
        if (audioStream && audioStream.getAudioTracks().length) {
          tracks.push(...audioStream.getAudioTracks());
        } else if (audioElement) {
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
          videoBitsPerSecond: qualitySettings.bitrate,
        });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };

        // Track recording start time for duration fix
        const startTime = Date.now();

        mediaRecorder.onstop = async () => {
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
          }

          const rawBlob = new Blob(chunksRef.current, { type: mimeType });
          
          // Fix WebM duration metadata so platforms (Instagram, TikTok) don't show 0 seconds
          const elapsed = Date.now() - startTime;
          let blob: Blob;
          try {
            blob = await fixWebmDuration(rawBlob, elapsed, { logger: false });
          } catch {
            blob = rawBlob; // fallback to unfixed blob
          }

          setState((prev) => ({
            ...prev,
            isRecording: false,
            progress: 100,
            videoBlob: blob,
            mp4Blob: null,
            isConverting: false,
            convertProgress: 0,
            error: null,
            stage: 'جاهز للتحميل!',
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

        // Start recording — use larger timeslice to reduce overhead
        setState((prev) => ({ ...prev, stage: 'جاري بدء التسجيل...' }));
        mediaRecorder.start(500);

        // Reset and play audio (if available)
        if (audioElement) {
          await audioElement.play();
        }

        // Progress tracking
        
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
            if (audioElement) audioElement.pause();
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

  const convertToMp4 = useCallback(async (): Promise<Blob | null> => {
    // If we already have MP4, return it (use ref to avoid stale closures).
    if (mp4BlobRef.current) return mp4BlobRef.current;
    if (state.mp4Blob) return state.mp4Blob;
    if (!state.videoBlob) return null;

    if (conversionInProgressRef.current) {
      // Wait for existing conversion
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!conversionInProgressRef.current) {
            clearInterval(checkInterval);
            resolve(mp4BlobRef.current);
          }
        }, 300);
      });
    }

    try {
      conversionInProgressRef.current = true;
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

      conversionInProgressRef.current = false;
      mp4BlobRef.current = mp4;
      setState((prev) => ({
        ...prev,
        isConverting: false,
        mp4Blob: mp4,
        error: null,
        stage: 'جاهز للتحميل بصيغة MP4',
      }));

      return mp4;
    } catch (e) {
      console.error('MP4 conversion failed:', e);
      conversionInProgressRef.current = false;
      setState((prev) => ({
        ...prev,
        isConverting: false,
        error: 'فشل التحويل إلى MP4',
        stage: 'فشل التحويل',
      }));
      return null;
    }
  }, [state.videoBlob, state.mp4Blob]);

  const downloadMp4 = useCallback(
    async (filename: string = 'quran-reel.mp4') => {
      // IMPORTANT: programmatic downloads can be blocked if they happen after an awaited async task.
      // So we only download when MP4 is already ready.
      const blob = mp4BlobRef.current ?? state.mp4Blob;

      if (!blob) {
        setState((prev) => ({
          ...prev,
          error: prev.isConverting || conversionInProgressRef.current ? null : 'ملف MP4 غير جاهز بعد',
          stage:
            prev.isConverting || conversionInProgressRef.current
              ? 'جاري التحويل إلى MP4...'
              : 'MP4 غير متوفر بعد',
        }));
        return;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const finalName = filename.endsWith('.mp4') ? filename : `${filename.replace(/\.[^/.]+$/, '')}.mp4`;
      a.download = finalName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Some browsers may cancel the download if we revoke immediately.
      window.setTimeout(() => URL.revokeObjectURL(url), 1500);

      setState((prev) => ({
        ...prev,
        stage: 'تم بدء التحميل!',
        error: null,
      }));
    },
    [state.mp4Blob]
  );

  const downloadWebm = useCallback(
    (filename: string = 'quran-reel.webm') => {
      const blob = state.videoBlob;

      if (!blob) {
        setState((prev) => ({
          ...prev,
          error: 'لا يوجد فيديو WebM للتحميل',
        }));
        return;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const finalName = filename.endsWith('.webm') ? filename : `${filename.replace(/\.[^/.]+$/, '')}.webm`;
      a.download = finalName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      window.setTimeout(() => URL.revokeObjectURL(url), 1500);

      setState((prev) => ({
        ...prev,
        stage: 'تم تحميل WebM!',
        error: null,
      }));
    },
    [state.videoBlob]
  );

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
    conversionInProgressRef.current = false;
    mp4BlobRef.current = null;
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
