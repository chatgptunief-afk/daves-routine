'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Wind, Moon, Leaf } from 'lucide-react';
import { useApp } from '@/components/AppStateProvider';
import { Arc } from '@/components/ui/Arc';
import { EersteSteenField } from '@/components/ui/EersteSteenField';
import { GebedGroup } from '@/components/ui/GebedGroup';
import { PhaseGroup } from '@/components/ui/PhaseGroup';
import { CleanSoulGroup } from '@/components/ui/CleanSoulGroup';
import { GoalChip } from '@/components/ui/GoalChip';
import { LogSheet } from '@/components/ui/LogSheet';
import { Dagafsluiting } from '@/components/ui/Dagafsluiting';
import { Herstel } from '@/components/ui/Herstel';
import { Breathing } from '@/components/ui/Breathing';
import { MomentOverlay, type MomentContent } from '@/components/ui/MomentOverlay';
import { Toast } from '@/components/ui/Toast';
import { LoadingState } from '@/components/ui/LoadingState';
import { useNow } from '@/hooks/useNow';
import { getCurrentPhase, momentLine } from '@/lib/phase';
import { dateLabel, addDays, weekday, timeStringToDate } from '@/lib/date';
import { tasksForWeekday } from '@/lib/tasks';
import { Goal, Phase } from '@/types';

export default function VandaagPage() {
  const router = useRouter();
  const app = useApp();
  const { state, isLoaded, toast, toggleTask, completeDagafsluiting, markCheckinDone, logGoalEntry } = app;

  const now = useNow(30000);
  const [breathingOpen, setBreathingOpen] = useState(false);
  const [dagafsluitingOpen, setDagafsluitingOpen] = useState(false);
  const [logGoal, setLogGoal] = useState<Goal | null>(null);
  const [moment, setMoment] = useState<MomentContent | null>(null);

  // Render-time afgeleide state i.p.v. een ref + effect: React ondersteunt setState tijdens
  // render expliciet voor "state aanpassen bij een prop-wijziging" (react.dev/learn/you-might-
  // not-need-an-effect), en het voorkomt de renderfase-ref-mutatie die hiervoor stond.
  const [wasAllDone, setWasAllDone] = useState(false);
  if (app.allAnkersDone !== wasAllDone) {
    setWasAllDone(app.allAnkersDone);
    if (app.allAnkersDone) {
      setMoment({ number: `${app.streak.current + 1}`, line: 'Alle ankers staan. De dag is gemaakt.' });
    }
  }

  useEffect(() => {
    if (isLoaded && state && !state.onboardingComplete) router.replace('/welkom');
  }, [isLoaded, state, router]);

  if (!isLoaded || !state || !now || !state.prayerTimesCache) {
    return <LoadingState />;
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

  const ochtendTasks = app.ritmeTasks.filter(t => phaseForGroup(t.phase) === 'ochtend');
  const doorlopendTasks = app.ritmeTasks.filter(t => phaseForGroup(t.phase) === 'doorlopend');
  const avondTasks = app.ritmeTasks.filter(t => phaseForGroup(t.phase) === 'avond');

  const activeGoals = state.goals.filter(g => !g.archivedAt);

  const nextDay = addDays(times.date, 1);
  const tomorrowTaskList = tasksForWeekday(state.taskBlueprint, weekday(nextDay)).filter(t => t.domain === 'ritme');

  return (
    <div className="pb-8">
      <div className="flex items-center justify-between mb-5">
        <p className="eyebrow">{dateLabel(times.date)}</p>
        <button onClick={() => setBreathingOpen(true)} className="tap w-8 h-8 -mr-1.5 rounded-full flex items-center justify-center text-paper-44" aria-label="Adem">
          <Wind size={16} strokeWidth={1.75} />
        </button>
      </div>

      <Arc now={now} times={times} completionRatio={completionRatio} prayersCompleted={prayersCompleted} />
      <p className="text-center text-[14px] text-paper-56 -mt-1 mb-7">{momentLine(now, times)}</p>

      {app.missedDaysInARow >= 2 && state.lastCheckinDate !== times.date && (
        <Herstel missedDays={app.missedDaysInARow} onContinue={markCheckinDone} />
      )}

      <div className="pb-6 mb-6 border-b border-line">
        <EersteSteenField task={app.firstStoneTask} onToggle={toggleTask} dayIsOver={dayIsOver} />
      </div>

      <div className="space-y-6">
        <GebedGroup tasks={app.gebedTasks} times={times} now={now} onToggle={toggleTask} />

        {app.zuiverheidTasks.length > 0 ? (
          <CleanSoulGroup tasks={app.zuiverheidTasks} streaks={app.zuiverheidStreaks} onToggle={toggleTask} />
        ) : (
          <Link href="/ik/zuiverheid" className="tap flex items-center gap-2 text-[13.5px] text-paper-56">
            <Leaf size={14} strokeWidth={1.75} className="text-grove-400" />
            Clean Soul instellen
          </Link>
        )}

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
        className="tap w-full flex items-center justify-center gap-2 mt-10 pt-6 border-t border-line h-11 text-paper-56 text-[13.5px]"
      >
        <Moon size={14} strokeWidth={1.75} />
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
