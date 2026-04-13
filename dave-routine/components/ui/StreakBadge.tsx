'use client';
import { motion } from 'framer-motion';

interface StreakBadgeProps {
  currentStreak: number;
  longestStreak: number;
}

export function StreakBadge({ currentStreak, longestStreak }: StreakBadgeProps) {
  const isActive = currentStreak > 0;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Main Flame */}
      <div className="relative flex flex-col items-center">
        <motion.div
          animate={isActive ? {
            scale: [1, 1.05, 1],
            filter: ['brightness(1)', 'brightness(1.3)', 'brightness(1)'],
          } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="text-7xl leading-none"
        >
          {isActive ? '🔥' : '💤'}
        </motion.div>

        {/* Glow behind flame */}
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-full blur-2xl bg-orange-500/30 -z-10"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>

      {/* Streak Number */}
      <div className="text-center">
        <motion.div
          key={currentStreak}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-6xl font-black bg-gradient-to-b from-orange-300 to-orange-600 bg-clip-text text-transparent"
        >
          {currentStreak}
        </motion.div>
        <p className="text-white/50 text-sm mt-1 font-medium">
          dag{currentStreak !== 1 ? 'en' : ''} op rij
        </p>
      </div>

      {/* Longest streak */}
      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
        <span className="text-lg">🏆</span>
        <span className="text-white/70 text-sm">Hoogste streak: <span className="text-white font-bold">{longestStreak}</span></span>
      </div>
    </div>
  );
}
