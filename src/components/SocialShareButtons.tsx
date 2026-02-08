import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Share2, Instagram, Facebook } from 'lucide-react';

interface SocialShareButtonsProps {
  videoBlob: Blob | null;
  title: string;
  text: string;
  filename: string;
}

// TikTok icon component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
  </svg>
);

export function SocialShareButtons({ videoBlob, title, text, filename }: SocialShareButtonsProps) {
  const shareToSocial = async (platform: 'instagram' | 'facebook' | 'tiktok' | 'native') => {
    if (!videoBlob) {
      toast.error('لا يوجد فيديو للمشاركة');
      return;
    }

    const file = new File([videoBlob], filename, { type: 'video/mp4' });
    const navAny = navigator as Navigator & { canShare?: (data: ShareData) => boolean };

    // For Instagram, TikTok - we use native share to open the app
    if (platform === 'native' || platform === 'instagram' || platform === 'tiktok') {
      if (navigator.share && navAny.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            title,
            text: `${text}\n\n#قرآن_كريم #quran #islamic #reels`,
            files: [file],
          });
          toast.success('تمت المشاركة بنجاح!');
          return;
        } catch (e) {
          if ((e as Error).name === 'AbortError') {
            // User cancelled - don't show error
            return;
          }
          console.error('Share failed:', e);
        }
      }
      
      // Fallback: download the file so user can upload manually
      downloadFile(videoBlob, filename);
      
      if (platform === 'instagram') {
        toast.info('تم تحميل الفيديو. افتح Instagram وارفع الفيديو كـ Reel');
      } else if (platform === 'tiktok') {
        toast.info('تم تحميل الفيديو. افتح TikTok وارفع الفيديو');
      } else {
        toast.info('تم تحميل الفيديو للمشاركة');
      }
      return;
    }

    // Facebook - try native share first, then fallback
    if (platform === 'facebook') {
      if (navigator.share && navAny.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            title,
            text,
            files: [file],
          });
          toast.success('تمت المشاركة بنجاح!');
          return;
        } catch (e) {
          if ((e as Error).name === 'AbortError') return;
          console.error('Facebook share failed:', e);
        }
      }
      
      // Fallback: download and open Facebook
      downloadFile(videoBlob, filename);
      window.open('https://www.facebook.com/', '_blank');
      toast.info('تم تحميل الفيديو. ارفعه على Facebook كـ Reel');
    }
  };

  const downloadFile = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground text-center">مشاركة مباشرة على:</p>
      <div className="grid grid-cols-4 gap-2">
        {/* Instagram Reels */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => shareToSocial('instagram')}
          disabled={!videoBlob}
          className="flex flex-col items-center gap-1 h-auto py-2 bg-gradient-to-br from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white border-0"
        >
          <Instagram className="h-5 w-5" />
          <span className="text-xs">Reels</span>
        </Button>

        {/* TikTok */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => shareToSocial('tiktok')}
          disabled={!videoBlob}
          className="flex flex-col items-center gap-1 h-auto py-2 bg-black hover:bg-gray-900 text-white border-0"
        >
          <TikTokIcon className="h-5 w-5" />
          <span className="text-xs">TikTok</span>
        </Button>

        {/* Facebook Reels */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => shareToSocial('facebook')}
          disabled={!videoBlob}
          className="flex flex-col items-center gap-1 h-auto py-2 bg-blue-600 hover:bg-blue-700 text-white border-0"
        >
          <Facebook className="h-5 w-5" />
          <span className="text-xs">Reels</span>
        </Button>

        {/* Native Share */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => shareToSocial('native')}
          disabled={!videoBlob}
          className="flex flex-col items-center gap-1 h-auto py-2"
        >
          <Share2 className="h-5 w-5" />
          <span className="text-xs">المزيد</span>
        </Button>
      </div>
    </div>
  );
}
