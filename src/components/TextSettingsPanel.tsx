import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Type, Palette, Layers } from 'lucide-react';

export interface TextSettings {
  fontSize: number;
  fontFamily: string;
  textColor: string;
  shadowIntensity: number;
  overlayOpacity: number;
}

interface TextSettingsPanelProps {
  settings: TextSettings;
  onChange: (settings: TextSettings) => void;
}

const fontOptions = [
  { value: '"Noto Naskh Arabic", serif', label: 'نسخ' },
  { value: '"Amiri", serif', label: 'أميري' },
  { value: '"Amiri Quran", serif', label: 'أميري قرآن' },
  { value: '"Scheherazade New", serif', label: 'شهرزاد' },
  { value: '"Aref Ruqaa", serif', label: 'رقعة' },
  { value: '"Reem Kufi", sans-serif', label: 'ريم كوفي' },
  { value: '"Lateef", serif', label: 'لطيف' },
  { value: '"Cairo", sans-serif', label: 'القاهرة' },
  { value: '"El Messiri", sans-serif', label: 'المسيري' },
  { value: '"Tajawal", sans-serif', label: 'تجول' },
  { value: '"Mada", sans-serif', label: 'مدى' },
];

const colorOptions = [
  { value: '#ffffff', label: 'أبيض', className: 'bg-white border border-gray-300' },
  { value: '#fef3c7', label: 'ذهبي', className: 'bg-amber-100' },
  { value: '#e0f2fe', label: 'سماوي', className: 'bg-sky-100' },
  { value: '#dcfce7', label: 'أخضر', className: 'bg-green-100' },
  { value: '#fce7f3', label: 'وردي', className: 'bg-pink-100' },
];

export function TextSettingsPanel({ settings, onChange }: TextSettingsPanelProps) {
  const updateSetting = <K extends keyof TextSettings>(key: K, value: TextSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Type className="h-5 w-5" />
          تخصيص النص
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Font Size */}
        <div className="space-y-3">
          <Label className="text-sm">حجم الخط</Label>
          <Slider
            value={[settings.fontSize]}
            onValueChange={([value]) => updateSetting('fontSize', value)}
            min={18}
            max={48}
            step={2}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>صغير</span>
            <span>{settings.fontSize}px</span>
            <span>كبير</span>
          </div>
        </div>

        {/* Font Family */}
        <div className="space-y-3">
          <Label className="text-sm">نوع الخط</Label>
          <RadioGroup
            value={settings.fontFamily}
            onValueChange={(value) => updateSetting('fontFamily', value)}
            className="grid grid-cols-3 gap-2"
          >
            {fontOptions.map((font) => (
              <div key={font.value} className="relative">
                <RadioGroupItem value={font.value} id={font.value} className="peer sr-only" />
                <Label
                  htmlFor={font.value}
                  className="flex items-center justify-center rounded-lg border-2 border-muted p-3 hover:bg-muted/50 peer-data-[state=checked]:border-primary cursor-pointer transition-all"
                  style={{ fontFamily: font.value }}
                >
                  {font.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Text Color */}
        <div className="space-y-3">
          <Label className="text-sm flex items-center gap-2">
            <Palette className="h-4 w-4" />
            لون النص
          </Label>
          <RadioGroup
            value={settings.textColor}
            onValueChange={(value) => updateSetting('textColor', value)}
            className="flex gap-2 flex-wrap"
          >
            {colorOptions.map((color) => (
              <div key={color.value} className="relative">
                <RadioGroupItem value={color.value} id={`color-${color.value}`} className="peer sr-only" />
                <Label
                  htmlFor={`color-${color.value}`}
                  className={`flex h-8 w-8 rounded-full cursor-pointer ring-offset-2 peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-primary transition-all ${color.className}`}
                  title={color.label}
                />
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Shadow Intensity */}
        <div className="space-y-3">
          <Label className="text-sm flex items-center gap-2">
            <Layers className="h-4 w-4" />
            كثافة الظل
          </Label>
          <Slider
            value={[settings.shadowIntensity]}
            onValueChange={([value]) => updateSetting('shadowIntensity', value)}
            min={0}
            max={1}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>بدون</span>
            <span>قوي</span>
          </div>
        </div>

        {/* Overlay Opacity */}
        <div className="space-y-3">
          <Label className="text-sm">تعتيم الخلفية</Label>
          <Slider
            value={[settings.overlayOpacity]}
            onValueChange={([value]) => updateSetting('overlayOpacity', value)}
            min={0}
            max={0.7}
            step={0.05}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>فاتح</span>
            <span>{Math.round(settings.overlayOpacity * 100)}%</span>
            <span>معتم</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
