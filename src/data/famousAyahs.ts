// Pre-defined famous ayahs that are commonly used in videos
export interface FamousAyah {
  id: string;
  name: string;
  description: string;
  surahNumber: number;
  startAyah: number;
  endAyah: number;
}

export const famousAyahs: FamousAyah[] = [
  {
    id: 'ayat-kursi',
    name: 'آية الكرسي',
    description: 'سورة البقرة - الآية 255',
    surahNumber: 2,
    startAyah: 255,
    endAyah: 255,
  },
  {
    id: 'fatiha',
    name: 'سورة الفاتحة كاملة',
    description: 'أم الكتاب',
    surahNumber: 1,
    startAyah: 1,
    endAyah: 7,
  },
  {
    id: 'last-baqarah',
    name: 'خواتيم البقرة',
    description: 'آخر آيتين من سورة البقرة',
    surahNumber: 2,
    startAyah: 285,
    endAyah: 286,
  },
  {
    id: 'ikhlas',
    name: 'سورة الإخلاص',
    description: 'تعدل ثلث القرآن',
    surahNumber: 112,
    startAyah: 1,
    endAyah: 4,
  },
  {
    id: 'falaq',
    name: 'سورة الفلق',
    description: 'المعوذتين - الأولى',
    surahNumber: 113,
    startAyah: 1,
    endAyah: 5,
  },
  {
    id: 'nas',
    name: 'سورة الناس',
    description: 'المعوذتين - الثانية',
    surahNumber: 114,
    startAyah: 1,
    endAyah: 6,
  },
  {
    id: 'mulk-start',
    name: 'بداية سورة الملك',
    description: 'المانعة من عذاب القبر',
    surahNumber: 67,
    startAyah: 1,
    endAyah: 5,
  },
  {
    id: 'kahf-start',
    name: 'بداية سورة الكهف',
    description: 'أول 10 آيات',
    surahNumber: 18,
    startAyah: 1,
    endAyah: 10,
  },
  {
    id: 'rahman-start',
    name: 'بداية سورة الرحمن',
    description: 'عروس القرآن',
    surahNumber: 55,
    startAyah: 1,
    endAyah: 13,
  },
  {
    id: 'yasin-start',
    name: 'بداية سورة يس',
    description: 'قلب القرآن',
    surahNumber: 36,
    startAyah: 1,
    endAyah: 12,
  },
  {
    id: 'jinn',
    name: 'سورة الجن - البداية',
    description: 'استماع الجن للقرآن',
    surahNumber: 72,
    startAyah: 1,
    endAyah: 10,
  },
  {
    id: 'maryam-story',
    name: 'قصة مريم',
    description: 'من سورة مريم',
    surahNumber: 19,
    startAyah: 16,
    endAyah: 26,
  },
  {
    id: 'duha',
    name: 'سورة الضحى',
    description: 'تسلية للنبي ﷺ',
    surahNumber: 93,
    startAyah: 1,
    endAyah: 11,
  },
  {
    id: 'sharh',
    name: 'سورة الشرح',
    description: 'إن مع العسر يسرا',
    surahNumber: 94,
    startAyah: 1,
    endAyah: 8,
  },
  {
    id: 'asr',
    name: 'سورة العصر',
    description: 'لو تدبرها الناس لكفتهم',
    surahNumber: 103,
    startAyah: 1,
    endAyah: 3,
  },
];
