import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Bookmark, ChevronLeft, Heart } from 'lucide-react';
import { famousAyahs, FamousAyah } from '@/data/famousAyahs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FamousAyahSelectorProps {
  onSelect: (ayah: FamousAyah) => void;
}

export function FamousAyahSelector({ onSelect }: FamousAyahSelectorProps) {
  const { user, isAuthenticated } = useAuth();
  const [favoriteSurahs, setFavoriteSurahs] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!user) return;
    supabase.from('favorite_surahs').select('surah_number').eq('user_id', user.id)
      .then(({ data }) => {
        setFavoriteSurahs(new Set((data || []).map((f: any) => f.surah_number)));
      });
  }, [user]);

  const toggleFavorite = async (e: React.MouseEvent, surahNumber: number) => {
    e.stopPropagation();
    if (!isAuthenticated || !user) {
      toast.error('سجل دخول أولاً');
      return;
    }
    if (favoriteSurahs.has(surahNumber)) {
      await supabase.from('favorite_surahs').delete().eq('user_id', user.id).eq('surah_number', surahNumber);
      setFavoriteSurahs(prev => { const n = new Set(prev); n.delete(surahNumber); return n; });
      toast.success('تم الإزالة من المفضلة');
    } else {
      await supabase.from('favorite_surahs').insert({ user_id: user.id, surah_number: surahNumber });
      setFavoriteSurahs(prev => new Set(prev).add(surahNumber));
      toast.success('تم الإضافة للمفضلة');
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bookmark className="h-5 w-5" />
          آيات مشهورة
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[280px] px-4">
          <div className="space-y-2 pb-4">
            {famousAyahs.map((ayah) => (
              <div key={ayah.id} className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  className="flex-1 justify-between h-auto py-3 px-4 hover:bg-muted/80"
                  onClick={() => onSelect(ayah)}
                >
                  <div className="text-right">
                    <p className="font-semibold">{ayah.name}</p>
                    <p className="text-xs text-muted-foreground">{ayah.description}</p>
                  </div>
                  <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={(e) => toggleFavorite(e, ayah.surahNumber)}
                >
                  <Heart className={cn("h-4 w-4", favoriteSurahs.has(ayah.surahNumber) && "fill-red-500 text-red-500")} />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
