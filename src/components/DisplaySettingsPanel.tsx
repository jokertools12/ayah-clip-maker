import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Sparkles } from 'lucide-react';

export interface DisplaySettings {
  showSurahName: boolean;
  showReciterName: boolean;
  showAyahText: boolean;
  showAyahNumber: boolean;
  highlightStyle: 'solid' | 'glow' | 'underline';
}

interface DisplaySettingsPanelProps {
  settings: DisplaySettings;
  onChange: (settings: DisplaySettings) => void;
}

const highlightOptions = [
  { value: 'solid', label: 'تظليل مملوء', description: 'خلفية ملونة للكلمة' },
  { value: 'glow', label: 'توهج ذهبي', description: 'إضاءة حول الكلمة' },
  { value: 'underline', label: 'خط سفلي', description: 'خط تحت الكلمة' },
];

export function DisplaySettingsPanel({ settings, onChange }: DisplaySettingsPanelProps) {
  const updateSetting = <K extends keyof DisplaySettings>(key: K, value: DisplaySettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Eye className="h-5 w-5" />
          إعدادات العرض
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Visibility Toggles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="showSurahName" className="flex items-center gap-2 cursor-pointer">
              {settings.showSurahName ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              إظهار اسم السورة
            </Label>
            <Switch
              id="showSurahName"
              checked={settings.showSurahName}
              onCheckedChange={(checked) => updateSetting('showSurahName', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="showReciterName" className="flex items-center gap-2 cursor-pointer">
              {settings.showReciterName ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              إظهار اسم القارئ
            </Label>
            <Switch
              id="showReciterName"
              checked={settings.showReciterName}
              onCheckedChange={(checked) => updateSetting('showReciterName', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="showAyahText" className="flex items-center gap-2 cursor-pointer">
              {settings.showAyahText ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              إظهار نص الآية
            </Label>
            <Switch
              id="showAyahText"
              checked={settings.showAyahText}
              onCheckedChange={(checked) => updateSetting('showAyahText', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="showAyahNumber" className="flex items-center gap-2 cursor-pointer">
              {settings.showAyahNumber ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              إظهار رقم الآية
            </Label>
            <Switch
              id="showAyahNumber"
              checked={settings.showAyahNumber}
              onCheckedChange={(checked) => updateSetting('showAyahNumber', checked)}
            />
          </div>
        </div>

        {/* Highlight Style */}
        <div className="space-y-3 pt-2 border-t">
          <Label className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            نمط تمييز الكلمات
          </Label>
          <RadioGroup
            value={settings.highlightStyle}
            onValueChange={(value) => updateSetting('highlightStyle', value as DisplaySettings['highlightStyle'])}
            className="space-y-2"
          >
            {highlightOptions.map((option) => (
              <div key={option.value} className="relative">
                <RadioGroupItem value={option.value} id={`highlight-${option.value}`} className="peer sr-only" />
                <Label
                  htmlFor={`highlight-${option.value}`}
                  className="flex flex-col rounded-lg border-2 border-muted p-3 hover:bg-muted/50 peer-data-[state=checked]:border-primary cursor-pointer transition-all"
                >
                  <span className="font-medium">{option.label}</span>
                  <span className="text-xs text-muted-foreground">{option.description}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}