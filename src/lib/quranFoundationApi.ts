export type QuranFoundationRecitation = {
  id: number;
  reciter_name: string;
  style?: string | null;
  translated_name?: {
    name: string;
    language_name: string;
  };
};

export type QuranFoundationTimestamp = {
  verse_key: string; // e.g. "2:255"
  timestamp_from: number; // ms
  timestamp_to: number; // ms
  // segments: [word_index (1-based), start_ms, end_ms]
  segments?: [number, number, number][];
};

export type QuranFoundationChapterAudio = {
  audio_url: string;
  timestamps?: QuranFoundationTimestamp[];
};

const API_BASE = 'https://api.quran.com/api/v4';

function normalizeName(s: string) {
  return s
    .toLowerCase()
    .replace(/[\u2018\u2019`']/g, '')
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function fetchRecitations(language: string = 'en'): Promise<QuranFoundationRecitation[]> {
  const url = `${API_BASE}/resources/recitations?language=${encodeURIComponent(language)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('فشل في جلب قائمة القراء');
  const json = await res.json();
  return Array.isArray(json) ? json : json.recitations;
}

export function resolveRecitationIdByName(
  recitations: QuranFoundationRecitation[],
  englishName: string
): number | null {
  const needle = normalizeName(englishName);
  if (!needle) return null;

  // Prefer Murattal / null style when multiple exist.
  const scored = recitations
    .map((r) => {
      const name = normalizeName(r.reciter_name || r.translated_name?.name || '');
      const style = normalizeName(r.style || '');
      const nameHit = name.includes(needle) || needle.includes(name);
      const score = (nameHit ? 10 : 0) + (style.includes('murattal') ? 2 : 0) + (style ? 0 : 1);
      return { r, score, name };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored[0]?.r.id ?? null;
}

export async function fetchChapterRecitationAudio(
  recitationId: number,
  chapterNumber: number,
  segments: boolean = true
): Promise<QuranFoundationChapterAudio> {
  const url = `${API_BASE}/chapter_recitations/${recitationId}/${chapterNumber}?segments=${segments ? 'true' : 'false'}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('فشل في جلب ملف الصوت وتوقيتاته');
  const json = await res.json();
  const audioFile = json.audio_file ?? json;

  return {
    audio_url: audioFile.audio_url,
    timestamps: audioFile.timestamps,
  };
}

// Direct fetch using known recitation ID (more reliable)
export async function fetchChapterRecitationAudioById(
  recitationId: number,
  chapterNumber: number,
  segments: boolean = true
): Promise<QuranFoundationChapterAudio> {
  const url = `${API_BASE}/chapter_recitations/${recitationId}/${chapterNumber}?segments=${segments ? 'true' : 'false'}`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('فشل في جلب ملف الصوت');
    const json = await res.json();
    const audioFile = json.audio_file ?? json;

    return {
      audio_url: audioFile.audio_url,
      timestamps: audioFile.timestamps,
    };
  } catch (error) {
    console.error('Error fetching recitation:', error);
    throw error;
  }
}
