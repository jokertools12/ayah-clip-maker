import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Sparkles, Frame, Hash, Wand2 } from 'lucide-react';

export interface DisplaySettings {
  showSurahName: boolean;
  showReciterName: boolean;
  showAyahText: boolean;
  showAyahNumber: boolean;
  highlightStyle: 'none' | 'solid' | 'glow' | 'underline' | 'shadow';
  frameStyle: 'none' | 'simple' | 'ornate' | 'golden' | 'geometric' | 'modern' | 'minimal';
  ayahNumberStyle: 'circle' | 'star' | 'diamond' | 'octagon' | 'flower' | 'square' | 'hexagon';
  surahNamePosition: 'top' | 'bottom' | 'topLeft' | 'topRight';
  surahNameStyle: 'classic' | 'banner' | 'calligraphy' | 'circle' | 'diamond' | 'ribbon';
  textShadowStyle: 'soft' | 'strong' | 'none' | 'glow';
  decorationStyle: 'none' | 'sideBorder' | 'separator' | 'both';
  ayahTransition: 'none' | 'fade' | 'slide' | 'zoom' | 'blur' | 'rise' | 'rotate' | 'cinematic' | 'elastic' | 'random';
}

interface DisplaySettingsPanelProps {
  settings: DisplaySettings;
  onChange: (settings: DisplaySettings) => void;
}

const highlightOptions = [
  { value: 'none', label: 'بدون تمييز', description: 'لا يتم تمييز الكلمات' },
  { value: 'solid', label: 'تظليل مملوء', description: 'خلفية ملونة للكلمة' },
  { value: 'glow', label: 'توهج ذهبي', description: 'إضاءة حول الكلمة' },
  { value: 'underline', label: 'خط سفلي', description: 'خط تحت الكلمة' },
  { value: 'shadow', label: 'ظل عميق', description: 'ظل ناعم محيط' },
];

const frameOptions = [
  { value: 'none', label: 'بدون إطار', description: 'نص فقط' },
  { value: 'simple', label: 'إطار أنيق', description: 'حدود رفيعة' },
  { value: 'ornate', label: 'إطار مزخرف', description: 'زخرفة إسلامية' },
  { value: 'golden', label: 'إطار ذهبي', description: 'توهج ذهبي' },
  { value: 'geometric', label: 'إطار هندسي', description: 'أنماط هندسية' },
  { value: 'modern', label: 'إطار عصري', description: 'خطوط ناعمة' },
  { value: 'minimal', label: 'إطار بسيط', description: 'حد واحد رفيع' },
];

const ayahNumberOptions = [
  { value: 'circle', label: 'دائرة', description: '◯' },
  { value: 'star', label: 'نجمة', description: '✦' },
  { value: 'diamond', label: 'معين', description: '◇' },
  { value: 'octagon', label: 'مثمن', description: '⬡' },
  { value: 'flower', label: 'زهرة', description: '✿' },
  { value: 'square', label: 'مربع', description: '◻' },
  { value: 'hexagon', label: 'سداسي', description: '⬢' },
];

const surahPositionOptions = [
  { value: 'top', label: 'أعلى المنتصف', description: 'مركز الأعلى' },
  { value: 'bottom', label: 'أسفل', description: 'مركز الأسفل' },
  { value: 'topLeft', label: 'أعلى يسار', description: 'الزاوية العليا' },
  { value: 'topRight', label: 'أعلى يمين', description: 'الزاوية اليمنى' },
];

const textShadowOptions = [
  { value: 'soft', label: 'ظل ناعم', description: 'ظل خفيف' },
  { value: 'strong', label: 'ظل قوي', description: 'ظل عميق' },
  { value: 'glow', label: 'توهج', description: 'إضاءة محيطة' },
  { value: 'none', label: 'بدون ظل', description: 'نص مسطح' },
];

const decorationOptions = [
  { value: 'none', label: 'نظيف', description: 'بدون زخرفة' },
  { value: 'sideBorder', label: 'زخارف جانبية', description: 'رموز يمين/يسار' },
  { value: 'separator', label: 'فاصل علوي', description: 'خط/موجة فوق الآيات' },
  { value: 'both', label: 'كلاهما', description: 'جانبية + فاصل' },
];

