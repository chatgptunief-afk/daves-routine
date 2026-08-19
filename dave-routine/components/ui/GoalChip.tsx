'use client';
import { Goal } from '@/types';
import { computeGoalProgress } from '@/lib/goals';
import { LogEntry } from '@/types';

interface GoalChipProps {
  goal: Goal;
  entries: LogEntry[];
  onTap: () => void;
}

export function GoalChip({ goal, entries, onTap }: GoalChipProps) {
  const progress = computeGoalProgress(goal, entries);
  return (
    <button
      onClick={onTap}
      className="tap flex-shrink-0 h-10 px-4 rounded-full bg-ink-700 border border-line flex items-center gap-2"
    >
      <span className="text-[13px] text-paper-72">{goal.title}</span>
      <span className="tnum text-[13px] font-semibold text-paper">
        {progress.actual}{goal.unit === 'uren' || goal.unit === 'minuten' ? '' : ` ${goal.unit}`} / {goal.target}
      </span>
    </button>
  );
}
