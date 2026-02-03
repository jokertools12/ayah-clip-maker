import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, Video } from 'lucide-react';
import { useState, useRef } from 'react';

interface CustomBackgroundUploaderProps {
  onUpload: (url: string, type: 'image' | 'video') => void;
  currentCustomBackground?: string | null;
  onClear: () => void;
}

export function CustomBackgroundUploader({ onUpload, currentCustomBackground, onClear }: CustomBackgroundUploaderProps) {
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
      onUpload(url, isVideo ? 'video' : 'image');
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('حدث خطأ في رفع الملف');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Upload className="h-5 w-5" />
          خلفية مخصصة
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentCustomBackground ? (
          <div className="relative">
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              {currentCustomBackground.includes('video') ? (
                <video 
                  src={currentCustomBackground} 
                  className="w-full h-full object-cover"
                  muted
                  loop
                  autoPlay
                  playsInline
                />
              ) : (
                <img 
                  src={currentCustomBackground} 
                  alt="خلفية مخصصة"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={onClear}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div 
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-2">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                <Video className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">اضغط لرفع خلفية</p>
                <p className="text-xs text-muted-foreground">صورة أو فيديو</p>
              </div>
            </div>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="hidden"
        />
        
        {!currentCustomBackground && (
          <Button 
            variant="outline" 
            className="w-full gap-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="h-4 w-4" />
            {isUploading ? 'جاري الرفع...' : 'رفع خلفية مخصصة'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
