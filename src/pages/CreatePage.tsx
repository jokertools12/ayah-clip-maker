import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { SurahCard } from '@/components/SurahCard';
import { ReciterCard } from '@/components/ReciterCard';
import { AyahDisplay } from '@/components/AyahDisplay';
import { BackgroundSelector } from '@/components/BackgroundSelector';
import { TextSettingsPanel, TextSettings } from '@/components/TextSettingsPanel';
import { VideoPreview } from '@/components/VideoPreview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { surahs } from '@/data/surahs';
import { reciters } from '@/data/reciters';
import { BackgroundItem, getRandomBackground } from '@/data/backgrounds';
import { useQuranApi } from '@/hooks/useQuranApi';
import {
  Monitor,
  Smartphone,
  Loader2,
  Play,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Search,
  Settings,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

type AspectRatio = '9:16' | '16:9';

const defaultTextSettings: TextSettings = {
  fontSize: 28,
  fontFamily: '"Amiri", serif',
  textColor: '#ffffff',
  shadowIntensity: 0.5,
  overlayOpacity: 0.4,
};

export default function CreatePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { fetchAyahs, loading: apiLoading } = useQuranApi();

  // Step state
  const [currentStep, setCurrentStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Selection state
  const [selectedSurah, setSelectedSurah] = useState<number | null>(
    searchParams.get('surah') ? parseInt(searchParams.get('surah')!) : null
  );
  const [selectedReciter, setSelectedReciter] = useState<string | null>(null);
  const [startAyah, setStartAyah] = useState(1);
  const [endAyah, setEndAyah] = useState(5);
  const [startAyahInput, setStartAyahInput] = useState('1');
  const [endAyahInput, setEndAyahInput] = useState('5');
  const [selectedBackground, setSelectedBackground] = useState<BackgroundItem | null>(
    () => getRandomBackground('video')
  );
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [textSettings, setTextSettings] = useState<TextSettings>(defaultTextSettings);

  // Preview state
  const [ayahs, setAyahs] = useState<{ number: number; numberInSurah: number; text: string }[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewAyahIndex, setPreviewAyahIndex] = useState(0);

  const selectedSurahData = surahs.find((s) => s.number === selectedSurah);
  const selectedReciterData = reciters.find((r) => r.id === selectedReciter);

  // Filter surahs
  const filteredSurahs = surahs.filter(
    (surah) =>
      surah.name.includes(searchQuery) ||
      surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.number.toString().includes(searchQuery)
  );

  // Fetch ayahs when selection changes
  useEffect(() => {
    if (selectedSurah && startAyah && endAyah) {
      loadAyahs();
    }
  }, [selectedSurah, startAyah, endAyah]);

  // Preview animation
  useEffect(() => {
    if (currentStep === 5 && ayahs.length > 0) {
      const interval = setInterval(() => {
        setPreviewAyahIndex((prev) => (prev + 1) % ayahs.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [currentStep, ayahs.length]);

  const loadAyahs = async () => {
    if (!selectedSurah) return;
    setPreviewLoading(true);
    const data = await fetchAyahs(selectedSurah, startAyah, endAyah);
    if (data) {
      setAyahs(data);
    }
    setPreviewLoading(false);
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !selectedSurah) {
      toast.error('الرجاء اختيار سورة');
      return;
    }
    if (currentStep === 2 && !selectedReciter) {
      toast.error('الرجاء اختيار قارئ');
      return;
    }
    if (currentStep === 4 && !selectedBackground) {
      toast.error('الرجاء اختيار خلفية');
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleCreateVideo = () => {
    if (!selectedSurah || !selectedReciter || !selectedBackground) {
      toast.error('الرجاء إكمال جميع الخطوات');
      return;
    }

    // Navigate to preview page with all settings
    const params = new URLSearchParams({
      surah: selectedSurah.toString(),
      reciter: selectedReciter,
      start: startAyah.toString(),
      end: endAyah.toString(),
      background: selectedBackground.id,
      backgroundType: selectedBackground.type,
      ratio: aspectRatio,
      fontSize: textSettings.fontSize.toString(),
      fontFamily: textSettings.fontFamily,
      textColor: textSettings.textColor,
      shadowIntensity: textSettings.shadowIntensity.toString(),
      overlayOpacity: textSettings.overlayOpacity.toString(),
    });

    navigate(`/preview?${params.toString()}`);
  };

  const stepLabels = ['اختر السورة', 'اختر القارئ', 'حدد الآيات', 'اختر الخلفية', 'المعاينة'];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            إنشاء فيديو جديد
          </h1>
          <p className="text-muted-foreground">
            اتبع الخطوات لإنشاء مقطع قرآني احترافي
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center gap-1 md:gap-2 mb-6 overflow-x-auto pb-2"
        >
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full font-bold transition-all text-sm ${
                  currentStep === step
                    ? 'gradient-primary text-primary-foreground'
                    : currentStep > step
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step}
              </div>
              {step < 5 && (
                <div
                  className={`w-6 md:w-12 h-1 rounded ${
                    currentStep > step ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </motion.div>

        {/* Step Labels */}
        <div className="hidden md:flex justify-center gap-6 mb-8">
          {stepLabels.map((label, index) => (
            <span
              key={index}
              className={`text-sm transition-colors ${
                currentStep === index + 1 ? 'text-primary font-medium' : 'text-muted-foreground'
              }`}
            >
              {label}
            </span>
          ))}
        </div>

        {/* Mobile Step Label */}
        <div className="md:hidden text-center mb-6">
          <span className="text-primary font-medium">{stepLabels[currentStep - 1]}</span>
        </div>

        {/* Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="mb-8"
        >
          {/* Step 1: Select Surah */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  اختر السورة
                </CardTitle>
                {/* Search */}
                <div className="relative mt-4">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="ابحث عن سورة..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[55vh]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-1">
                    {filteredSurahs.map((surah) => (
                      <SurahCard
                        key={surah.number}
                        {...surah}
                        isSelected={selectedSurah === surah.number}
                        onClick={() => setSelectedSurah(surah.number)}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Select Reciter */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>اختر القارئ</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[55vh]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-1">
                    {reciters.map((reciter) => (
                      <ReciterCard
                        key={reciter.id}
                        reciter={reciter}
                        isSelected={selectedReciter === reciter.id}
                        onClick={() => setSelectedReciter(reciter.id)}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Select Ayahs */}
          {currentStep === 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>حدد نطاق الآيات</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-2">السورة المختارة</p>
                    <p className="text-xl font-bold">{selectedSurahData?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedSurahData?.numberOfAyahs} آية
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startAyah">من الآية</Label>
                      <Input
                        id="startAyah"
                        type="text"
                        inputMode="numeric"
                        value={startAyahInput}
                        onChange={(e) => {
                          // Allow any input while typing
                          setStartAyahInput(e.target.value);
                        }}
                        onBlur={() => {
                          const max = selectedSurahData?.numberOfAyahs || 1;
                          const val = parseInt(startAyahInput) || 1;
                          const clamped = Math.min(Math.max(val, 1), max);
                          setStartAyah(clamped);
                          setStartAyahInput(clamped.toString());
                          // Also adjust end if needed
                          if (endAyah < clamped) {
                            setEndAyah(clamped);
                            setEndAyahInput(clamped.toString());
                          }
                        }}
                        className="text-center"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endAyah">إلى الآية</Label>
                      <Input
                        id="endAyah"
                        type="text"
                        inputMode="numeric"
                        value={endAyahInput}
                        onChange={(e) => {
                          // Allow any input while typing
                          setEndAyahInput(e.target.value);
                        }}
                        onBlur={() => {
                          const max = selectedSurahData?.numberOfAyahs || 1;
                          const val = parseInt(endAyahInput) || startAyah;
                          const clamped = Math.min(Math.max(val, startAyah), max);
                          setEndAyah(clamped);
                          setEndAyahInput(clamped.toString());
                        }}
                        className="text-center"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="text-sm text-primary font-medium">
                      سيتم تضمين {endAyah - startAyah + 1} آية في الفيديو
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>معاينة الآيات</CardTitle>
                </CardHeader>
                <CardContent>
                  {previewLoading || apiLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <ScrollArea className="h-[350px]">
                      <div className="space-y-2 pr-4">
                        {ayahs.map((ayah) => (
                          <AyahDisplay
                            key={ayah.number}
                            number={ayah.numberInSurah}
                            text={ayah.text}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 4: Select Background & Settings */}
          {currentStep === 4 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>اختر الخلفية</CardTitle>
                </CardHeader>
                <CardContent>
                  <BackgroundSelector
                    selectedBackground={selectedBackground}
                    onSelect={setSelectedBackground}
                  />
                </CardContent>
              </Card>

              <div className="space-y-6">
                {/* Aspect Ratio */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      صيغة الفيديو
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={aspectRatio}
                      onValueChange={(v) => setAspectRatio(v as AspectRatio)}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div className="relative">
                        <RadioGroupItem value="9:16" id="vertical" className="peer sr-only" />
                        <Label
                          htmlFor="vertical"
                          className="flex flex-col items-center justify-center rounded-lg border-2 border-muted p-4 hover:bg-muted/50 peer-data-[state=checked]:border-primary cursor-pointer"
                        >
                          <Smartphone className="h-8 w-8 mb-2" />
                          <span className="font-medium">عمودي (9:16)</span>
                          <span className="text-xs text-muted-foreground">ريلز / تيكتوك</span>
                        </Label>
                      </div>
                      <div className="relative">
                        <RadioGroupItem value="16:9" id="horizontal" className="peer sr-only" />
                        <Label
                          htmlFor="horizontal"
                          className="flex flex-col items-center justify-center rounded-lg border-2 border-muted p-4 hover:bg-muted/50 peer-data-[state=checked]:border-primary cursor-pointer"
                        >
                          <Monitor className="h-8 w-8 mb-2" />
                          <span className="font-medium">أفقي (16:9)</span>
                          <span className="text-xs text-muted-foreground">يوتيوب</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>

                {/* Text Settings */}
                <TextSettingsPanel settings={textSettings} onChange={setTextSettings} />
              </div>
            </div>
          )}

          {/* Step 5: Preview & Summary */}
          {currentStep === 5 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Live Preview */}
              <div className="flex justify-center">
                <VideoPreview
                  background={selectedBackground}
                  surahName={selectedSurahData?.name || ''}
                  reciterName={selectedReciterData?.name || ''}
                  currentAyah={ayahs[previewAyahIndex] || null}
                  aspectRatio={aspectRatio}
                  textSettings={textSettings}
                  isPlaying={true}
                />
              </div>

              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>ملخص الفيديو</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between py-3 border-b border-border/50">
                      <span className="text-muted-foreground">السورة</span>
                      <span className="font-medium">{selectedSurahData?.name}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-border/50">
                      <span className="text-muted-foreground">القارئ</span>
                      <span className="font-medium">{selectedReciterData?.name}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-border/50">
                      <span className="text-muted-foreground">الآيات</span>
                      <span className="font-medium">
                        من {startAyah} إلى {endAyah} ({endAyah - startAyah + 1} آية)
                      </span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-border/50">
                      <span className="text-muted-foreground">الخلفية</span>
                      <span className="font-medium">{selectedBackground?.name}</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="text-muted-foreground">الصيغة</span>
                      <span className="font-medium">
                        {aspectRatio === '9:16' ? 'عمودي (ريلز)' : 'أفقي (يوتيوب)'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={handleCreateVideo}
                      size="lg"
                      className="w-full gap-2 text-lg py-6"
                    >
                      <Play className="h-5 w-5" />
                      إنشاء الفيديو
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-between"
        >
          <Button
            variant="outline"
            onClick={handlePrevStep}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ChevronRight className="h-4 w-4" />
            السابق
          </Button>

          {currentStep < 5 && (
            <Button onClick={handleNextStep} className="gap-2">
              التالي
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
