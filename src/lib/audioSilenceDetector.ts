/**
 * Smart ayah clipping for full-surah audio sources.
 *
 * For reciters that only provide full-surah MP3 files, we:
 * 1) Decode the full audio
 * 2) Detect natural silence gaps
 * 3) Estimate verse boundaries using full-surah text weights
 * 4) Snap estimated boundaries to nearby silence gaps
 * 5) Extract only the requested ayah range into a new WAV blob
 *
 * This produces exact clipped playback (not full-file range playback), plus
 * relative per-ayah timestamps inside the clipped audio.
 */

export interface AyahSegment {
  from: number;
  to: number;
}

export interface SmartAyahClipResult {
  blobUrl: string;
  totalDuration: number;
  timestamps: AyahSegment[];
  sourceRange: AyahSegment;
}

interface SilenceGap {
  start: number;
  end: number;
  mid: number;
  duration: number;
}

export async function createSmartAyahClipFromFullSurah(
  audioUrl: string,
  startAyah: number,
  endAyah: number,
  fullSurahTexts: string[],
): Promise<SmartAyahClipResult> {
  if (!fullSurahTexts.length) {
    throw new Error('Full surah texts are required for smart clipping');
  }

  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

  try {
    const res = await fetch(audioUrl);
    if (!res.ok) throw new Error(`Failed to fetch audio: ${res.status}`);

    const arrayBuf = await res.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuf.slice(0));
    const totalDuration = audioBuffer.duration;
    const sampleRate = audioBuffer.sampleRate;
    const channelData = audioBuffer.getChannelData(0);

    const silences = findSilenceGaps(channelData, sampleRate, totalDuration);
    const estimatedBoundaries = buildEstimatedBoundaries(fullSurahTexts, totalDuration);

    const selectedBoundaries = pickSelectionBoundaries({
      estimatedBoundaries,
      silences,
      startAyah,
      endAyah,
      totalAyahs: fullSurahTexts.length,
      totalDuration,
    });

    const absoluteSegments = buildSegmentsFromBoundaries(selectedBoundaries);
    if (!absoluteSegments.length) {
      throw new Error('Could not determine ayah segments');
    }

    const clipStart = absoluteSegments[0].from;
    const clipEnd = absoluteSegments[absoluteSegments.length - 1].to;
    const clipped = sliceAudioBuffer(audioBuffer, clipStart, clipEnd, ctx);

    const timestamps = absoluteSegments.map((segment) => ({
      from: Math.max(0, segment.from - clipStart),
      to: Math.max(0, segment.to - clipStart),
    }));

    const blobUrl = URL.createObjectURL(audioBufferToWav(clipped));

    return {
      blobUrl,
      totalDuration: clipped.duration,
      timestamps,
      sourceRange: { from: clipStart, to: clipEnd },
    };
  } finally {
    ctx.close().catch(() => {});
  }
}

export async function detectAyahSegments(
  audioUrl: string,
  expectedAyahCount: number,
  startAyah: number,
  totalAyahsInSurah: number,
): Promise<AyahSegment[]> {
  const syntheticTexts = Array.from({ length: Math.max(totalAyahsInSurah, startAyah + expectedAyahCount - 1) }, () => 'آية');
  const result = await createSmartAyahClipFromFullSurah(
    audioUrl,
    startAyah,
    startAyah + expectedAyahCount - 1,
    syntheticTexts,
  );
  return result.timestamps;
}

