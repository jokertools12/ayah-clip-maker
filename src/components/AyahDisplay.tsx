import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AyahDisplayProps {
  number: number;
  text: string;
  isHighlighted?: boolean;
  showNumber?: boolean;
  className?: string;
}

export function AyahDisplay({
  number,
  text,
  isHighlighted,
  showNumber = true,
  className,
}: AyahDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: number * 0.1 }}
      className={cn(
        "rounded-lg p-4 transition-all duration-300",
        isHighlighted && "bg-quran-gold/20 verse-highlight",
        className
      )}
    >
      <p className="font-quran text-2xl md:text-3xl leading-loose text-right">
        {text}
        {showNumber && (
          <span className="inline-flex items-center justify-center mx-2 h-8 w-8 rounded-full bg-primary/10 text-primary text-sm font-cairo">
            {number}
          </span>
        )}
      </p>
    </motion.div>
  );
}
