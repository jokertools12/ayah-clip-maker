import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Eye, EyeOff, Sparkles, Frame, Hash, Wand2, Type, Save, Trash2, User, Lock, Settings2, Palette, LayoutGrid, Film, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { PremiumBadge } from '@/components/PremiumBadge';

export interface DisplaySettings {
  showSurahName: boolean;
  showReciterName: boolean;
  showAyahText: boolean;
  showAyahNumber: boolean;
  highlightStyle: 'none' | 'solid' | 'glow' | 'underline' | 'shadow';
  frameStyle: 'none' | 'simple' | 'ornate' | 'golden' | 'geometric' | 'modern' | 'minimal';
  ayahNumberStyle: 'circle' | 'star' | 'diamond' | 'octagon' | 'flower' | 'square' | 'hexagon';
  ayahNumberColor: 'gold' | 'white' | 'silver' | 'emerald' | 'royal';
  verseDisplayMode: 'full' | 'twoWords' | 'threeTwo' | 'wordByWord';
  surahNamePosition: 'top' | 'bottom' | 'topLeft' | 'topRight';
  surahNameStyle: 'classic' | 'banner' | 'calligraphy' | 'circle' | 'diamond' | 'ribbon';
  reciterNameStyle: 'simple' | 'elegant' | 'badge' | 'tag' | 'glow';
  textShadowStyle: 'soft' | 'strong' | 'none' | 'glow';
  ayahTransition: 'none' | 'fade' | 'slide' | 'zoom' | 'blur' | 'rise' | 'rotate' | 'cinematic' | 'elastic' | 'random';
  watermarkEnabled: boolean;
  watermarkText: string;
  watermarkPosition: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight' | 'bottomCenter';
  glowStyle: 'none' | 'golden' | 'soft' | 'neon' | 'pulse';
  lyricsDisplayStyle: 'scroll' | 'single' | 'karaoke' | 'fade';
  slideshowTransition: 'crossfade' | 'slideLeft' | 'slideRight' | 'slideUp' | 'zoomThrough' | 'wipe' | 'mixed';
  wordScaleEffect: boolean;
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

const ayahNumberColorOptions = [
  { value: 'gold', label: 'ذهبي', description: '✨', color: '#D4AF37' },
  { value: 'white', label: 'أبيض', description: '⬜', color: '#FFFFFF' },
  { value: 'silver', label: 'فضي', description: '🩶', color: '#C0C0C0' },
  { value: 'emerald', label: 'زمردي', description: '💚', color: '#50C878' },
  { value: 'royal', label: 'ملكي', description: '💜', color: '#7B68EE' },
];

const verseDisplayModeOptions = [
  { value: 'full', label: 'كامل', description: 'عرض الآية كاملة' },
  { value: 'twoWords', label: 'كلمتين', description: 'عرض كلمتين كلمتين' },
  { value: 'threeTwo', label: 'ثلاث ثم اثنتين', description: 'تبديل 3 و 2 كلمات' },
  { value: 'wordByWord', label: 'كلمة كلمة', description: 'عرض كلمة واحدة' },
];

const glowStyleOptions = [
  { value: 'none', label: 'بدون توهج', description: 'نص عادي' },
  { value: 'golden', label: 'ذهبي', description: 'توهج ذهبي كلاسيكي' },
  { value: 'soft', label: 'ناعم', description: 'إضاءة بيضاء هادئة' },
  { value: 'neon', label: 'نيون', description: 'توهج سماوي ساطع' },
  { value: 'pulse', label: 'نابض', description: 'توهج متموج' },
];

const lyricsDisplayOptions = [
  { value: 'scroll', label: 'تمرير', description: 'عرض عدة أسطر مع تمرير' },
  { value: 'single', label: 'سطر واحد', description: 'عرض السطر الحالي فقط كبير' },
  { value: 'karaoke', label: 'كاريوكي', description: '3 أسطر مع تمييز الحالي' },
  { value: 'fade', label: 'تلاشي', description: 'سطر واحد مع تأثير ظهور' },
];

const slideshowTransitionOptions = [
  { value: 'crossfade', label: 'تلاشي سلس', description: 'انتقال ناعم وهادئ' },
  { value: 'slideLeft', label: 'انزلاق يسار', description: 'دخول من اليمين' },
  { value: 'slideRight', label: 'انزلاق يمين', description: 'دخول من اليسار' },
  { value: 'slideUp', label: 'انزلاق للأعلى', description: 'دخول من الأسفل' },
  { value: 'zoomThrough', label: 'تكبير عابر', description: 'تكبير درامي سينمائي' },
  { value: 'wipe', label: 'مسح أفقي', description: 'كشف تدريجي أفقي' },
  { value: 'mixed', label: '🎲 متنوع', description: 'انتقال مختلف لكل صورة' },
];

const watermarkPositionOptions = [
  { value: 'bottomRight', label: 'أسفل يمين' },
  { value: 'bottomLeft', label: 'أسفل يسار' },
  { value: 'bottomCenter', label: 'أسفل وسط' },
  { value: 'topRight', label: 'أعلى يمين' },
  { value: 'topLeft', label: 'أعلى يسار' },
];

const performanceModeOptions = [
  { value: 'economy', label: '🔋 اقتصادي', description: 'أداء أخف وأسرع' },
  { value: 'balanced', label: '⚖️ متوازن', description: 'توازن جودة وأداء' },
  { value: 'pro', label: '🎬 احترافي', description: 'أعلى جودة بصرية' },
];

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

// Reusable radio grid component
function RadioOptionGrid({ options, value, onChange, idPrefix, columns = 2 }: {
  options: { value: string; label: string; description: string; color?: string }[];
  value: string;
  onChange: (val: string) => void;
  idPrefix: string;
  columns?: number;
}) {
  const gridCols = columns === 3 ? 'grid-cols-3' : columns === 4 ? 'grid-cols-4' : 'grid-cols-2';
  return (
    <RadioGroup value={value} onValueChange={onChange} className={`grid ${gridCols} gap-2`}>
      {options.map((option) => (
        <div key={option.value} className="relative">
          <RadioGroupItem value={option.value} id={`${idPrefix}-${option.value}`} className="peer sr-only" />
          <Label
            htmlFor={`${idPrefix}-${option.value}`}
            className="flex flex-col items-center rounded-lg border-2 border-muted p-2 hover:bg-muted/50 peer-data-[state=checked]:border-primary cursor-pointer transition-all text-center"
          >
            {option.color ? (
              <span className="text-lg" style={{ color: option.color }}>{option.description}</span>
            ) : (
              <span className="font-medium text-sm">{option.label}</span>
            )}
            {option.color ? (
              <span className="text-xs">{option.label}</span>
            ) : (
              <span className="text-xs text-muted-foreground">{option.description}</span>
            )}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
}

export function DisplaySettingsPanel({ settings, onChange }: DisplaySettingsPanelProps) {
  const { isPremium } = useSubscription();
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
          <Settings2 className="h-5 w-5" />
          إعدادات العرض
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Accordion type="multiple" defaultValue={['display-elements', 'verse-display']} className="w-full">

          {/* ═══ Section 1: Display Elements ═══ */}
          <AccordionItem value="display-elements" className="border-b px-4">
            <AccordionTrigger className="text-sm font-semibold gap-2">
              <span className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                عناصر العرض
              </span>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pb-4">
              {/* Visibility Toggles */}
              {[
                { key: 'showSurahName' as const, label: 'إظهار اسم السورة' },
                { key: 'showReciterName' as const, label: 'إظهار اسم القارئ' },
                { key: 'showAyahText' as const, label: 'إظهار نص الآية' },
                { key: 'showAyahNumber' as const, label: 'إظهار رقم الآية' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={key} className="flex items-center gap-2 cursor-pointer">
                    {settings[key] ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                    {label}
                  </Label>
                  <Switch
                    id={key}
                    checked={settings[key]}
                    onCheckedChange={(checked) => updateSetting(key, checked)}
                  />
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>

          {/* ═══ Section 2: Text Styling ═══ */}
          <AccordionItem value="text-styling" className="border-b px-4">
            <AccordionTrigger className="text-sm font-semibold gap-2">
              <span className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                نمط النصوص
              </span>
            </AccordionTrigger>
            <AccordionContent className="space-y-5 pb-4">
              {/* Surah Name Style */}
              {settings.showSurahName && (
                <>
                  <div className="space-y-3">
                    <Label className="text-sm flex items-center gap-2">
                      <Wand2 className="h-4 w-4" />
                      شكل اسم السورة
                    </Label>
                    <RadioOptionGrid
                      options={surahNameStyleOptions}
                      value={settings.surahNameStyle || 'classic'}
                      onChange={(v) => updateSetting('surahNameStyle', v as DisplaySettings['surahNameStyle'])}
                      idPrefix="sname"
                      columns={3}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm">موضع اسم السورة</Label>
                    <RadioOptionGrid
                      options={surahPositionOptions}
                      value={settings.surahNamePosition || 'top'}
                      onChange={(v) => updateSetting('surahNamePosition', v as DisplaySettings['surahNamePosition'])}
                      idPrefix="pos"
                    />
                  </div>
                </>
              )}

              {/* Reciter Name Style */}
              {settings.showReciterName && (
                <div className="space-y-3">
                  <Label className="text-sm flex items-center gap-2">
                    <User className="h-4 w-4" />
                    شكل اسم القارئ
                  </Label>
                  <RadioOptionGrid
                    options={reciterNameStyleOptions}
                    value={settings.reciterNameStyle || 'simple'}
                    onChange={(v) => updateSetting('reciterNameStyle', v as DisplaySettings['reciterNameStyle'])}
                    idPrefix="reciter"
                    columns={3}
                  />
                </div>
              )}

              {/* Text Shadow Style */}
              <div className="space-y-3">
                <Label className="text-sm">نمط ظل النص</Label>
                <RadioOptionGrid
                  options={textShadowOptions}
                  value={settings.textShadowStyle || 'soft'}
                  onChange={(v) => updateSetting('textShadowStyle', v as DisplaySettings['textShadowStyle'])}
                  idPrefix="shadow"
                />
              </div>

              {/* Highlight Style */}
              <div className="space-y-3">
                <Label className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  نمط تمييز الكلمات
                </Label>
                <RadioGroup
                  value={settings.highlightStyle}
                  onValueChange={(value) => updateSetting('highlightStyle', value as DisplaySettings['highlightStyle'])}
                  className="space-y-1.5"
                >
                  {highlightOptions.map((option) => (
                    <div key={option.value} className="relative">
                      <RadioGroupItem value={option.value} id={`highlight-${option.value}`} className="peer sr-only" />
                      <Label
                        htmlFor={`highlight-${option.value}`}
                        className="flex flex-col rounded-lg border-2 border-muted p-2.5 hover:bg-muted/50 peer-data-[state=checked]:border-primary cursor-pointer transition-all"
                      >
                        <span className="font-medium text-sm">{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Word Scale Effect Toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">تأثير تكبير الكلمة</Label>
                  <p className="text-xs text-muted-foreground">تكبير الكلمة المميزة أثناء النطق</p>
                </div>
                <Switch
                  checked={settings.wordScaleEffect !== false}
                  onCheckedChange={(checked) => onChange({ ...settings, wordScaleEffect: checked })}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ═══ Section 3: Verse Display ═══ */}
          <AccordionItem value="verse-display" className="border-b px-4">
            <AccordionTrigger className="text-sm font-semibold gap-2">
              <span className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4 text-primary" />
                عرض الآيات
              </span>
            </AccordionTrigger>
            <AccordionContent className="space-y-5 pb-4">
              {/* Verse Display Mode */}
              <div className="space-y-3">
                <Label className="text-sm flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  طريقة عرض الآيات
                </Label>
                <RadioOptionGrid
                  options={verseDisplayModeOptions}
                  value={settings.verseDisplayMode || 'full'}
                  onChange={(v) => updateSetting('verseDisplayMode', v as DisplaySettings['verseDisplayMode'])}
                  idPrefix="vdm"
                />
              </div>

              {/* Ayah Number Style + Color */}
              {settings.showAyahNumber && (
                <>
                  <div className="space-y-3">
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
                  <div className="space-y-3">
                    <Label className="text-sm">لون رقم الآية</Label>
                    <RadioOptionGrid
                      options={ayahNumberColorOptions}
                      value={settings.ayahNumberColor || 'gold'}
                      onChange={(v) => updateSetting('ayahNumberColor', v as DisplaySettings['ayahNumberColor'])}
                      idPrefix="ayahColor"
                      columns={3}
                    />
                  </div>
                </>
              )}

              {/* Ayah Transition */}
              <div className="space-y-3">
                <Label className="text-sm flex items-center gap-2">
                  <Wand2 className="h-4 w-4" />
                  انتقال بين الآيات
                </Label>
                <RadioOptionGrid
                  options={transitionOptions}
                  value={settings.ayahTransition || 'fade'}
                  onChange={(v) => updateSetting('ayahTransition', v as DisplaySettings['ayahTransition'])}
                  idPrefix="trans"
                  columns={3}
                />
              </div>

            </AccordionContent>
          </AccordionItem>

          {/* ═══ Section 4: Frame & Background ═══ */}
          <AccordionItem value="frame-background" className="border-b px-4">
            <AccordionTrigger className="text-sm font-semibold gap-2">
              <span className="flex items-center gap-2">
                <Film className="h-4 w-4 text-primary" />
                الإطار والخلفية
              </span>
            </AccordionTrigger>
            <AccordionContent className="space-y-5 pb-4">
              {/* Frame Style */}
              <div className="space-y-3">
                <Label className="text-sm flex items-center gap-2">
                  <Frame className="h-4 w-4" />
                  إطار النص
                </Label>
                <RadioOptionGrid
                  options={frameOptions}
                  value={settings.frameStyle}
                  onChange={(v) => updateSetting('frameStyle', v as DisplaySettings['frameStyle'])}
                  idPrefix="frame"
                />
              </div>

              {/* Slideshow Transition */}
              <div className="space-y-3">
                <Label className="text-sm">🎬 نمط الانتقال بين الصور</Label>
                <RadioOptionGrid
                  options={slideshowTransitionOptions}
                  value={settings.slideshowTransition || 'crossfade'}
                  onChange={(v) => updateSetting('slideshowTransition', v as DisplaySettings['slideshowTransition'])}
                  idPrefix="slt"
                />
              </div>

            </AccordionContent>
          </AccordionItem>

          {/* ═══ Section 5: Ibtahalat & Advanced ═══ */}
          <AccordionItem value="advanced" className="px-4">
            <AccordionTrigger className="text-sm font-semibold gap-2">
              <span className="flex items-center gap-2">
                <Star className="h-4 w-4 text-primary" />
                ابتهالات ومتقدم
              </span>
            </AccordionTrigger>
            <AccordionContent className="space-y-5 pb-4">
              {/* Glow Style - Premium */}
              <div className="space-y-3">
                <Label className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  نمط التوهج (الابتهالات)
                  {!isPremium && <Lock className="h-3 w-3 text-muted-foreground" />}
                </Label>
                {!isPremium ? (
                  <div className="text-center py-3"><PremiumBadge showLock /></div>
                ) : (
                  <RadioOptionGrid
                    options={glowStyleOptions}
                    value={settings.glowStyle || 'golden'}
                    onChange={(v) => updateSetting('glowStyle', v as DisplaySettings['glowStyle'])}
                    idPrefix="glow"
                    columns={3}
                  />
                )}
              </div>

              {/* Lyrics Display Style */}
              <div className="space-y-3">
                <Label className="text-sm flex items-center gap-2">
                  <Wand2 className="h-4 w-4" />
                  طريقة عرض الكلمات (الابتهالات)
                </Label>
                <RadioOptionGrid
                  options={lyricsDisplayOptions}
                  value={settings.lyricsDisplayStyle || 'scroll'}
                  onChange={(v) => updateSetting('lyricsDisplayStyle', v as DisplaySettings['lyricsDisplayStyle'])}
                  idPrefix="lyrics"
                />
              </div>

              {/* Watermark - Premium */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="watermarkEnabled" className="flex items-center gap-2 cursor-pointer">
                    <Type className="h-4 w-4" />
                    علامة مائية
                    {!isPremium && <Lock className="h-3 w-3 text-muted-foreground" />}
                  </Label>
                  <Switch
                    id="watermarkEnabled"
                    checked={settings.watermarkEnabled || false}
                    onCheckedChange={(checked) => {
                      if (!isPremium) {
                        toast.error('العلامة المائية متاحة للأعضاء المميزين فقط');
                        return;
                      }
                      updateSetting('watermarkEnabled', checked);
                    }}
                  />
                </div>
                {!isPremium && <PremiumBadge showLock />}
                {settings.watermarkEnabled && isPremium && (
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

              {/* Templates */}
              <div className="space-y-3 pt-2 border-t">
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
                    حفظ الإعدادات كقالب
                  </Button>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

        </Accordion>
      </CardContent>
    </Card>
  );
}
