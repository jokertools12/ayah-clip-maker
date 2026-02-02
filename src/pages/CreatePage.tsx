import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { SurahCard } from '@/components/SurahCard';
import { ReciterCard } from '@/components/ReciterCard';
import { AyahDisplay } from '@/components/AyahDisplay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { surahs } from '@/data/surahs';
import { reciters } from '@/data/reciters';
import { useQuranApi } from '@/hooks/useQuranApi';
import { 
  Video, 
  Image, 
  Monitor, 
  Smartphone, 
  Loader2, 
  Play,
  ChevronRight,
  ChevronLeft,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';

type BackgroundType = 'video' | 'image';
type AspectRatio = '9:16' | '16:9';

export default function CreatePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { fetchAyahs, loading: apiLoading } = useQuranApi();

  // Step state
  const [currentStep, setCurrentStep] = useState(1);

  // Selection state
  const [selectedSurah, setSelectedSurah] = useState<number | null>(
    searchParams.get('surah') ? parseInt(searchParams.get('surah')!) : null
  );
  const [selectedReciter, setSelectedReciter] = useState<string | null>(null);
  const [startAyah, setStartAyah] = useState(1);
  const [endAyah, setEndAyah] = useState(5);
  const [backgroundType, setBackgroundType] = useState<BackgroundType>('video');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');

  // Preview state
  const [ayahs, setAyahs] = useState<{ number: number; numberInSurah: number; text: string }[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  const selectedSurahData = surahs.find((s) => s.number === selectedSurah);
  const selectedReciterData = reciters.find((r) => r.id === selectedReciter);

  // Fetch ayahs when selection changes
  useEffect(() => {
    if (selectedSurah && startAyah && endAyah) {
      loadAyahs();
    }
  }, [selectedSurah, startAyah, endAyah]);

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
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleCreateVideo = () => {
    if (!selectedSurah || !selectedReciter) {
      toast.error('الرجاء إكمال جميع الخطوات');
      return;
    }

    // Navigate to preview page with all settings
    const params = new URLSearchParams({
      surah: selectedSurah.toString(),
      reciter: selectedReciter,
      start: startAyah.toString(),
      end: endAyah.toString(),
      background: backgroundType,
      ratio: aspectRatio,
    });

    navigate(`/preview?${params.toString()}`);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">إنشاء فيديو جديد</h1>
          <p className="text-muted-foreground">
            اتبع الخطوات لإنشاء مقطع قرآني احترافي
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center gap-2 mb-8"
        >
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full font-bold transition-all ${
                  currentStep === step
                    ? 'gradient-primary text-primary-foreground'
                    : currentStep > step
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step}
              </div>
              {step < 4 && (
                <div
                  className={`w-8 md:w-16 h-1 rounded ${
                    currentStep > step ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </motion.div>

        {/* Step Labels */}
        <div className="hidden md:flex justify-center gap-4 mb-8">
          {['اختر السورة', 'اختر القارئ', 'حدد الآيات', 'الإعدادات'].map((label, index) => (
            <span
              key={index}
              className={`text-sm ${
                currentStep === index + 1 ? 'text-primary font-medium' : 'text-muted-foreground'
              }`}
            >
              {label}
            </span>
          ))}
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
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar p-1">
                  {surahs.map((surah) => (
                    <SurahCard
                      key={surah.number}
                      {...surah}
                      isSelected={selectedSurah === surah.number}
                      onClick={() => setSelectedSurah(surah.number)}
                    />
                  ))}
                </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reciters.map((reciter) => (
                    <ReciterCard
                      key={reciter.id}
                      reciter={reciter}
                      isSelected={selectedReciter === reciter.id}
                      onClick={() => setSelectedReciter(reciter.id)}
                    />
                  ))}
                </div>
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
                        type="number"
                        min={1}
                        max={selectedSurahData?.numberOfAyahs || 1}
                        value={startAyah}
                        onChange={(e) => setStartAyah(parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endAyah">إلى الآية</Label>
                      <Input
                        id="endAyah"
                        type="number"
                        min={startAyah}
                        max={selectedSurahData?.numberOfAyahs || 1}
                        value={endAyah}
                        onChange={(e) => setEndAyah(parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    سيتم تضمين {endAyah - startAyah + 1} آية في الفيديو
                  </p>
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
                    <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                      {ayahs.map((ayah) => (
                        <AyahDisplay
                          key={ayah.number}
                          number={ayah.numberInSurah}
                          text={ayah.text}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 4: Settings */}
          {currentStep === 4 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>إعدادات الفيديو</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Background Type */}
                  <div className="space-y-3">
                    <Label>نوع الخلفية</Label>
                    <Tabs
                      value={backgroundType}
                      onValueChange={(v) => setBackgroundType(v as BackgroundType)}
                    >
                      <TabsList className="w-full">
                        <TabsTrigger value="video" className="flex-1 gap-2">
                          <Video className="h-4 w-4" />
                          فيديو متحرك
                        </TabsTrigger>
                        <TabsTrigger value="image" className="flex-1 gap-2">
                          <Image className="h-4 w-4" />
                          صورة مع حركة
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                    <p className="text-xs text-muted-foreground">
                      {backgroundType === 'video'
                        ? 'فيديوهات طبيعية متحركة من مكتبة Pexels'
                        : 'صور طبيعية مع تأثير Ken Burns للحركة البطيئة'}
                    </p>
                  </div>

                  {/* Aspect Ratio */}
                  <div className="space-y-3">
                    <Label>صيغة الفيديو</Label>
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
                  </div>
                </CardContent>
              </Card>

              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>ملخص الفيديو</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-border/50">
                      <span className="text-muted-foreground">السورة</span>
                      <span className="font-medium">{selectedSurahData?.name}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border/50">
                      <span className="text-muted-foreground">القارئ</span>
                      <span className="font-medium">{selectedReciterData?.name}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border/50">
                      <span className="text-muted-foreground">الآيات</span>
                      <span className="font-medium">
                        من {startAyah} إلى {endAyah} ({endAyah - startAyah + 1} آية)
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border/50">
                      <span className="text-muted-foreground">الخلفية</span>
                      <span className="font-medium">
                        {backgroundType === 'video' ? 'فيديو متحرك' : 'صورة مع حركة'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">الصيغة</span>
                      <span className="font-medium">
                        {aspectRatio === '9:16' ? 'عمودي (ريلز)' : 'أفقي (يوتيوب)'}
                      </span>
                    </div>
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

          {currentStep < 4 ? (
            <Button onClick={handleNextStep} className="gap-2">
              التالي
              <ChevronLeft className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleCreateVideo} className="gap-2">
              <Play className="h-4 w-4" />
              إنشاء الفيديو
            </Button>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