function normalizeArabicText(text: string): string {
  return text
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    .replace(/[﴿﴾۞۩]/g, ' ')
    .replace(/[^\u0600-\u06FF\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getAyahWeight(text: string): number {
  const normalized = normalizeArabicText(text);
  if (!normalized) return 1;

  const words = normalized.split(/\s+/).filter(Boolean).length;
  const letters = normalized.replace(/\s+/g, '').length;

  return Math.max(1, letters + words * 2);
}

function buildEstimatedBoundaries(fullSurahTexts: string[], totalDuration: number): number[] {
  const weights = fullSurahTexts.map(getAyahWeight);
  const totalWeight = Math.max(1, weights.reduce((sum, value) => sum + value, 0));
  const prefix: number[] = [0];

  for (const weight of weights) {
    prefix.push(prefix[prefix.length - 1] + weight);
  }

  return prefix.map((value) => (value / totalWeight) * totalDuration);
}

function findSilenceGaps(
  channelData: Float32Array,
  sampleRate: number,
  totalDuration: number,
): SilenceGap[] {
  const windowSize = Math.max(1, Math.floor(sampleRate * 0.04));
  const envelope: number[] = [];

  for (let i = 0; i < channelData.length; i += windowSize) {
    const end = Math.min(i + windowSize, channelData.length);
    let sum = 0;
    let peak = 0;

    for (let j = i; j < end; j++) {
      const value = Math.abs(channelData[j]);
      sum += value * value;
      if (value > peak) peak = value;
    }

    const rms = Math.sqrt(sum / Math.max(1, end - i));
    envelope.push(Math.max(rms, peak * 0.8));
  }

  const sortedEnvelope = [...envelope].sort((a, b) => a - b);
  const q20 = sortedEnvelope[Math.floor(sortedEnvelope.length * 0.2)] ?? 0.006;
  const threshold = Math.max(0.004, Math.min(0.028, q20 * 1.8));
  const minSilenceDuration = 0.12;

  const gaps: SilenceGap[] = [];
  let silenceStartWindow = -1;

  for (let index = 0; index < envelope.length; index++) {
    const level = envelope[index];
    const timeSec = (index * windowSize) / sampleRate;

    if (level <= threshold) {
      if (silenceStartWindow < 0) silenceStartWindow = index;
      continue;
    }

    if (silenceStartWindow >= 0) {
      const start = (silenceStartWindow * windowSize) / sampleRate;
      const end = timeSec;
      const duration = end - start;
      if (duration >= minSilenceDuration) {
        gaps.push({
          start,
          end,
          mid: start + duration / 2,
          duration,
        });
      }
      silenceStartWindow = -1;
    }
  }

  if (silenceStartWindow >= 0) {
    const start = (silenceStartWindow * windowSize) / sampleRate;
    const end = totalDuration;
    const duration = end - start;
    if (duration >= minSilenceDuration) {
      gaps.push({
        start,
        end,
        mid: start + duration / 2,
        duration,
      });
    }
  }

  return gaps;
}

function pickSelectionBoundaries({
  estimatedBoundaries,
  silences,
  startAyah,
  endAyah,
  totalAyahs,
  totalDuration,
}: {
  estimatedBoundaries: number[];
  silences: SilenceGap[];
  startAyah: number;
  endAyah: number;
  totalAyahs: number;
  totalDuration: number;
}): number[] {
  const boundaries: number[] = [];
  const startBoundaryIndex = Math.max(0, startAyah - 1);
  const endBoundaryIndex = Math.min(totalAyahs, endAyah);

  for (let boundaryIndex = startBoundaryIndex; boundaryIndex <= endBoundaryIndex; boundaryIndex++) {
    if (boundaryIndex === 0) {
      boundaries.push(0);
      continue;
    }

    if (boundaryIndex === totalAyahs) {
      boundaries.push(totalDuration);
      continue;
    }

    const target = estimatedBoundaries[boundaryIndex] ?? 0;
    const previousEstimated = estimatedBoundaries[Math.max(0, boundaryIndex - 1)] ?? 0;
    const nextEstimated = estimatedBoundaries[Math.min(totalAyahs, boundaryIndex + 1)] ?? totalDuration;
    const previousChosen = boundaries[boundaries.length - 1] ?? 0;

    const localSpan = Math.max(0.35, nextEstimated - previousEstimated);
    const searchWindow = Math.min(12, Math.max(0.75, localSpan * 0.9));

    const candidates = silences
      .filter((silence) => silence.mid > previousChosen + 0.04)
      .map((silence) => ({
        ...silence,
        score:
          Math.abs(silence.mid - target) -
          Math.min(silence.duration, 0.5) * 0.65 -
          (silence.mid >= target - searchWindow && silence.mid <= target + searchWindow ? 0.2 : 0),
      }))
      .sort((a, b) => a.score - b.score);

    const chosen = candidates[0]?.mid;
    const fallback = Math.max(previousChosen + 0.05, Math.min(target, totalDuration));
    boundaries.push(chosen ?? fallback);
  }

  return enforceIncreasingBoundaries(boundaries, totalDuration);
}

function enforceIncreasingBoundaries(boundaries: number[], totalDuration: number): number[] {
  const fixed = [...boundaries];

  for (let i = 1; i < fixed.length; i++) {
    fixed[i] = Math.max(fixed[i], fixed[i - 1] + 0.05);
  }

  fixed[fixed.length - 1] = Math.min(totalDuration, fixed[fixed.length - 1]);

  for (let i = fixed.length - 2; i >= 0; i--) {
    fixed[i] = Math.min(fixed[i], fixed[i + 1] - 0.05);
  }

  fixed[0] = Math.max(0, fixed[0]);
  fixed[fixed.length - 1] = Math.min(totalDuration, fixed[fixed.length - 1]);

  return fixed;
}

function buildSegmentsFromBoundaries(boundaries: number[]): AyahSegment[] {
  const segments: AyahSegment[] = [];

  for (let i = 0; i < boundaries.length - 1; i++) {
    segments.push({
      from: boundaries[i],
      to: boundaries[i + 1],
    });
  }

  return segments;
}

function sliceAudioBuffer(
  source: AudioBuffer,
  startSec: number,
  endSec: number,
  ctx: AudioContext,
): AudioBuffer {
  const sampleRate = source.sampleRate;
  const numChannels = source.numberOfChannels;
  const startSample = Math.max(0, Math.floor(startSec * sampleRate));
  const endSample = Math.min(source.length, Math.ceil(endSec * sampleRate));
  const clippedLength = Math.max(1, endSample - startSample);
  const clipped = ctx.createBuffer(numChannels, clippedLength, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const src = source.getChannelData(channel).subarray(startSample, endSample);
    clipped.getChannelData(channel).set(src, 0);
  }

  return clipped;
}

function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1;
  const bitDepth = 16;

  const length = buffer.length * numChannels;
  const interleaved = new Float32Array(length);

  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      interleaved[i * numChannels + channel] = buffer.getChannelData(channel)[i];
    }
  }

  const dataLength = length * (bitDepth / 8);
  const headerLength = 44;
  const totalLength = headerLength + dataLength;
  const arrayBuffer = new ArrayBuffer(totalLength);
  const view = new DataView(arrayBuffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, totalLength - 8, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
  view.setUint16(32, numChannels * (bitDepth / 8), true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  let writeOffset = 44;
  for (let i = 0; i < interleaved.length; i++) {
    const sample = Math.max(-1, Math.min(1, interleaved[i]));
    const value = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    view.setInt16(writeOffset, value, true);
    writeOffset += 2;
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, text: string) {
  for (let i = 0; i < text.length; i++) {
    view.setUint8(offset + i, text.charCodeAt(i));
  }
}
