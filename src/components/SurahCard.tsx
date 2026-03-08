import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface SurahCardProps {
  number: number;
  name: string;
  englishName: string;
  revelationType: 'Meccan' | 'Medinan';
  numberOfAyahs: number;
  onClick?: () => void;
  isSelected?: boolean;
}

export function SurahCard({
  number,
  name,
  englishName,
  revelationType,
  numberOfAyahs,
  onClick,
  isSelected,
}: SurahCardProps) {
  const { user, isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('favorite_surahs')
      .select('id')
      .eq('user_id', user.id)
      .eq('surah_number', number)
      .maybeSingle()
      .then(({ data }) => setIsFavorite(!!data));
  }, [user, number]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated || !user) {
      toast.error('سجل دخول أولاً');
      return;
    }

    if (isFavorite) {
      await supabase
        .from('favorite_surahs')
        .delete()
        .eq('user_id', user.id)
        .eq('surah_number', number);
      setIsFavorite(false);
      toast.success('تم الإزالة من المفضلة');
    } else {
      await supabase
        .from('favorite_surahs')
        .insert({ user_id: user.id, surah_number: number });
      setIsFavorite(true);
      toast.success('تم الإضافة للمفضلة');
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-xl border p-4 transition-all duration-300",
        "bg-card hover:shadow-lg hover:shadow-primary/10",
        isSelected && "ring-2 ring-primary border-primary"
      )}
    >
      <div className="flex items-start justify-between">
        {/* Number Badge */}
        <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary text-primary-foreground font-bold">
          {number}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Favorite Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={toggleFavorite}
          >
            <Heart className={cn("h-4 w-4", isFavorite && "fill-red-500 text-red-500")} />
          </Button>

          {/* Revelation Type Badge */}
          <span
            className={cn(
              "rounded-full px-2 py-1 text-xs font-medium",
              revelationType === 'Meccan'
                ? "bg-quran-emerald/20 text-quran-emerald"
                : "bg-quran-gold/20 text-quran-gold"
            )}
          >
            {revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
          </span>
        </div>
      </div>

      {/* Surah Name */}
      <div className="mt-4">
        <h3 className="text-xl font-bold font-quran">{name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{englishName}</p>
      </div>

      {/* Ayah Count */}
      <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
        <span>{numberOfAyahs} آية</span>
      </div>
    </motion.div>
  );
}
