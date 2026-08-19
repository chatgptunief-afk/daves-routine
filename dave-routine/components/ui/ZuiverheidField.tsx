'use client';
import { Task } from '@/types';
import { getIcon } from '@/lib/icons';
import { useCallback } from 'react';

interface ZuiverheidFieldProps {
  task: Task | null;
  streakDays: number;
  onToggle: (id: string) => void;
}

export function ZuiverheidField({ task, streakDays, onToggle }: ZuiverheidFieldProps) {
  if (!task) return null;
  const Icon = getIcon(task.icon);

  const handleToggle = useCallback(() => {
    try { if ('vibrate' in navigator) navigator.vibrate(10); } catch {}
    onToggle(task.id);
  }, [task, onToggle]);

  return (
    <div>
      <div className="eyebrow mb-2">Zuiverheid</div>
      <button
        onClick={handleToggle}
        role="checkbox"
        aria-checked={task.completed}
        className="tap w-full flex items-center gap-3 py-1"
      >
        <Icon size={18} strokeWidth={1.75} className={task.completed ? 'text-grove-400' : 'text-paper-56'} />
        <span className="flex-1 text-left text-[15px] text-paper">
          Dag {streakDays} vastgehouden
        </span>
        <span
          className="flex-shrink-0 w-6 h-6 rounded-full border-[1.5px] flex items-center justify-center"
          style={{
            borderColor: task.completed ? 'transparent' : 'rgba(245,241,232,0.44)',
            background: task.completed ? '#7CA98A' : 'transparent',
          }}
        >
          {task.completed && (
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-ink-900" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          )}
        </span>
      </button>
    </div>
  );
}
