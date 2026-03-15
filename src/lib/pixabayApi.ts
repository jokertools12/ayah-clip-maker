// Pixabay Video API — standard CFR videos, better for recording
const PIXABAY_API_KEY = '55028717-a65fc22c944c87d6a021b1f16';
const BASE_URL = 'https://pixabay.com/api/videos/';

export interface PixabayVideo {
  id: number;
  pageURL: string;
  type: string;
  tags: string;
  duration: number;
  picture_id: string;
  videos: {
    large: { url: string; width: number; height: number; size: number };
    medium: { url: string; width: number; height: number; size: number };
    small: { url: string; width: number; height: number; size: number };
    tiny: { url: string; width: number; height: number; size: number };
  };
  userImageURL: string;
}

export interface PixabaySearchResponse {
  total: number;
  totalHits: number;
  hits: PixabayVideo[];
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

export async function searchPixabayVideos(
  query: string,
  options?: {
    perPage?: number;
    page?: number;
    minWidth?: number;
    minHeight?: number;
  }
): Promise<PixabayVideo[]> {
  const { perPage = 15, page = 1 } = options || {};

  try {
    const params = new URLSearchParams({
      key: PIXABAY_API_KEY,
      q: query,
      per_page: perPage.toString(),
      page: page.toString(),
      safesearch: 'true',
    });

    const response = await fetch(`${BASE_URL}?${params}`);

    if (!response.ok) {
      throw new Error(`Pixabay API error: ${response.status}`);
    }

    const data: PixabaySearchResponse = await response.json();
    return data.hits;
  } catch (error) {
    console.error('Error fetching Pixabay videos:', error);
    return [];
  }
}

/**
 * Get the thumbnail URL for a Pixabay video.
 * Uses the tiny video URL as a poster source (Pixabay doesn't provide static thumbnails).
 */
export function getVideoThumbnail(video: PixabayVideo): string {
  return video.videos.tiny?.url || video.videos.small?.url || '';
}

/**
 * Get optimal video URL from Pixabay.
 * Pixabay provides pre-sized videos (large=1280p, medium=640p, small=270p, tiny=100p).
 * We use 'medium' for preview and 'large' for recording to reduce CPU overhead.
 */
export function getBestVideoUrl(
  video: PixabayVideo,
  quality: 'tiny' | 'small' | 'medium' | 'large' = 'medium'
): string {
  const v = video.videos;
  // Try requested quality, then fallback down
  const fallbackOrder: Array<'large' | 'medium' | 'small' | 'tiny'> = ['large', 'medium', 'small', 'tiny'];
  const startIdx = fallbackOrder.indexOf(quality);
  for (let i = startIdx; i < fallbackOrder.length; i++) {
    const q = fallbackOrder[i];
    if (v[q]?.url) return v[q].url;
  }
  // Fallback up
  for (let i = startIdx - 1; i >= 0; i--) {
    const q = fallbackOrder[i];
    if (v[q]?.url) return v[q].url;
  }
  return v.medium?.url || v.small?.url || '';
}
