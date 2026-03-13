// Pexels API for fetching video backgrounds
const PEXELS_API_KEY = '1Mm7g8hkrqF1baxPp6KUyjRGN9GTo6E9GJkEm0Nr7xge8zN0Jz89OlA7';
const BASE_URL = 'https://api.pexels.com/videos';

export interface PexelsVideo {
  id: number;
  width: number;
  height: number;
  duration: number;
  url: string;
  image: string;
  video_files: {
    id: number;
    quality: string;
    file_type: string;
    width: number;
    height: number;
    link: string;
  }[];
}

export interface PexelsSearchResponse {
  page: number;
  per_page: number;
  total_results: number;
  videos: PexelsVideo[];
}

export type VideoCategory = 
  | 'nature'
  | 'sky'
  | 'mountains'
  | 'ocean'
  | 'forest'
  | 'clouds'
  | 'rain'
  | 'sunset'
  | 'stars'
  | 'desert'
  | 'waterfall'
  | 'flowers';

export const VIDEO_CATEGORIES: { id: VideoCategory; label: string; query: string }[] = [
  { id: 'nature', label: 'طبيعة', query: 'nature landscape' },
  { id: 'sky', label: 'سماء', query: 'sky clouds blue' },
  { id: 'mountains', label: 'جبال', query: 'mountains scenic' },
  { id: 'ocean', label: 'محيط', query: 'ocean waves sea' },
  { id: 'forest', label: 'غابة', query: 'forest trees green' },
  { id: 'clouds', label: 'سحب', query: 'clouds timelapse' },
  { id: 'rain', label: 'مطر', query: 'rain drops water' },
  { id: 'sunset', label: 'غروب', query: 'sunset golden hour' },
  { id: 'stars', label: 'نجوم', query: 'stars night sky' },
  { id: 'desert', label: 'صحراء', query: 'desert sand dunes' },
  { id: 'waterfall', label: 'شلال', query: 'waterfall water' },
  { id: 'flowers', label: 'زهور', query: 'flowers garden bloom' },
];

export async function searchPexelsVideos(
  query: string,
  options?: {
    orientation?: 'portrait' | 'landscape' | 'square';
    size?: 'small' | 'medium' | 'large';
    perPage?: number;
    page?: number;
  }
): Promise<PexelsVideo[]> {
  const { orientation = 'portrait', size = 'medium', perPage = 15, page = 1 } = options || {};

  try {
    const params = new URLSearchParams({
      query,
      orientation,
      size,
      per_page: perPage.toString(),
      page: page.toString(),
    });

    const response = await fetch(`${BASE_URL}/search?${params}`, {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status}`);
    }

    const data: PexelsSearchResponse = await response.json();
    return data.videos;
  } catch (error) {
    console.error('Error fetching Pexels videos:', error);
    return [];
  }
}

export async function getPopularPexelsVideos(
  options?: {
    perPage?: number;
    page?: number;
  }
): Promise<PexelsVideo[]> {
  const { perPage = 15, page = 1 } = options || {};

  try {
    const params = new URLSearchParams({
      per_page: perPage.toString(),
      page: page.toString(),
    });

    const response = await fetch(`${BASE_URL}/popular?${params}`, {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status}`);
    }

    const data: PexelsSearchResponse = await response.json();
    return data.videos;
  } catch (error) {
    console.error('Error fetching popular Pexels videos:', error);
    return [];
  }
}

// Get optimal video URL — prefer SD portrait for recording performance
// SD = less data to download/normalize, still looks good at 720p-1080p output
export function getBestVideoUrl(video: PexelsVideo, preferLowRes = false): string {
  const files = [...video.video_files].sort((a, b) => {
    // Prefer portrait orientation
    const aIsPortrait = a.height > a.width;
    const bIsPortrait = b.height > b.width;
    if (aIsPortrait !== bIsPortrait) return aIsPortrait ? -1 : 1;
    
    // Always prefer SD now — HD is acceptable, never UHD
    // SD downloads faster and normalizes quicker via FFmpeg
    const qualityOrder = preferLowRes
      ? { sd: 3, hd: 1, uhd: 0 }
      : { sd: 3, hd: 2, uhd: 0 };
    const aQuality = qualityOrder[a.quality as keyof typeof qualityOrder] ?? 0;
    const bQuality = qualityOrder[b.quality as keyof typeof qualityOrder] ?? 0;
    if (aQuality !== bQuality) return bQuality - aQuality;

    // For same quality tier, prefer smaller file (lower resolution)
    return (a.width * a.height) - (b.width * b.height);
  });

  return files[0]?.link || video.video_files[0]?.link || '';
}
