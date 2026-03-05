import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { VIDEO_PRESETS, VideoPreset } from '@/data/videoPresets';
import { PremiumBadge } from '@/components/PremiumBadge';
import { useSubscription } from '@/hooks/useSubscription';
import { Palette, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PresetSelectorProps {
  selectedPresetId?: string;
  onSelectPreset: (preset: VideoPreset) => void;
}

export function PresetSelector({ selectedPresetId, onSelectPreset }: PresetSelectorProps) {
  const { isPremium, canUseFeature } = useSubscription();
  const locked = !canUseFeature('presets');

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Palette className="h-5 w-5" />
          قوالب جاهزة
          {locked && <Lock className="h-4 w-4 text-muted-foreground" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        {locked ? (
          <div className="text-center py-8 space-y-3">
            <Lock className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">القوالب الجاهزة متاحة للأعضاء المميزين فقط</p>
            <PremiumBadge showLock />
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-2">
            <div className="grid grid-cols-2 gap-2">
              {VIDEO_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => onSelectPreset(preset)}
                  className={cn(
                    'relative rounded-lg border-2 p-3 text-right transition-all focus:outline-none focus:ring-2 focus:ring-ring',
                    selectedPresetId === preset.id
                      ? 'border-primary bg-primary/10'
                      : 'border-muted hover:border-muted-foreground/50 hover:bg-muted/50'
                  )}
                >
                  <div
                    className="h-12 w-full rounded-md mb-2"
                    style={{ background: preset.previewGradient || '#333' }}
                  />
                  <p className="text-sm font-medium leading-tight">{preset.name}</p>
                  <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">{preset.description}</p>
                  {preset.recommendedAspectRatio === '16:9' && (
                    <Badge variant="secondary" className="absolute top-2 left-2 text-[9px] px-1.5 py-0.5">
                      16:9
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
