// Curated nature backgrounds - reliable free sources
export interface BackgroundItem {
  id: string;
  type: 'video' | 'image';
  url: string;
  thumbnail: string;
  name: string;
  category: 'nature' | 'sky' | 'water' | 'mountain' | 'forest' | 'desert' | 'abstract';
}

// Using reliable CDN sources with direct links
export const backgroundVideos: BackgroundItem[] = [
  {
    id: 'clouds-1',
    type: 'video',
    url: 'https://cdn.pixabay.com/video/2020/05/25/40130-424930032_large.mp4',
    thumbnail: 'https://i.vimeocdn.com/video/902291256-a03c33b1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1?mw=700',
    name: 'سحب متحركة',
    category: 'sky',
  },
  {
    id: 'ocean-1',
    type: 'video',
    url: 'https://cdn.pixabay.com/video/2022/03/09/110635-686618347_large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=300',
    name: 'أمواج البحر',
    category: 'water',
  },
  {
    id: 'stars-1',
    type: 'video',
    url: 'https://cdn.pixabay.com/video/2019/07/23/25432-350482147_large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=300',
    name: 'نجوم الليل',
    category: 'sky',
  },
  {
    id: 'forest-1',
    type: 'video',
    url: 'https://cdn.pixabay.com/video/2021/04/02/69665-533320920_large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=300',
    name: 'غابة خضراء',
    category: 'forest',
  },
  {
    id: 'sunset-1',
    type: 'video',
    url: 'https://cdn.pixabay.com/video/2016/09/10/5039-183267178_large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=300',
    name: 'غروب الشمس',
    category: 'sky',
  },
  {
    id: 'rain-1',
    type: 'video',
    url: 'https://cdn.pixabay.com/video/2020/02/12/32006-390929729_large.mp4',
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
];

export const allBackgrounds = [...backgroundVideos, ...backgroundImages];

export function getRandomBackground(type: 'video' | 'image'): BackgroundItem {
  const list = type === 'video' ? backgroundVideos : backgroundImages;
  return list[Math.floor(Math.random() * list.length)];
}

export function getBackgroundsByCategory(category: BackgroundItem['category']): BackgroundItem[] {
  return allBackgrounds.filter((bg) => bg.category === category);
}
