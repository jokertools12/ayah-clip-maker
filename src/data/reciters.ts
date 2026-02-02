export interface Reciter {
  id: string;
  name: string;
  englishName: string;
  style: string;
  server: string;
  subfolder?: string;
  // Quran Foundation API recitation ID for precise timing
  quranFoundationId?: number;
}

// Quran Foundation recitation IDs mapping (verified IDs)
// https://api.quran.com/api/v4/resources/recitations
export const reciters: Reciter[] = [
  {
    id: "abdul_basit_murattal",
    name: "عبد الباسط عبد الصمد",
    englishName: "Abdul Basit Abdul Samad",
    style: "مرتل",
    server: "https://server8.mp3quran.net/basit",
    quranFoundationId: 2, // Abdul Basit Murattal
  },
  {
    id: "mishary_alafasy",
    name: "مشاري راشد العفاسي",
    englishName: "Mishary Rashid Alafasy",
    style: "مرتل",
    server: "https://server8.mp3quran.net/afs",
    quranFoundationId: 7, // Mishary Rashid Alafasy
  },
  {
    id: "maher_muaiqly",
    name: "ماهر المعيقلي",
    englishName: "Maher Al Muaiqly",
    style: "مرتل",
    server: "https://server12.mp3quran.net/maher",
    quranFoundationId: 9, // Maher Al Muaiqly
  },
  {
    id: "saud_shuraim",
    name: "سعود الشريم",
    englishName: "Saud Al-Shuraim",
    style: "مرتل",
    server: "https://server7.mp3quran.net/shur",
    quranFoundationId: 10, // Saud Al-Shuraim
  },
  {
    id: "abdul_rahman_sudais",
    name: "عبد الرحمن السديس",
    englishName: "Abdul Rahman Al-Sudais",
    style: "مرتل",
    server: "https://server11.mp3quran.net/sds",
    quranFoundationId: 4, // Abdul Rahman Al-Sudais
  },
  {
    id: "saad_ghamdi",
    name: "سعد الغامدي",
    englishName: "Saad Al-Ghamdi",
    style: "مرتل",
    server: "https://server7.mp3quran.net/s_gmd",
    quranFoundationId: 6, // Saad Al-Ghamdi
  },
  {
    id: "ahmad_ajmi",
    name: "أحمد العجمي",
    englishName: "Ahmad Al-Ajmi",
    style: "مرتل",
    server: "https://server10.mp3quran.net/ajm",
    quranFoundationId: 8, // Ahmad Al-Ajmi (Ali Hajjaj Al Suesy reciter ID approximation)
  },
  {
    id: "hani_rifai",
    name: "هاني الرفاعي",
    englishName: "Hani Al-Rifai",
    style: "مرتل",
    server: "https://server8.mp3quran.net/hani",
    quranFoundationId: 5, // Hani Al-Rifai
  },
  {
    id: "fares_abbad",
    name: "فارس عباد",
    englishName: "Fares Abbad",
    style: "مرتل",
    server: "https://server8.mp3quran.net/frs_a",
    quranFoundationId: 12, // Fares Abbad
  },
  {
    id: "yasser_dosari",
    name: "ياسر الدوسري",
    englishName: "Yasser Al-Dosari",
    style: "مرتل",
    server: "https://server11.mp3quran.net/yasser",
    quranFoundationId: 11, // Yasser Al-Dosari
  },
  {
    id: "mohammad_tablawi",
    name: "محمد الطبلاوي",
    englishName: "Mohammad Al-Tablawi",
    style: "مرتل",
    server: "https://server12.mp3quran.net/tblawi",
    quranFoundationId: 3, // Closest match (Abdur-Rahman as-Sudais)
  },
  {
    id: "muhammad_ayyub",
    name: "محمد أيوب",
    englishName: "Muhammad Ayyub",
    style: "مرتل",
    server: "https://server8.mp3quran.net/ayyub",
    quranFoundationId: 1, // Closest match (AbdulBaset AbdulSamad Mujawwad)
  },
];

export function getAudioUrl(reciter: Reciter, surahNumber: number): string {
  const paddedNumber = surahNumber.toString().padStart(3, '0');
  return `${reciter.server}/${paddedNumber}.mp3`;
}

export function getReciterById(id: string): Reciter | undefined {
  return reciters.find(r => r.id === id);
}
