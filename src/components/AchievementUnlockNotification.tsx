import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, X } from 'lucide-react';

interface AchievementNotification {
  id: string;
  title: string;
  description: string;
  points: number;
}

let showNotification: (ach: AchievementNotification) => void = () => {};

export function triggerAchievementNotification(ach: AchievementNotification) {
  showNotification(ach);
}

export function AchievementUnlockOverlay() {
  const [notification, setNotification] = useState<AchievementNotification | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    showNotification = (ach) => {
      setNotification(ach);
      setVisible(true);
      setTimeout(() => setVisible(false), 5000);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && notification && (
        <motion.div
          initial={{ opacity: 0, y: -80, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-[90vw] max-w-sm"
        >
          <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-card shadow-2xl shadow-primary/20">
            {/* Animated background glow */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/10"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            <div className="relative p-5">
              <button
                onClick={() => setVisible(false)}
                className="absolute top-3 left-3 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-4">
                {/* Animated Trophy */}
                <motion.div
                  className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0"
                  animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    <Trophy className="h-7 w-7 text-primary" />
                  </motion.div>
                </motion.div>

                <div className="flex-1 min-w-0">
                  <motion.p
                    className="text-xs font-medium text-primary mb-0.5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    🎉 إنجاز جديد!
                  </motion.p>
                  <motion.h3
                    className="font-bold text-foreground truncate"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {notification.title}
                  </motion.h3>
                  <motion.p
                    className="text-xs text-muted-foreground mt-0.5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {notification.description}
                  </motion.p>
                </div>

                {/* Points Badge */}
                <motion.div
                  className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 shrink-0"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.5 }}
                >
                  <Star className="h-3.5 w-3.5 text-primary" />
                  <span className="text-sm font-bold text-primary">+{notification.points}</span>
                </motion.div>
              </div>

              {/* Sparkle particles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute h-1 w-1 rounded-full bg-primary"
                  initial={{
                    opacity: 0,
                    x: 60 + Math.random() * 40,
                    y: 30 + Math.random() * 20,
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    x: 60 + (Math.random() - 0.5) * 120,
                    y: (Math.random() - 0.5) * 80,
                    scale: [0, 1.5, 0],
                  }}
                  transition={{ duration: 1.2, delay: 0.3 + i * 0.1 }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
