import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Sparkles, Frame, Hash, Wand2, Droplets, Type, Save, FolderOpen, Trash2, User } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

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
  reciterNameStyle: 'simple' | 'elegant' | 'badge' | 'tag' | 'glow';
  textShadowStyle: 'soft' | 'strong' | 'none' | 'glow';
  decorationStyle: 'none' | 'sideBorder' | 'separator' | 'both';
  ayahTransition: 'none' | 'fade' | 'slide' | 'zoom' | 'blur' | 'rise' | 'rotate' | 'cinematic' | 'elastic' | 'random';
  particleDensity: 'off' | 'low' | 'medium' | 'high';
  watermarkEnabled: boolean;
  watermarkText: string;
  watermarkPosition: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight' | 'bottomCenter';
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

const reciterNameStyleOptions = [
  { value: 'simple', label: 'بسيط', description: 'نص عادي شفاف' },
  { value: 'elegant', label: 'أنيق', description: 'خط مزخرف بظل' },
  { value: 'badge', label: 'شارة', description: 'داخل شارة مستطيلة' },
  { value: 'tag', label: 'علامة', description: 'تصميم وسم حديث' },
  { value: 'glow', label: 'متوهج', description: 'توهج ذهبي حول النص' },
];

const particleDensityOptions = [
  { value: 'off', label: 'إيقاف', description: 'بدون جزيئات' },
  { value: 'low', label: 'قليل', description: '10 جزيئات' },
  { value: 'medium', label: 'متوسط', description: '20 جزيئة' },
  { value: 'high', label: 'كثيف', description: '40 جزيئة' },
];

const watermarkPositionOptions = [
  { value: 'bottomRight', label: 'أسفل يمين' },
  { value: 'bottomLeft', label: 'أسفل يسار' },
  { value: 'bottomCenter', label: 'أسفل وسط' },
  { value: 'topRight', label: 'أعلى يمين' },
  { value: 'topLeft', label: 'أعلى يسار' },
];

// Template storage
const TEMPLATES_KEY = 'ayah-clip-display-templates';

interface SavedTemplate {
  id: string;
  name: string;
  settings: DisplaySettings;
  createdAt: number;
}

