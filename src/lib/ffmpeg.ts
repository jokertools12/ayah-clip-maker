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
    // If one CDN is blocked, try another.
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

  // Try H.264 + AAC first; if not available in this build, fallback to MPEG-4 Part 2.
  try {
    await ffmpeg.exec([
      '-i',
      inName,
      '-c:v',
      'libx264',
      '-pix_fmt',
      'yuv420p',
      '-preset',
      'veryfast',
      '-crf',
      '23',
      '-c:a',
      'aac',
      '-b:a',
      '128k',
      outName,
    ]);
  } catch {
    await ffmpeg.exec(['-i', inName, '-c:v', 'mpeg4', '-q:v', '5', '-c:a', 'aac', '-b:a', '128k', outName]);
  }

  const data = (await ffmpeg.readFile(outName)) as unknown as Uint8Array;
  // Some typings expose SharedArrayBuffer-like buffers; copy into a fresh ArrayBuffer for Blob.
  const copy = new Uint8Array(data.byteLength);
  copy.set(data);

  // Cleanup (best-effort)
  try {
    await ffmpeg.deleteFile(inName);
    await ffmpeg.deleteFile(outName);
  } catch {
    // ignore
  }

  return new Blob([copy.buffer], { type: 'video/mp4' });
}
