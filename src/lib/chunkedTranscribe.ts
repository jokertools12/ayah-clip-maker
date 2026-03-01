/**
 * Client-side audio chunking for full transcription.
 * Splits audio into ~30s WAV segments, sends each to the edge function,
 * and merges results with correct timestamps.
 */

const CHUNK_DURATION_SEC = 30;

export interface TranscribedLine {
  text: string;
  start: number;
  end: number;
}

export interface ChunkedTranscriptionResult {
  text: string;
  lines: TranscribedLine[];
}

/**
 * Encode an AudioBuffer segment to a base64 WAV string.
 */
function audioBufferSegmentToBase64Wav(
  source: AudioBuffer,
  startSample: number,
  endSample: number
): string {
  const length = endSample - startSample;
  const numChannels = 1; // mono for smaller payload
  const sampleRate = source.sampleRate;
  const bitDepth = 16;

  // Extract and downmix to mono
  const mono = new Float32Array(length);
  const srcData = source.getChannelData(0);
  for (let i = 0; i < length; i++) {
    mono[i] = srcData[startSample + i];
  }
  if (source.numberOfChannels > 1) {
    const ch2 = source.getChannelData(1);
    for (let i = 0; i < length; i++) {
      mono[i] = (mono[i] + ch2[startSample + i]) / 2;
    }
  }

  // WAV encode
  const dataLength = length * (bitDepth / 8);
  const totalLength = 44 + dataLength;
  const buffer = new ArrayBuffer(totalLength);
  const view = new DataView(buffer);

  // RIFF header
  writeStr(view, 0, "RIFF");
  view.setUint32(4, totalLength - 8, true);
  writeStr(view, 8, "WAVE");
  writeStr(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
  view.setUint16(32, numChannels * (bitDepth / 8), true);
  view.setUint16(34, bitDepth, true);
  writeStr(view, 36, "data");
  view.setUint32(40, dataLength, true);

  let off = 44;
  for (let i = 0; i < mono.length; i++) {
    const s = Math.max(-1, Math.min(1, mono[i]));
    view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    off += 2;
  }

  // Convert to base64
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function writeStr(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

/**
 * Transcribe full audio by chunking it into ~30s segments.
 */
export async function transcribeFullAudio(
  audioUrl: string,
  onProgress?: (completed: number, total: number) => void
): Promise<ChunkedTranscriptionResult> {
  const projectUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

  // 1. Fetch and decode the full audio client-side
  const resp = await fetch(audioUrl);
  if (!resp.ok) throw new Error(`Failed to fetch audio: ${resp.status}`);
  const arrayBuffer = await resp.arrayBuffer();

  const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  const decoded = await ctx.decodeAudioData(arrayBuffer);
  const totalDuration = decoded.duration;
  const sampleRate = decoded.sampleRate;

  // 2. Calculate chunks
  const totalChunks = Math.ceil(totalDuration / CHUNK_DURATION_SEC);
  onProgress?.(0, totalChunks);

  // 3. Process each chunk sequentially
  const allLines: TranscribedLine[] = [];
  let fullText = "";

  for (let i = 0; i < totalChunks; i++) {
    const startSec = i * CHUNK_DURATION_SEC;
    const endSec = Math.min((i + 1) * CHUNK_DURATION_SEC, totalDuration);
    const startSample = Math.floor(startSec * sampleRate);
    const endSample = Math.min(Math.floor(endSec * sampleRate), decoded.length);

    const chunkBase64 = audioBufferSegmentToBase64Wav(decoded, startSample, endSample);

    const res = await fetch(`${projectUrl}/functions/v1/transcribe-audio`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: publishableKey,
        Authorization: `Bearer ${publishableKey}`,
      },
      body: JSON.stringify({
        audioBase64: chunkBase64,
        language: "ara",
        chunkOffset: startSec,
      }),
    });

    const payload = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(payload?.error || `Chunk ${i + 1} failed: HTTP ${res.status}`);
    }

    if (payload?.lines) {
      allLines.push(...payload.lines);
    }
    if (payload?.text) {
      fullText += (fullText ? " " : "") + payload.text;
    }

    onProgress?.(i + 1, totalChunks);
  }

  ctx.close().catch(() => {});

  return {
    text: fullText || allLines.map((l) => l.text).join(" "),
    lines: allLines,
  };
}
