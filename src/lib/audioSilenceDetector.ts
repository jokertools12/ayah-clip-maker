/**
 * Detects silence gaps in an audio file to split it into ayah segments.
 * Uses Web Audio API to analyze amplitude and find natural pauses.
 */

export interface AyahSegment {
  from: number; // seconds
  to: number;   // seconds
}

/**
 * Fetches audio from URL, decodes it, and detects silence gaps
 * to split into the expected number of ayah segments.
 */
export async function detectAyahSegments(
  audioUrl: string,
  expectedAyahCount: number,
  startAyah: number,
  totalAyahsInSurah: number,
): Promise<AyahSegment[]> {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

  try {
    const res = await fetch(audioUrl);
    if (!res.ok) throw new Error(`Failed to fetch audio: ${res.status}`);
    const arrayBuf = await res.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuf.slice(0));

    const sampleRate = audioBuffer.sampleRate;
    const channelData = audioBuffer.getChannelData(0);
    const totalDuration = audioBuffer.duration;

    // Step 1: Find all silence gaps in the audio
    const silences = findSilenceGaps(channelData, sampleRate, totalDuration);

    // Step 2: Estimate the rough region for our ayahs
    const roughFrom = ((startAyah - 1) / totalAyahsInSurah) * totalDuration;
    const roughTo = ((startAyah - 1 + expectedAyahCount) / totalAyahsInSurah) * totalDuration;

    // Expand search region by 15%
    const margin = (roughTo - roughFrom) * 0.15;
    const searchFrom = Math.max(0, roughFrom - margin);
    const searchTo = Math.min(totalDuration, roughTo + margin);

    // Step 3: Find silences in our region
    const regionSilences = silences.filter(
      s => s.mid >= searchFrom && s.mid <= searchTo
    );

    // Step 4: We need (expectedAyahCount - 1) split points
    const neededSplits = expectedAyahCount - 1;

    if (regionSilences.length >= neededSplits) {
      // Pick the best split points (longest silences, evenly distributed)
      const splits = pickBestSplits(regionSilences, neededSplits, searchFrom, searchTo);
      return buildSegments(splits, searchFrom, searchTo);
    }

    // Not enough silences found — fall back to proportional
    return proportionalSegments(searchFrom, searchTo, expectedAyahCount);
  } finally {
    ctx.close().catch(() => {});
  }
}

interface SilenceGap {
  start: number;
  end: number;
  mid: number;
  duration: number;
}

function findSilenceGaps(
  channelData: Float32Array,
  sampleRate: number,
  totalDuration: number,
): SilenceGap[] {
  const windowSize = Math.floor(sampleRate * 0.05); // 50ms windows
  const threshold = 0.015; // amplitude threshold for silence
  const minSilenceDuration = 0.15; // minimum 150ms gap to count as silence

  const gaps: SilenceGap[] = [];
  let silenceStart: number | null = null;

  for (let i = 0; i < channelData.length; i += windowSize) {
    const end = Math.min(i + windowSize, channelData.length);
    let maxAmp = 0;
    for (let j = i; j < end; j++) {
      const amp = Math.abs(channelData[j]);
      if (amp > maxAmp) maxAmp = amp;
    }

    const timeSec = i / sampleRate;

    if (maxAmp < threshold) {
      if (silenceStart === null) silenceStart = timeSec;
    } else {
      if (silenceStart !== null) {
        const silenceDur = timeSec - silenceStart;
        if (silenceDur >= minSilenceDuration) {
          gaps.push({
            start: silenceStart,
            end: timeSec,
            mid: silenceStart + silenceDur / 2,
            duration: silenceDur,
          });
        }
        silenceStart = null;
      }
    }
  }

  // Handle silence at end
  if (silenceStart !== null) {
    const silenceDur = totalDuration - silenceStart;
    if (silenceDur >= minSilenceDuration) {
      gaps.push({
        start: silenceStart,
        end: totalDuration,
        mid: silenceStart + silenceDur / 2,
        duration: silenceDur,
      });
    }
  }

  return gaps;
}

function pickBestSplits(
  silences: SilenceGap[],
  count: number,
  regionStart: number,
  regionEnd: number,
): number[] {
  if (count === 0) return [];

  // Sort by duration (longest first) then pick evenly spaced ones
  const sorted = [...silences].sort((a, b) => b.duration - a.duration);

  // Take top candidates (2x what we need)
  const candidates = sorted.slice(0, Math.min(count * 3, sorted.length));

  // Sort candidates by time
  candidates.sort((a, b) => a.mid - b.mid);

  if (candidates.length <= count) {
    return candidates.map(s => s.mid);
  }

  // Dynamic programming to pick `count` splits that are most evenly spaced
  const regionDur = regionEnd - regionStart;
  const idealGap = regionDur / (count + 1);

  // Greedy: pick the silence closest to each ideal split point
  const picks: number[] = [];
  const used = new Set<number>();

  for (let i = 0; i < count; i++) {
    const idealTime = regionStart + idealGap * (i + 1);
    let bestIdx = -1;
    let bestDist = Infinity;

    for (let j = 0; j < candidates.length; j++) {
      if (used.has(j)) continue;
      const dist = Math.abs(candidates[j].mid - idealTime);
      // Weight by silence duration (prefer longer silences)
      const score = dist - candidates[j].duration * 2;
      if (score < bestDist) {
        bestDist = score;
        bestIdx = j;
      }
    }

    if (bestIdx >= 0) {
      picks.push(candidates[bestIdx].mid);
      used.add(bestIdx);
    }
  }

  return picks.sort((a, b) => a - b);
}

function buildSegments(splits: number[], regionStart: number, regionEnd: number): AyahSegment[] {
  const segments: AyahSegment[] = [];
  let prev = regionStart;

  for (const split of splits) {
    segments.push({ from: prev, to: split });
    prev = split;
  }
  segments.push({ from: prev, to: regionEnd });

  return segments;
}

function proportionalSegments(from: number, to: number, count: number): AyahSegment[] {
  const dur = (to - from) / count;
  return Array.from({ length: count }, (_, i) => ({
    from: from + dur * i,
    to: from + dur * (i + 1),
  }));
}
