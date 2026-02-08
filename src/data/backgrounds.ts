// Curated nature backgrounds - reliable free sources with Ken Burns effect for images
export interface BackgroundItem {
  id: string;
  type: 'video' | 'image' | 'animated';
  url: string;
  thumbnail: string;
  name: string;
  category: 'nature' | 'sky' | 'water' | 'mountain' | 'forest' | 'desert' | 'abstract' | 'islamic';
  // For slideshow backgrounds - multiple images that change
  slideImages?: string[];
}

// Static images with Ken Burns effect (most reliable)
export const backgroundImages: BackgroundItem[] = [
  // Mountains
  {
    id: 'mountain-1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300',
    name: 'جبال شاهقة',
    category: 'mountain',
  },
  {
    id: 'mountain-2',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=300',
    name: 'قمم جبلية',
    category: 'mountain',
  },
  {
    id: 'mountain-3',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=300',
    name: 'جبل إيفرست',
    category: 'mountain',
  },
  {
    id: 'mountain-4',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=300',
    name: 'جبال ثلجية',
    category: 'mountain',
  },
  
  // Desert
  {
    id: 'desert-1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=300',
    name: 'صحراء ذهبية',
    category: 'desert',
  },
  {
    id: 'desert-2',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=300',
    name: 'كثبان رملية',
    category: 'desert',
  },
  {
    id: 'desert-3',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1542401886-65d6c61db217?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1542401886-65d6c61db217?w=300',
    name: 'صحراء عند الغروب',
    category: 'desert',
  },
  
  // Ocean & Water
  {
    id: 'ocean-img-1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=300',
    name: 'بحر هادئ',
    category: 'water',
  },
  {
    id: 'ocean-img-2',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=300',
    name: 'أمواج البحر',
    category: 'water',
  },
  {
    id: 'waterfall-1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=300',
    name: 'شلال جميل',
    category: 'water',
  },
  {
    id: 'lake-1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=300',
    name: 'بحيرة هادئة',
    category: 'water',
  },
  {
    id: 'lake-2',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
    name: 'بحيرة صافية',
    category: 'water',
  },
  {
    id: 'rain-1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1428592953211-077101b2021b?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1428592953211-077101b2021b?w=300',
    name: 'قطرات المطر',
    category: 'water',
  },
  
  // Sky
  {
    id: 'sky-1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?w=300',
    name: 'سماء ملونة',
    category: 'sky',
  },
  {
    id: 'stars-img-1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=300',
    name: 'نجوم ساطعة',
    category: 'sky',
  },
  {
    id: 'aurora-1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=300',
    name: 'شفق قطبي',
    category: 'sky',
  },
  {
    id: 'sunset-1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=300',
    name: 'غروب الشمس',
    category: 'sky',
  },
  {
    id: 'sunset-2',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1472120435266-53107fd0c44a?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1472120435266-53107fd0c44a?w=300',
    name: 'غروب برتقالي',
    category: 'sky',
  },
  {
    id: 'clouds-1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=300',
    name: 'سحب بيضاء',
    category: 'sky',
  },
  {
    id: 'clouds-2',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?w=300',
    name: 'سماء زرقاء',
    category: 'sky',
  },
  {
    id: 'milkyway-1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=300',
    name: 'درب التبانة',
    category: 'sky',
  },
  
  // Forest
  {
    id: 'forest-img-1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=300',
    name: 'غابة خضراء',
    category: 'forest',
  },
  {
    id: 'forest-img-2',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300',
    name: 'أشعة الشمس في الغابة',
    category: 'forest',
  },
  {
    id: 'forest-img-3',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1476362174823-3a23f4aa6d76?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1476362174823-3a23f4aa6d76?w=300',
    name: 'غابة ضبابية',
    category: 'forest',
  },
  {
    id: 'forest-img-4',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=300',
    name: 'أشجار عملاقة',
    category: 'forest',
  },
  
  // Islamic
  {
    id: 'mosque-1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=300',
    name: 'مسجد',
    category: 'islamic',
  },
  {
    id: 'mosque-2',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1591604129939-f1efa0a2d71c?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1591604129939-f1efa0a2d71c?w=300',
    name: 'مئذنة مسجد',
    category: 'islamic',
  },
  {
    id: 'mosque-3',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=300',
    name: 'داخل المسجد',
    category: 'islamic',
  },
  {
    id: 'mosque-4',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1545167496-c1f3de6d96c3?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1545167496-c1f3de6d96c3?w=300',
    name: 'مسجد عند الغروب',
    category: 'islamic',
  },
  
  // Nature (General)
  {
    id: 'nature-1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=300',
    name: 'سهول خضراء',
    category: 'nature',
  },
  {
    id: 'nature-2',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=300',
    name: 'منظر طبيعي',
    category: 'nature',
  },
  {
    id: 'nature-3',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300',
    name: 'جبال وغابات',
    category: 'nature',
  },
  {
    id: 'flower-1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=300',
    name: 'حقل زهور',
    category: 'nature',
  },
];

