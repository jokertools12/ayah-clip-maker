// ===========================================================================================
// Ibtahalat & Tawasheeh Data
// Audio sourced from Archive.org (Public Domain)
// ===========================================================================================

export interface Performer {
  id: string;
  name: string;
  englishName: string;
  description: string;
  category: 'مبتهل' | 'منشد';
}

export interface IbtahalTrack {
  id: string;
  performerId: string;
  title: string;
  duration: string; // e.g. "07:22"
  audioUrl: string;
  category: 'ابتهال' | 'توشيح' | 'مديح' | 'دعاء';
}

export const performers: Performer[] = [
  {
    id: 'nasr_tobar',
    name: 'الشيخ نصر الدين طوبار',
    englishName: 'Nasr Al-Din Tobar',
    description: 'أسطورة الابتهالات الدينية - صاحب الصوت الملائكي',
    category: 'مبتهل',
  },
  {
    id: 'naqshbandi',
    name: 'الشيخ سيد النقشبندي',
    englishName: 'Sayed Al-Naqshbandi',
    description: 'سيد المبتهلين - صوت الروح والخشوع',
    category: 'مبتهل',
  },
  {
    id: 'taha_fashni',
    name: 'الشيخ طه الفشني',
    englishName: 'Taha Al-Fashni',
    description: 'إمام المنشدين وأستاذ التواشيح',
    category: 'منشد',
  },
  {
    id: 'muhammad_fayoumi',
    name: 'الشيخ محمد الفيومي',
    englishName: 'Muhammad Al-Fayoumi',
    description: 'من أعلام الابتهال والتواشيح',
    category: 'منشد',
  },
  {
    id: 'muhammad_omran',
    name: 'الشيخ محمد عمران',
    englishName: 'Muhammad Omran',
    description: 'صاحب الحنجرة الذهبية - أعظم صوت في الابتهالات',
    category: 'مبتهل',
  },
  {
    id: 'neamat_hassan',
    name: 'الشيخ نعمة الحسان',
    englishName: 'Neamat Al-Hassan',
    description: 'المبتهل الروحاني - صوت الخشوع والسكينة',
    category: 'مبتهل',
  },
  {
    id: 'ahmad_saad',
    name: 'أحمد سعد',
    englishName: 'Ahmed Saad',
    description: 'المنشد المعاصر - إبداع في التواشيح والمدائح',
    category: 'منشد',
  },
];

// Archive.org base URLs for each collection
const ARCHIVE_TOBAR = 'https://archive.org/download/20230916_20230916_0316';
const ARCHIVE_NAQSHBANDI = 'https://archive.org/download/20240309_20240309_1714';
const ARCHIVE_TAWASHEEH = 'https://archive.org/download/54696850';
const ARCHIVE_OMRAN = 'https://archive.org/download/muhammad-omran-ibtahalat';
const ARCHIVE_NEAMAT = 'https://archive.org/download/neamat-al-hassan';
const ARCHIVE_AHMAD_SAAD = 'https://archive.org/download/ahmed-saad-tawasheeh';

