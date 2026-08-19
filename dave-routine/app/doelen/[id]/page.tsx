'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Plus } from 'lucide-react';
import { useApp } from '@/components/AppStateProvider';
import { Meter } from '@/components/ui/Meter';
import { LogSheet } from '@/components/ui/LogSheet';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { computeGoalProgress, historicalPeriods, GOAL_COLOR_CSS } from '@/lib/goals';
import { dateLabel } from '@/lib/date';

export default function GoalDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { state, isLoaded, logGoalEntry, archiveGoal } = useApp();
  const [logOpen, setLogOpen] = useState(false);

  if (!isLoaded || !state) {
    return <LoadingState />;
  }

  const goal = state.goals.find(g => g.id === params.id);
  if (!goal) {
    return (
      <div className="pt-16 text-center">
        <p className="text-paper-56 text-[14px] mb-4">Dit doel bestaat niet meer.</p>
        <button onClick={() => router.push('/doelen')} className="text-ember-500 text-[14px] font-medium">Terug naar Doelen</button>
      </div>
    );
  }

  const progress = computeGoalProgress(goal, state.logEntries);
  const colorCss = GOAL_COLOR_CSS[goal.color] ?? GOAL_COLOR_CSS.ember;
  const history = goal.period !== 'doorlopend' ? historicalPeriods(goal, state.logEntries, 6) : [];
  const recentEntries = state.logEntries
    .filter(e => e.goalId === goal.id)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 10);

  const handleArchive = () => {
    archiveGoal(goal.id);
    router.push('/doelen');
  };

  return (
    <div className="pb-8">
      <button onClick={() => router.push('/doelen')} className="tap flex items-center gap-1 text-paper-56 text-[14px] mb-4">
        <ChevronLeft size={16} /> Doelen
      </button>

      <p className="eyebrow mb-1">{goal.period === 'doorlopend' ? 'Doorlopend doel' : `Per ${goal.period}`}</p>
      <p className="font-display text-[26px] text-paper mb-5">{goal.title}</p>

      <div className="rounded-card bg-ink-700 border border-line p-5 mb-6">
        <div className="flex items-baseline justify-between mb-3">
          <p className="numeral-hero text-paper text-[36px]">{progress.actual}</p>
          <p className="text-[14px] text-paper-56">van {goal.target} {goal.unit}</p>
        </div>
        <Meter percentage={progress.percentage} paceMarkerPercentage={goal.period === 'doorlopend' ? null : Math.min(100, (progress.expected / goal.target) * 100)} color={colorCss} />
        <p className="text-[12px] text-paper-56 mt-2">
          {progress.status === 'voor' ? 'Je loopt voor op schema.' : progress.status === 'achter' ? 'Je loopt achter op schema.' : 'Je zit op schema.'}
        </p>
      </div>

      <Button onClick={() => setLogOpen(true)} className="mb-8 flex items-center justify-center gap-2">
        <Plus size={17} /> Log toevoegen
      </Button>

      {history.length > 0 && (
        <div className="mb-8">
          <p className="eyebrow mb-3">Vorige periodes</p>
          <div className="flex items-end gap-2 h-20">
            {history.map((h, i) => {
              const pct = goal.target > 0 ? Math.min(100, (h.total / goal.target) * 100) : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1.5 h-full">
                  <div className="w-full rounded-t-[3px]" style={{ height: `${Math.max(4, pct)}%`, background: colorCss, opacity: 0.7 }} />
                  <p className="tnum text-[10px] text-paper-56">{h.total}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {recentEntries.length > 0 && (
        <div className="mb-8">
          <p className="eyebrow mb-2">Recent gelogd</p>
          <div className="space-y-0">
            {recentEntries.map(e => (
              <div key={e.id} className="flex items-center justify-between py-2.5 border-b border-line last:border-b-0">
                <span className="text-[14px] text-paper-72">{dateLabel(e.date)}</span>
                <span className="tnum text-[14px] text-paper">{e.amount} {goal.unit}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button variant="destructive" onClick={handleArchive} className="mx-auto">Doel archiveren</Button>

      <LogSheet
        goal={logOpen ? goal : null}
        onClose={() => setLogOpen(false)}
        onSubmit={amount => { logGoalEntry(goal.id, amount); setLogOpen(false); }}
      />
    </div>
  );
}