// Animated backgrounds (GIFs or Lottie-style animations)
export const animatedBackgrounds: BackgroundItem[] = [];

// Slideshow backgrounds - multiple images that transition smoothly
export const slideshowBackgrounds: BackgroundItem[] = [
  {
    id: 'slideshow-nature-1',
    type: 'animated',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300',
    name: 'مناظر طبيعية متغيرة',
    category: 'nature',
    slideImages: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
      'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80',
      'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1920&q=80',
      'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1920&q=80',
      'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1920&q=80',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&q=80',
    ],
  },
  {
    id: 'slideshow-sky-1',
    type: 'animated',
    url: 'https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?w=300',
    name: 'سماء متغيرة',
    category: 'sky',
    slideImages: [
      'https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?w=1920&q=80',
      'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=80',
      'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&q=80',
      'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=1920&q=80',
      'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1920&q=80',
      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&q=80',
    ],
  },
  {
    id: 'slideshow-water-1',
    type: 'animated',
    url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=300',
    name: 'مياه وبحار متغيرة',
    category: 'water',
    slideImages: [
      'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1920&q=80',
      'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1920&q=80',
      'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1920&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80',
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1920&q=80',
    ],
  },
  {
    id: 'slideshow-mountain-1',
    type: 'animated',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=300',
    name: 'جبال متغيرة',
    category: 'mountain',
    slideImages: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
      'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1920&q=80',
      'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=1920&q=80',
    ],
  },
  {
    id: 'slideshow-forest-1',
    type: 'animated',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=300',
    name: 'غابات متغيرة',
    category: 'forest',
    slideImages: [
      'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80',
      'https://images.unsplash.com/photo-1476362174823-3a23f4aa6d76?w=1920&q=80',
      'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=1920&q=80',
    ],
  },
  {
    id: 'slideshow-islamic-1',
    type: 'animated',
    url: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=300',
    name: 'مساجد متغيرة',
    category: 'islamic',
    slideImages: [
      'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1920&q=80',
      'https://images.unsplash.com/photo-1591604129939-f1efa0a2d71c?w=1920&q=80',
      'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=1920&q=80',
      'https://images.unsplash.com/photo-1545167496-c1f3de6d96c3?w=1920&q=80',
    ],
  },
  {
    id: 'slideshow-desert-1',
    type: 'animated',
    url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=300',
    name: 'صحراء متغيرة',
    category: 'desert',
    slideImages: [
      'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1920&q=80',
      'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=1920&q=80',
      'https://images.unsplash.com/photo-1542401886-65d6c61db217?w=1920&q=80',
    ],
  },
];

// Video backgrounds (MP4 format) - using reliable CDN sources
export const backgroundVideos: BackgroundItem[] = [
  {
    id: 'clouds-video',
    type: 'video',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-clouds-and-blue-sky-2408-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=300',
    name: 'سحب متحركة',
    category: 'sky',
  },
  {
    id: 'ocean-video',
    type: 'video',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-sea-waves-hitting-the-shore-1090-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=300',
    name: 'أمواج البحر',
    category: 'water',
  },
  {
    id: 'stars-video',
    type: 'video',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=300',
    name: 'نجوم الليل',
    category: 'sky',
  },
  {
    id: 'forest-video',
    type: 'video',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=300',
    name: 'غابة مشمسة',
    category: 'forest',
  },
  {
    id: 'sunset-video',
    type: 'video',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-pink-and-blue-sky-2405-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=300',
    name: 'غروب وردي',
    category: 'sky',
  },
  {
    id: 'rain-video',
    type: 'video',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-rain-falling-on-the-water-of-a-lake-18312-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1428592953211-077101b2021b?w=300',
    name: 'مطر على البحيرة',
    category: 'water',
  },
];

export const allBackgrounds = [...backgroundImages, ...slideshowBackgrounds, ...backgroundVideos];

export function getRandomBackground(type: 'video' | 'image' | 'animated'): BackgroundItem {
  const list = type === 'video' ? backgroundVideos : type === 'animated' ? slideshowBackgrounds : backgroundImages;
  return list[Math.floor(Math.random() * list.length)];
}

export function getBackgroundsByCategory(category: BackgroundItem['category']): BackgroundItem[] {
  return allBackgrounds.filter((bg) => bg.category === category);
}
