'use client';
import { useAppState } from '@/hooks/useAppState';
import { StreakBadge } from '@/components/ui/StreakBadge';
import { motion } from 'framer-motion';
import { getTodayDateString } from '@/lib/tasks';
import { Crown } from 'lucide-react';

const WEEKDAYS = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'];

function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      date: d.toISOString().split('T')[0],
      dayLabel: WEEKDAYS[d.getDay()],
      isToday: i === 0,
    });
  }
  return days;
}

export default function StreakPage() {
  const { state, isLoaded } = useAppState();

  if (!isLoaded || !state) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const last7 = getLast7Days();
  const today = getTodayDateString();
  const ultimateTodayCompleted = state.streaks.ultimate.history[today] || false;

  const getMotivation = (streak: number) => {
    if (streak === 0) return { msg: 'Start vandaag nog je Ultimate streak! 💪', color: 'text-white/50' };
    if (streak < 3) return { msg: 'Goed begin! Hou vol! 🚀', color: 'text-amber-400' };
    if (streak < 7) return { msg: 'Je bent op de goede weg! 🔥', color: 'text-orange-400' };
    if (streak < 14) return { msg: 'Ongelooflijk consistent! ⚡', color: 'text-violet-400' };
    if (streak < 30) return { msg: 'Je bent onstopbaar! 🏆', color: 'text-yellow-400' };
    return { msg: 'LEGENDE STATUS 👑', color: 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500' };
  };

  const motivation = getMotivation(state.streaks.ultimate.currentStreak);

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Statistieken</h1>
        <p className="text-white/40 text-sm mt-1">Jouw voortgang in alle domeinen</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className="relative bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-orange-500/20 rounded-3xl p-8 flex flex-col items-center overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-500/20 via-transparent to-transparent opacity-50 blur-xl"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-4 text-orange-300 font-bold tracking-widest uppercase text-sm">
            <Crown size={18} /> Ultimate Streak
          </div>
          <motion.div
            animate={state.streaks.ultimate.currentStreak > 0 ? {
              scale: [1, 1.05, 1],
              filter: ['brightness(1)', 'brightness(1.2)', 'brightness(1)'],
            } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="text-7xl mb-2"
          >
            {state.streaks.ultimate.currentStreak > 0 ? '👑' : '💤'}
          </motion.div>
          <div className="text-6xl font-black bg-gradient-to-b from-yellow-200 to-orange-500 bg-clip-text text-transparent mb-1">
            {state.streaks.ultimate.currentStreak}
          </div>
          <p className="text-orange-200/50 text-sm font-medium mb-4">dagen alles gehaald</p>
          
          <div className="bg-orange-500/20 border border-orange-500/30 rounded-full px-4 py-1.5 text-xs text-orange-200">
            Record: {state.streaks.ultimate.longestStreak} dagen
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-center font-bold text-lg">
        <p className={motivation.color}>{motivation.msg}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="w-4 h-px bg-white/20"></span>
          Individuele doelen
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { tag: 'routine', label: 'Routine', emoji: '🏆', color: 'from-violet-500 to-purple-500' },
            { tag: 'prayer', label: 'Gebeden', emoji: '🕌', color: 'from-amber-400 to-orange-500' },
            { tag: 'cleansoul', label: 'Clean Soul', emoji: '🛡️', color: 'from-teal-400 to-emerald-500' },
          ].map((s, i) => {
            const current = state.streaks[s.tag as keyof typeof state.streaks].currentStreak;
            return (
              <motion.div
                key={s.tag}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + (i * 0.1) }}
                className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center"
              >
                <div className="text-3xl mb-2">{s.emoji}</div>
                <div className={`text-2xl font-black bg-gradient-to-br ${s.color} bg-clip-text text-transparent`}>
                  {current}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-white/40 mt-1">{s.label}</div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="w-4 h-px bg-white/20"></span>
          Afgelopen 7 dagen (Ultimate)
        </h2>
        <div className="grid grid-cols-7 gap-1.5">
          {last7.map(({ date, dayLabel, isToday }, i) => {
            const completed = state.streaks.ultimate.history[date];
            const isFuture = date > today;
            return (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 + i * 0.05 }}
                className="flex flex-col items-center gap-1.5"
              >
                <span className={`text-[10px] font-medium ${isToday ? 'text-orange-400' : 'text-white/30'}`}>
                  {dayLabel}
                </span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base transition-all
                  ${isFuture
                    ? 'bg-white/5 border border-white/5'
                    : completed
                      ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                      : isToday && ultimateTodayCompleted
                        ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                        : 'bg-white/[0.06] border border-white/10'
                  }`}
                >
                  {isFuture ? '' : completed ? '✓' : isToday ? '•' : '✗'}
                </div>
                {isToday && (
                  <div className="w-1 h-1 rounded-full bg-orange-400 mt-1" />
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
