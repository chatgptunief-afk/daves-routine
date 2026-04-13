'use client';
import { useAppState } from '@/hooks/useAppState';
import { ROUTINE_LEVELS, PRAYER_LEVELS, CLEAN_SOUL_LEVELS, getCurrentLevel, getNextLevel } from '@/lib/estate';
import { SoulVisualization } from '@/components/ui/SoulVisualization';
import { motion } from 'framer-motion';
import { Sparkles, ArrowUpCircle, Trophy } from 'lucide-react';

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

  const currentRoutine   = getCurrentLevel(rStreak, ROUTINE_LEVELS);
  const currentPrayer    = getCurrentLevel(pStreak, PRAYER_LEVELS);
  const currentCleanSoul = getCurrentLevel(cStreak, CLEAN_SOUL_LEVELS);

  const nextRoutine   = getNextLevel(rStreak, ROUTINE_LEVELS);
  const nextPrayer    = getNextLevel(pStreak, PRAYER_LEVELS);
  const nextCleanSoul = getNextLevel(cStreak, CLEAN_SOUL_LEVELS);

  const isMaxAll = !nextRoutine && !nextPrayer && !nextCleanSoul;

  const domains = [
    {
      label: 'Basis · Routine',
      current: currentRoutine,
      next: nextRoutine,
      streak: rStreak,
      icon: currentRoutine.emoji,
      accent: '#7c3aed',
      badge: 'text-violet-400',
      bgBadge: 'bg-violet-500/10',
    },
    {
      label: 'Sfeer · Gebeden',
      current: currentPrayer,
      next: nextPrayer,
      streak: pStreak,
      icon: currentPrayer.emoji,
      accent: '#f59e0b',
      badge: 'text-amber-400',
      bgBadge: 'bg-amber-500/10',
    },
    {
      label: 'Omgeving · Clean Soul',
      current: currentCleanSoul,
      next: nextCleanSoul,
      streak: cStreak,
      icon: currentCleanSoul.emoji,
      accent: '#14b8a6',
      badge: 'text-teal-400',
      bgBadge: 'bg-teal-500/10',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Sparkles className="text-amber-400" /> Soul Estate
        </h1>
        <p className="text-white/40 text-sm mt-1">Jouw discipline bouwt deze wereld — 50 dagen voor het Gouden Paleis</p>
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

      {/* MAX LEVEL celebration */}
      {isMaxAll && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-yellow-500/20 to-amber-600/20 border border-yellow-500/30 rounded-3xl p-5 flex items-center gap-4"
        >
          <span className="text-4xl">👑</span>
          <div>
            <div className="text-yellow-300 font-bold text-lg">Gouden Paleis Bereikt!</div>
            <div className="text-yellow-200/60 text-sm">Je hebt het ultieme level van alle domeinen bereikt. Legendarisch.</div>
          </div>
        </motion.div>
      )}

      {/* Domains */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <h2 className="text-white/60 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
          <span className="w-4 h-px bg-white/20" />
          Domeinen & Upgrades
        </h2>

        {domains.map(({ label, current, next, streak, icon, accent, badge, bgBadge }) => {
          const maxThreshold = next ? next.threshold : 50;
          const prevThreshold = current.threshold;
          const pct = next
            ? Math.round(((streak - prevThreshold) / (maxThreshold - prevThreshold)) * 100)
            : 100;

          return (
            <div key={label} className="bg-white/[0.03] border border-white/10 rounded-3xl p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full rounded-l-3xl" style={{ background: accent }} />

              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-white/40 text-xs uppercase tracking-widest font-bold mb-0.5">{label}</div>
                  <div className="text-white font-bold text-lg">{current.description}</div>
                </div>
                <div className="text-3xl">{icon}</div>
              </div>

              {/* Progress bar to next level */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-[10px] text-white/30 mb-1">
                  <span>Dag {streak}</span>
                  <span>{next ? `Dag ${next.threshold}` : 'Max bereikt'}</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: accent }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {next ? (
                <div className="flex items-center gap-2 text-xs bg-white/5 rounded-xl p-2.5 text-white/70">
                  <ArrowUpCircle size={16} className={badge} />
                  <span>
                    Nog <strong className="text-white">{next.threshold - streak} dagen</strong> voor <strong>{next.description}</strong> {next.emoji}
                  </span>
                </div>
              ) : (
                <div className={`flex items-center gap-2 text-xs font-medium rounded-xl p-2.5 ${bgBadge}`}>
                  <Trophy size={14} className={badge} />
                  <span className={badge}>MAX LEVEL BEREIKT ✨</span>
                </div>
              )}
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
