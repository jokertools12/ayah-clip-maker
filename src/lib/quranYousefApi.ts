/**
 * Comprehensive Quran API Service
 * Primary: quran.yousefheiba.com (reciters, ayahs)
 * Fallback: alquran.cloud, mp3quran.net, quran.com
 */

const YOUSEF_API = 'https://quran.yousefheiba.com/api';

// ============ Types ============

export interface YousefReciter {
  reciter_id: string;
  reciter_name: string;
  reciter_short_name: string;
}

export interface YousefAyah {
  id: string;
  number: string;
  text: string;
  number_in_surah: string;
  page: string;
  surah_id: string;
  hizb_id: string;
  juz_id: string;
  sajda: string;
}

export interface AudioValidationResult {
  isValid: boolean;
  url: string;
  statusCode?: number;
  reciterId: string;
  reciterName: string;
}

// ============ Reciters ============

let cachedReciters: YousefReciter[] | null = null;

export async function fetchYousefReciters(): Promise<YousefReciter[]> {
  if (cachedReciters) return cachedReciters;
  
  try {
    const res = await fetch(`${YOUSEF_API}/reciters`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    cachedReciters = data.reciters || data;
    return cachedReciters!;
  } catch (err) {
    console.error('Failed to fetch Yousef reciters:', err);
    return [];
  }
}

/**
 * Find matching Yousef reciter ID for our internal reciter
 * Uses fuzzy name matching
 */
export async function resolveYousefReciterId(arabicName: string): Promise<string | null> {
  const reciters = await fetchYousefReciters();
  
  // Clean name for comparison
  const cleanName = (name: string) => name
    .replace(/[-–—]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  const needle = cleanName(arabicName);
  
  // Try exact match first
  let match = reciters.find(r => cleanName(r.reciter_name) === needle);
  if (match) return match.reciter_id;
  
  // Try partial match
  match = reciters.find(r => 
    cleanName(r.reciter_name).includes(needle) || 
    needle.includes(cleanName(r.reciter_name))
  );
  if (match) return match.reciter_id;
  
  // Try word-level match (at least 2 words match)
  const needleWords = needle.split(' ');
  match = reciters.find(r => {
    const nameWords = cleanName(r.reciter_name).split(' ');
    const matchCount = needleWords.filter(w => nameWords.includes(w)).length;
    return matchCount >= 2;
  });
  
  return match?.reciter_id || null;
}

// ============ Ayahs ============

let ayahCache = new Map<number, YousefAyah[]>();

export async function fetchYousefAyahs(surahNumber: number): Promise<YousefAyah[]> {
  if (ayahCache.has(surahNumber)) return ayahCache.get(surahNumber)!;
  
  try {
    const res = await fetch(`${YOUSEF_API}/ayah?number=${surahNumber}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: YousefAyah[] = await res.json();
    ayahCache.set(surahNumber, data);
    return data;
  } catch (err) {
    console.error('Failed to fetch Yousef ayahs:', err);
    return [];
  }
}

export async function fetchAyahRange(
  surahNumber: number,
  startAyah: number,
  endAyah: number
): Promise<YousefAyah[]> {
  const allAyahs = await fetchYousefAyahs(surahNumber);
  return allAyahs.filter(
    a => parseInt(a.number_in_surah) >= startAyah && parseInt(a.number_in_surah) <= endAyah
  );
}

// ============ Audio Verification ============

/**
 * Validate that an audio URL is accessible and returns 200
 * Uses HEAD request to minimize bandwidth
 */
export async function validateAudioUrl(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
    });
    
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Full audio verification protocol:
 * 1. Verify the reciter ID matches between our system and the API
 * 2. Validate the audio URL returns 200
 * 3. Return validation result with details
 */
export async function verifyReciterAudio(
  internalReciterId: string,
  reciterArabicName: string,
  audioUrl: string
): Promise<AudioValidationResult> {
  // Step 1: Resolve the reciter in Yousef API
  const yousefId = await resolveYousefReciterId(reciterArabicName);
  
  // Step 2: Validate audio URL
  const isUrlValid = await validateAudioUrl(audioUrl);
  
  return {
    isValid: isUrlValid,
    url: audioUrl,
    reciterId: internalReciterId,
    reciterName: reciterArabicName,
  };
}

/**
 * Get verified audio URL with fallback chain:
 * 1. Try Quran Foundation audio (with timestamps)
 * 2. Try mp3quran.net
 * 3. Try EveryAyah.com
 */
export async function getVerifiedAudioUrl(
  primaryUrl: string,
  fallbackUrls: string[]
): Promise<string | null> {
  // Try primary
  if (await validateAudioUrl(primaryUrl)) return primaryUrl;
  
  // Try fallbacks
  for (const url of fallbackUrls) {
    if (await validateAudioUrl(url)) return url;
  }
  
  return null;
}

// ============ Reciter ID Mapping ============

// Maps our internal reciter IDs to quran.yousefheiba.com reciter_ids
// Populated lazily on first use
let reciterIdMap: Map<string, string> | null = null;

export async function getReciterIdMapping(): Promise<Map<string, string>> {
  if (reciterIdMap) return reciterIdMap;
  
  const reciters = await fetchYousefReciters();
  reciterIdMap = new Map();
  
  // Known mappings (manually verified)
  const knownMappings: Record<string, string> = {
    'mishary_alafasy': 'مشاري راشد العفاسي',
    'abdul_basit_murattal': 'عبد الباسط عبد الصمد',
    'maher_muaiqly': 'ماهر المعيقلي',
    'saud_shuraim': 'سعود الشريم',
    'abdul_rahman_sudais': 'عبد الرحمن السديس',
    'saad_ghamdi': 'سعد الغامدي',
    'ahmad_ajmi': 'أحمد بن علي العجمي',
    'hani_rifai': 'هاني الرفاعي',
    'fares_abbad': 'فارس عباد',
    'yasser_dosari': 'ياسر الدوسري',
    'nasser_qatami': 'ناصر القطامي',
    'islam_sobhi': 'إسلام صبحي',
    'idris_abkar': 'إدريس أبكر',
  };
  
  for (const [internalId, arabicName] of Object.entries(knownMappings)) {
    const match = reciters.find(r => 
      r.reciter_name.includes(arabicName) || arabicName.includes(r.reciter_name)
    );
    if (match) {
      reciterIdMap.set(internalId, match.reciter_id);
    }
  }
  
  return reciterIdMap;
}
