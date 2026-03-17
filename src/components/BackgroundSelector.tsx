import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Image as ImageIcon, Sparkles, Upload, Video, Film, Lock } from 'lucide-react';
import { BackgroundItem, backgroundImages, slideshowBackgrounds } from '@/data/backgrounds';
import { CustomBackgroundUploader } from '@/components/CustomBackgroundUploader';
import { PexelsVideoSelector } from '@/components/PexelsVideoSelector';
import { PexelsOriginalVideoSelector } from '@/components/PexelsOriginalVideoSelector';
import { PremiumBadge } from '@/components/PremiumBadge';
import { useSubscription } from '@/hooks/useSubscription';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface BackgroundSelectorProps {
  selectedBackground: BackgroundItem | null;
  onSelect: (background: BackgroundItem) => void;
  customBackground?: string | null;
  onCustomBackgroundChange?: (url: string | null) => void;
}

export function BackgroundSelector({ 
  selectedBackground, 
  onSelect, 
  customBackground, 
  onCustomBackgroundChange 
}: BackgroundSelectorProps) {
  const [activeTab, setActiveTab] = useState<'custom' | 'image' | 'slideshow' | 'pixabay' | 'pexels'>('image');
  const { canUseFeature, isPremium } = useSubscription();

  const renderBackgroundCard = (bg: BackgroundItem) => {
    const isSelected = selectedBackground?.id === bg.id && !customBackground;

    return (
      <motion.div
        key={bg.id}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          onCustomBackgroundChange?.(null); // Clear custom when selecting preset
          onSelect(bg);
        }}
        className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
          isSelected
            ? 'border-primary ring-2 ring-primary/30'
            : 'border-transparent hover:border-primary/50'
        }`}
      >
        <div className="aspect-video relative">
          <img
            src={bg.thumbnail}
            alt={bg.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Type indicator */}
           <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white">
             {bg.type === 'animated' ? (
               <Sparkles className="h-3 w-3" />
             ) : (
               <ImageIcon className="h-3 w-3" />
             )}
           </div>

          {/* Slideshow indicator */}
          {bg.slideImages && bg.slideImages.length > 1 && (
            <div className="absolute bottom-8 left-2 px-2 py-0.5 rounded-full bg-primary/80 text-primary-foreground text-xs">
              {bg.slideImages.length} صور
            </div>
          )}

          {/* Selected indicator */}
          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-2 left-2 p-1 rounded-full bg-primary text-primary-foreground"
            >
              <Check className="h-4 w-4" />
            </motion.div>
          )}

          {/* Name */}
          <div className="absolute bottom-2 right-2 left-2">
            <p className="text-white text-sm font-medium text-right truncate">
              {bg.name}
            </p>
          </div>
        </div>
      </motion.div>
    );
  };

  const handlePixabayVideoSelect = (videoUrl: string, thumbnailUrl: string) => {
    const pixabayBackground: BackgroundItem = {
      id: `pixabay-${Date.now()}`,
      name: 'فيديو Pixabay',
      url: videoUrl,
      thumbnail: thumbnailUrl,
      type: 'video',
      category: 'nature',
    };
    onCustomBackgroundChange?.(null);
    onSelect(pixabayBackground);
  };

  const handlePexelsVideoSelect = (videoUrl: string, thumbnailUrl: string) => {
    const pexelsBackground: BackgroundItem = {
      id: `pexels-${Date.now()}`,
      name: 'فيديو Pexels',
      url: videoUrl,
      thumbnail: thumbnailUrl,
      type: 'video',
      category: 'nature',
    };
    onCustomBackgroundChange?.(null);
    onSelect(pexelsBackground);
  };

  const tabDescriptions: Record<string, string> = {
    custom: 'ارفع صورة أو فيديو من جهازك',
    image: 'صور طبيعية عالية الجودة مع تأثير Ken Burns للحركة',
    slideshow: 'صور متغيرة ومتنوعة تتحرك وتتبدل تلقائياً',
    pixabay: 'فيديوهات احترافية من Pixabay',
    pexels: 'فيديوهات احترافية من Pexels',
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="w-full grid grid-cols-5">
          <TabsTrigger value="custom" className="gap-1 text-xs sm:text-sm">
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">رفع</span>
          </TabsTrigger>
          <TabsTrigger value="image" className="gap-1 text-xs sm:text-sm">
            <ImageIcon className="h-4 w-4" />
            <span className="hidden sm:inline">صور</span>
          </TabsTrigger>
          <TabsTrigger value="slideshow" className="gap-1 text-xs sm:text-sm">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">متغيرة</span>
            {!isPremium && <Lock className="h-3 w-3 opacity-60" />}
          </TabsTrigger>
          <TabsTrigger value="pixabay" className="gap-1 text-xs sm:text-sm">
            <Video className="h-4 w-4" />
            <span className="hidden sm:inline">Pixabay</span>
            {!isPremium && <Lock className="h-3 w-3 opacity-60" />}
          </TabsTrigger>
          <TabsTrigger value="pexels" className="gap-1 text-xs sm:text-sm">
            <Film className="h-4 w-4" />
            <span className="hidden sm:inline">Pexels</span>
            {!isPremium && <Lock className="h-3 w-3 opacity-60" />}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="custom" className="mt-4">
          <CustomBackgroundUploader 
            onUpload={(url) => onCustomBackgroundChange?.(url)}
            currentBackground={customBackground}
          />
        </TabsContent>

        <TabsContent value="image" className="mt-4">
          <ScrollArea className="h-[300px] pr-4">
            <div className="grid grid-cols-2 gap-3">
              {backgroundImages.map(renderBackgroundCard)}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="slideshow" className="mt-4">
          {!canUseFeature('slideshowBackgrounds') ? (
            <div className="text-center py-8 space-y-3">
              <Lock className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">الخلفيات المتغيرة متاحة للأعضاء المميزين فقط</p>
              <PremiumBadge showLock />
            </div>
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              <div className="grid grid-cols-2 gap-3">
                {slideshowBackgrounds.map(renderBackgroundCard)}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="pexels" className="mt-4">
          {!canUseFeature('pexelsVideos') ? (
            <div className="text-center py-8 space-y-3">
              <Lock className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">فيديوهات Pixabay متاحة للأعضاء المميزين فقط</p>
              <PremiumBadge showLock />
            </div>
          ) : (
            <PexelsVideoSelector onSelect={handlePexelsVideoSelect} />
          )}
        </TabsContent>
      </Tabs>

      <p className="text-xs text-muted-foreground text-center">{tabDescriptions[activeTab]}</p>
    </div>
  );
}