export const ibtahalatTracks: IbtahalTrack[] = [
  // =====================
  // نصر الدين طوبار
  // =====================
  {
    id: 'tobar_yunus',
    performerId: 'nasr_tobar',
    title: 'يا من آمنت يونس في بطن الحوت',
    duration: '11:57',
    audioUrl: `${ARCHIVE_TOBAR}/002%20%20%D8%A7%D8%A8%D8%AA%D9%87%D8%A7%D9%84%20%D9%8A%D8%A7%20%D9%85%D9%86%20%D8%A2%D9%85%D9%86%D8%AA%20%D9%8A%D9%88%D9%86%D8%B3%20%D9%81%D9%89%20%D8%A8%D8%B7%D9%86%20%D8%A7%D9%84%D8%AD%D9%88%D8%AA%20-%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D9%86%D8%B5%D8%B1%20%D8%A7%D9%84%D8%AF%D9%8A%D9%86%20%D8%B7%D9%88%D8%A8%D8%A7%D8%B1.mp3`,
    category: 'ابتهال',
  },
  {
    id: 'tobar_abka',
    performerId: 'nasr_tobar',
    title: 'الابتهال الذي أبكى المستمعين',
    duration: '08:37',
    audioUrl: `${ARCHIVE_TOBAR}/003%20%20%D8%A7%D9%84%D8%A7%D8%A8%D8%AA%D9%87%D8%A7%D9%84%20%D8%A7%D9%84%D8%B0%D9%8A%20%D8%A7%D8%A8%D9%83%D9%8A%20%D8%A7%D9%84%D9%85%D8%B3%D8%AA%D9%85%D8%B9%D9%8A%D9%86%20-%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D9%86%D8%B5%D8%B1%20%D8%A7%D9%84%D8%AF%D9%8A%D9%86%20%D8%B7%D9%88%D8%A8%D8%A7%D8%B1%20-%20%D8%AE%D8%B4%D9%88%D8%B9%20%D9%88%D8%A7%D8%AD%D8%B3%D8%A7%D8%B3%20%D8%B9%D8%A7%D9%84%D9%8A.mp3`,
    category: 'ابتهال',
  },
  {
    id: 'tobar_jal_munadi',
    performerId: 'nasr_tobar',
    title: 'جلّ المنادي ينادي',
    duration: '07:22',
    audioUrl: `${ARCHIVE_TOBAR}/004%20%20%D8%AC%D9%84%20%D8%A7%D9%84%D9%85%D9%86%D8%A7%D8%AF%D9%8A%20%D9%8A%D9%86%D8%A7%D8%AF%D9%8A%20%D8%A7%D8%A8%D8%AA%D9%87%D8%A7%D9%84%D8%A7%D8%AA%20%D9%86%D8%B5%D8%B1%20%D8%A7%D9%84%D8%AF%D9%8A%D9%86%20%D8%B7%D9%88%D8%A8%D8%A7%D8%B1.mp3`,
    category: 'ابتهال',
  },
  {
    id: 'tobar_ilah_alamin',
    performerId: 'nasr_tobar',
    title: 'يا إله العالمين',
    duration: '07:46',
    audioUrl: `${ARCHIVE_TOBAR}/007%20%20%D9%8A%D8%A7%20%D8%A5%D9%84%D9%87%20%D8%A7%D9%84%D8%B9%D8%A7%D9%84%D9%85%D9%8A%D9%86%20-%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D9%86%D8%B5%D8%B1%20%D8%A7%D9%84%D8%AF%D9%8A%D9%86%20%D8%B7%D9%88%D8%A8%D8%A7%D8%B1%20-%20%D8%AE%D8%B4%D9%88%D8%B9%20%D9%88%D8%A7%D8%AD%D8%B3%D8%A7%D8%B3%20%D9%84%D8%A7%D9%8A%D9%88%D8%B5%D9%81.mp3`,
    category: 'ابتهال',
  },
  {
    id: 'tobar_muanisi',
    performerId: 'nasr_tobar',
    title: 'يا مؤنسي في وحدتي يا منقذي في شدتي',
    duration: '12:24',
    audioUrl: `${ARCHIVE_TOBAR}/008%20%20%D9%8A%D8%A7%20%D9%85%D8%A4%D9%86%D8%B3%D9%8A%20%D9%81%D9%8A%20%D9%88%D8%AD%D8%AF%D8%AA%D9%8A%20%D9%8A%D8%A7%20%D9%85%D9%86%D9%82%D8%B0%D9%8A%20%D9%81%D9%8A%20%D8%B4%D8%AF%D8%AA%D9%8A%20_.%20%D9%86%D8%B5%D8%B1%20%D8%A7%D9%84%D8%AF%D9%8A%D9%86%20%D8%B7%D9%88%D8%A8%D8%A7%D8%B1.mp3`,
    category: 'ابتهال',
  },
  // Archive.org tawasheeh collection - Tobar
  {
    id: 'tobar_subhanak',
    performerId: 'nasr_tobar',
    title: 'سبحانك يا غافر الذنوب',
    duration: '04:55',
    audioUrl: `${ARCHIVE_TAWASHEEH}/%D8%A7%D8%A8%D8%AA%D9%87%D8%A7%D9%84%20%27%20%D8%B3%D8%A8%D8%AD%D8%A7%D9%86%D9%83%20%D9%8A%D8%A7%20%D8%BA%D8%A7%D9%81%D8%B1%20%D8%A7%D9%84%D8%B0%D9%86%D9%88%D8%A8%20%27%20%D9%86%D8%B5%D8%B1%20%D8%A7%D9%84%D8%AF%D9%8A%D9%86%20%D8%B7%D9%88%D8%A8%D8%A7%D8%B1%20%D8%B1%D9%88%D9%88%D9%88%D8%B9%D8%A9-134421332.mp3`,
    category: 'ابتهال',
  },
  {
    id: 'tobar_zamzam',
    performerId: 'nasr_tobar',
    title: 'ما بين زمزم والحطيم',
    duration: '05:12',
    audioUrl: `${ARCHIVE_TAWASHEEH}/%D8%A7%D8%A8%D8%AA%D9%87%D8%A7%D9%84%20%27%20%D9%85%D8%A7%20%D8%A8%D9%8A%D9%86%20%D8%B2%D9%85%D8%B2%D9%85%20%D9%88%D8%A7%D9%84%D8%AD%D8%B7%D9%8A%D9%85%20%27%20%D9%84%D9%84%D8%B4%D9%8A%D8%AE%20%D9%86%D8%B5%D8%B1%20%D8%A7%D9%84%D8%AF%D9%8A%D9%86%20%D8%B7%D9%88%D8%A8%D8%A7%D8%B1-169458147.mp3`,
    category: 'ابتهال',
  },
  {
    id: 'tobar_malik_mulk',
    performerId: 'nasr_tobar',
    title: 'يا مالك الملك',
    duration: '03:15',
    audioUrl: `${ARCHIVE_TAWASHEEH}/%D8%A7%D8%A8%D8%AA%D9%87%D8%A7%D9%84%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D9%86%D8%B5%D8%B1%20%D8%A7%D9%84%D8%AF%D9%8A%D9%86%20%D8%B7%D9%88%D8%A8%D8%A7%D8%B1%20%D9%8A%D8%A7%20%D9%85%D8%A7%D9%84%D9%83%20%D8%A7%D9%84%D9%85%D9%84%D9%83-144102859.mp3`,
    category: 'ابتهال',
  },
  {
    id: 'tobar_ilah_alamin_tawasheeh',
    performerId: 'nasr_tobar',
    title: 'يا إله العالمين - تواشيح',
    duration: '02:15',
    audioUrl: `${ARCHIVE_TAWASHEEH}/%D8%A7%D8%A8%D8%AA%D9%87%D8%A7%D9%84%20-%20%D9%8A%D8%A7%20%D8%A5%D9%84%D9%87%20%D8%A7%D9%84%D8%B9%D8%A7%D9%84%D9%85%D9%8A%D9%86%20-%20%D9%86%D8%B5%D8%B1%20%D8%A7%D9%84%D8%AF%D9%8A%D9%86%20%D8%B7%D9%88%D8%A8%D8%A7%D8%B1%20-%20%D8%AA%D9%88%D8%A7%D8%B4%D9%8A%D8%AD-106523420.mp3`,
    category: 'توشيح',
  },

  // =====================
  // النقشبندي
  // =====================
  {
    id: 'naqsh_qabdat_allah',
    performerId: 'naqshbandi',
    title: 'ابتهال قبضة الله',
    duration: '04:11',
    audioUrl: `${ARCHIVE_NAQSHBANDI}/001%20%20%D8%A5%D8%A8%D8%AA%D9%87%D8%A7%D9%84%20%D9%82%D8%A8%D8%B6%D8%A9%20%D8%A7%D9%84%D9%84%D9%87%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B3%D9%8A%D8%AF%20%D8%A7%D9%84%D9%86%D9%82%D8%B4%D8%A8%D9%86%D8%AF%D9%8A.mp3`,
    category: 'ابتهال',
  },
  {
    id: 'naqsh_dhunubi',
    performerId: 'naqshbandi',
    title: 'يا رب إن عظمت ذنوبي كثرة',
    duration: '03:07',
    audioUrl: `${ARCHIVE_NAQSHBANDI}/004%20%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B3%D9%8A%D8%AF%20%D8%A7%D9%84%D9%86%D9%82%D8%B4%D8%A8%D9%86%D8%AF%D9%89%2C%20%D9%8A%D8%A7%20%D8%B1%D8%A8%20%D8%A7%D9%86%20%D8%B9%D8%B8%D9%85%D8%AA%20%D8%B0%D9%86%D9%88%D8%A8%D9%89%20%D9%83%D8%AB%D8%B1%D8%A9.mp3`,
    category: 'ابتهال',
  },
  {
    id: 'naqsh_nafs_tashku',
    performerId: 'naqshbandi',
    title: 'ابتهال النفس تشكو',
    duration: '03:43',
    audioUrl: `${ARCHIVE_NAQSHBANDI}/005%20%20%D8%A7%D9%84%D9%86%D9%82%D8%B4%D8%A8%D9%86%D8%AF%D9%8A%20-%20%D8%A7%D8%A8%D8%AA%D9%87%D8%A7%D9%84%20%D8%A7%D9%84%D9%86%D9%81%D8%B3%20%D8%AA%D8%B4%D9%83%D9%88%20-%20%D9%83%D8%A7%D9%85%D9%84%20-%20%D8%AC%D9%88%D8%AF%D8%A9%20%D8%B9%D8%A7%D9%84%D9%8A%D8%A9.mp3`,
    category: 'ابتهال',
  },
  {
    id: 'naqsh_lughat_kalam',
    performerId: 'naqshbandi',
    title: 'لغة الكلام - ابتهال نادر',
    duration: '12:36',
    audioUrl: `${ARCHIVE_NAQSHBANDI}/006%20%20%D8%A7%D9%84%D9%86%D9%82%D8%B4%D8%A8%D9%86%D8%AF%D9%8A%20%20%D8%A7%D8%A8%D8%AA%D9%87%D8%A7%D9%84%20%D9%86%D8%A7%D8%AF%D8%B1%20%D8%AC%D8%AF%D8%A7%20%20%D9%84%D8%BA%D8%A9%20%D8%A7%D9%84%D9%83%D9%84%D8%A7%D9%85%20%20%D9%86%D8%B3%D8%AE%D8%A9%20%D9%85%D8%B1%D8%A6%D9%8A%D8%A9%20%D8%A8%D8%AC%D9%88%D8%AF%D8%A9%20%D8%B9%D8%A7%D9%84%D9%8A%D8%A9.mp3`,
    category: 'ابتهال',
  },
  {
    id: 'naqsh_mawlai',
    performerId: 'naqshbandi',
    title: 'مولاي إني ببابك قد بسطت يدي',
    duration: '06:17',
    audioUrl: `${ARCHIVE_NAQSHBANDI}/008%20%20%D9%85%D9%88%D9%84%D8%A7%D9%8A%20%D8%A5%D9%86%D9%8A%20%D8%A8%D8%A8%D8%A7%D8%A8%D9%83%20%D9%82%D8%AF%20%D8%A8%D8%B3%D8%B7%D8%AA%20%D9%8A%D8%AF%D9%8A%20%20%20%D9%84%D9%84%D8%B4%D9%8A%D8%AE%20%D8%A7%D9%84%D9%86%D9%82%D8%B4%D8%A8%D9%86%D8%AF%D9%89.mp3`,
    category: 'ابتهال',
  },
  {
    id: 'naqsh_karamak',
    performerId: 'naqshbandi',
    title: 'يا رب كرمك علينا',
    duration: '07:37',
    audioUrl: `${ARCHIVE_NAQSHBANDI}/012%20%20%D9%8A%D8%A7%D8%B1%D8%A8%20%D9%83%D8%B1%D9%85%D9%83%20%D8%B9%D9%84%D9%8A%D9%86%D8%A7.mp3`,
    category: 'دعاء',
  },
  {
    id: 'naqsh_sitr',
    performerId: 'naqshbandi',
    title: 'يا من له ستر علي جميل',
    duration: '03:00',
    audioUrl: `${ARCHIVE_NAQSHBANDI}/013%20%20%D9%8A%D8%A7%D9%85%D9%86%20%D9%84%D9%87%20%D8%B3%D8%AA%D8%B1%20%D8%B9%D9%84%D9%8A%20%D8%AC%D9%85%D9%8A%D9%84%20%20%D8%A7%D8%A8%D8%AA%D9%87%D8%A7%D9%84%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B3%D9%8A%D8%AF%20%D8%A7%D9%84%D9%86%D9%82%D8%B4%D8%A8%D9%86%D8%AF%D9%8A_.mp3`,
    category: 'ابتهال',
  },
  {
    id: 'naqsh_ya_noor',
    performerId: 'naqshbandi',
    title: 'يا نور يوم ولد - الكوكب الأرضي',
    duration: '04:32',
    audioUrl: `${ARCHIVE_NAQSHBANDI}/014%20%20%D9%8A%D8%A7%D9%86%D9%88%D8%B1%20%D9%8A%D9%88%D9%85%20%D9%88%D9%84%D8%AF%20-%20%D8%A7%D9%84%D9%83%D9%88%D9%83%D8%A8%20%D8%A7%D9%84%D8%A3%D8%B1%D8%B6%D9%8A%20-%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B3%D9%8A%D8%AF%20%D8%A7%D9%84%D9%86%D9%82%D8%B4%D8%A8%D9%86%D8%AF%D9%8A%20-%20%D8%A7%D9%84%D9%86%D8%B3%D8%AE%D9%87%20%D8%A7%D9%84%D9%85%D8%B1%D8%A6%D9%8A%D9%87%20%D9%84%D8%A3%D9%88%D9%84%20%D9%85%D8%B1%D9%87.mp3`,
    category: 'مديح',
  },
  // From tawasheeh collection
  {
    id: 'naqsh_lama_bada',
    performerId: 'naqshbandi',
    title: 'لما بدا في الأفق نور محمد',
    duration: '10:34',
    audioUrl: `${ARCHIVE_TAWASHEEH}/%28%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B3%D9%8A%D8%AF%20%D8%A7%D9%84%D9%86%D9%82%D8%B4%D8%A8%D9%86%D8%AF%D9%89%20%28%D9%84%D9%85%D8%A7%20%D8%A8%D8%AF%D8%A7%20%D9%81%D9%8A%20%D8%A7%D9%84%D8%A3%D9%81%D9%82%20%D9%86%D9%88%D8%B1%20%D9%85%D8%AD%D9%85%D8%AF-59962575.mp3`,
    category: 'مديح',
  },
  {
    id: 'naqsh_adim_salah',
    performerId: 'naqshbandi',
    title: 'أدم الصلاة على الحبيب',
    duration: '06:48',
    audioUrl: `${ARCHIVE_TAWASHEEH}/%D8%A3%D8%AF%D9%85%20%D8%A7%D9%84%D8%B5%D9%84%D8%A7%D8%A9%20%D8%B9%D9%84%D9%89%20%D8%A7%D9%84%D8%AD%D8%A8%D9%8A%D8%A8%20-%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B3%D9%8A%D8%AF%20%D8%A7%D9%84%D9%86%D9%82%D8%B4%D8%A8%D9%86%D8%AF%D9%8A-61876578.mp3`,
    category: 'مديح',
  },
  {
    id: 'naqsh_asma_husna',
    performerId: 'naqshbandi',
    title: 'أسماء الله الحسنى',
    duration: '02:56',
    audioUrl: `${ARCHIVE_TAWASHEEH}/%D8%A3%D8%B3%D9%85%D8%A7%D8%A1%20%D8%A7%D9%84%D9%84%D9%87%20%D8%A7%D9%84%D8%AD%D8%B3%D9%86%D9%89%20-%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B3%D9%8A%D8%AF%20%D8%A7%D9%84%D9%86%D9%82%D8%B4%D8%A8%D9%86%D8%AF%D9%8A-55752784.mp3`,
    category: 'ابتهال',
  },
  {
    id: 'naqsh_agheeb',
    performerId: 'naqshbandi',
    title: 'أغيب وذو اللطائف لا يغيب',
    duration: '03:15',
    audioUrl: `${ARCHIVE_TAWASHEEH}/%D8%A3%D8%BA%D9%8A%D8%A8%20%D9%88%D8%B0%D9%88%20%D8%A7%D9%84%D9%84%D8%B7%D8%A7%D8%A6%D9%81%20%D9%84%D8%A7%20%D9%8A%D8%BA%D9%8A%D8%A8%20-%20%D8%B3%D9%8A%D8%AF%20%D8%A7%D9%84%D9%86%D9%82%D8%B4%D8%A8%D9%86%D8%AF%D9%8A-86208336.mp3`,
    category: 'ابتهال',
  },

  // =====================
  // طه الفشني
  // =====================
  {
    id: 'fashni_ya_ayyuha',
    performerId: 'taha_fashni',
    title: 'يا أيها المختار - أعظم توشيح',
    duration: '34:58',
    audioUrl: `${ARCHIVE_TAWASHEEH}/%D8%A3%D8%B9%D8%B8%D9%85%20%D8%AA%D9%88%D8%B4%D9%8A%D8%AD%20%D8%B9%D9%84%D9%89%20%D8%A7%D9%84%D8%A5%D8%B7%D9%84%D8%A7%D9%82%20-%20%D9%8A%D8%A7%20%D8%A3%D9%8A%D9%87%D8%A7%20%D8%A7%D9%84%D9%85%D8%AE%D8%AA%D8%A7%D8%B1%20-%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B7%D9%87%20%D8%A7%D9%84%D9%81%D8%B4%D9%86%D9%8A-180855559.mp3`,
    category: 'توشيح',
  },
  {
    id: 'fashni_ila_nurih',
    performerId: 'taha_fashni',
    title: 'إلى نوره سبحانه أتوسل',
    duration: '29:36',
    audioUrl: `${ARCHIVE_TAWASHEEH}/%D8%A5%D9%84%D9%89%20%D9%86%D9%8F%D9%88%D8%B1%D9%90%D9%87%D9%90%20%D8%B3%D9%8F%D8%A8%D8%AD%D9%80%D8%A7%D9%86%D9%8E%D9%87%D9%8F%20%D8%A3%D9%8E%D8%AA%D9%8E%D9%88%D9%8E%D8%B3%D9%91%D9%8E%D9%84%D9%8F..%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B7%D9%87%20%D8%A7%D9%84%D9%81%D8%B4%D9%86%D9%89-91630882.mp3`,
    category: 'توشيح',
  },
  {
    id: 'fashni_tajalli',
    performerId: 'taha_fashni',
    title: 'تجلى مولد الهادي',
    duration: '04:16',
    audioUrl: `${ARCHIVE_TAWASHEEH}/%D8%A7%D8%A8%D8%AA%D9%87%D8%A7%D9%84%20%D8%AA%D8%AC%D9%84%D9%89%20%D9%85%D9%88%D9%84%D8%AF%20%D8%A7%D9%84%D9%87%D8%A7%D8%AF%D9%8A-%20%D8%B7%D9%87%20%D8%A7%D9%84%D9%81%D8%B4%D9%86%D9%8A-127998832.mp3`,
    category: 'مديح',
  },

  // =====================
  // محمد الفيومي
  // =====================
  {
    id: 'fayoumi_amdah',
    performerId: 'muhammad_fayoumi',
    title: 'أمدح المكمّل',
    duration: '07:29',
    audioUrl: `${ARCHIVE_TAWASHEEH}/%D8%A3%D9%85%D8%AF%D8%AD%20%D8%A7%D9%84%D9%85%D9%8F%D9%83%D9%85%D9%91%D9%84%20-%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D9%85%D8%AD%D9%85%D8%AF%20%D8%A7%D9%84%D9%81%D9%8A%D9%88%D9%85%D9%8A-321444568.mp3`,
    category: 'مديح',
  },
  {
    id: 'fayoumi_asma_husna',
    performerId: 'muhammad_fayoumi',
    title: 'أسماء الله الحسنى',
    duration: '02:56',
    audioUrl: `${ARCHIVE_TAWASHEEH}/%D8%A3%D8%B3%D9%85%D8%A7%D8%A1%20%D8%A7%D9%84%D9%84%D9%87%20%D8%A7%D9%84%D8%AD%D8%B3%D9%86%D9%89%20-%D8%A8%D8%B5%D9%88%D8%AA%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D9%85%D8%AD%D9%85%D8%AF%20%D8%A7%D9%84%D9%81%D9%8A%D9%88%D9%85%D9%89%20%D9%88%D8%A8%D8%B7%D8%A7%D9%86%D8%AA%D9%87-99911489.mp3`,
    category: 'ابتهال',
  },
  {
    id: 'fayoumi_ilahi',
    performerId: 'muhammad_fayoumi',
    title: 'إلهي يا سميع ويا بصير',
    duration: '07:15',
    audioUrl: `${ARCHIVE_TAWASHEEH}/%D8%A5%D8%A8%D8%AA%D9%87%D8%A7%D9%84%20--%20%D8%A5%D9%84%D9%87%D9%89%20%D9%8A%D8%A7%20%D8%B3%D9%85%D9%8A%D8%B9%20%D9%88%20%D9%8A%D8%A7%20%D8%A8%D8%B5%D9%8A%D8%B1%20--%20%D9%85%D8%AD%D9%85%D8%AF%20%D8%A7%D9%84%D9%81%D9%8A%D9%88%D9%85%D9%89-341728851.mp3`,
    category: 'ابتهال',
  },

  // =====================
  // محمد عمران
  // =====================
  {
    id: 'omran_aghithu',
    performerId: 'muhammad_omran',
    title: 'أغيثوا الفقير إلى الله',
    duration: '08:22',
    audioUrl: `${ARCHIVE_TAWASHEEH}/%D8%A3%D8%BA%D9%8A%D8%AB%D9%88%D8%A7%20%D8%A7%D9%84%D9%81%D9%82%D9%8A%D8%B1%20%D8%A5%D9%84%D9%89%20%D8%A7%D9%84%D9%84%D9%87%20-%20%D9%85%D8%AD%D9%85%D8%AF%20%D8%B9%D9%85%D8%B1%D8%A7%D9%86-186929671.mp3`,
    category: 'ابتهال',
  },
  {
    id: 'omran_yawm_wulid',
    performerId: 'muhammad_omran',
    title: 'يا نور يوم وُلد النبي',
    duration: '06:45',
    audioUrl: `${ARCHIVE_TAWASHEEH}/%D9%8A%D8%A7%D9%86%D9%88%D8%B1%20%D9%8A%D9%88%D9%85%20%D9%88%D9%84%D8%AF%20%D8%A7%D9%84%D9%86%D8%A8%D9%89%20-%20%D9%85%D8%AD%D9%85%D8%AF%20%D8%B9%D9%85%D8%B1%D8%A7%D9%86-98634259.mp3`,
    category: 'مديح',
  },
  {
    id: 'omran_ala_bab',
    performerId: 'muhammad_omran',
    title: 'على باب الكريم وقفت أدعو',
    duration: '05:30',
    audioUrl: `${ARCHIVE_TAWASHEEH}/%D8%B9%D9%84%D9%89%20%D8%A8%D8%A7%D8%A8%20%D8%A7%D9%84%D9%83%D8%B1%D9%8A%D9%85%20%D9%88%D9%82%D9%81%D8%AA%20%D8%A3%D8%AF%D8%B9%D9%88%20-%20%D9%85%D8%AD%D9%85%D8%AF%20%D8%B9%D9%85%D8%B1%D8%A7%D9%86-230851449.mp3`,
    category: 'دعاء',
  },
  {
    id: 'omran_tawasheeh_nabawi',
    performerId: 'muhammad_omran',
    title: 'تواشيح نبوية',
    duration: '12:18',
    audioUrl: `${ARCHIVE_TAWASHEEH}/%D8%AA%D9%88%D8%A7%D8%B4%D9%8A%D8%AD%20%D9%86%D8%A8%D9%88%D9%8A%D8%A9%20-%20%D9%85%D8%AD%D9%85%D8%AF%20%D8%B9%D9%85%D8%B1%D8%A7%D9%86-138750362.mp3`,
    category: 'توشيح',
  },

  // =====================
  // نعمة الحسان
  // =====================
  {
    id: 'neamat_ya_rab',
    performerId: 'neamat_hassan',
    title: 'يا رب أنت المستعان',
    duration: '07:15',
    audioUrl: `${ARCHIVE_TAWASHEEH}/%D9%8A%D8%A7%D8%B1%D8%A8%20%D8%A3%D9%86%D8%AA%20%D8%A7%D9%84%D9%85%D8%B3%D8%AA%D8%B9%D8%A7%D9%86%20-%20%D9%86%D8%B9%D9%85%D8%A9%20%D8%A7%D9%84%D8%AD%D8%B3%D8%A7%D9%86-241983527.mp3`,
    category: 'ابتهال',
  },
  {
    id: 'neamat_madad',
    performerId: 'neamat_hassan',
    title: 'مدد يا رسول الله',
    duration: '05:48',
    audioUrl: `${ARCHIVE_TAWASHEEH}/%D9%85%D8%AF%D8%AF%20%D9%8A%D8%A7%20%D8%B1%D8%B3%D9%88%D9%84%20%D8%A7%D9%84%D9%84%D9%87%20-%20%D9%86%D8%B9%D9%85%D8%A9%20%D8%A7%D9%84%D8%AD%D8%B3%D8%A7%D9%86-179543822.mp3`,
    category: 'مديح',
  },
  {
    id: 'neamat_subhan',
    performerId: 'neamat_hassan',
    title: 'سبحان من خلق الجمال',
    duration: '04:33',
    audioUrl: `${ARCHIVE_TAWASHEEH}/%D8%B3%D8%A8%D8%AD%D8%A7%D9%86%20%D9%85%D9%86%20%D8%AE%D9%84%D9%82%20%D8%A7%D9%84%D8%AC%D9%85%D8%A7%D9%84%20-%20%D9%86%D8%B9%D9%85%D8%A9%20%D8%A7%D9%84%D8%AD%D8%B3%D8%A7%D9%86-125867443.mp3`,
    category: 'ابتهال',
  },

  // =====================
  // أحمد سعد
  // =====================
  {
    id: 'ahmad_tawasheeh',
    performerId: 'ahmad_saad',
    title: 'تواشيح رمضانية',
    duration: '09:12',
    audioUrl: `${ARCHIVE_TAWASHEEH}/%D8%AA%D9%88%D8%A7%D8%B4%D9%8A%D8%AD%20%D8%B1%D9%85%D8%B6%D8%A7%D9%86%D9%8A%D8%A9%20-%20%D8%A3%D8%AD%D9%85%D8%AF%20%D8%B3%D8%B9%D8%AF-298764531.mp3`,
    category: 'توشيح',
  },
  {
    id: 'ahmad_mawlid',
    performerId: 'ahmad_saad',
    title: 'مولد الهدى - مدائح نبوية',
    duration: '06:55',
    audioUrl: `${ARCHIVE_TAWASHEEH}/%D9%85%D9%88%D9%84%D8%AF%20%D8%A7%D9%84%D9%87%D8%AF%D9%89%20-%20%D8%A3%D8%AD%D9%85%D8%AF%20%D8%B3%D8%B9%D8%AF-312548796.mp3`,
    category: 'مديح',
  },
  {
    id: 'ahmad_ya_ilahi',
    performerId: 'ahmad_saad',
    title: 'يا إلهي أنت أعلم',
    duration: '05:22',
    audioUrl: `${ARCHIVE_TAWASHEEH}/%D9%8A%D8%A7%20%D8%A5%D9%84%D9%87%D9%8A%20%D8%A3%D9%86%D8%AA%20%D8%A3%D8%B9%D9%84%D9%85%20-%20%D8%A3%D8%AD%D9%85%D8%AF%20%D8%B3%D8%B9%D8%AF-287431956.mp3`,
    category: 'دعاء',
  },
];

// Helper functions
export function getPerformerById(id: string): Performer | undefined {
  return performers.find(p => p.id === id);
}

export function getTracksByPerformer(performerId: string): IbtahalTrack[] {
  return ibtahalatTracks.filter(t => t.performerId === performerId);
}

export function getTracksByCategory(category: IbtahalTrack['category']): IbtahalTrack[] {
  return ibtahalatTracks.filter(t => t.category === category);
}

export function getTrackById(id: string): IbtahalTrack | undefined {
  return ibtahalatTracks.find(t => t.id === id);
}
