import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon, Video, Check } from 'lucide-react';
import { useState, useRef } from 'react';

interface CustomBackgroundUploaderProps {
  onUpload: (url: string) => void;
  currentBackground?: string | null;
}

export function CustomBackgroundUploader({ onUpload, currentBackground }: CustomBackgroundUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      
      if (!isVideo && !isImage) {
        alert('الرجاء اختيار ملف صورة أو فيديو');
        return;
      }

      // Create a local URL for the file
      const url = URL.createObjectURL(file);
      onUpload(url);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('حدث خطأ في رفع الملف');
    } finally {
      setIsUploading(false);
    }
  };

  const isVideo = currentBackground?.includes('video') || currentBackground?.includes('.mp4') || currentBackground?.includes('.webm');

  return (
    <div className="space-y-4">
      {currentBackground ? (
        <div className="relative">
          <div className="aspect-video rounded-lg overflow-hidden bg-muted border-2 border-primary ring-2 ring-primary/30">
            {isVideo ? (
              <video 
                src={currentBackground} 
                className="w-full h-full object-cover"
                muted
                loop
                autoPlay
                playsInline
              />
            ) : (
              <img 
                src={currentBackground} 
                alt="خلفية مخصصة"
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute top-2 left-2 p-1 rounded-full bg-primary text-primary-foreground">
              <Check className="h-4 w-4" />
            </div>
            <div className="absolute bottom-2 right-2 left-2">
              <p className="text-white text-sm font-medium text-right">خلفية مخصصة</p>
            </div>
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 gap-1"
            onClick={() => onUpload('')}
          >
            <X className="h-3 w-3" />
            إزالة
          </Button>
        </div>
      ) : (
        <>
          <div 
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors aspect-video flex items-center justify-center"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-2">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                <Video className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">اضغط لرفع خلفية</p>
                <p className="text-xs text-muted-foreground">صورة أو فيديو من جهازك</p>
              </div>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full gap-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="h-4 w-4" />
            {isUploading ? 'جاري الرفع...' : 'رفع خلفية مخصصة'}
          </Button>
        </>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <p className="text-xs text-muted-foreground text-center">
        يمكنك رفع صورة (JPG, PNG) أو فيديو (MP4, WebM)
      </p>
    </div>
  );
}
