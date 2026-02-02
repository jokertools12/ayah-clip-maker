import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Reciter } from '@/data/reciters';

interface ReciterCardProps {
  reciter: Reciter;
  isSelected?: boolean;
  onClick?: () => void;
}

export function ReciterCard({ reciter, isSelected, onClick }: ReciterCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-xl border p-4 transition-all duration-300",
        "bg-card hover:shadow-lg hover:shadow-primary/10",
        isSelected && "ring-2 ring-primary border-primary bg-primary/5"
      )}
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="flex h-12 w-12 items-center justify-center rounded-full gradient-gold text-accent-foreground font-bold text-lg">
          {reciter.name.charAt(0)}
        </div>

        {/* Info */}
        <div className="flex-1">
          <h3 className="font-bold text-lg">{reciter.name}</h3>
          <p className="text-sm text-muted-foreground">{reciter.englishName}</p>
        </div>

        {/* Style Badge */}
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          {reciter.style}
        </span>
      </div>
    </motion.div>
  );
}
