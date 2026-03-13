import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpegSingleton: FFmpeg | null = null;
let ffmpegLoading: Promise<FFmpeg> | null = null;

export async function getFFmpeg(onProgress?: (ratio: number) => void): Promise<FFmpeg> {
  if (ffmpegSingleton) return ffmpegSingleton;
  if (ffmpegLoading) return ffmpegLoading;

  ffmpegLoading = (async () => {
    const ffmpeg = new FFmpeg();
    if (onProgress) {
      ffmpeg.on('progress', ({ progress }) => onProgress(progress));
    }

    // Lazy-load core from CDN to avoid bundling massive WASM into the app.
    const coreBases = [
      'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd',
      'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd',
    ];

    let lastErr: unknown = null;
    for (const coreBase of coreBases) {
      try {
        await ffmpeg.load({
          coreURL: await toBlobURL(`${coreBase}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${coreBase}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        lastErr = null;
        break;
      } catch (e) {
        lastErr = e;
      }
    }

    if (lastErr) throw lastErr;

    ffmpegSingleton = ffmpeg;
    return ffmpeg;
  })();

  return ffmpegLoading;
}

/**
 * Normalize a background video to a standard format for smooth recording:
 * - CFR 30fps
 * - H.264 (libx264) with yuv420p
 * - Scale/crop to match target aspect ratio
 * - No audio (background videos are muted)
 */
export async function normalizeBackgroundVideo(
  input: Blob,
  aspectRatio: '9:16' | '16:9' = '9:16',
  opts?: {
    onProgress?: (ratio: number) => void;
    maxWidth?: number;
    maxHeight?: number;
  }
): Promise<Blob> {
  const ffmpeg = await getFFmpeg(opts?.onProgress);

  const inName = 'bg_input.mp4';
  const outName = 'bg_normalized.mp4';

  await ffmpeg.writeFile(inName, await fetchFile(input));

  // Target dimensions based on aspect ratio
  const targetW = aspectRatio === '9:16' ? (opts?.maxWidth ?? 720) : (opts?.maxWidth ?? 1280);
  const targetH = aspectRatio === '9:16' ? (opts?.maxHeight ?? 1280) : (opts?.maxHeight ?? 720);

  // Video filter: force 30fps CFR, scale to fit, then crop to exact dimensions
  const vf = [
    'fps=30',
    `scale=${targetW}:${targetH}:force_original_aspect_ratio=increase`,
    `crop=${targetW}:${targetH}`,
  ].join(',');

  try {
    await ffmpeg.exec([
      '-i', inName,
      '-vf', vf,
      '-r', '30',
      '-vsync', 'cfr',
      '-an', // no audio for background
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-preset', 'veryfast',
      '-crf', '28', // slightly lower quality is fine for background
      '-movflags', '+faststart',
      outName,
    ]);
  } catch {
    // Fallback: mpeg4 codec if libx264 unavailable
    try {
      await ffmpeg.exec([
        '-i', inName,
        '-vf', vf,
        '-r', '30',
        '-vsync', 'cfr',
        '-an',
        '-c:v', 'mpeg4',
        '-q:v', '6',
        '-pix_fmt', 'yuv420p',
        outName,
      ]);
    } catch (e2) {
      // Last resort: just re-encode with basic settings
      await ffmpeg.exec([
        '-i', inName,
        '-r', '30',
        '-an',
        outName,
      ]);
    }
  }

  const data = (await ffmpeg.readFile(outName)) as unknown as Uint8Array;
  const copy = new Uint8Array(data.byteLength);
  copy.set(data);

  // Cleanup
  try { await ffmpeg.deleteFile(inName); } catch {}
  try { await ffmpeg.deleteFile(outName); } catch {}

  return new Blob([copy.buffer], { type: 'video/mp4' });
}

export async function convertWebmToMp4(
  input: Blob,
  opts?: {
    onProgress?: (ratio: number) => void;
  }
): Promise<Blob> {
  const ffmpeg = await getFFmpeg(opts?.onProgress);

  const inName = 'input.webm';
  const outName = 'output.mp4';

  await ffmpeg.writeFile(inName, await fetchFile(input));

  // H.264 + AAC with CFR 30fps for maximum compatibility and smoothness
  try {
    await ffmpeg.exec([
      '-i', inName,
      '-r', '30',
      '-vsync', 'cfr',
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-preset', 'veryfast',
      '-crf', '23',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-movflags', '+faststart',
      outName,
    ]);
  } catch {
    // Fallback to mpeg4 codec
    try {
      await ffmpeg.exec([
        '-i', inName,
        '-r', '30',
        '-vsync', 'cfr',
        '-c:v', 'mpeg4',
        '-q:v', '5',
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac',
        '-b:a', '128k',
        outName,
      ]);
    } catch {
      // Last resort
      await ffmpeg.exec(['-i', inName, '-r', '30', '-c:a', 'aac', outName]);
    }
  }

  const data = (await ffmpeg.readFile(outName)) as unknown as Uint8Array;
  const copy = new Uint8Array(data.byteLength);
  copy.set(data);

  try { await ffmpeg.deleteFile(inName); } catch {}
  try { await ffmpeg.deleteFile(outName); } catch {}

  return new Blob([copy.buffer], { type: 'video/mp4' });
}
