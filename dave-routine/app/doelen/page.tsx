'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useApp } from '@/components/AppStateProvider';
import { Sheet } from '@/components/ui/Sheet';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Meter } from '@/components/ui/Meter';
import { LoadingState } from '@/components/ui/LoadingState';
import { computeGoalProgress, GOAL_COLOR_CSS } from '@/lib/goals';
import { todayString } from '@/lib/date';
import { DomainColor, GoalPeriod } from '@/types';

const PERIODS: { value: GoalPeriod; label: string }[] = [
  { value: 'week', label: 'Per week' },
  { value: 'maand', label: 'Per maand' },
  { value: 'kwartaal', label: 'Per kwartaal' },
  { value: 'jaar', label: 'Per jaar' },
  { value: 'doorlopend', label: 'Doorlopend' },
];

const COLORS: { value: DomainColor; label: string }[] = [
  { value: 'ember', label: 'Ember' },
  { value: 'dusk', label: 'Dusk' },
  { value: 'grove', label: 'Grove' },
];

export default function DoelenPage() {
  const { state, isLoaded, addGoal } = useApp();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [unit, setUnit] = useState('keer');
  const [target, setTarget] = useState('');
  const [period, setPeriod] = useState<GoalPeriod>('week');
  const [color, setColor] = useState<DomainColor>('ember');

  if (!isLoaded || !state) {
    return <LoadingState />;
  }

  const activeGoals = state.goals.filter(g => !g.archivedAt);

  const handleCreate = () => {
    const t = parseFloat(target.replace(',', '.'));
    if (!title.trim() || !t || t <= 0) return;
    addGoal({ title: title.trim(), unit, target: t, period, startDate: todayString(), color });
    setTitle(''); setUnit('keer'); setTarget(''); setPeriod('week'); setColor('ember');
    setSheetOpen(false);
  };

  return (
    <div className="pb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="eyebrow mb-1">Doelen</p>
          <p className="font-display text-[24px] text-paper">Wat je opbouwt.</p>
        </div>
        <button onClick={() => setSheetOpen(true)} className="tap w-10 h-10 rounded-full bg-ink-700 border border-line flex items-center justify-center" aria-label="Nieuw doel">
          <Plus size={18} className="text-paper" />
        </button>
      </div>

      {activeGoals.length === 0 && (
        <EmptyState
          line="Nog geen doelen."
          explanation="Een doel is iets meetbaars — kilometers, bladzijden, uren. Geen taak, een richting."
          action={<Button onClick={() => setSheetOpen(true)}>Doel toevoegen</Button>}
        />
      )}

      <div className="rounded-card bg-ink-700 divide-y divide-line overflow-hidden">
        {activeGoals.map(goal => {
          const progress = computeGoalProgress(goal, state.logEntries);
          const colorCss = GOAL_COLOR_CSS[goal.color] ?? GOAL_COLOR_CSS.ember;
          return (
            <Link key={goal.id} href={`/doelen/${goal.id}`} className="tap block p-5">
              <div className="flex items-baseline justify-between mb-2.5">
                <p className="font-medium text-[16px] text-paper">{goal.title}</p>
                <p className="tnum text-[14px] text-paper-56">
                  {progress.actual} / {goal.target} {goal.unit}
                </p>
              </div>
              <Meter percentage={progress.percentage} paceMarkerPercentage={goal.period === 'doorlopend' ? null : Math.min(100, (progress.expected / goal.target) * 100)} color={colorCss} />
              <p className="text-[12px] text-paper-56 mt-2.5">
                {progress.status === 'voor' ? 'Voor op schema' : progress.status === 'achter' ? 'Achter op schema' : 'Op schema'}
              </p>
            </Link>
          );
        })}
      </div>

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Nieuw doel">
        <div className="space-y-4 pb-2">
          <Input label="Titel" value={title} onChange={e => setTitle(e.target.value)} placeholder="Bijv. Hardlopen" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Doel" inputMode="decimal" value={target} onChange={e => setTarget(e.target.value)} placeholder="10" />
            <Input label="Eenheid" value={unit} onChange={e => setUnit(e.target.value)} placeholder="km" />
          </div>
          <div>
            <label className="text-[13px] font-medium text-paper-56 block mb-1.5">Periode</label>
            <select
              value={period}
              onChange={e => setPeriod(e.target.value as GoalPeriod)}
              className="w-full h-[52px] bg-ink-600 rounded-control border border-line px-4 text-paper text-[16px] focus:outline-none focus:border-ember-500/50"
            >
              {PERIODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[13px] font-medium text-paper-56 block mb-1.5">Kleur</label>
            <div className="flex gap-2.5">
              {COLORS.map(c => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  className="tap w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: GOAL_COLOR_CSS[c.value], outline: color === c.value ? '2px solid var(--color-paper)' : 'none', outlineOffset: 2 }}
                  aria-label={c.label}
                />
              ))}
            </div>
          </div>
          <Button onClick={handleCreate} disabled={!title.trim() || !target}>Doel aanmaken</Button>
        </div>
      </Sheet>
    </div>
  );
}