const transitionOptions = [
  { value: 'none', label: 'بدون انتقال', description: 'ظهور مباشر' },
  { value: 'fade', label: 'تلاشي', description: 'ظهور تدريجي' },
  { value: 'slide', label: 'انزلاق', description: 'دخول من الأسفل' },
  { value: 'zoom', label: 'تكبير', description: 'تكبير للداخل' },
  { value: 'blur', label: 'ضبابي', description: 'إزالة الضبابية' },
  { value: 'rise', label: 'صعود ناعم', description: 'ارتفاع سينمائي' },
  { value: 'rotate', label: 'دوران خفيف', description: 'ميل احترافي' },
  { value: 'cinematic', label: 'سينمائي', description: 'دخول درامي ناعم' },
  { value: 'elastic', label: 'مرن', description: 'ارتداد أنيق' },
  { value: 'random', label: '🎲 عشوائي', description: 'تأثير مختلف لكل آية' },
];

const surahNameStyleOptions = [
  { value: 'classic', label: 'كلاسيكي', description: 'شارة مستطيلة مزخرفة' },
  { value: 'banner', label: 'لافتة', description: 'شريط عريض متدرج' },
  { value: 'calligraphy', label: 'خطي', description: 'نص مزخرف فقط' },
  { value: 'circle', label: 'دائرة', description: 'داخل دائرة ذهبية' },
  { value: 'diamond', label: 'معين', description: 'شكل ماسي أنيق' },
  { value: 'ribbon', label: 'شريط', description: 'شريط ذهبي ملفوف' },
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

        {/* Frame Style */}
        <div className="space-y-3 pt-2 border-t">
          <Label className="text-sm flex items-center gap-2">
            <Frame className="h-4 w-4" />
            إطار النص
            <span className="text-xs text-muted-foreground mr-auto">(الافتراضي: بدون)</span>
          </Label>
          <RadioGroup
            value={settings.frameStyle}
            onValueChange={(value) => updateSetting('frameStyle', value as DisplaySettings['frameStyle'])}
            className="grid grid-cols-2 gap-2"
          >
            {frameOptions.map((option) => (
              <div key={option.value} className="relative">
                <RadioGroupItem value={option.value} id={`frame-${option.value}`} className="peer sr-only" />
                <Label
                  htmlFor={`frame-${option.value}`}
                  className="flex flex-col items-center rounded-lg border-2 border-muted p-2 hover:bg-muted/50 peer-data-[state=checked]:border-primary cursor-pointer transition-all text-center"
                >
                  <span className="font-medium text-sm">{option.label}</span>
                  <span className="text-xs text-muted-foreground">{option.description}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Ayah Number Style */}
        {settings.showAyahNumber && (
          <div className="space-y-3 pt-2 border-t">
            <Label className="text-sm flex items-center gap-2">
              <Hash className="h-4 w-4" />
              شكل رقم الآية
            </Label>
            <RadioGroup
              value={settings.ayahNumberStyle}
              onValueChange={(value) => updateSetting('ayahNumberStyle', value as DisplaySettings['ayahNumberStyle'])}
              className="flex flex-wrap gap-2"
            >
              {ayahNumberOptions.map((option) => (
                <div key={option.value} className="relative">
                  <RadioGroupItem value={option.value} id={`ayahNum-${option.value}`} className="peer sr-only" />
                  <Label
                    htmlFor={`ayahNum-${option.value}`}
                    className="flex flex-col items-center rounded-lg border-2 border-muted px-3 py-2 hover:bg-muted/50 peer-data-[state=checked]:border-primary cursor-pointer transition-all"
                  >
                    <span className="text-2xl text-primary">{option.description}</span>
                    <span className="text-xs">{option.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}

        {/* Surah Name Position */}
        {settings.showSurahName && (
          <div className="space-y-3 pt-2 border-t">
            <Label className="text-sm flex items-center gap-2">
              موضع اسم السورة
            </Label>
            <RadioGroup
              value={settings.surahNamePosition || 'top'}
              onValueChange={(value) => updateSetting('surahNamePosition', value as DisplaySettings['surahNamePosition'])}
              className="grid grid-cols-2 gap-2"
            >
              {surahPositionOptions.map((option) => (
                <div key={option.value} className="relative">
                  <RadioGroupItem value={option.value} id={`pos-${option.value}`} className="peer sr-only" />
                  <Label
                    htmlFor={`pos-${option.value}`}
                    className="flex flex-col items-center rounded-lg border-2 border-muted p-2 hover:bg-muted/50 peer-data-[state=checked]:border-primary cursor-pointer transition-all text-center"
                  >
                    <span className="font-medium text-sm">{option.label}</span>
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}

        {/* Surah Name Style */}
        {settings.showSurahName && (
          <div className="space-y-3 pt-2 border-t">
            <Label className="text-sm flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              شكل اسم السورة
            </Label>
            <RadioGroup
              value={settings.surahNameStyle || 'classic'}
              onValueChange={(value) => updateSetting('surahNameStyle', value as DisplaySettings['surahNameStyle'])}
              className="grid grid-cols-3 gap-2"
            >
              {surahNameStyleOptions.map((option) => (
                <div key={option.value} className="relative">
                  <RadioGroupItem value={option.value} id={`sname-${option.value}`} className="peer sr-only" />
                  <Label
                    htmlFor={`sname-${option.value}`}
                    className="flex flex-col items-center rounded-lg border-2 border-muted p-2 hover:bg-muted/50 peer-data-[state=checked]:border-primary cursor-pointer transition-all text-center"
                  >
                    <span className="font-medium text-sm">{option.label}</span>
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}

        {/* Text Shadow Style */}
        <div className="space-y-3 pt-2 border-t">
          <Label className="text-sm flex items-center gap-2">
            نمط ظل النص
          </Label>
          <RadioGroup
            value={settings.textShadowStyle || 'soft'}
            onValueChange={(value) => updateSetting('textShadowStyle', value as DisplaySettings['textShadowStyle'])}
            className="grid grid-cols-2 gap-2"
          >
            {textShadowOptions.map((option) => (
              <div key={option.value} className="relative">
                <RadioGroupItem value={option.value} id={`shadow-${option.value}`} className="peer sr-only" />
                <Label
                  htmlFor={`shadow-${option.value}`}
                  className="flex flex-col items-center rounded-lg border-2 border-muted p-2 hover:bg-muted/50 peer-data-[state=checked]:border-primary cursor-pointer transition-all text-center"
                >
                  <span className="font-medium text-sm">{option.label}</span>
                  <span className="text-xs text-muted-foreground">{option.description}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Decoration Style */}
        <div className="space-y-3 pt-2 border-t">
          <Label className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            زخرفة حول الآيات
          </Label>
          <RadioGroup
            value={settings.decorationStyle || 'none'}
            onValueChange={(value) => updateSetting('decorationStyle', value as DisplaySettings['decorationStyle'])}
            className="grid grid-cols-2 gap-2"
          >
            {decorationOptions.map((option) => (
              <div key={option.value} className="relative">
                <RadioGroupItem value={option.value} id={`deco-${option.value}`} className="peer sr-only" />
                <Label
                  htmlFor={`deco-${option.value}`}
                  className="flex flex-col items-center rounded-lg border-2 border-muted p-2 hover:bg-muted/50 peer-data-[state=checked]:border-primary cursor-pointer transition-all text-center"
                >
                  <span className="font-medium text-sm">{option.label}</span>
                  <span className="text-xs text-muted-foreground">{option.description}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Ayah Transition */}
        <div className="space-y-3 pt-2 border-t">
          <Label className="text-sm flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            انتقال بين الآيات
          </Label>
          <RadioGroup
            value={settings.ayahTransition || 'fade'}
            onValueChange={(value) => updateSetting('ayahTransition', value as DisplaySettings['ayahTransition'])}
            className="grid grid-cols-3 gap-2"
          >
            {transitionOptions.map((option) => (
              <div key={option.value} className="relative">
                <RadioGroupItem value={option.value} id={`trans-${option.value}`} className="peer sr-only" />
                <Label
                  htmlFor={`trans-${option.value}`}
                  className="flex flex-col items-center rounded-lg border-2 border-muted p-2 hover:bg-muted/50 peer-data-[state=checked]:border-primary cursor-pointer transition-all text-center"
                >
                  <span className="font-medium text-sm">{option.label}</span>
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
