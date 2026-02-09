import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Download, FileVideo, Image, Settings2, Gauge, Loader2 } from 'lucide-react';
import { ExportQuality, QUALITY_PRESETS } from '@/hooks/useVideoRecorder';

export type ExportFormat = 'mp4' | 'webm' | 'gif';

export interface ExportSettings {
  format: ExportFormat;
  quality: ExportQuality;
  motionSpeed: number;
}

interface ExportFormatSelectorProps {
  settings: ExportSettings;
  onChange: (settings: ExportSettings) => void;
  onExport: (format: ExportFormat) => void;
  videoBlob: Blob | null;
  mp4Blob: Blob | null;
  isConverting: boolean;
  isRecording: boolean;
}

const FORMAT_OPTIONS: { id: ExportFormat; label: string; description: string; icon: typeof FileVideo }[] = [
  { id: 'mp4', label: 'MP4', description: 'الأكثر توافقاً - للمشاركة على كل المنصات', icon: FileVideo },
  { id: 'webm', label: 'WebM', description: 'حجم أصغر - للويب والمتصفحات', icon: FileVideo },
  { id: 'gif', label: 'GIF', description: 'صورة متحركة - بدون صوت', icon: Image },
];

export function ExportFormatSelector({
  settings,
  onChange,
  onExport,
  videoBlob,
  mp4Blob,
  isConverting,
  isRecording,
}: ExportFormatSelectorProps) {
  const updateSetting = <K extends keyof ExportSettings>(key: K, value: ExportSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  const canExport = (format: ExportFormat) => {
    if (isRecording || isConverting) return false;
    if (format === 'webm') return !!videoBlob;
    if (format === 'mp4') return !!mp4Blob;
    if (format === 'gif') return !!videoBlob; // GIF is derived from WebM
    return false;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          إعدادات التصدير
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Format Selection */}
        <div className="space-y-3">
          <Label className="text-sm">صيغة الملف</Label>
          <RadioGroup
            value={settings.format}
            onValueChange={(value) => updateSetting('format', value as ExportFormat)}
            className="space-y-2"
          >
            {FORMAT_OPTIONS.map((option) => (
              <div key={option.id} className="relative">
                <RadioGroupItem value={option.id} id={`format-${option.id}`} className="peer sr-only" />
                <Label
                  htmlFor={`format-${option.id}`}
                  className="flex items-center gap-3 rounded-lg border-2 border-muted p-3 hover:bg-muted/50 peer-data-[state=checked]:border-primary cursor-pointer transition-all"
                >
                  <option.icon className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <span className="font-medium">{option.label}</span>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                  {canExport(option.id) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onExport(option.id);
                      }}
                      className="gap-1"
                    >
                      <Download className="h-4 w-4" />
                      تحميل
                    </Button>
                  )}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Quality Selection */}
        <div className="space-y-3 pt-2 border-t">
          <Label className="text-sm">جودة الفيديو</Label>
          <RadioGroup
            value={settings.quality}
            onValueChange={(value) => updateSetting('quality', value as ExportQuality)}
            className="grid grid-cols-2 gap-2"
          >
            {(Object.entries(QUALITY_PRESETS) as [ExportQuality, typeof QUALITY_PRESETS[ExportQuality]][]).map(
              ([key, preset]) => (
                <div key={key} className="relative">
                  <RadioGroupItem value={key} id={`quality-${key}`} className="peer sr-only" />
                  <Label
                    htmlFor={`quality-${key}`}
                    className="flex flex-col items-center rounded-lg border-2 border-muted p-3 hover:bg-muted/50 peer-data-[state=checked]:border-primary cursor-pointer transition-all text-center"
                  >
                    <span className="font-medium text-sm">{preset.label}</span>
                    <span className="text-xs text-muted-foreground">{preset.resolution}</span>
                  </Label>
                </div>
              )
            )}
          </RadioGroup>
        </div>

        {/* Motion Speed */}
        <div className="space-y-3 pt-2 border-t">
          <Label className="text-sm flex items-center gap-2">
            <Gauge className="h-4 w-4" />
            سرعة حركة الخلفية
          </Label>
          <Slider
            value={[settings.motionSpeed]}
            onValueChange={([value]) => updateSetting('motionSpeed', value)}
            min={1}
            max={10}
            step={0.5}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>بطيء (x1)</span>
            <span className="font-medium text-primary">x{settings.motionSpeed}</span>
            <span>سريع (x10)</span>
          </div>
        </div>

        {/* Status */}
        {isRecording && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 text-primary">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">جاري التسجيل...</span>
          </div>
        )}
        {isConverting && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary text-secondary-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">جاري تحويل الفيديو...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
