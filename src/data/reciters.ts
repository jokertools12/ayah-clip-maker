export interface Reciter {
  id: string;
  name: string;
  englishName: string;
  style: string;
  server: string;
  subfolder?: string;
}

export const reciters: Reciter[] = [
  {
    id: "abdul_basit_murattal",
    name: "عبد الباسط عبد الصمد",
    englishName: "Abdul Basit Abdul Samad",
    style: "مرتل",
    server: "https://server8.mp3quran.net/basit",
  },
  {
    id: "mishary_alafasy",
    name: "مشاري راشد العفاسي",
    englishName: "Mishary Rashid Alafasy",
    style: "مرتل",
    server: "https://server8.mp3quran.net/afs",
  },
  {
    id: "maher_muaiqly",
    name: "ماهر المعيقلي",
    englishName: "Maher Al Muaiqly",
    style: "مرتل",
    server: "https://server12.mp3quran.net/maher",
  },
  {
    id: "saud_shuraim",
    name: "سعود الشريم",
    englishName: "Saud Al-Shuraim",
    style: "مرتل",
    server: "https://server7.mp3quran.net/shur",
  },
  {
    id: "abdul_rahman_sudais",
    name: "عبد الرحمن السديس",
    englishName: "Abdul Rahman Al-Sudais",
    style: "مرتل",
    server: "https://server11.mp3quran.net/sds",
  },
  {
    id: "saad_ghamdi",
    name: "سعد الغامدي",
    englishName: "Saad Al-Ghamdi",
    style: "مرتل",
    server: "https://server7.mp3quran.net/s_gmd",
  },
  {
    id: "ahmad_ajmi",
    name: "أحمد العجمي",
    englishName: "Ahmad Al-Ajmi",
    style: "مرتل",
    server: "https://server10.mp3quran.net/ajm",
  },
  {
    id: "hani_rifai",
    name: "هاني الرفاعي",
    englishName: "Hani Al-Rifai",
    style: "مرتل",
    server: "https://server8.mp3quran.net/hani",
  },
  {
    id: "fares_abbad",
    name: "فارس عباد",
    englishName: "Fares Abbad",
    style: "مرتل",
    server: "https://server8.mp3quran.net/frs_a",
  },
  {
    id: "yasser_dosari",
    name: "ياسر الدوسري",
    englishName: "Yasser Al-Dosari",
    style: "مرتل",
    server: "https://server11.mp3quran.net/yasser",
  },
  {
    id: "mohammad_tablawi",
    name: "محمد الطبلاوي",
    englishName: "Mohammad Al-Tablawi",
    style: "مرتل",
    server: "https://server12.mp3quran.net/tblawi",
  },
  {
    id: "muhammad_ayyub",
    name: "محمد أيوب",
    englishName: "Muhammad Ayyub",
    style: "مرتل",
    server: "https://server8.mp3quran.net/ayyub",
  },
];

export function getAudioUrl(reciter: Reciter, surahNumber: number): string {
  const paddedNumber = surahNumber.toString().padStart(3, '0');
  return `${reciter.server}/${paddedNumber}.mp3`;
}