function loadTemplates(): SavedTemplate[] {
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveTemplates(templates: SavedTemplate[]) {
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}

export function DisplaySettingsPanel({ settings, onChange }: DisplaySettingsPanelProps) {
  const [templates, setTemplates] = useState<SavedTemplate[]>(loadTemplates);
  const [templateName, setTemplateName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);

  const updateSetting = <K extends keyof DisplaySettings>(key: K, value: DisplaySettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) return;
    const newTemplate: SavedTemplate = {
      id: `tpl-${Date.now()}`,
      name: templateName.trim(),
      settings: { ...settings },
      createdAt: Date.now(),
    };
    const updated = [...templates, newTemplate];
    setTemplates(updated);
    saveTemplates(updated);
    setTemplateName('');
    setShowSaveInput(false);
    toast.success(`تم حفظ القالب "${newTemplate.name}"`);
  };

  const handleLoadTemplate = (tpl: SavedTemplate) => {
    onChange({ ...tpl.settings });
    toast.success(`تم تطبيق قالب "${tpl.name}"`);
  };

  const handleDeleteTemplate = (id: string) => {
    const updated = templates.filter(t => t.id !== id);
    setTemplates(updated);
    saveTemplates(updated);
    toast.success('تم حذف القالب');
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
        {/* Save / Load Templates */}
        <div className="space-y-3 pb-2 border-b">
          <Label className="text-sm flex items-center gap-2">
            <Save className="h-4 w-4" />
            القوالب المحفوظة
          </Label>
          {templates.length > 0 && (
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {templates.map(tpl => (
                <div key={tpl.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-sm">
                  <button onClick={() => handleLoadTemplate(tpl)} className="flex-1 text-right hover:text-primary transition-colors font-medium truncate">
                    {tpl.name}
                  </button>
                  <button onClick={() => handleDeleteTemplate(tpl.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {showSaveInput ? (
            <div className="flex gap-2">
              <Input
                value={templateName}
                onChange={e => setTemplateName(e.target.value)}
                placeholder="اسم القالب..."
                className="text-sm"
                dir="auto"
                onKeyDown={e => e.key === 'Enter' && handleSaveTemplate()}
              />
              <Button size="sm" onClick={handleSaveTemplate} disabled={!templateName.trim()}>
                <Save className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => setShowSaveInput(true)}>
              <Save className="h-4 w-4" />
              حفظ الإعدادات الحالية كقالب
            </Button>
          )}
        </div>
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

        {/* Reciter Name Style */}
        {settings.showReciterName && (
          <div className="space-y-3 pt-2 border-t">
            <Label className="text-sm flex items-center gap-2">
              <User className="h-4 w-4" />
              شكل اسم القارئ
            </Label>
            <RadioGroup
              value={settings.reciterNameStyle || 'simple'}
              onValueChange={(value) => updateSetting('reciterNameStyle', value as DisplaySettings['reciterNameStyle'])}
              className="grid grid-cols-3 gap-2"
            >
              {reciterNameStyleOptions.map((option) => (
                <div key={option.value} className="relative">
                  <RadioGroupItem value={option.value} id={`reciter-${option.value}`} className="peer sr-only" />
                  <Label
                    htmlFor={`reciter-${option.value}`}
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

        {/* Particle Density */}
        <div className="space-y-3 pt-2 border-t">
          <Label className="text-sm flex items-center gap-2">
            <Droplets className="h-4 w-4" />
            كثافة الجزيئات الذهبية
          </Label>
          <RadioGroup
            value={settings.particleDensity || 'medium'}
            onValueChange={(value) => updateSetting('particleDensity', value as DisplaySettings['particleDensity'])}
            className="grid grid-cols-4 gap-2"
          >
            {particleDensityOptions.map((option) => (
              <div key={option.value} className="relative">
                <RadioGroupItem value={option.value} id={`particle-${option.value}`} className="peer sr-only" />
                <Label
                  htmlFor={`particle-${option.value}`}
                  className="flex flex-col items-center rounded-lg border-2 border-muted p-2 hover:bg-muted/50 peer-data-[state=checked]:border-primary cursor-pointer transition-all text-center"
                >
                  <span className="font-medium text-sm">{option.label}</span>
                  <span className="text-xs text-muted-foreground">{option.description}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Watermark */}
        <div className="space-y-3 pt-2 border-t">
          <div className="flex items-center justify-between">
            <Label htmlFor="watermarkEnabled" className="flex items-center gap-2 cursor-pointer">
              <Type className="h-4 w-4" />
              علامة مائية
            </Label>
            <Switch
              id="watermarkEnabled"
              checked={settings.watermarkEnabled || false}
              onCheckedChange={(checked) => updateSetting('watermarkEnabled', checked)}
            />
          </div>
          {settings.watermarkEnabled && (
            <div className="space-y-3 pl-2">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">نص العلامة المائية</Label>
                <Input
                  value={settings.watermarkText || ''}
                  onChange={(e) => updateSetting('watermarkText', e.target.value)}
                  placeholder="مثال: @username"
                  className="text-sm"
                  dir="auto"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">موضع العلامة</Label>
                <RadioGroup
                  value={settings.watermarkPosition || 'bottomRight'}
                  onValueChange={(value) => updateSetting('watermarkPosition', value as DisplaySettings['watermarkPosition'])}
                  className="grid grid-cols-3 gap-2"
                >
                  {watermarkPositionOptions.map((option) => (
                    <div key={option.value} className="relative">
                      <RadioGroupItem value={option.value} id={`wm-${option.value}`} className="peer sr-only" />
                      <Label
                        htmlFor={`wm-${option.value}`}
                        className="flex items-center justify-center rounded-lg border-2 border-muted p-2 hover:bg-muted/50 peer-data-[state=checked]:border-primary cursor-pointer transition-all text-center text-xs"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          )}
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
