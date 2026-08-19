'use client';
import { m } from 'framer-motion';
import { Task, Prayer } from '@/types';
import { Check } from './Check';
import { useCallback } from 'react';

interface PrayerRowProps {
  task: Task;
  time: string; // "HH:mm"
  isCurrent: boolean;
  isPast: boolean;
  onToggle: (id: string) => void;
}

const PRAYER_LABEL: Record<Prayer, string> = {
  fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha',
};

export function PrayerRow({ task, time, isCurrent, isPast, onToggle }: PrayerRowProps) {
  const label = task.prayer ? PRAYER_LABEL[task.prayer] : task.title;

  const handleToggle = useCallback(() => {
    if (!task.completed) {
      try { if ('vibrate' in navigator) navigator.vibrate(8); } catch {}
    }
    onToggle(task.id);
  }, [task.completed, task.id, onToggle]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleToggle(); }
  }, [handleToggle]);

  return (
    <m.div
      layout
      role="checkbox"
      aria-checked={task.completed}
      tabIndex={0}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      className={`tap flex items-center gap-3 py-2.5 px-3 -mx-3 rounded-field cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-dusk-500 transition-colors ${isCurrent ? 'bg-dusk-soft' : ''}`}
    >
      <Check checked={task.completed} size={20} fillColor="var(--color-dusk-500)" markColor="#0A0A0F" ringColor="rgba(245,241,232,0.36)" />
      <span className={`flex-1 text-[15px] font-medium ${task.completed ? 'text-paper-56' : isPast ? 'text-paper-56' : 'text-paper'}`}>
        {label}
      </span>
      {isCurrent && <span className="w-1 h-1 rounded-full bg-dusk-400 flex-shrink-0" aria-hidden="true" />}
      <span className="tnum text-[13px] text-paper-56">{time}</span>
    </m.div>
  );
}
