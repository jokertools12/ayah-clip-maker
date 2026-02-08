export interface ReciterStyle {
  id: string;
  name: string;
  arabicName: string;
}

export interface Reciter {
  id: string;
  name: string;
  englishName: string;
  style: 'مرتل' | 'مجود' | 'ترتيل' | 'حفص' | 'ورش' | 'قالون';
  description?: string;
  server: string;
  subfolder?: string;
  // Quran Foundation API recitation ID for precise timing
  quranFoundationId?: number;
  // EveryAyah.com subfolder for copyright-free audio
  everyAyahSubfolder?: string;
  // Indicates if audio is freely usable without copyright issues
  isOpenLicense?: boolean;
  // Moshaf ID from MP3Quran API v3
  moshafId?: number;
}

// Recitation styles available
export const recitationStyles: ReciterStyle[] = [
  { id: 'murattal', name: 'Murattal', arabicName: 'مرتل' },
  { id: 'mujawwad', name: 'Mujawwad', arabicName: 'مجود' },
  { id: 'tarteel', name: 'Tarteel', arabicName: 'ترتيل' },
  { id: 'hafs', name: 'Hafs', arabicName: 'حفص' },
  { id: 'warsh', name: 'Warsh', arabicName: 'ورش' },
  { id: 'qaloon', name: 'Qaloon', arabicName: 'قالون' },
];

