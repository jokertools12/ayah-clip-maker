import { useState, useEffect, useRef, useCallback } from 'react';
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { surahs } from '@/data/surahs';
import { reciters, getRecitersByStyle } from '@/data/reciters';
import { BackgroundItem, getRandomBackground, slideshowBackgrounds, backgroundImages } from '@/data/backgrounds';
import { FamousAyah, famousAyahs, ayahCategories, getAyahsByCategory } from '@/data/famousAyahs';
import {
  performers,
  ibtahalatTracks,
  getTracksByPerformer,
  getTracksByCategory,
  getPerformerById,
  searchTracks,
  IbtahalTrack,
} from '@/data/ibtahalat';
import { useQuranApi } from '@/hooks/useQuranApi';
import {
  Monitor,
  Smartphone,
  Loader2,
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Search,
  Settings,
  Sparkles,
  Bookmark,
  Music,
  Mic,
  Filter,
  User,
} from 'lucide-react';
import { toast } from 'sonner';

type AspectRatio = '9:16' | '16:9';
type ContentMode = 'surah' | 'famous' | 'ibtahalat';

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

  // Determine initial tab from URL
  const initialTab = searchParams.get('tab') || 'surahs';
  const preSelectedSurah = searchParams.get('surah')
    ? parseInt(searchParams.get('surah')!)
    : null;

  const [currentStep, setCurrentStep] = useState(preSelectedSurah ? 2 : 1);
  const [contentMode, setContentMode] = useState<ContentMode>(
    preSelectedSurah ? 'surah' : 'surah'
  );
  const [activeContentTab, setActiveContentTab] = useState<string>(
    initialTab === 'ibtahalat' ? 'ibtahalat' : 'surahs'
  );

  // ── Shared state ──
  const [selectedBackground, setSelectedBackground] = useState<BackgroundItem | null>(
    () => backgroundImages[0] || slideshowBackgrounds[0] || getRandomBackground('animated')
  );
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [textSettings, setTextSettings] = useState<TextSettings>(defaultTextSettings);

  // ── Surah / Quran state ──
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSurah, setSelectedSurah] = useState<number | null>(preSelectedSurah);
  const [selectedReciter, setSelectedReciter] = useState<string | null>(null);
  const [startAyah, setStartAyah] = useState(1);
  const [endAyah, setEndAyah] = useState(5);
  const [startAyahInput, setStartAyahInput] = useState('1');
  const [endAyahInput, setEndAyahInput] = useState('5');
  const [reciterSearch, setReciterSearch] = useState('');

  // ── Ibtahalat state ──
  const [ibtSearchQuery, setIbtSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [selectedPerformer, setSelectedPerformer] = useState<string | null>(null);
  const [ibtBrowseMode, setIbtBrowseMode] = useState<'byCategory' | 'byPerformer' | 'search'>('byCategory');
  const [ibtCategory, setIbtCategory] = useState('all');
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ── Ayah preview data ──
  const [ayahs, setAyahs] = useState<{ number: number; numberInSurah: number; text: string }[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewAyahIndex, setPreviewAyahIndex] = useState(0);

  const selectedSurahData = surahs.find((s) => s.number === selectedSurah);
  const selectedReciterData = reciters.find((r) => r.id === selectedReciter);
  const selectedTrackData = ibtahalatTracks.find((t) => t.id === selectedTrack);

  const filteredSurahs = surahs.filter(
    (surah) =>
      surah.name.includes(searchQuery) ||
      surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.number.toString().includes(searchQuery)
  );

  const filterReciters = (list: typeof reciters) => {
    if (!reciterSearch) return list;
    return list.filter(r =>
      r.name.includes(reciterSearch) ||
      r.englishName.toLowerCase().includes(reciterSearch.toLowerCase()) ||
      r.description?.includes(reciterSearch)
    );
  };

  // Ibtahalat filtering
  const getFilteredTracks = (): IbtahalTrack[] => {
    if (ibtBrowseMode === 'search' && ibtSearchQuery.trim()) {
      return searchTracks(ibtSearchQuery);
    }
    if (ibtBrowseMode === 'byPerformer' && selectedPerformer) {
      return getTracksByPerformer(selectedPerformer);
    }
    if (ibtBrowseMode === 'byCategory') {
      return ibtCategory === 'all' ? ibtahalatTracks : getTracksByCategory(ibtCategory as IbtahalTrack['category']);
    }
    return ibtahalatTracks;
  };
  const filteredTracks = getFilteredTracks();

  const ibtCategories = [
    { value: 'all', label: 'الكل', count: ibtahalatTracks.length },
    { value: 'ابتهال', label: 'ابتهال', count: getTracksByCategory('ابتهال').length },
    { value: 'توشيح', label: 'توشيح', count: getTracksByCategory('توشيح').length },
    { value: 'مديح', label: 'مديح', count: getTracksByCategory('مديح').length },
    { value: 'دعاء', label: 'دعاء', count: getTracksByCategory('دعاء').length },
  ];

  useEffect(() => {
    if (selectedSurah && startAyah && endAyah && contentMode !== 'ibtahalat') {
      loadAyahs();
    }
  }, [selectedSurah, startAyah, endAyah, contentMode]);

  useEffect(() => {
    if (currentStep === getMaxStep() && ayahs.length > 0) {
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
    if (data) setAyahs(data);
    setPreviewLoading(false);
  };

  const handlePlayPreview = useCallback((track: IbtahalTrack) => {
    if (playingTrackId === track.id) {
      audioRef.current?.pause();
      setPlayingTrackId(null);
      return;
    }
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(track.audioUrl);
    audio.play().catch(() => toast.error('تعذر تشغيل الصوت'));
    audio.onended = () => setPlayingTrackId(null);
    audioRef.current = audio;
    setPlayingTrackId(track.id);
  }, [playingTrackId]);

  // Dynamic steps based on content mode
  const getStepLabels = (): string[] => {
    if (contentMode === 'ibtahalat') {
      return ['اختر المحتوى', 'اختر الخلفية', 'المعاينة'];
    }
    return ['اختر المحتوى', 'اختر القارئ', 'حدد الآيات', 'اختر الخلفية', 'المعاينة'];
  };
  const getMaxStep = () => getStepLabels().length;
  const stepLabels = getStepLabels();

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (contentMode === 'ibtahalat' && !selectedTrack) {
        toast.error('الرجاء اختيار ابتهال');
        return;
      }
      if ((contentMode === 'surah' || contentMode === 'famous') && !selectedSurah) {
        toast.error('الرجاء اختيار سورة');
        return;
      }
    }
    if (contentMode !== 'ibtahalat') {
      if (currentStep === 2 && !selectedReciter) {
        toast.error('الرجاء اختيار قارئ');
        return;
      }
      if (currentStep === 4 && !selectedBackground) {
        toast.error('الرجاء اختيار خلفية');
        return;
      }
    } else {
      if (currentStep === 2 && !selectedBackground) {
        toast.error('الرجاء اختيار خلفية');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, getMaxStep()));
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleCreateVideo = () => {
    if (contentMode === 'ibtahalat') {
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
      return;
    }

    if (!selectedSurah || !selectedReciter || !selectedBackground) {
      toast.error('الرجاء إكمال جميع الخطوات');
      return;
    }

    const params = new URLSearchParams({
      surah: selectedSurah.toString(),
      reciter: selectedReciter,
      start: startAyah.toString(),
      end: endAyah.toString(),
      background: selectedBackground.id,
      backgroundType: selectedBackground.type,
      backgroundUrl: selectedBackground.url,
      backgroundThumb: selectedBackground.thumbnail,
      ratio: aspectRatio,
      fontSize: textSettings.fontSize.toString(),
      fontFamily: textSettings.fontFamily,
      textColor: textSettings.textColor,
      shadowIntensity: textSettings.shadowIntensity.toString(),
      overlayOpacity: textSettings.overlayOpacity.toString(),
    });
    navigate(`/preview?${params.toString()}`);
  };

  // Quran step mapping (for non-ibtahalat): 1=content, 2=reciter, 3=ayahs, 4=bg, 5=preview
  // Ibtahalat step mapping: 1=content, 2=bg, 3=preview

  const isOnLastStep = currentStep === getMaxStep();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center justify-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            إنشاء فيديو جديد
          </h1>
          <p className="text-muted-foreground">
            اختر المحتوى واتبع الخطوات لإنشاء مقطع احترافي
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center gap-1 md:gap-2 mb-4 overflow-x-auto pb-2"
        >
          {stepLabels.map((_, idx) => {
            const step = idx + 1;
            return (
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
                {step < stepLabels.length && (
                  <div
                    className={`w-6 md:w-12 h-1 rounded ${
                      currentStep > step ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            );
          })}
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
          key={`${contentMode}-${currentStep}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="mb-8"
        >
          {/* ═══════ Step 1: Choose Content ═══════ */}
          {currentStep === 1 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  اختر المحتوى
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Tabs
                  value={activeContentTab}
                  onValueChange={(v) => {
                    setActiveContentTab(v);
                    if (v === 'ibtahalat') setContentMode('ibtahalat');
                    else if (v === 'famous') setContentMode('famous');
                    else setContentMode('surah');
                  }}
                  className="w-full"
                >
                  <TabsList className="w-full grid grid-cols-3 mb-4">
                    <TabsTrigger value="surahs" className="gap-1 text-xs sm:text-sm">
                      <BookOpen className="h-4 w-4" />
                      <span className="hidden sm:inline">السور</span>
                      <span className="sm:hidden">السور</span>
                    </TabsTrigger>
                    <TabsTrigger value="famous" className="gap-1 text-xs sm:text-sm">
                      <Bookmark className="h-4 w-4" />
                      <span className="hidden sm:inline">آيات مشهورة</span>
                      <span className="sm:hidden">مشهورة</span>
                    </TabsTrigger>
                    <TabsTrigger value="ibtahalat" className="gap-1 text-xs sm:text-sm">
                      <Music className="h-4 w-4" />
                      <span className="hidden sm:inline">تواشيح وابتهالات</span>
                      <span className="sm:hidden">ابتهالات</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* ── Surahs Tab ── */}
                  <TabsContent value="surahs">
                    <div className="relative mb-4">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="ابحث عن سورة..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pr-10"
                      />
                    </div>
                    <ScrollArea className="h-[50vh]">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-1">
                        {filteredSurahs.map((surah) => (
                          <SurahCard
                            key={surah.number}
                            {...surah}
                            isSelected={selectedSurah === surah.number}
                            onClick={() => {
                              setSelectedSurah(surah.number);
                              setContentMode('surah');
                            }}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  {/* ── Famous Ayahs Tab ── */}
                  <TabsContent value="famous">
                    <FamousAyahsGrid
                      onSelect={(ayah) => {
                        setContentMode('famous');
                        setSelectedSurah(ayah.surahNumber);
                        setStartAyah(ayah.startAyah);
                        setEndAyah(ayah.endAyah);
                        setStartAyahInput(ayah.startAyah.toString());
                        setEndAyahInput(ayah.endAyah.toString());
                        // Skip to reciter step
                        setCurrentStep(2);
                      }}
                    />
                  </TabsContent>

                  {/* ── Ibtahalat Tab ── */}
                  <TabsContent value="ibtahalat">
                    {/* Browse mode buttons */}
                    <div className="flex gap-2 mb-4 flex-wrap">
                      <Button
                        variant={ibtBrowseMode === 'byCategory' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setIbtBrowseMode('byCategory')}
                        className="gap-1"
                      >
                        <Filter className="h-4 w-4" />
                        حسب التصنيف
                      </Button>
                      <Button
                        variant={ibtBrowseMode === 'byPerformer' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setIbtBrowseMode('byPerformer')}
                        className="gap-1"
                      >
                        <User className="h-4 w-4" />
                        حسب المبتهل
                      </Button>
                      <Button
                        variant={ibtBrowseMode === 'search' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setIbtBrowseMode('search')}
                        className="gap-1"
                      >
                        <Search className="h-4 w-4" />
                        بحث
                      </Button>
                    </div>

                    {ibtBrowseMode === 'search' && (
                      <div className="relative mb-4">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="ابحث في الابتهالات والتواشيح..."
                          value={ibtSearchQuery}
                          onChange={(e) => setIbtSearchQuery(e.target.value)}
                          className="pr-10"
                          autoFocus
                        />
                      </div>
                    )}

                    {ibtBrowseMode === 'byCategory' && (
                      <div className="flex gap-2 mb-4 flex-wrap">
                        {ibtCategories.map(cat => (
                          <Button
                            key={cat.value}
                            variant={ibtCategory === cat.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setIbtCategory(cat.value)}
                          >
                            {cat.label}
                            <Badge variant="secondary" className="mr-1 text-xs">{cat.count}</Badge>
                          </Button>
                        ))}
                      </div>
                    )}

                    {ibtBrowseMode === 'byPerformer' && (
                      <div className="flex gap-2 flex-wrap mb-4">
                        {performers.map(p => (
                          <Button
                            key={p.id}
                            variant={selectedPerformer === p.id ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedPerformer(p.id)}
                            className="gap-1"
                          >
                            <Mic className="h-3 w-3" />
                            {p.name}
                            <Badge variant="secondary" className="mr-1 text-xs">
                              {getTracksByPerformer(p.id).length}
                            </Badge>
                          </Button>
                        ))}
                      </div>
                    )}

                    <ScrollArea className="h-[50vh]">
                      <div className="space-y-2 p-1">
                        {filteredTracks.length === 0 ? (
                          <p className="text-center text-muted-foreground py-8">لا توجد نتائج</p>
                        ) : (
                          filteredTracks.map(track => {
                            const performer = getPerformerById(track.performerId);
                            const isSelected = selectedTrack === track.id;
                            const isPlaying = playingTrackId === track.id;
                            return (
                              <motion.div
                                key={track.id}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => {
                                  setSelectedTrack(track.id);
                                  setContentMode('ibtahalat');
                                }}
                                className={`cursor-pointer rounded-xl border-2 p-3 transition-all ${
                                  isSelected ? 'border-primary bg-primary/5' : 'border-transparent hover:border-primary/30 bg-muted/50'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="shrink-0 h-9 w-9 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedTrack(track.id);
                                      setContentMode('ibtahalat');
                                      handlePlayPreview(track);
                                    }}
                                  >
                                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                  </Button>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm truncate">{track.title}</p>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {performer?.name} • {track.duration}
                                    </p>
                                  </div>
                                  <Badge variant="secondary" className="text-xs shrink-0">{track.category}</Badge>
                                </div>
                              </motion.div>
                            );
                          })
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* ═══════ Quran: Step 2 - Select Reciter ═══════ */}
          {contentMode !== 'ibtahalat' && currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>اختر القارئ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative mb-4">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="ابحث عن قارئ..."
                    value={reciterSearch}
                    onChange={(e) => setReciterSearch(e.target.value)}
                    className="pr-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  🔊 اضغط على أيقونة السماعة لمعاينة صوت القارئ
                </p>
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="w-full grid grid-cols-4 mb-4">
                    <TabsTrigger value="all">الكل ({filterReciters(reciters).length})</TabsTrigger>
                    <TabsTrigger value="مرتل">مرتل</TabsTrigger>
                    <TabsTrigger value="مجود">مجود</TabsTrigger>
                    <TabsTrigger value="ترتيل">ترتيل</TabsTrigger>
                  </TabsList>
                  <TabsContent value="all">
                    <ScrollArea className="h-[50vh]">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-1">
                        {filterReciters(reciters).map((reciter) => (
                          <ReciterCard
                            key={reciter.id}
                            reciter={reciter}
                            isSelected={selectedReciter === reciter.id}
                            onClick={() => setSelectedReciter(reciter.id)}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  {(['مرتل', 'مجود', 'ترتيل'] as const).map(style => (
                    <TabsContent key={style} value={style}>
                      <ScrollArea className="h-[50vh]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-1">
                          {filterReciters(getRecitersByStyle(style)).map((reciter) => (
                            <ReciterCard
                              key={reciter.id}
                              reciter={reciter}
                              isSelected={selectedReciter === reciter.id}
                              onClick={() => setSelectedReciter(reciter.id)}
                            />
                          ))}
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* ═══════ Quran: Step 3 - Select Ayahs ═══════ */}
          {contentMode !== 'ibtahalat' && currentStep === 3 && (
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>حدد نطاق الآيات</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-2">السورة المختارة</p>
                    <p className="text-xl font-bold">{selectedSurahData?.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedSurahData?.numberOfAyahs} آية</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startAyah">من الآية</Label>
                      <Input
                        id="startAyah"
                        type="text"
                        inputMode="numeric"
                        value={startAyahInput}
                        onChange={(e) => setStartAyahInput(e.target.value)}
                        onBlur={() => {
                          const max = selectedSurahData?.numberOfAyahs || 1;
                          const val = parseInt(startAyahInput) || 1;
                          const clamped = Math.min(Math.max(val, 1), max);
                          setStartAyah(clamped);
                          setStartAyahInput(clamped.toString());
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
                        onChange={(e) => setEndAyahInput(e.target.value)}
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

                  <div>
                    <Label className="mb-3 block">معاينة الآيات</Label>
                    {previewLoading || apiLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <ScrollArea className="h-[200px] border rounded-lg p-3">
                        <div className="space-y-2">
                          {ayahs.map((ayah) => (
                            <AyahDisplay key={ayah.number} number={ayah.numberInSurah} text={ayah.text} />
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ═══════ Background Step (Quran: 4, Ibtahalat: 2) ═══════ */}
          {((contentMode !== 'ibtahalat' && currentStep === 4) || (contentMode === 'ibtahalat' && currentStep === 2)) && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <BackgroundSelector selectedBackground={selectedBackground} onSelect={setSelectedBackground} />
              </div>
              <div className="space-y-6">
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
                      className="space-y-3"
                    >
                      <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                        <RadioGroupItem value="9:16" id="ratio-916" />
                        <Label htmlFor="ratio-916" className="flex items-center gap-2 cursor-pointer">
                          <Smartphone className="h-5 w-5" />
                          <div>
                            <p className="font-medium">عمودي 9:16</p>
                            <p className="text-xs text-muted-foreground">مثالي للريلز وتيكتوك</p>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                        <RadioGroupItem value="16:9" id="ratio-169" />
                        <Label htmlFor="ratio-169" className="flex items-center gap-2 cursor-pointer">
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
                {contentMode !== 'ibtahalat' && (
                  <TextSettingsPanel settings={textSettings} onChange={setTextSettings} />
                )}
              </div>
            </div>
          )}

          {/* ═══════ Preview / Summary Step ═══════ */}
          {isOnLastStep && (
            <Card>
              <CardHeader>
                <CardTitle>ملخص الفيديو</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contentMode === 'ibtahalat' ? (
                    <>
                      <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                        <p className="text-sm text-muted-foreground">المبتهل</p>
                        <p className="font-bold text-lg">
                          {selectedTrackData ? getPerformerById(selectedTrackData.performerId)?.name : ''}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                        <p className="text-sm text-muted-foreground">الابتهال</p>
                        <p className="font-bold text-lg">{selectedTrackData?.title}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                        <p className="text-sm text-muted-foreground">المدة</p>
                        <p className="font-bold">{selectedTrackData?.duration}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                        <p className="text-sm text-muted-foreground">السورة</p>
                        <p className="font-bold text-lg">{selectedSurahData?.name}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                        <p className="text-sm text-muted-foreground">القارئ</p>
                        <p className="font-bold text-lg">{selectedReciterData?.name}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                        <p className="text-sm text-muted-foreground">الآيات</p>
                        <p className="font-bold">من {startAyah} إلى {endAyah} ({endAyah - startAyah + 1} آية)</p>
                      </div>
                    </>
                  )}
                  <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                    <p className="text-sm text-muted-foreground">الخلفية</p>
                    <p className="font-bold">{selectedBackground?.name}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                    <p className="text-sm text-muted-foreground">الصيغة</p>
                    <p className="font-bold">
                      {aspectRatio === '9:16' ? 'عمودي (ريلز)' : 'أفقي (يوتيوب)'}
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={handleCreateVideo} size="lg" className="w-full gap-2 text-lg py-6">
                    <Play className="h-5 w-5" />
                    إنشاء الفيديو
                  </Button>
                </div>
              </CardContent>
            </Card>
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

          {!isOnLastStep && (
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

// ── Famous Ayahs Grid Component ──
function FamousAyahsGrid({ onSelect }: { onSelect: (ayah: FamousAyah) => void }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const filteredAyahs = getAyahsByCategory(selectedCategory);

  return (
    <div className="space-y-4">
      <div className="w-full overflow-x-auto pb-2" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="flex gap-2 min-w-max">
          {ayahCategories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className="whitespace-nowrap"
            >
              {cat.name}
            </Button>
          ))}
        </div>
      </div>
      <ScrollArea className="h-[45vh]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1">
          {filteredAyahs.map((ayah) => (
            <motion.div
              key={ayah.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(ayah)}
              className="cursor-pointer rounded-xl border-2 border-transparent hover:border-primary/50 transition-all p-4 bg-muted/50 hover:bg-muted"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{ayah.name}</h3>
                  <p className="text-sm text-muted-foreground">{ayah.description}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {ayah.endAyah - ayah.startAyah + 1} آية
                    </span>
                  </div>
                </div>
                <ChevronLeft className="h-5 w-5 text-muted-foreground" />
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
