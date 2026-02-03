// Curated nature backgrounds - reliable free sources with Ken Burns effect for images
export interface BackgroundItem {
  id: string;
  type: 'video' | 'image' | 'animated';
  url: string;
  thumbnail: string;
  name: string;
  category: 'nature' | 'sky' | 'water' | 'mountain' | 'forest' | 'desert' | 'abstract' | 'islamic';
}

// Static images with Ken Burns effect (most reliable)
export const backgroundImages: BackgroundItem[] = [
  {
    id: 'mountain-1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300',
    name: 'جبال شاهقة',
    category: 'mountain',
  },
  {
    id: 'desert-1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=300',
    name: 'صحراء ذهبية',
    category: 'desert',
  },
  {
    id: 'ocean-img-1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=300',
    name: 'بحر هادئ',
    category: 'water',
  },
  {
    id: 'sky-1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?w=300',
    name: 'سماء ملونة',
    category: 'sky',
  },
  {
    id: 'forest-img-1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=300',
    name: 'غابة خضراء',
    category: 'forest',
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
    id: 'waterfall-1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=300',
    name: 'شلال جميل',
    category: 'water',
  },
  {
    id: 'mosque-1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=300',
    name: 'مسجد',
    category: 'islamic',
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
    id: 'lake-1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=300',
    name: 'بحيرة هادئة',
    category: 'water',
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
    id: 'clouds-1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=300',
    name: 'سحب بيضاء',
    category: 'sky',
  },
];

// Animated backgrounds (GIFs or Lottie-style animations)
export const animatedBackgrounds: BackgroundItem[] = [
  {
    id: 'particles-1',
    type: 'animated',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300',
    name: 'جزيئات متحركة',
    category: 'abstract',
  },
  {
    id: 'galaxy-1',
    type: 'animated',
    url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=300',
    name: 'مجرة درب التبانة',
    category: 'sky',
  },
  {
    id: 'nebula-1',
    type: 'animated',
    url: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=300',
    name: 'سديم كوني',
    category: 'sky',
  },
  {
    id: 'bokeh-1',
    type: 'animated',
    url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=300',
    name: 'أضواء متوهجة',
    category: 'abstract',
  },
  {
    id: 'rain-1',
    type: 'animated',
    url: 'https://images.unsplash.com/photo-1428592953211-077101b2021b?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1428592953211-077101b2021b?w=300',
    name: 'قطرات المطر',
    category: 'nature',
  },
  {
    id: 'northern-lights',
    type: 'animated',
    url: 'https://images.unsplash.com/photo-1483086431886-3590a88317fe?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1483086431886-3590a88317fe?w=300',
    name: 'أضواء الشمال',
    category: 'sky',
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

export const allBackgrounds = [...backgroundImages, ...animatedBackgrounds, ...backgroundVideos];

export function getRandomBackground(type: 'video' | 'image' | 'animated'): BackgroundItem {
  const list = type === 'video' ? backgroundVideos : type === 'animated' ? animatedBackgrounds : backgroundImages;
  return list[Math.floor(Math.random() * list.length)];
}

export function getBackgroundsByCategory(category: BackgroundItem['category']): BackgroundItem[] {
  return allBackgrounds.filter((bg) => bg.category === category);
}
