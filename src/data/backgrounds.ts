// Curated nature backgrounds - reliable free sources with Ken Burns effect for images
export interface BackgroundItem {
  id: string;
  type: 'video' | 'image';
  url: string;
  thumbnail: string;
  name: string;
  category: 'nature' | 'sky' | 'water' | 'mountain' | 'forest' | 'desert' | 'abstract';
}

// Using static images with Ken Burns effect (more reliable than video)
// Video backgrounds often have CORS issues, so we prioritize beautiful images
export const backgroundVideos: BackgroundItem[] = [
  // Converting video backgrounds to use image URLs with Ken Burns effect
  {
    id: 'clouds-1',
    type: 'image', // Changed to image for reliability
    url: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=300',
    name: 'سحب متحركة',
    category: 'sky',
  },
  {
    id: 'ocean-1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=300',
    name: 'أمواج البحر',
    category: 'water',
  },
  {
    id: 'stars-1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=300',
    name: 'نجوم الليل',
    category: 'sky',
  },
  {
    id: 'forest-1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=300',
    name: 'غابة خضراء',
    category: 'forest',
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
    id: 'rain-1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1428592953211-077101b2021b?w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1428592953211-077101b2021b?w=300',
    name: 'قطرات المطر',
    category: 'nature',
  },
];

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
    category: 'abstract',
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
];

export const allBackgrounds = [...backgroundVideos, ...backgroundImages];

export function getRandomBackground(type: 'video' | 'image'): BackgroundItem {
  // Since we converted all to images, always return from the combined list
  const list = allBackgrounds;
  return list[Math.floor(Math.random() * list.length)];
}

export function getBackgroundsByCategory(category: BackgroundItem['category']): BackgroundItem[] {
  return allBackgrounds.filter((bg) => bg.category === category);
}
