'use client';
import { useAppState } from '@/hooks/useAppState';
import { ROUTINE_LEVELS, PRAYER_LEVELS, CLEAN_SOUL_LEVELS, getCurrentLevel, getNextLevel } from '@/lib/estate';
import { SoulVisualization } from '@/components/ui/SoulVisualization';
import { motion } from 'framer-motion';
import { Sparkles, ArrowUpCircle } from 'lucide-react';

export default function EstatePage() {
  const { state, isLoaded } = useAppState();

  if (!isLoaded || !state) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const rStreak = state.streaks.routine.currentStreak;
  const pStreak = state.streaks.prayer.currentStreak;
  const cStreak = state.streaks.cleansoul.currentStreak;

  const currentRoutine = getCurrentLevel(rStreak, ROUTINE_LEVELS);
  const currentPrayer = getCurrentLevel(pStreak, PRAYER_LEVELS);
  const currentCleanSoul = getCurrentLevel(cStreak, CLEAN_SOUL_LEVELS);

  const nextRoutine = getNextLevel(rStreak, ROUTINE_LEVELS);
  const nextPrayer = getNextLevel(pStreak, PRAYER_LEVELS);
  const nextCleanSoul = getNextLevel(cStreak, CLEAN_SOUL_LEVELS);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Sparkles className="text-amber-400" /> Soul Estate
        </h1>
        <p className="text-white/40 text-sm mt-1">Jouw discipline bouwt deze wereld</p>
      </motion.div>

      {/* Visual Representation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.8, ease: 'easeOut' }}
      >
        <SoulVisualization
          routineStreak={rStreak}
          prayerStreak={pStreak}
          cleanSoulStreak={cStreak}
        />
      </motion.div>

      {/* Domains Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <h2 className="text-white/60 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
          <span className="w-4 h-px bg-white/20"></span>
          Domeinen & Upgrades
        </h2>

        {/* Routine */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-violet-500" />
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="text-white/40 text-xs uppercase tracking-widest font-bold">Basis • Routine</div>
              <div className="text-white font-bold text-lg">{currentRoutine.description}</div>
            </div>
            <div className="text-2xl">🏠</div>
          </div>
          {nextRoutine ? (
            <div className="mt-3 flex items-center gap-2 text-xs bg-white/5 rounded-xl p-2.5 text-white/70">
              <ArrowUpCircle size={16} className="text-violet-400" />
              <span>Nog <strong className="text-white">{nextRoutine.threshold - rStreak} dagen</strong> voor <strong>{nextRoutine.description}</strong></span>
            </div>
          ) : (
            <div className="mt-3 text-xs text-violet-300 font-medium bg-violet-500/10 rounded-xl p-2.5">
              MAX LEVEL BEREIKT
            </div>
          )}
        </div>

        {/* Gebeden */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="text-white/40 text-xs uppercase tracking-widest font-bold">Sfeer • Gebeden</div>
              <div className="text-white font-bold text-lg">{currentPrayer.description}</div>
            </div>
            <div className="text-2xl">🕌</div>
          </div>
          {nextPrayer ? (
            <div className="mt-3 flex items-center gap-2 text-xs bg-white/5 rounded-xl p-2.5 text-white/70">
              <ArrowUpCircle size={16} className="text-amber-400" />
              <span>Nog <strong className="text-white">{nextPrayer.threshold - pStreak} dagen</strong> voor <strong>{nextPrayer.description}</strong></span>
            </div>
          ) : (
            <div className="mt-3 text-xs text-amber-300 font-medium bg-amber-500/10 rounded-xl p-2.5">
              MAX LEVEL BEREIKT
            </div>
          )}
        </div>

        {/* Clean Soul */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-teal-400" />
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="text-white/40 text-xs uppercase tracking-widest font-bold">Omgeving • Clean Soul</div>
              <div className="text-white font-bold text-lg">{currentCleanSoul.description}</div>
            </div>
            <div className="text-2xl">🛡️</div>
          </div>
          {nextCleanSoul ? (
            <div className="mt-3 flex items-center gap-2 text-xs bg-white/5 rounded-xl p-2.5 text-white/70">
              <ArrowUpCircle size={16} className="text-teal-400" />
              <span>Nog <strong className="text-white">{nextCleanSoul.threshold - cStreak} dagen</strong> voor <strong>{nextCleanSoul.description}</strong></span>
            </div>
          ) : (
            <div className="mt-3 text-xs text-teal-300 font-medium bg-teal-500/10 rounded-xl p-2.5">
              MAX LEVEL BEREIKT
            </div>
          )}
        </div>

      </motion.div>
    </div>
  );
}
