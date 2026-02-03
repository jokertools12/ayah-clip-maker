import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Play, Image as ImageIcon, Sparkles } from 'lucide-react';
import { BackgroundItem, backgroundVideos, backgroundImages, animatedBackgrounds } from '@/data/backgrounds';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BackgroundSelectorProps {
  selectedBackground: BackgroundItem | null;
  onSelect: (background: BackgroundItem) => void;
}

export function BackgroundSelector({ selectedBackground, onSelect }: BackgroundSelectorProps) {
  const [activeTab, setActiveTab] = useState<'video' | 'image' | 'animated'>('image');

  const renderBackgroundCard = (bg: BackgroundItem) => {
    const isSelected = selectedBackground?.id === bg.id;

    return (
      <motion.div
        key={bg.id}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSelect(bg)}
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
            {bg.type === 'video' ? (
              <Play className="h-3 w-3" />
            ) : bg.type === 'animated' ? (
              <Sparkles className="h-3 w-3" />
            ) : (
              <ImageIcon className="h-3 w-3" />
            )}
          </div>

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

  const tabDescriptions = {
    image: 'صور طبيعية عالية الجودة مع تأثير Ken Burns للحركة',
    animated: 'خلفيات متحركة بتأثيرات بصرية مميزة',
    video: 'مقاطع فيديو طبيعية متحركة',
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'video' | 'image' | 'animated')}>
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="image" className="gap-1 text-xs sm:text-sm">
            <ImageIcon className="h-4 w-4" />
            <span className="hidden sm:inline">صور</span>
          </TabsTrigger>
          <TabsTrigger value="animated" className="gap-1 text-xs sm:text-sm">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">متحركة</span>
          </TabsTrigger>
          <TabsTrigger value="video" className="gap-1 text-xs sm:text-sm">
            <Play className="h-4 w-4" />
            <span className="hidden sm:inline">فيديو</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="image" className="mt-4">
          <ScrollArea className="h-[300px] pr-4">
            <div className="grid grid-cols-2 gap-3">
              {backgroundImages.map(renderBackgroundCard)}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="animated" className="mt-4">
          <ScrollArea className="h-[300px] pr-4">
            <div className="grid grid-cols-2 gap-3">
              {animatedBackgrounds.map(renderBackgroundCard)}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="video" className="mt-4">
          <ScrollArea className="h-[300px] pr-4">
            <div className="grid grid-cols-2 gap-3">
              {backgroundVideos.map(renderBackgroundCard)}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <p className="text-xs text-muted-foreground text-center">
        {tabDescriptions[activeTab]}
      </p>
    </div>
  );
}
