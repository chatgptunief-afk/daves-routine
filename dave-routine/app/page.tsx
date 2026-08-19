'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wind, Moon } from 'lucide-react';
import { useApp } from '@/components/AppStateProvider';
import { Arc } from '@/components/ui/Arc';
import { EersteSteenField } from '@/components/ui/EersteSteenField';
import { GebedGroup } from '@/components/ui/GebedGroup';
import { PhaseGroup } from '@/components/ui/PhaseGroup';
import { ZuiverheidField } from '@/components/ui/ZuiverheidField';
import { GoalChip } from '@/components/ui/GoalChip';
import { LogSheet } from '@/components/ui/LogSheet';
import { Dagafsluiting } from '@/components/ui/Dagafsluiting';
import { Herstel } from '@/components/ui/Herstel';
import { Breathing } from '@/components/ui/Breathing';
import { MomentOverlay, type MomentContent } from '@/components/ui/MomentOverlay';
import { Toast } from '@/components/ui/Toast';
import { getCurrentPhase, momentLine } from '@/lib/phase';
import { dateLabel, addDays, weekday, timeStringToDate } from '@/lib/date';
import { tasksForWeekday } from '@/lib/tasks';
import { Goal, Phase } from '@/types';

export default function VandaagPage() {
  const router = useRouter();
  const app = useApp();
  const { state, isLoaded, toast, toggleTask, completeDagafsluiting, markCheckinDone, logGoalEntry } = app;

  const [now, setNow] = useState<Date | null>(null);
  const [breathingOpen, setBreathingOpen] = useState(false);
  const [dagafsluitingOpen, setDagafsluitingOpen] = useState(false);
  const [logGoal, setLogGoal] = useState<Goal | null>(null);
  const [moment, setMoment] = useState<MomentContent | null>(null);
  const wasAllDone = useRef(false);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (isLoaded && state && !state.onboardingComplete) router.replace('/welkom');
  }, [isLoaded, state, router]);

  useEffect(() => {
    if (app.allAnkersDone && !wasAllDone.current) {
      setMoment({ number: `${app.streak.current + 1}`, line: 'Alle ankers staan. De dag is gemaakt.' });
    }
    wasAllDone.current = app.allAnkersDone;
  }, [app.allAnkersDone, app.streak.current]);

  if (!isLoaded || !state || !now || !state.prayerTimesCache) {
    return (
      <div className="pt-16 text-center">
        <p className="text-paper-56 text-[14px]">Laden...</p>
      </div>
    );
  }

  const times = state.prayerTimesCache;
  const currentPhase = getCurrentPhase(now, times);
  const phaseForGroup = (p: Phase): 'ochtend' | 'doorlopend' | 'avond' => {
    if (p === 'fajr' || p === 'ochtend') return 'ochtend';
    if (p === 'middag' || p === 'doorlopend') return 'doorlopend';
    return 'avond';
  };
  const activeGroup = phaseForGroup(currentPhase);

  const prayersCompleted = {
    fajr: !!app.gebedTasks.find(t => t.prayer === 'fajr')?.completed,
    dhuhr: !!app.gebedTasks.find(t => t.prayer === 'dhuhr')?.completed,
    asr: !!app.gebedTasks.find(t => t.prayer === 'asr')?.completed,
    maghrib: !!app.gebedTasks.find(t => t.prayer === 'maghrib')?.completed,
    isha: !!app.gebedTasks.find(t => t.prayer === 'isha')?.completed,
  };

  const completionRatio = app.ankerTasks.length > 0 ? app.ankersCompletedCount / app.ankerTasks.length : 0;
  const dayIsOver = now > timeStringToDate(times.date, times.isha);

  const purityTask = app.zuiverheidTasks[0] ?? null;
  const displayedPurityStreak = app.purityStreak + (purityTask?.completed ? 1 : 0);

  const ochtendTasks = app.ritmeTasks.filter(t => phaseForGroup(t.phase) === 'ochtend');
  const doorlopendTasks = app.ritmeTasks.filter(t => phaseForGroup(t.phase) === 'doorlopend');
  const avondTasks = app.ritmeTasks.filter(t => phaseForGroup(t.phase) === 'avond');

  const activeGoals = state.goals.filter(g => !g.archivedAt);

  const nextDay = addDays(times.date, 1);
  const tomorrowTaskList = tasksForWeekday(state.taskBlueprint, weekday(nextDay)).filter(t => t.domain === 'ritme');

  return (
    <div className="pb-8">
      <div className="flex items-start justify-between mb-1">
        <div>
          <p className="eyebrow mb-1">{dateLabel(times.date)}</p>
          <p className="text-[15px] text-paper-72">{momentLine(now, times)}</p>
        </div>
        <button onClick={() => setBreathingOpen(true)} className="tap w-9 h-9 rounded-full flex items-center justify-center text-paper-56" aria-label="Adem">
          <Wind size={18} strokeWidth={1.75} />
        </button>
      </div>

      <div className="my-6">
        <Arc now={now} times={times} completionRatio={completionRatio} prayersCompleted={prayersCompleted} />
      </div>

      {app.missedDaysInARow >= 2 && state.lastCheckinDate !== times.date && (
        <Herstel missedDays={app.missedDaysInARow} onContinue={markCheckinDone} />
      )}

      <div className="space-y-7">
        <EersteSteenField task={app.firstStoneTask} onToggle={toggleTask} dayIsOver={dayIsOver} />

        <GebedGroup tasks={app.gebedTasks} times={times} now={now} onToggle={toggleTask} />

        <ZuiverheidField task={purityTask} streakDays={displayedPurityStreak} onToggle={toggleTask} />

        {activeGoals.length > 0 && (
          <div className="flex gap-2 overflow-x-auto -mx-5 px-5 pb-1">
            {activeGoals.map(goal => (
              <GoalChip key={goal.id} goal={goal} entries={state.logEntries} onTap={() => setLogGoal(goal)} />
            ))}
          </div>
        )}

        <PhaseGroup title="Ochtend" tasks={ochtendTasks} ankerIds={state.ankerIds} onToggle={toggleTask} isCurrentPhase={activeGroup === 'ochtend'} />
        <PhaseGroup title="Ritme" tasks={doorlopendTasks} ankerIds={state.ankerIds} onToggle={toggleTask} isCurrentPhase={activeGroup === 'doorlopend'} />
        <PhaseGroup title="Avond" tasks={avondTasks} ankerIds={state.ankerIds} onToggle={toggleTask} isCurrentPhase={activeGroup === 'avond'} />
      </div>

      <button
        onClick={() => setDagafsluitingOpen(true)}
        className="tap w-full flex items-center justify-center gap-2 mt-8 h-11 rounded-control text-paper-56 text-[14px] border border-line"
      >
        <Moon size={15} strokeWidth={1.75} />
        Dag afsluiten
      </button>

      <Breathing open={breathingOpen} onClose={() => setBreathingOpen(false)} />
      <Dagafsluiting
        open={dagafsluitingOpen}
        onClose={() => setDagafsluitingOpen(false)}
        tomorrowTasks={tomorrowTaskList}
        currentFirstStoneId={state.frogTaskId}
        onComplete={completeDagafsluiting}
      />
      <LogSheet
        goal={logGoal}
        onClose={() => setLogGoal(null)}
        onSubmit={amount => { if (logGoal) logGoalEntry(logGoal.id, amount); setLogGoal(null); }}
      />
      <MomentOverlay content={moment} onDone={() => setMoment(null)} />
      <Toast message={toast} />
    </div>
  );
}
