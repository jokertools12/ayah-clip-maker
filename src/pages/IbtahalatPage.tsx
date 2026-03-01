import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { BackgroundSelector } from '@/components/BackgroundSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { BackgroundItem, getRandomBackground } from '@/data/backgrounds';
import {
  performers,
  ibtahalatTracks,
  getTracksByPerformer,
  getTracksByCategory,
  Performer,
  IbtahalTrack,
} from '@/data/ibtahalat';
import {
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  Search,
  Sparkles,
  Music,
  Mic,
  Monitor,
  Smartphone,
  Volume2,
} from 'lucide-react';
import { toast } from 'sonner';

type AspectRatio = '9:16' | '16:9';

export default function IbtahalatPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPerformer, setSelectedPerformer] = useState<string | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [selectedBackground, setSelectedBackground] = useState<BackgroundItem | null>(
    () => getRandomBackground('animated')
  );
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [searchQuery, setSearchQuery] = useState('');
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const selectedPerformerData = performers.find(p => p.id === selectedPerformer);
  const selectedTrackData = ibtahalatTracks.find(t => t.id === selectedTrack);

  const filteredPerformers = performers.filter(
    p => p.name.includes(searchQuery) || p.englishName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePlayPreview = useCallback((track: IbtahalTrack) => {
    if (playingTrackId === track.id) {
      audioRef.current?.pause();
      setPlayingTrackId(null);
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(track.audioUrl);
    audio.play().catch(() => toast.error('تعذر تشغيل الصوت'));
    audio.onended = () => setPlayingTrackId(null);
    audioRef.current = audio;
    setPlayingTrackId(track.id);
  }, [playingTrackId]);

  const handleNextStep = () => {
    if (currentStep === 1 && !selectedPerformer) {
      toast.error('الرجاء اختيار مبتهل');
      return;
    }
    if (currentStep === 2 && !selectedTrack) {
      toast.error('الرجاء اختيار ابتهال');
      return;
    }
    if (currentStep === 3 && !selectedBackground) {
      toast.error('الرجاء اختيار خلفية');
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleCreateVideo = () => {
    if (!selectedTrack || !selectedBackground) {
      toast.error('الرجاء إكمال جميع الخطوات');
      return;
    }
    const track = ibtahalatTracks.find(t => t.id === selectedTrack)!;
    const performer = performers.find(p => p.id === track.performerId)!;

    const params = new URLSearchParams({
      mode: 'ibtahalat',
      trackId: track.id,
      trackTitle: track.title,
      performerName: performer.name,
      audioUrl: track.audioUrl,
      background: selectedBackground.id,
      backgroundType: selectedBackground.type,
      backgroundUrl: selectedBackground.url,
      backgroundThumb: selectedBackground.thumbnail,
      ratio: aspectRatio,
    });

    navigate(`/preview?${params.toString()}`);
  };

  const stepLabels = ['اختر المبتهل', 'اختر الابتهال', 'اختر الخلفية', 'المعاينة'];

  const performerTracks = selectedPerformer ? getTracksByPerformer(selectedPerformer) : [];

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
            <Music className="h-8 w-8 text-primary" />
            ابتهالات وتواشيح
          </h1>
          <p className="text-muted-foreground">
            أنشئ فيديو بابتهالات وتواشيح أشهر المبتهلين والمنشدين
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center gap-1 md:gap-2 mb-6 overflow-x-auto pb-2"
        >
          {[1, 2, 3, 4].map((step) => (
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
              {step < 4 && (
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
        <div className="md:hidden text-center mb-6">
          <span className="text-primary font-medium">{stepLabels[currentStep - 1]}</span>
        </div>

        {/* Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          {/* Step 1: Select Performer */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-5 w-5" />
                  اختر المبتهل أو المنشد
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative mb-4">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="ابحث عن مبتهل..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPerformers.map((performer) => (
                    <PerformerCard
                      key={performer.id}
                      performer={performer}
                      trackCount={getTracksByPerformer(performer.id).length}
                      isSelected={selectedPerformer === performer.id}
                      onClick={() => setSelectedPerformer(performer.id)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Select Track */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  اختر الابتهال - {selectedPerformerData?.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="w-full grid grid-cols-5 mb-4">
                    <TabsTrigger value="all">الكل</TabsTrigger>
                    <TabsTrigger value="ابتهال">ابتهال</TabsTrigger>
                    <TabsTrigger value="توشيح">توشيح</TabsTrigger>
                    <TabsTrigger value="مديح">مديح</TabsTrigger>
                    <TabsTrigger value="دعاء">دعاء</TabsTrigger>
                  </TabsList>

                  {['all', 'ابتهال', 'توشيح', 'مديح', 'دعاء'].map(cat => {
                    const tracks = cat === 'all'
                      ? performerTracks
                      : performerTracks.filter(t => t.category === cat);
                    return (
                      <TabsContent key={cat} value={cat}>
                        <ScrollArea className="h-[50vh]">
                          <div className="space-y-3 p-1">
                            {tracks.length === 0 ? (
                              <p className="text-center text-muted-foreground py-8">لا توجد تسجيلات في هذا التصنيف</p>
                            ) : (
                              tracks.map(track => (
                                <TrackCard
                                  key={track.id}
                                  track={track}
                                  isSelected={selectedTrack === track.id}
                                  isPlaying={playingTrackId === track.id}
                                  onClick={() => setSelectedTrack(track.id)}
                                  onPlayPreview={() => handlePlayPreview(track)}
                                />
                              ))
                            )}
                          </div>
                        </ScrollArea>
                      </TabsContent>
                    );
                  })}
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Background */}
          {currentStep === 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <BackgroundSelector
                  selectedBackground={selectedBackground}
                  onSelect={setSelectedBackground}
                />
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>نسبة الأبعاد</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={aspectRatio}
                    onValueChange={(v) => setAspectRatio(v as AspectRatio)}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                      <RadioGroupItem value="9:16" id="ratio-916-ibt" />
                      <Label htmlFor="ratio-916-ibt" className="flex items-center gap-2 cursor-pointer">
                        <Smartphone className="h-5 w-5" />
                        <div>
                          <p className="font-medium">عمودي 9:16</p>
                          <p className="text-xs text-muted-foreground">مثالي للريلز وتيكتوك</p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                      <RadioGroupItem value="16:9" id="ratio-169-ibt" />
                      <Label htmlFor="ratio-169-ibt" className="flex items-center gap-2 cursor-pointer">
                        <Monitor className="h-5 w-5" />
                        <div>
                          <p className="font-medium">أفقي 16:9</p>
                          <p className="text-xs text-muted-foreground">مثالي ليوتيوب</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 4: Preview */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>ملخص الفيديو</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                    <p className="text-sm text-muted-foreground">المبتهل</p>
                    <p className="font-bold text-lg">{selectedPerformerData?.name}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                    <p className="text-sm text-muted-foreground">الابتهال</p>
                    <p className="font-bold text-lg">{selectedTrackData?.title}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                    <p className="text-sm text-muted-foreground">المدة</p>
                    <p className="font-bold">{selectedTrackData?.duration}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                    <p className="text-sm text-muted-foreground">نسبة الأبعاد</p>
                    <p className="font-bold">{aspectRatio === '9:16' ? 'عمودي (ريلز)' : 'أفقي (يوتيوب)'}</p>
                  </div>
                </div>
                <Button onClick={handleCreateVideo} size="lg" className="w-full text-lg">
                  <Play className="h-5 w-5 ml-2" />
                  إنشاء الفيديو
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
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
        </div>
      </div>
    </Layout>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function PerformerCard({
  performer,
  trackCount,
  isSelected,
  onClick,
}: {
  performer: Performer;
  trackCount: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`cursor-pointer rounded-xl p-5 border-2 transition-all duration-200 ${
        isSelected
          ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
          : 'border-border hover:border-primary/50 hover:bg-muted/50'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`flex h-14 w-14 items-center justify-center rounded-full ${
          isSelected ? 'gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        }`}>
          <Mic className="h-7 w-7" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg truncate">{performer.name}</h3>
          <p className="text-sm text-muted-foreground">{performer.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {performer.category}
            </span>
            <span className="text-xs text-muted-foreground">
              {trackCount} تسجيل
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TrackCard({
  track,
  isSelected,
  isPlaying,
  onClick,
  onPlayPreview,
}: {
  track: IbtahalTrack;
  isSelected: boolean;
  isPlaying: boolean;
  onClick: () => void;
  onPlayPreview: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50 hover:bg-muted/50'
      }`}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPlayPreview();
        }}
        className={`flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
          isPlaying ? 'gradient-primary text-primary-foreground' : 'bg-muted hover:bg-primary/20'
        }`}
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold truncate">{track.title}</h4>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
            {track.category}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Volume2 className="h-3 w-3" />
            {track.duration}
          </span>
        </div>
      </div>
      {isSelected && (
        <div className="flex-shrink-0 h-6 w-6 rounded-full gradient-primary flex items-center justify-center">
          <svg className="h-3.5 w-3.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  );
}