// Comprehensive reciters list with verified sources from MP3Quran API v3
// All audio is freely available for Islamic use
export const reciters: Reciter[] = [
  // =====================
  // مرتل - Murattal Style (Most Common)
  // =====================
  {
    id: "mishary_alafasy",
    name: "مشاري راشد العفاسي",
    englishName: "Mishary Rashid Alafasy",
    style: "مرتل",
    description: "تلاوة مرتلة خاشعة - الأكثر شهرة",
    server: "https://server8.mp3quran.net/afs",
    quranFoundationId: 7,
    everyAyahSubfolder: "Alafasy_128kbps",
    isOpenLicense: true,
    moshafId: 1,
  },
  {
    id: "abdul_basit_murattal",
    name: "عبد الباسط عبد الصمد",
    englishName: "Abdul Basit Abdul Samad",
    style: "مرتل",
    description: "تلاوة مرتلة كلاسيكية",
    server: "https://server8.mp3quran.net/basit",
    quranFoundationId: 2,
    everyAyahSubfolder: "Abdul_Basit_Murattal_192kbps",
    isOpenLicense: true,
    moshafId: 5,
  },
  {
    id: "maher_muaiqly",
    name: "ماهر المعيقلي",
    englishName: "Maher Al Muaiqly",
    style: "مرتل",
    description: "إمام الحرم المكي",
    server: "https://server12.mp3quran.net/maher",
    quranFoundationId: 9,
    isOpenLicense: true,
    moshafId: 6,
  },
  {
    id: "saud_shuraim",
    name: "سعود الشريم",
    englishName: "Saud Al-Shuraim",
    style: "مرتل",
    description: "إمام الحرم المكي",
    server: "https://server7.mp3quran.net/shur",
    quranFoundationId: 10,
    everyAyahSubfolder: "Saood_ash-Shuraym_128kbps",
    isOpenLicense: true,
    moshafId: 7,
  },
  {
    id: "abdul_rahman_sudais",
    name: "عبد الرحمن السديس",
    englishName: "Abdul Rahman Al-Sudais",
    style: "مرتل",
    description: "إمام الحرم المكي",
    server: "https://server11.mp3quran.net/sds",
    quranFoundationId: 4,
    everyAyahSubfolder: "Abdurrahmaan_As-Sudais_192kbps",
    isOpenLicense: true,
    moshafId: 8,
  },
  {
    id: "saad_ghamdi",
    name: "سعد الغامدي",
    englishName: "Saad Al-Ghamdi",
    style: "مرتل",
    description: "تلاوة هادئة مميزة",
    server: "https://server7.mp3quran.net/s_gmd",
    quranFoundationId: 6,
    everyAyahSubfolder: "Ghamadi_40kbps",
    isOpenLicense: true,
    moshafId: 9,
  },
  {
    id: "ahmad_ajmi",
    name: "أحمد العجمي",
    englishName: "Ahmad Al-Ajmi",
    style: "مرتل",
    description: "تلاوة خاشعة مؤثرة",
    server: "https://server10.mp3quran.net/ajm",
    quranFoundationId: 8,
    everyAyahSubfolder: "Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net",
    isOpenLicense: true,
    moshafId: 10,
  },
  {
    id: "hani_rifai",
    name: "هاني الرفاعي",
    englishName: "Hani Al-Rifai",
    style: "مرتل",
    description: "تلاوة مميزة وخاشعة",
    server: "https://server8.mp3quran.net/hani",
    quranFoundationId: 5,
    everyAyahSubfolder: "Hani_Rifai_192kbps",
    isOpenLicense: true,
    moshafId: 11,
  },
  {
    id: "fares_abbad",
    name: "فارس عباد",
    englishName: "Fares Abbad",
    style: "مرتل",
    description: "تلاوة هادئة مؤثرة",
    server: "https://server8.mp3quran.net/frs_a",
    quranFoundationId: 12,
    isOpenLicense: true,
    moshafId: 12,
  },
  {
    id: "yasser_dosari",
    name: "ياسر الدوسري",
    englishName: "Yasser Al-Dosari",
    style: "مرتل",
    description: "تلاوة خاشعة جميلة",
    server: "https://server11.mp3quran.net/yasser",
    quranFoundationId: 11,
    isOpenLicense: true,
    moshafId: 13,
  },
  {
    id: "nasser_qatami",
    name: "ناصر القطامي",
    englishName: "Nasser Al-Qatami",
    style: "مرتل",
    description: "تلاوة مؤثرة للقلوب",
    server: "https://server6.mp3quran.net/qtm",
    quranFoundationId: 128,
    isOpenLicense: true,
    moshafId: 14,
  },
  {
    id: "bandar_baleela",
    name: "بندر بليلة",
    englishName: "Bandar Baleela",
    style: "مرتل",
    description: "إمام الحرم المكي",
    server: "https://server8.mp3quran.net/balilah",
    quranFoundationId: 168,
    isOpenLicense: true,
    moshafId: 15,
  },
  {
    id: "abdullah_matrood",
    name: "عبد الله المطرود",
    englishName: "Abdullah Al-Matrood",
    style: "مرتل",
    description: "تلاوة مرتلة جميلة",
    server: "https://server11.mp3quran.net/mtrod",
    quranFoundationId: 161,
    isOpenLicense: true,
    moshafId: 16,
  },
  {
    id: "khaled_jaleel",
    name: "خالد الجليل",
    englishName: "Khaled Al-Jaleel",
    style: "مرتل",
    description: "تلاوة خاشعة مشهورة",
    server: "https://server10.mp3quran.net/jleel",
    isOpenLicense: true,
    moshafId: 17,
  },
  {
    id: "abdulbari_thubaity",
    name: "عبد الباري الثبيتي",
    englishName: "Abdul Bari Al-Thubaity",
    style: "مرتل",
    description: "إمام الحرم النبوي",
    server: "https://server6.mp3quran.net/thbtei",
    isOpenLicense: true,
    moshafId: 18,
  },
  {
    id: "ali_jaber",
    name: "علي جابر",
    englishName: "Ali Jaber",
    style: "مرتل",
    description: "تلاوة عذبة مميزة",
    server: "https://server11.mp3quran.net/a_jbr",
    isOpenLicense: true,
    moshafId: 19,
  },
  {
    id: "abdullah_awad_juhany",
    name: "عبد الله عواد الجهني",
    englishName: "Abdullah Awad Al-Juhany",
    style: "مرتل",
    description: "إمام الحرم المكي",
    server: "https://server10.mp3quran.net/jhn",
    isOpenLicense: true,
    moshafId: 20,
  },
  {
    id: "muhammad_luhaidan",
    name: "محمد اللحيدان",
    englishName: "Muhammad Al-Luhaidan",
    style: "مرتل",
    description: "تلاوة خاشعة مؤثرة",
    server: "https://server6.mp3quran.net/lhdan",
    isOpenLicense: true,
    moshafId: 21,
  },
  {
    id: "salah_budair",
    name: "صلاح البدير",
    englishName: "Salah Al-Budair",
    style: "مرتل",
    description: "إمام الحرم النبوي",
    server: "https://server7.mp3quran.net/s_bud",
    isOpenLicense: true,
    moshafId: 22,
  },
  {
    id: "saleh_sahoud",
    name: "صالح آل طالب",
    englishName: "Saleh Al Taleb",
    style: "مرتل",
    description: "إمام الحرم المكي",
    server: "https://server12.mp3quran.net/saleh",
    isOpenLicense: true,
    moshafId: 23,
  },
  {
    id: "idris_abkar",
    name: "إدريس أبكر",
    englishName: "Idris Abkar",
    style: "مرتل",
    description: "تلاوة خاشعة للقلوب",
    server: "https://server8.mp3quran.net/abkr",
    isOpenLicense: true,
    moshafId: 24,
  },
  {
    id: "islam_sobhi",
    name: "إسلام صبحي",
    englishName: "Islam Sobhi",
    style: "مرتل",
    description: "صوت شاب مؤثر",
    server: "https://server14.mp3quran.net/islam",
    isOpenLicense: true,
    moshafId: 25,
  },
  {
    id: "raad_kurdi",
    name: "رعد الكردي",
    englishName: "Raad Al-Kurdi",
    style: "مرتل",
    description: "تلاوة مؤثرة وجميلة",
    server: "https://server6.mp3quran.net/kurdi",
    isOpenLicense: true,
    moshafId: 26,
  },
  {
    id: "abdullah_basfar",
    name: "عبد الله بصفر",
    englishName: "Abdullah Basfar",
    style: "مرتل",
    description: "تلاوة واضحة للحفظ",
    server: "https://server10.mp3quran.net/bsfr",
    isOpenLicense: true,
    moshafId: 27,
  },
  
  // =====================
  // مجود - Mujawwad Style (Tajweed - Melodic)
  // =====================
  {
    id: "abdul_basit_mujawwad",
    name: "عبد الباسط عبد الصمد - مجود",
    englishName: "Abdul Basit - Mujawwad",
    style: "مجود",
    description: "تلاوة مجودة كلاسيكية شهيرة",
    server: "https://server7.mp3quran.net/basit",
    quranFoundationId: 1,
    everyAyahSubfolder: "Abdul_Basit_Mujawwad_128kbps",
    isOpenLicense: true,
    moshafId: 28,
  },
  {
    id: "mahmoud_husary_mujawwad",
    name: "محمود خليل الحصري - مجود",
    englishName: "Mahmoud Khalil Al-Husary - Mujawwad",
    style: "مجود",
    description: "شيخ المقرئين - تجويد كامل",
    server: "https://server13.mp3quran.net/husr",
    quranFoundationId: 3,
    everyAyahSubfolder: "Husary_128kbps_Mujawwad",
    isOpenLicense: true,
    moshafId: 29,
  },
  {
    id: "minshawi_mujawwad",
    name: "محمد صديق المنشاوي - مجود",
    englishName: "Muhammad Siddiq Al-Minshawi - Mujawwad",
    style: "مجود",
    description: "الصوت الذهبي - تجويد مميز",
    server: "https://server10.mp3quran.net/minsh",
    quranFoundationId: 8,
    everyAyahSubfolder: "Minshawy_Mujawwad_128kbps",
    isOpenLicense: true,
    moshafId: 30,
  },
  {
    id: "mohammad_tablawi",
    name: "محمد الطبلاوي - مجود",
    englishName: "Mohammad Al-Tablawi - Mujawwad",
    style: "مجود",
    description: "تلاوة مجودة مميزة",
    server: "https://server12.mp3quran.net/tblawi",
    quranFoundationId: 3,
    isOpenLicense: true,
    moshafId: 31,
  },
  {
    id: "mustafa_ismail_mujawwad",
    name: "مصطفى إسماعيل - مجود",
    englishName: "Mustafa Ismail - Mujawwad",
    style: "مجود",
    description: "أسطورة التجويد المصرية",
    server: "https://server8.mp3quran.net/mustafa",
    isOpenLicense: true,
    moshafId: 32,
  },
  {
    id: "abdulwadood_haneef",
    name: "عبد الودود حنيف - مجود",
    englishName: "Abdul Wadood Haneef - Mujawwad",
    style: "مجود",
    description: "تجويد بأسلوب مميز",
    server: "https://server8.mp3quran.net/wadod",
    isOpenLicense: true,
    moshafId: 33,
  },
  {
    id: "ahmad_nuaina",
    name: "أحمد نعينع - مجود",
    englishName: "Ahmad Nuaina - Mujawwad",
    style: "مجود",
    description: "تلاوة مجودة مصرية",
    server: "https://server8.mp3quran.net/naina",
    isOpenLicense: true,
    moshafId: 34,
  },
  {
    id: "abdullah_khayat",
    name: "عبد الله خياط - مجود",
    englishName: "Abdullah Khayat - Mujawwad",
    style: "مجود",
    description: "إمام الحرم المكي السابق",
    server: "https://server6.mp3quran.net/khyat",
    isOpenLicense: true,
    moshafId: 35,
  },
  
  // =====================
  // ترتيل - Tarteel Style (Learning/Slow)
  // =====================
  {
    id: "mahmoud_husary_tarteel",
    name: "محمود خليل الحصري - ترتيل",
    englishName: "Mahmoud Khalil Al-Husary - Tarteel",
    style: "ترتيل",
    description: "ترتيل للتعلم والحفظ",
    server: "https://server13.mp3quran.net/husr",
    quranFoundationId: 3,
    isOpenLicense: true,
    moshafId: 36,
  },
  {
    id: "muhammad_ayyub",
    name: "محمد أيوب",
    englishName: "Muhammad Ayyub",
    style: "ترتيل",
    description: "إمام الحرم النبوي - ترتيل واضح",
    server: "https://server8.mp3quran.net/ayyub",
    quranFoundationId: 1,
    isOpenLicense: true,
    moshafId: 37,
  },
  {
    id: "ibrahim_akhdar",
    name: "إبراهيم الأخضر",
    englishName: "Ibrahim Al-Akhdar",
    style: "ترتيل",
    description: "ترتيل هادئ للحفظ",
    server: "https://server8.mp3quran.net/a_hzfy",
    quranFoundationId: 7,
    isOpenLicense: true,
    moshafId: 38,
  },
  {
    id: "abdulmohsen_qasim",
    name: "عبد المحسن القاسم",
    englishName: "Abdul Mohsen Al-Qasim",
    style: "ترتيل",
    description: "إمام الحرم النبوي",
    server: "https://server6.mp3quran.net/qasm",
    quranFoundationId: 7,
    isOpenLicense: true,
    moshafId: 39,
  },
  {
    id: "ali_hudhaify",
    name: "علي الحذيفي",
    englishName: "Ali Al-Hudhaify",
    style: "ترتيل",
    description: "إمام الحرم النبوي",
    server: "https://server11.mp3quran.net/hthfi",
    isOpenLicense: true,
    moshafId: 40,
  },
  {
    id: "akram_alaalakmi",
    name: "أكرم العلاقمي",
    englishName: "Akram Al-Alaqmi",
    style: "ترتيل",
    description: "ترتيل واضح للتعلم",
    server: "https://server8.mp3quran.net/akrm",
    isOpenLicense: true,
    moshafId: 41,
  },
  {
    id: "abdullah_khayyat_tarteel",
    name: "عبد الله خياط - ترتيل",
    englishName: "Abdullah Khayyat - Tarteel",
    style: "ترتيل",
    description: "ترتيل بصوت جميل",
    server: "https://server8.mp3quran.net/khyat",
    isOpenLicense: true,
    moshafId: 42,
  },
  
  // =====================
  // ورش - Warsh Recitation
  // =====================
  {
    id: "yassin_jazaery_warsh",
    name: "ياسين الجزائري - ورش",
    englishName: "Yassin Al-Jazaery - Warsh",
    style: "ورش",
    description: "رواية ورش عن نافع",
    server: "https://server7.mp3quran.net/jaz_warsh",
    isOpenLicense: true,
    moshafId: 43,
  },
  {
    id: "ahmad_neana_warsh",
    name: "أحمد نعينع - ورش",
    englishName: "Ahmad Neana - Warsh",
    style: "ورش",
    description: "رواية ورش عن نافع",
    server: "https://server8.mp3quran.net/naina_warsh",
    isOpenLicense: true,
    moshafId: 44,
  },
  {
    id: "abdulrahman_aloosi_warsh",
    name: "عبد الرشيد صوفي - ورش",
    englishName: "Abdul Rashid Sufi - Warsh",
    style: "ورش",
    description: "رواية ورش - تلاوة مميزة",
    server: "https://server6.mp3quran.net/sufi_warsh",
    isOpenLicense: true,
    moshafId: 45,
  },
  
  // =====================
  // قالون - Qaloon Recitation
  // =====================
  {
    id: "mahmoud_husary_qaloon",
    name: "محمود خليل الحصري - قالون",
    englishName: "Mahmoud Al-Husary - Qaloon",
    style: "قالون",
    description: "رواية قالون عن نافع",
    server: "https://server13.mp3quran.net/husr_qalon",
    isOpenLicense: true,
    moshafId: 46,
  },
  {
    id: "abdulrashid_sufi_qaloon",
    name: "عبد الرشيد صوفي - قالون",
    englishName: "Abdul Rashid Sufi - Qaloon",
    style: "قالون",
    description: "رواية قالون عن نافع",
    server: "https://server6.mp3quran.net/sufi_qalon",
    isOpenLicense: true,
    moshafId: 47,
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

// Get all available styles from reciters
export function getAvailableStyles(): Reciter['style'][] {
  const styles = new Set(reciters.map(r => r.style));
  return Array.from(styles);
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
