'use client';
import { useAppState } from '@/hooks/useAppState';
import { SoulVisualization } from '@/components/ui/SoulVisualization';
import { ROUTINE_LEVELS, PRAYER_LEVELS, CLEAN_SOUL_LEVELS, getCurrentLevel, getNextLevel } from '@/lib/estate';
import { getTodayDateString } from '@/lib/tasks';
import { m } from 'framer-motion';
import { Flame, Trophy } from 'lucide-react';

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

export default function VoortgangPage() {
  const { state, isLoaded } = useAppState();

  if (!isLoaded || !state) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-7 h-7 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const last7 = getLast7Days();
  const today = getTodayDateString();
  const ultimateTodayCompleted = state.streaks.ultimate.history[today] || false;
  const ultimate = state.streaks.ultimate;
  const hasStreak = ultimate.currentStreak > 0;

  const rStreak = state.streaks.routine.currentStreak;
  const pStreak = state.streaks.prayer.currentStreak;
  const cStreak = state.streaks.cleansoul.currentStreak;

  const domains = [
    {
      key: 'routine', label: 'Routine', emoji: '🏆', streak: rStreak,
      current: getCurrentLevel(rStreak, ROUTINE_LEVELS), next: getNextLevel(rStreak, ROUTINE_LEVELS),
      color: 'var(--color-accent)',
    },
    {
      key: 'prayer', label: 'Gebeden', emoji: '🕌', streak: pStreak,
      current: getCurrentLevel(pStreak, PRAYER_LEVELS), next: getNextLevel(pStreak, PRAYER_LEVELS),
      color: 'var(--color-prayer)',
    },
    {
      key: 'cleansoul', label: 'Clean Soul', emoji: '🛡️', streak: cStreak,
      current: getCurrentLevel(cStreak, CLEAN_SOUL_LEVELS), next: getNextLevel(cStreak, CLEAN_SOUL_LEVELS),
      color: 'var(--color-cleansoul)',
    },
  ];

  return (
    <div className="space-y-8">
      <m.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="font-display text-[26px] font-semibold text-text tracking-tight">Voortgang</h1>
        <p className="text-text-tertiary text-sm mt-0.5">Jouw consistentie over tijd</p>
      </m.div>

      {/* Ultimate streak hero */}
      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className="rounded-card p-6 flex flex-col items-center text-center border"
        style={{
          borderColor: hasStreak ? 'rgba(226,145,74,0.25)' : 'var(--color-border)',
          background: hasStreak ? 'linear-gradient(160deg, rgba(226,145,74,0.1), rgba(21,19,25,0.5))' : 'var(--color-surface)',
        }}
      >
        <div className="flex items-center gap-2 mb-3 text-accent-strong font-semibold text-sm">
          <Flame size={16} /> Ultimate streak
        </div>
        <div className="font-display tnum text-7xl font-bold text-text leading-none mb-1 tracking-tight">
          {ultimate.currentStreak}
        </div>
        <p className="text-text-tertiary text-sm mb-4">{ultimate.currentStreak === 1 ? 'dag alles gehaald' : 'dagen alles gehaald'}</p>

        {hasStreak ? (
          <div className="bg-accent-soft border border-accent/20 rounded-full px-4 py-1.5 text-xs text-accent-strong font-medium">
            Record: {ultimate.longestStreak} dagen
          </div>
        ) : (
          <p className="text-text-secondary text-xs max-w-[220px]">
            Nog geen streak. Voltooi vandaag je taken en de eerste dag telt.
          </p>
        )}
      </m.div>

      {/* 7-day history */}
      <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}>
        <h2 className="font-display text-text font-semibold text-[15px] mb-3">Afgelopen 7 dagen</h2>
        <div className="grid grid-cols-7 gap-1.5">
          {last7.map(({ date, dayLabel, isToday }, i) => {
            const completed = state.streaks.ultimate.history[date];
            const isFuture = date > today;
            return (
              <m.div
                key={date}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + i * 0.03, duration: 0.25 }}
                className="flex flex-col items-center gap-1.5"
              >
                <span className={`text-[10px] font-medium ${isToday ? 'text-accent-strong' : 'text-text-tertiary'}`}>
                  {dayLabel}
                </span>
                <div className={`w-9 h-9 rounded-control flex items-center justify-center text-sm font-semibold
                  ${isFuture
                    ? 'bg-surface border border-border text-transparent'
                    : completed || (isToday && ultimateTodayCompleted)
                      ? 'bg-accent text-accent-ink'
                      : 'bg-surface border border-border text-text-tertiary'
                  }`}
                >
                  {isFuture ? '' : completed || (isToday && ultimateTodayCompleted) ? '✓' : isToday ? '·' : '–'}
                </div>
              </m.div>
            );
          })}
        </div>
      </m.div>

      {/* Soul Estate */}
      <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}>
        <h2 className="font-display text-text font-semibold text-[15px] mb-1">Jouw wereld</h2>
        <p className="text-text-tertiary text-sm mb-3">Groeit mee met je discipline, dag na dag</p>
        <SoulVisualization routineStreak={rStreak} prayerStreak={pStreak} cleanSoulStreak={cStreak} />
      </m.div>

      {/* Domain breakdown */}
      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className="space-y-2.5"
      >
        <h2 className="font-display text-text font-semibold text-[15px]">Domeinen</h2>

        {domains.map(({ key, label, emoji, streak, current, next, color }) => {
          const maxThreshold = next ? next.threshold : 50;
          const prevThreshold = current.threshold;
          const pct = next
            ? Math.round(((streak - prevThreshold) / (maxThreshold - prevThreshold)) * 100)
            : 100;

          return (
            <div key={key} className="bg-surface border border-border rounded-card p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="min-w-0">
                  <div className="text-text-tertiary text-xs font-medium mb-0.5">{label}</div>
                  <div className="font-display text-text font-semibold text-[15px]">{current.description}</div>
                </div>
                <div className="text-2xl flex-shrink-0">{emoji}</div>
              </div>

              <div className="mb-2.5">
                <div className="flex items-center justify-between text-[11px] text-text-tertiary mb-1">
                  <span className="tnum">Dag {streak}</span>
                  <span className="tnum">{next ? `Dag ${next.threshold}` : 'Max bereikt'}</span>
                </div>
                <div className="h-1.5 bg-white/[0.07] rounded-full overflow-hidden">
                  <m.div
                    className="h-full rounded-full"
                    style={{ background: color }}
                    initial={false}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                  />
                </div>
              </div>

              {next ? (
                <p className="text-xs text-text-secondary">
                  Nog <strong className="tnum text-text font-semibold">{next.threshold - streak} dagen</strong> voor {next.description} {next.emoji}
                </p>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-medium text-accent-strong">
                  <Trophy size={13} /> Max level bereikt
                </div>
              )}
            </div>
          );
        })}
      </m.div>
    </div>
  );
}
