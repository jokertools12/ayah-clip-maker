/**
 * Fetches multiple audio URLs, decodes them, and concatenates them
 * into a single seamless WAV blob with zero gaps between segments.
 *
 * Returns the blob URL and per-segment timestamps (in seconds).
 */

export interface ConcatResult {
  /** Object URL pointing to a WAV blob of the concatenated audio */
  blobUrl: string;
  /** Total duration in seconds */
  totalDuration: number;
  /** Per-segment start/end timestamps in seconds */
  timestamps: { from: number; to: number }[];
}

export async function concatenateAudioUrls(
  urls: string[],
  onProgress?: (loaded: number, total: number) => void
): Promise<ConcatResult> {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

  // 1. Fetch all files in parallel
  const buffers: ArrayBuffer[] = await Promise.all(
    urls.map(async (url, i) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch ${url}`);
      const buf = await res.arrayBuffer();
      onProgress?.(i + 1, urls.length);
      return buf;
    })
  );

  // 2. Decode all to AudioBuffer
  const decoded: AudioBuffer[] = await Promise.all(
    buffers.map((buf) => ctx.decodeAudioData(buf.slice(0))) // slice to avoid detached buffer issues
  );

  // 3. Calculate total length and per-segment timestamps
  const sampleRate = decoded[0]?.sampleRate ?? 44100;
  const numChannels = decoded[0]?.numberOfChannels ?? 1;
  let totalSamples = 0;
  const timestamps: { from: number; to: number }[] = [];

  for (const ab of decoded) {
    const fromSec = totalSamples / sampleRate;
    totalSamples += ab.length;
    const toSec = totalSamples / sampleRate;
    timestamps.push({ from: fromSec, to: toSec });
  }

  // 4. Concatenate into a single buffer
  const merged = ctx.createBuffer(numChannels, totalSamples, sampleRate);
  let offset = 0;
  for (const ab of decoded) {
    for (let ch = 0; ch < numChannels; ch++) {
      const srcData = ab.getChannelData(ch);
      merged.getChannelData(ch).set(srcData, offset);
    }
    offset += ab.length;
  }

  // 5. Encode to WAV
  const wavBlob = audioBufferToWav(merged);
  const blobUrl = URL.createObjectURL(wavBlob);

  ctx.close().catch(() => {});

  return {
    blobUrl,
    totalDuration: totalSamples / sampleRate,
    timestamps,
  };
}

// ── WAV encoder ─────────────────────────────────────────────────────────────

function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  // Interleave channels
  const length = buffer.length * numChannels;
  const interleaved = new Float32Array(length);

  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      interleaved[i * numChannels + ch] = buffer.getChannelData(ch)[i];
    }
  }

  // Write WAV
  const dataLength = length * (bitDepth / 8);
  const headerLength = 44;
  const totalLength = headerLength + dataLength;
  const arrayBuffer = new ArrayBuffer(totalLength);
  const view = new DataView(arrayBuffer);

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, totalLength - 8, true);
  writeString(view, 8, 'WAVE');

  // fmt chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // chunk size
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
  view.setUint16(32, numChannels * (bitDepth / 8), true);
  view.setUint16(34, bitDepth, true);

  // data chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  // Write samples
  let writeOffset = 44;
  for (let i = 0; i < interleaved.length; i++) {
    const s = Math.max(-1, Math.min(1, interleaved[i]));
    const val = s < 0 ? s * 0x8000 : s * 0x7fff;
    view.setInt16(writeOffset, val, true);
    writeOffset += 2;
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
