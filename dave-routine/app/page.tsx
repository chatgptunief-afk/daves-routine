'use client';
import { useEffect, useState } from 'react';
import { useAppState } from '@/hooks/useAppState';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { m, AnimatePresence } from 'framer-motion';
import { Bell, Coins, Flame } from 'lucide-react';
import { TaskCard } from '@/components/ui/TaskCard';
import { RoutineSection } from '@/components/ui/RoutineSection';
import { DailyCheckin } from '@/components/ui/DailyCheckin';

const DAYS_NL = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
const MONTHS_NL = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Goedemorgen';
  if (h < 17) return 'Goedemiddag';
  return 'Goedenavond';
}

function getDateLabel() {
  const d = new Date();
  return `${DAYS_NL[d.getDay()]} ${d.getDate()} ${MONTHS_NL[d.getMonth()]}`;
}

export default function TodayPage() {
  const {
    state, isLoaded, toggleTask, toggleNotifications, markCheckinDone, needsCheckin,
    completedCount, totalCount, completionPct, allDone,
    morningTasks, dailyTasks, eveningTasks, prayerTasks, cleanSoulTasks,
  } = useAppState();

  const coins = state?.soulCoins ?? 0;
  const [prevCoinsSeen, setPrevCoinsSeen] = useState(coins);
  const [showCoinToast, setShowCoinToast] = useState(false);

  if (coins !== prevCoinsSeen) {
    setPrevCoinsSeen(coins);
    if (coins > prevCoinsSeen) setShowCoinToast(true);
  }

  useEffect(() => {
    if (!showCoinToast) return;
    const t = setTimeout(() => setShowCoinToast(false), 2200);
    return () => clearTimeout(t);
  }, [showCoinToast]);

  if (!isLoaded || !state) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-7 h-7 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const frogTask = state.frogTaskId
    ? state.todayTasks.find(t => t.id === state.frogTaskId && !t.completed) ?? null
    : null;

  const requestNotifications = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(perm => {
        if (perm === 'granted') {
          toggleNotifications();
          new Notification('Notificaties geactiveerd!', {
            body: `Je krijgt nu meldingen, ${state.userName}.`,
            icon: '/icons/icon-192.png',
          });
        }
      });
    }
  };

  return (
    <>
      <DailyCheckin show={needsCheckin} userName={state.userName} onDone={markCheckinDone} />

      <div className="space-y-5">
        {/* Header */}
        <div className="flex justify-between items-start pt-1">
          <m.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <p className="text-text-tertiary text-sm">{getDateLabel()}</p>
            <h1 className="text-2xl font-bold text-text mt-0.5">
              {getGreeting()}, {state.userName}
            </h1>
          </m.div>

          <div className="flex items-center gap-2 pt-0.5">
            <div className="relative">
              <div className="flex items-center gap-1.5 bg-accent-soft border border-accent/20 rounded-full px-2.5 py-1.5">
                <Coins size={13} className="text-accent" />
                <span className="tnum text-accent-strong font-semibold text-sm">{state.soulCoins ?? 0}</span>
              </div>
              <AnimatePresence>
                {showCoinToast && (
                  <m.div
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: 1, y: -22 }}
                    exit={{ opacity: 0, y: -32 }}
                    transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                    className="absolute top-0 left-1/2 -translate-x-1/2 text-accent-strong font-bold text-xs whitespace-nowrap pointer-events-none"
                  >
                    +1
                  </m.div>
                )}
              </AnimatePresence>
            </div>
            <button
              onClick={requestNotifications}
              aria-label="Notificaties"
              className={`tap p-2.5 rounded-full border ${state.notificationsEnabled ? 'bg-accent-soft border-accent/30 text-accent' : 'bg-surface border-border text-text-tertiary'}`}
            >
              <Bell size={18} />
            </button>
          </div>
        </div>

        {/* Frog spotlight */}
        {frogTask && (
          <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}>
            <p className="text-xs font-semibold text-accent-strong mb-1.5 px-1">Prioriteit vandaag</p>
            <TaskCard task={frogTask} onToggle={toggleTask} isFrog />
          </m.div>
        )}

        {/* Progress overview */}
        <m.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          className={`rounded-card p-5 border flex items-center justify-between gap-4 ${
            allDone ? 'bg-accent-soft border-accent/25' : 'bg-surface border-border'
          }`}
        >
          <div className="min-w-0">
            <h2 className="font-bold text-lg text-text mb-1">{allDone ? 'Dag voltooid' : 'Taken vandaag'}</h2>
            <p className="tnum text-text-secondary text-sm">{completedCount} van de {totalCount} voltooid</p>
            {state.streaks.ultimate.currentStreak > 0 && (
              <div className="flex items-center gap-1.5 mt-2 text-accent-strong">
                <Flame size={14} />
                <span className="tnum text-sm font-semibold">{state.streaks.ultimate.currentStreak} dagen op rij</span>
              </div>
            )}
          </div>
          <ProgressRing percentage={completionPct} size={68} strokeWidth={6} label={`${completionPct}%`} />
        </m.div>

        {/* Empty blueprint state */}
        {state.taskBlueprint.length === 0 && (
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="border border-border bg-surface rounded-card p-6 text-center"
          >
            <div className="text-3xl mb-3">🌱</div>
            <h3 className="text-text font-semibold text-base mb-1">Klaar voor een nieuwe start?</h3>
            <p className="text-text-tertiary text-sm">Je hebt nog geen taken ingesteld. Ga naar Profiel om je routine te bouwen.</p>
          </m.div>
        )}

        {/* Full checklist */}
        {state.taskBlueprint.length > 0 && (
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="space-y-2.5"
          >
            <RoutineSection
              title="Gebeden"
              emoji="🕌"
              tasks={prayerTasks}
              onToggle={toggleTask}
              accentColor="var(--color-prayer)"
              defaultOpen
              frogTaskId={state.frogTaskId}
            />
            <RoutineSection
              title="Ochtendroutine"
              emoji="🌅"
              tasks={morningTasks}
              onToggle={toggleTask}
              accentColor="var(--color-accent)"
              defaultOpen
              frogTaskId={state.frogTaskId}
            />
            <RoutineSection
              title="Dagelijkse taken"
              emoji="📅"
              tasks={dailyTasks}
              onToggle={toggleTask}
              accentColor="var(--color-accent)"
              defaultOpen
              frogTaskId={state.frogTaskId}
            />
            <RoutineSection
              title="Avondroutine"
              emoji="🌙"
              tasks={eveningTasks}
              onToggle={toggleTask}
              accentColor="var(--color-accent)"
              defaultOpen={false}
              frogTaskId={state.frogTaskId}
            />
            <RoutineSection
              title="Clean Soul"
              emoji="🛡️"
              tasks={cleanSoulTasks}
              onToggle={toggleTask}
              accentColor="var(--color-cleansoul)"
              defaultOpen
              frogTaskId={state.frogTaskId}
            />
          </m.div>
        )}

        <p className="text-center text-text-tertiary text-xs pb-2">
          Taken resetten automatisch om middernacht
        </p>
      </div>
    </>
  );
}
