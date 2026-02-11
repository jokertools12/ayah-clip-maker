// Islamic content: Hadiths, Sermons, and Religious Wisdom
export interface IslamicContentItem {
  id: string;
  text: string;
  source: string;
  category: 'hadith' | 'sermon' | 'wisdom';
  subcategory?: string;
}

export const islamicContent: IslamicContentItem[] = [
  // === أحاديث نبوية شريفة ===
  {
    id: 'hadith-1',
    text: 'إنما الأعمال بالنيات وإنما لكل امرئ ما نوى',
    source: 'متفق عليه',
    category: 'hadith',
    subcategory: 'أعمال',
  },
  {
    id: 'hadith-2',
    text: 'من كان يؤمن بالله واليوم الآخر فليقل خيراً أو ليصمت',
    source: 'متفق عليه',
    category: 'hadith',
    subcategory: 'أخلاق',
  },
  {
    id: 'hadith-3',
    text: 'لا يؤمن أحدكم حتى يحب لأخيه ما يحب لنفسه',
    source: 'متفق عليه',
    category: 'hadith',
    subcategory: 'إيمان',
  },
  {
    id: 'hadith-4',
    text: 'المسلم من سلم المسلمون من لسانه ويده',
    source: 'متفق عليه',
    category: 'hadith',
    subcategory: 'أخلاق',
  },
  {
    id: 'hadith-5',
    text: 'الطهور شطر الإيمان والحمد لله تملأ الميزان',
    source: 'رواه مسلم',
    category: 'hadith',
    subcategory: 'عبادات',
  },
  {
    id: 'hadith-6',
    text: 'اتق الله حيثما كنت وأتبع السيئة الحسنة تمحها وخالق الناس بخلق حسن',
    source: 'رواه الترمذي',
    category: 'hadith',
    subcategory: 'أخلاق',
  },
  {
    id: 'hadith-7',
    text: 'من سلك طريقاً يلتمس فيه علماً سهل الله له به طريقاً إلى الجنة',
    source: 'رواه مسلم',
    category: 'hadith',
    subcategory: 'علم',
  },
  {
    id: 'hadith-8',
    text: 'ما نقصت صدقة من مال وما زاد الله عبداً بعفو إلا عزاً',
    source: 'رواه مسلم',
    category: 'hadith',
    subcategory: 'صدقة',
  },
  {
    id: 'hadith-9',
    text: 'خيركم من تعلم القرآن وعلمه',
    source: 'رواه البخاري',
    category: 'hadith',
    subcategory: 'قرآن',
  },
  {
    id: 'hadith-10',
    text: 'الدنيا سجن المؤمن وجنة الكافر',
    source: 'رواه مسلم',
    category: 'hadith',
    subcategory: 'زهد',
  },
  {
    id: 'hadith-11',
    text: 'إن الله لا ينظر إلى صوركم وأموالكم ولكن ينظر إلى قلوبكم وأعمالكم',
    source: 'رواه مسلم',
    category: 'hadith',
    subcategory: 'إيمان',
  },
  {
    id: 'hadith-12',
    text: 'تبسمك في وجه أخيك صدقة',
    source: 'رواه الترمذي',
    category: 'hadith',
    subcategory: 'صدقة',
  },
  {
    id: 'hadith-13',
    text: 'المؤمن القوي خير وأحب إلى الله من المؤمن الضعيف وفي كل خير',
    source: 'رواه مسلم',
    category: 'hadith',
    subcategory: 'إيمان',
  },
  {
    id: 'hadith-14',
    text: 'من قال سبحان الله وبحمده مائة مرة حُطت خطاياه وإن كانت مثل زبد البحر',
    source: 'متفق عليه',
    category: 'hadith',
    subcategory: 'أذكار',
  },
  {
    id: 'hadith-15',
    text: 'ما ملأ آدمي وعاء شراً من بطنه',
    source: 'رواه الترمذي',
    category: 'hadith',
    subcategory: 'آداب',
  },
  {
    id: 'hadith-16',
    text: 'إذا مات ابن آدم انقطع عمله إلا من ثلاث: صدقة جارية أو علم ينتفع به أو ولد صالح يدعو له',
    source: 'رواه مسلم',
    category: 'hadith',
    subcategory: 'أعمال',
  },
  {
    id: 'hadith-17',
    text: 'لا تحقرن من المعروف شيئاً ولو أن تلقى أخاك بوجه طلق',
    source: 'رواه مسلم',
    category: 'hadith',
    subcategory: 'أخلاق',
  },
  {
    id: 'hadith-18',
    text: 'الكلمة الطيبة صدقة',
    source: 'متفق عليه',
    category: 'hadith',
    subcategory: 'صدقة',
  },

  // === خطب ومواعظ ===
  {
    id: 'sermon-1',
    text: 'أيها الناس إن ربكم واحد وإن أباكم واحد ألا لا فضل لعربي على عجمي ولا لعجمي على عربي ولا لأحمر على أسود ولا لأسود على أحمر إلا بالتقوى',
    source: 'خطبة الوداع - النبي ﷺ',
    category: 'sermon',
  },
  {
    id: 'sermon-2',
    text: 'كل المسلم على المسلم حرام دمه وماله وعرضه',
    source: 'خطبة الوداع - النبي ﷺ',
    category: 'sermon',
  },
  {
    id: 'sermon-3',
    text: 'استوصوا بالنساء خيراً فإنهن عوان عندكم',
    source: 'خطبة الوداع - النبي ﷺ',
    category: 'sermon',
  },
  {
    id: 'sermon-4',
    text: 'ألا إن أولياء الله لا خوف عليهم ولا هم يحزنون الذين آمنوا وكانوا يتقون',
    source: 'موعظة إيمانية',
    category: 'sermon',
  },
  {
    id: 'sermon-5',
    text: 'من أصبح منكم آمناً في سربه معافى في جسده عنده قوت يومه فكأنما حيزت له الدنيا بحذافيرها',
    source: 'موعظة نبوية',
    category: 'sermon',
  },
  {
    id: 'sermon-6',
    text: 'يا أيها الذين آمنوا اصبروا وصابروا ورابطوا واتقوا الله لعلكم تفلحون',
    source: 'موعظة قرآنية - آل عمران ٢٠٠',
    category: 'sermon',
  },
  {
    id: 'sermon-7',
    text: 'إن الله مع الصابرين فاصبر صبراً جميلاً فإن بعد العسر يسراً',
    source: 'موعظة إيمانية',
    category: 'sermon',
  },
  {
    id: 'sermon-8',
    text: 'حاسبوا أنفسكم قبل أن تُحاسبوا وزنوا أعمالكم قبل أن تُوزن عليكم',
    source: 'عمر بن الخطاب رضي الله عنه',
    category: 'sermon',
  },

  // === حكم ومواعظ ===
  {
    id: 'wisdom-1',
    text: 'اغتنم خمساً قبل خمس: شبابك قبل هرمك وصحتك قبل سقمك وغناك قبل فقرك وفراغك قبل شغلك وحياتك قبل موتك',
    source: 'حكمة نبوية',
    category: 'wisdom',
  },
  {
    id: 'wisdom-2',
    text: 'ليس الشديد بالصُّرَعة إنما الشديد الذي يملك نفسه عند الغضب',
    source: 'متفق عليه',
    category: 'wisdom',
  },
  {
    id: 'wisdom-3',
    text: 'ازهد في الدنيا يحبك الله وازهد فيما عند الناس يحبك الناس',
    source: 'رواه ابن ماجه',
    category: 'wisdom',
  },
  {
    id: 'wisdom-4',
    text: 'الصبر عند الصدمة الأولى',
    source: 'متفق عليه',
    category: 'wisdom',
  },
  {
    id: 'wisdom-5',
    text: 'رب أشعث أغبر مدفوع بالأبواب لو أقسم على الله لأبرّه',
    source: 'رواه مسلم',
    category: 'wisdom',
  },
  {
    id: 'wisdom-6',
    text: 'إن الله يحب إذا عمل أحدكم عملاً أن يتقنه',
    source: 'رواه البيهقي',
    category: 'wisdom',
  },
  {
    id: 'wisdom-7',
    text: 'كن في الدنيا كأنك غريب أو عابر سبيل',
    source: 'رواه البخاري',
    category: 'wisdom',
  },
  {
    id: 'wisdom-8',
    text: 'أحب الأعمال إلى الله أدومها وإن قلّ',
    source: 'متفق عليه',
    category: 'wisdom',
  },
];

export const contentCategories = [
  { id: 'all', name: 'الكل', icon: '📚' },
  { id: 'hadith', name: 'أحاديث نبوية', icon: '🕌' },
  { id: 'sermon', name: 'خطب ومواعظ', icon: '🎤' },
  { id: 'wisdom', name: 'حكم وعبر', icon: '💡' },
] as const;

export function getContentByCategory(category: string): IslamicContentItem[] {
  if (category === 'all') return islamicContent;
  return islamicContent.filter((item) => item.category === category);
}
