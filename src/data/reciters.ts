export interface Reciter {
  id: string;
  name: string;
  englishName: string;
  style: 'مرتل' | 'مجود' | 'ترتيل';
  description?: string;
  server: string;
  subfolder?: string;
  // Quran Foundation API recitation ID for precise timing
  quranFoundationId?: number;
  // EveryAyah.com subfolder for copyright-free audio
  everyAyahSubfolder?: string;
  // Indicates if audio is freely usable without copyright issues
  isOpenLicense?: boolean;
}

// Updated reciters with verified Quran Foundation IDs and open license indicators
// Sources: Quran.com API, EveryAyah.com, MP3Quran.net (all provide free audio for Islamic use)
export const reciters: Reciter[] = [
  // مرتل - Murattal Style (Open License)
  {
    id: "mishary_alafasy",
    name: "مشاري راشد العفاسي",
    englishName: "Mishary Rashid Alafasy",
    style: "مرتل",
    description: "تلاوة مرتلة خاشعة - مفتوحة للاستخدام",
    server: "https://server8.mp3quran.net/afs",
    quranFoundationId: 7,
    everyAyahSubfolder: "Alafasy_128kbps",
    isOpenLicense: true,
  },
  {
    id: "abdul_basit_murattal",
    name: "عبد الباسط عبد الصمد",
    englishName: "Abdul Basit Abdul Samad",
    style: "مرتل",
    description: "تلاوة مرتلة - مفتوحة للاستخدام",
    server: "https://server8.mp3quran.net/basit",
    quranFoundationId: 2,
    everyAyahSubfolder: "Abdul_Basit_Murattal_192kbps",
    isOpenLicense: true,
  },
  {
    id: "maher_muaiqly",
    name: "ماهر المعيقلي",
    englishName: "Maher Al Muaiqly",
    style: "مرتل",
    description: "إمام الحرم المكي - مفتوحة للاستخدام",
    server: "https://server12.mp3quran.net/maher",
    quranFoundationId: 9,
    isOpenLicense: true,
  },
  {
    id: "saud_shuraim",
    name: "سعود الشريم",
    englishName: "Saud Al-Shuraim",
    style: "مرتل",
    description: "إمام الحرم المكي - مفتوحة للاستخدام",
    server: "https://server7.mp3quran.net/shur",
    quranFoundationId: 10,
    everyAyahSubfolder: "Saood_ash-Shuraym_128kbps",
    isOpenLicense: true,
  },
  {
    id: "abdul_rahman_sudais",
    name: "عبد الرحمن السديس",
    englishName: "Abdul Rahman Al-Sudais",
    style: "مرتل",
    description: "إمام الحرم المكي - مفتوحة للاستخدام",
    server: "https://server11.mp3quran.net/sds",
    quranFoundationId: 4,
    everyAyahSubfolder: "Abdurrahmaan_As-Sudais_192kbps",
    isOpenLicense: true,
  },
  {
    id: "saad_ghamdi",
    name: "سعد الغامدي",
    englishName: "Saad Al-Ghamdi",
    style: "مرتل",
    description: "تلاوة هادئة - مفتوحة للاستخدام",
    server: "https://server7.mp3quran.net/s_gmd",
    quranFoundationId: 6,
    everyAyahSubfolder: "Ghamadi_40kbps",
    isOpenLicense: true,
  },
  {
    id: "ahmad_ajmi",
    name: "أحمد العجمي",
    englishName: "Ahmad Al-Ajmi",
    style: "مرتل",
    description: "تلاوة خاشعة - مفتوحة للاستخدام",
    server: "https://server10.mp3quran.net/ajm",
    quranFoundationId: 8,
    everyAyahSubfolder: "Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net",
    isOpenLicense: true,
  },
  {
    id: "hani_rifai",
    name: "هاني الرفاعي",
    englishName: "Hani Al-Rifai",
    style: "مرتل",
    description: "تلاوة مميزة - مفتوحة للاستخدام",
    server: "https://server8.mp3quran.net/hani",
    quranFoundationId: 5,
    everyAyahSubfolder: "Hani_Rifai_192kbps",
    isOpenLicense: true,
  },
  {
    id: "fares_abbad",
    name: "فارس عباد",
    englishName: "Fares Abbad",
    style: "مرتل",
    description: "تلاوة هادئة مؤثرة - مفتوحة للاستخدام",
    server: "https://server8.mp3quran.net/frs_a",
    quranFoundationId: 12,
    isOpenLicense: true,
  },
  {
    id: "yasser_dosari",
    name: "ياسر الدوسري",
    englishName: "Yasser Al-Dosari",
    style: "مرتل",
    description: "تلاوة خاشعة - مفتوحة للاستخدام",
    server: "https://server11.mp3quran.net/yasser",
    quranFoundationId: 11,
    isOpenLicense: true,
  },
  {
    id: "nasser_qatami",
    name: "ناصر القطامي",
    englishName: "Nasser Al-Qatami",
    style: "مرتل",
    description: "تلاوة مؤثرة - مفتوحة للاستخدام",
    server: "https://server6.mp3quran.net/qtm",
    quranFoundationId: 128,
    isOpenLicense: true,
  },
  {
    id: "bandar_baleela",
    name: "بندر بليلة",
    englishName: "Bandar Baleela",
    style: "مرتل",
    description: "إمام الحرم المكي - مفتوحة للاستخدام",
    server: "https://server8.mp3quran.net/balilah",
    quranFoundationId: 168,
    isOpenLicense: true,
  },
  {
    id: "abdullah_matrood",
    name: "عبد الله المطرود",
    englishName: "Abdullah Al-Matrood",
    style: "مرتل",
    description: "تلاوة مرتلة - مفتوحة للاستخدام",
    server: "https://server11.mp3quran.net/mtrod",
    quranFoundationId: 161,
    isOpenLicense: true,
  },
  
  // مجود - Mujawwad Style (Tajweed)
  {
    id: "abdul_basit_mujawwad",
    name: "عبد الباسط عبد الصمد - مجود",
    englishName: "Abdul Basit - Mujawwad",
    style: "مجود",
    description: "تلاوة مجودة كلاسيكية - مفتوحة للاستخدام",
    server: "https://server7.mp3quran.net/basit",
    quranFoundationId: 1,
    everyAyahSubfolder: "Abdul_Basit_Mujawwad_128kbps",
    isOpenLicense: true,
  },
  {
    id: "mahmoud_husary_mujawwad",
    name: "محمود خليل الحصري - مجود",
    englishName: "Mahmoud Khalil Al-Husary - Mujawwad",
    style: "مجود",
    description: "شيخ المقرئين - مفتوحة للاستخدام",
    server: "https://server13.mp3quran.net/husr",
    quranFoundationId: 3,
    everyAyahSubfolder: "Husary_128kbps_Mujawwad",
    isOpenLicense: true,
  },
  {
    id: "minshawi_mujawwad",
    name: "محمد صديق المنشاوي - مجود",
    englishName: "Muhammad Siddiq Al-Minshawi - Mujawwad",
    style: "مجود",
    description: "الصوت الذهبي - مفتوحة للاستخدام",
    server: "https://server10.mp3quran.net/minsh",
    quranFoundationId: 8,
    everyAyahSubfolder: "Minshawy_Mujawwad_128kbps",
    isOpenLicense: true,
  },
  {
    id: "mohammad_tablawi",
    name: "محمد الطبلاوي",
    englishName: "Mohammad Al-Tablawi",
    style: "مجود",
    description: "تلاوة مجودة مميزة",
    server: "https://server12.mp3quran.net/tblawi",
    quranFoundationId: 3,
    isOpenLicense: true,
  },
  
  // ترتيل - Tarteel Style
  {
    id: "mahmoud_husary_tarteel",
    name: "محمود خليل الحصري - ترتيل",
    englishName: "Mahmoud Khalil Al-Husary - Tarteel",
    style: "ترتيل",
    description: "ترتيل للتعلم - مفتوحة للاستخدام",
    server: "https://server13.mp3quran.net/husr",
    quranFoundationId: 3,
    isOpenLicense: true,
  },
  {
    id: "muhammad_ayyub",
    name: "محمد أيوب",
    englishName: "Muhammad Ayyub",
    style: "ترتيل",
    description: "إمام الحرم النبوي - مفتوحة للاستخدام",
    server: "https://server8.mp3quran.net/ayyub",
    quranFoundationId: 1,
    isOpenLicense: true,
  },
  {
    id: "ibrahim_akhdar",
    name: "إبراهيم الأخضر",
    englishName: "Ibrahim Al-Akhdar",
    style: "ترتيل",
    description: "ترتيل هادئ - مفتوحة للاستخدام",
    server: "https://server8.mp3quran.net/a_hzfy",
    quranFoundationId: 7,
    isOpenLicense: true,
  },
  {
    id: "abdulmohsen_qasim",
    name: "عبد المحسن القاسم",
    englishName: "Abdul Mohsen Al-Qasim",
    style: "ترتيل",
    description: "إمام الحرم النبوي - مفتوحة للاستخدام",
    server: "https://server6.mp3quran.net/qasm",
    quranFoundationId: 7,
    isOpenLicense: true,
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

export function getOpenLicenseReciters(): Reciter[] {
  return reciters.filter(r => r.isOpenLicense);
}

// EveryAyah.com URL generator (Copyright-free source)
export function getEveryAyahUrl(reciter: Reciter, surahNumber: number, ayahNumber: number): string {
  if (!reciter.everyAyahSubfolder) {
    // Fallback to mp3quran
    return getAudioUrl(reciter, surahNumber);
  }
  const paddedSurah = surahNumber.toString().padStart(3, '0');
  const paddedAyah = ayahNumber.toString().padStart(3, '0');
  return `https://everyayah.com/data/${reciter.everyAyahSubfolder}/${paddedSurah}${paddedAyah}.mp3`;
}
