export interface Reciter {
  id: string;
  name: string;
  englishName: string;
  style: 'مرتل' | 'مجود' | 'ترتيل';
  server: string;
  subfolder?: string;
  // Quran Foundation API recitation ID for precise timing
  quranFoundationId?: number;
}

// Quran Foundation recitation IDs mapping (verified IDs)
// https://api.quran.com/api/v4/resources/recitations
export const reciters: Reciter[] = [
  // مرتل - Murattal Style
  {
    id: "abdul_basit_murattal",
    name: "عبد الباسط عبد الصمد",
    englishName: "Abdul Basit Abdul Samad",
    style: "مرتل",
    server: "https://server8.mp3quran.net/basit",
    quranFoundationId: 2,
  },
  {
    id: "mishary_alafasy",
    name: "مشاري راشد العفاسي",
    englishName: "Mishary Rashid Alafasy",
    style: "مرتل",
    server: "https://server8.mp3quran.net/afs",
    quranFoundationId: 7,
  },
  {
    id: "maher_muaiqly",
    name: "ماهر المعيقلي",
    englishName: "Maher Al Muaiqly",
    style: "مرتل",
    server: "https://server12.mp3quran.net/maher",
    quranFoundationId: 9,
  },
  {
    id: "saud_shuraim",
    name: "سعود الشريم",
    englishName: "Saud Al-Shuraim",
    style: "مرتل",
    server: "https://server7.mp3quran.net/shur",
    quranFoundationId: 10,
  },
  {
    id: "abdul_rahman_sudais",
    name: "عبد الرحمن السديس",
    englishName: "Abdul Rahman Al-Sudais",
    style: "مرتل",
    server: "https://server11.mp3quran.net/sds",
    quranFoundationId: 4,
  },
  {
    id: "saad_ghamdi",
    name: "سعد الغامدي",
    englishName: "Saad Al-Ghamdi",
    style: "مرتل",
    server: "https://server7.mp3quran.net/s_gmd",
    quranFoundationId: 6,
  },
  {
    id: "ahmad_ajmi",
    name: "أحمد العجمي",
    englishName: "Ahmad Al-Ajmi",
    style: "مرتل",
    server: "https://server10.mp3quran.net/ajm",
    quranFoundationId: 8,
  },
  {
    id: "hani_rifai",
    name: "هاني الرفاعي",
    englishName: "Hani Al-Rifai",
    style: "مرتل",
    server: "https://server8.mp3quran.net/hani",
    quranFoundationId: 5,
  },
  {
    id: "fares_abbad",
    name: "فارس عباد",
    englishName: "Fares Abbad",
    style: "مرتل",
    server: "https://server8.mp3quran.net/frs_a",
    quranFoundationId: 12,
  },
  {
    id: "yasser_dosari",
    name: "ياسر الدوسري",
    englishName: "Yasser Al-Dosari",
    style: "مرتل",
    server: "https://server11.mp3quran.net/yasser",
    quranFoundationId: 11,
  },
  
  // مجود - Mujawwad Style (Tajweed)
  {
    id: "abdul_basit_mujawwad",
    name: "عبد الباسط عبد الصمد - مجود",
    englishName: "Abdul Basit - Mujawwad",
    style: "مجود",
    server: "https://server7.mp3quran.net/basit",
    quranFoundationId: 1,
  },
  {
    id: "mahmoud_husary_mujawwad",
    name: "محمود خليل الحصري - مجود",
    englishName: "Mahmoud Khalil Al-Husary - Mujawwad",
    style: "مجود",
    server: "https://server13.mp3quran.net/husr",
    quranFoundationId: 3,
  },
  {
    id: "mohammad_tablawi",
    name: "محمد الطبلاوي",
    englishName: "Mohammad Al-Tablawi",
    style: "مجود",
    server: "https://server12.mp3quran.net/tblawi",
    quranFoundationId: 3,
  },
  
  // ترتيل - Tarteel Style
  {
    id: "mahmoud_husary_tarteel",
    name: "محمود خليل الحصري - ترتيل",
    englishName: "Mahmoud Khalil Al-Husary - Tarteel",
    style: "ترتيل",
    server: "https://server13.mp3quran.net/husr",
    quranFoundationId: 3,
  },
  {
    id: "muhammad_ayyub",
    name: "محمد أيوب",
    englishName: "Muhammad Ayyub",
    style: "ترتيل",
    server: "https://server8.mp3quran.net/ayyub",
    quranFoundationId: 1,
  },
  {
    id: "ibrahim_akhdar",
    name: "إبراهيم الأخضر",
    englishName: "Ibrahim Al-Akhdar",
    style: "ترتيل",
    server: "https://server8.mp3quran.net/a_hzfy",
    quranFoundationId: 7,
  },
  {
    id: "nasser_qatami",
    name: "ناصر القطامي",
    englishName: "Nasser Al-Qatami",
    style: "مرتل",
    server: "https://server6.mp3quran.net/qtm",
    quranFoundationId: 7,
  },
  {
    id: "abdulmohsen_qasim",
    name: "عبد المحسن القاسم",
    englishName: "Abdul Mohsen Al-Qasim",
    style: "ترتيل",
    server: "https://server6.mp3quran.net/qasm",
    quranFoundationId: 7,
  },
  {
    id: "bandar_baleela",
    name: "بندر بليلة",
    englishName: "Bandar Baleela",
    style: "مرتل",
    server: "https://server8.mp3quran.net/balilah",
    quranFoundationId: 7,
  },
  {
    id: "abdullah_matrood",
    name: "عبد الله المطرود",
    englishName: "Abdullah Al-Matrood",
    style: "مرتل",
    server: "https://server11.mp3quran.net/mtrod",
    quranFoundationId: 7,
  },
];

export function getAudioUrl(reciter: Reciter, surahNumber: number): string {
  const paddedNumber = surahNumber.toString().padStart(3, '0');
  return `${reciter.server}/${paddedNumber}.mp3`;
}

export function getReciterById(id: string): Reciter | undefined {
  return reciters.find(r => r.id === id);
}

export function getRecitersByStyle(style: Reciter['style']): Reciter[] {
  return reciters.filter(r => r.style === style);
}
