'use client';
import { Task } from '@/types';
import { Check } from './Check';
import { useCallback } from 'react';

interface ZuiverheidFieldProps {
  task: Task | null;
  streakDays: number;
  onToggle: (id: string) => void;
}

export function ZuiverheidField({ task, streakDays, onToggle }: ZuiverheidFieldProps) {
  if (!task) return null;

  const handleToggle = useCallback(() => {
    try { if ('vibrate' in navigator) navigator.vibrate(10); } catch {}
    onToggle(task.id);
  }, [task, onToggle]);

  return (
    <button
      onClick={handleToggle}
      role="checkbox"
      aria-checked={task.completed}
      className="tap w-full flex items-center gap-3 py-1"
    >
      <Check checked={task.completed} size={22} fillColor="var(--color-grove-500)" markColor="#0A0A0F" />
      <span className="flex-1 text-left">
        <span className="block text-[15px] text-paper">Zuiverheid</span>
        <span className="block text-[12.5px] text-paper-56 tnum">
          {streakDays > 0 ? `Dag ${streakDays} vastgehouden` : 'Vandaag begint het'}
        </span>
      </span>
    </button>
  );
}
