'use client';
import { Goal, LogEntry } from '@/types';
import { computeGoalProgress, GOAL_COLOR_CSS } from '@/lib/goals';

interface GoalChipProps {
  goal: Goal;
  entries: LogEntry[];
  onTap: () => void;
}

export function GoalChip({ goal, entries, onTap }: GoalChipProps) {
  const progress = computeGoalProgress(goal, entries);
  const color = GOAL_COLOR_CSS[goal.color] ?? GOAL_COLOR_CSS.ember;
  const filled = Math.min(100, progress.percentage);

  return (
    <button onClick={onTap} className="tap flex-shrink-0 w-[104px] rounded-field bg-ink-700 px-3.5 py-3 text-left">
      <p className="tnum text-[18px] text-paper font-medium leading-none">
        {progress.actual}
        <span className="text-[12px] text-paper-44 font-normal">/{goal.target}</span>
      </p>
      <p className="text-[11px] text-paper-56 truncate mt-1.5 mb-2">{goal.title}</p>
      <div className="h-[3px] rounded-full bg-white/[0.07] overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${filled}%`, background: color }} />
      </div>
    </button>
  );
}
