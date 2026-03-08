import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Heart, BookOpen, Mic, Video, Loader2, Trash2,
} from 'lucide-react';
import { surahs } from '@/data/surahs';
import { reciters } from '@/data/reciters';
import { toast } from 'sonner';

export default function FavoritesPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [favSurahs, setFavSurahs] = useState<number[]>([]);
  const [favReciters, setFavReciters] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [{ data: fs }, { data: fr }] = await Promise.all([
        supabase.from('favorite_surahs').select('surah_number').eq('user_id', user.id),
        supabase.from('favorite_reciters').select('reciter_id').eq('user_id', user.id),
      ]);
      setFavSurahs((fs || []).map((f: any) => f.surah_number));
      setFavReciters((fr || []).map((f: any) => f.reciter_id));
      setLoading(false);
    };
    load();
  }, [user]);

  const removeFavSurah = async (num: number) => {
    if (!user) return;
    await supabase.from('favorite_surahs').delete().eq('user_id', user.id).eq('surah_number', num);
    setFavSurahs(prev => prev.filter(n => n !== num));
    toast.success('تمت الإزالة من المفضلة');
  };

  const removeFavReciter = async (id: string) => {
    if (!user) return;
    await supabase.from('favorite_reciters').delete().eq('user_id', user.id).eq('reciter_id', id);
    setFavReciters(prev => prev.filter(r => r !== id));
    toast.success('تمت الإزالة من المفضلة');
  };

  if (authLoading || loading) {
    return <Layout><div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;
  }
  if (!isAuthenticated) return <Navigate to="/auth" replace />;

  const favSurahData = surahs.filter(s => favSurahs.includes(s.number));
  const favReciterData = reciters.filter(r => favReciters.includes(r.id));

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Heart className="h-8 w-8 text-destructive" />
            المفضلة
          </h1>
          <p className="text-muted-foreground mt-1">جميع السور والقراء المفضلين لديك</p>
        </motion.div>

        <Tabs defaultValue="surahs" dir="rtl">
          <TabsList className="mb-6">
            <TabsTrigger value="surahs" className="gap-2">
              <BookOpen className="h-4 w-4" />
              السور ({favSurahData.length})
            </TabsTrigger>
            <TabsTrigger value="reciters" className="gap-2">
              <Mic className="h-4 w-4" />
              القراء ({favReciterData.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="surahs">
            {favSurahData.length === 0 ? (
              <Card><CardContent className="p-12 text-center text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>لم تضف أي سورة للمفضلة بعد</p>
                <Button asChild className="mt-4" variant="outline"><Link to="/surahs">تصفح السور</Link></Button>
              </CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {favSurahData.map((s, i) => (
                  <motion.div key={s.number} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-bold text-primary">{s.number}</span>
                            </div>
                            <div>
                              <h3 className="font-bold">{s.name}</h3>
                              <p className="text-xs text-muted-foreground">{s.numberOfAyahs} آية</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeFavSurah(s.number)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="secondary" className="text-xs">{s.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}</Badge>
                        </div>
                        <Button asChild size="sm" className="w-full mt-3 gap-1">
                          <Link to={`/create?surah=${s.number}`}>
                            <Video className="h-4 w-4" />
                            إنشاء فيديو
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reciters">
            {favReciterData.length === 0 ? (
              <Card><CardContent className="p-12 text-center text-muted-foreground">
                <Mic className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>لم تضف أي قارئ للمفضلة بعد</p>
                <Button asChild className="mt-4" variant="outline"><Link to="/create">اختر قارئ</Link></Button>
              </CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {favReciterData.map((r, i) => (
                  <motion.div key={r.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                              <Mic className="h-5 w-5 text-accent" />
                            </div>
                            <div>
                              <h3 className="font-bold">{r.name}</h3>
                              <p className="text-xs text-muted-foreground">{r.style}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeFavReciter(r.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        <Button asChild size="sm" className="w-full mt-3 gap-1">
                          <Link to={`/create?reciter=${r.id}`}>
                            <Video className="h-4 w-4" />
                            إنشاء فيديو
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
