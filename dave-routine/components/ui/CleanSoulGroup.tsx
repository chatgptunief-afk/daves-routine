'use client';
import { Task } from '@/types';
import { getIcon } from '@/lib/icons';
import { Check } from './Check';
import { useCallback } from 'react';

interface CleanSoulGroupProps {
  tasks: Task[];
  streaks: Record<string, number>;
  onToggle: (id: string) => void;
}

// Clean Soul — de gewoontes die je achter je wil laten (roken, uitstellen, negatief praten).
// Eén rij per gewoonte, elk met een eigen doorlopende streak — die breekt nooit door een
// gemiste dag bij een ándere gewoonte. Beheer (toevoegen/hernoemen/stoppen) gebeurt in
// /ik/zuiverheid; hier alleen het dagelijkse aanvinken.
export function CleanSoulGroup({ tasks, streaks, onToggle }: CleanSoulGroupProps) {
  if (tasks.length === 0) return null;
  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div>
      <div className="flex items-center gap-3 py-1.5">
        <span className="eyebrow flex-1">Clean Soul</span>
        <span className="tnum text-[12px] text-paper-56">{completedCount}/{tasks.length}</span>
      </div>
      <div className="space-y-0.5">
        {tasks.map(task => (
          <CleanSoulRow key={task.id} task={task} streakDays={streaks[task.id] ?? 0} onToggle={onToggle} />
        ))}
      </div>
    </div>
  );
}

function CleanSoulRow({
  task, streakDays, onToggle,
}: { task: Task; streakDays: number; onToggle: (id: string) => void }) {
  const Icon = getIcon(task.icon);
  const displayStreak = streakDays + (task.completed ? 1 : 0);

  const handleToggle = useCallback(() => {
    try { if ('vibrate' in navigator) navigator.vibrate(10); } catch {}
    onToggle(task.id);
  }, [task.id, onToggle]);

  return (
    <button
      onClick={handleToggle}
      role="checkbox"
      aria-checked={task.completed}
      className="tap w-full flex items-center gap-3 py-2"
    >
      <Check checked={task.completed} size={22} fillColor="var(--color-grove-500)" markColor="#0A0A0F" />
      <Icon size={15} strokeWidth={1.5} className={task.completed ? 'text-grove-400' : 'text-paper-44'} />
      <span className="flex-1 text-left min-w-0">
        <span className="block text-[15px] text-paper truncate">{task.title}</span>
        <span className="block text-[12.5px] text-paper-56 tnum">
          {displayStreak > 0 ? `Dag ${displayStreak}` : 'Vandaag begint het'}
        </span>
      </span>
    </button>
  );
}
