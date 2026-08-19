'use client';
import { m } from 'framer-motion';
import { Task, Prayer } from '@/types';
import { getIcon } from '@/lib/icons';
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
  const Icon = getIcon(task.icon);
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
      className={`tap flex items-center gap-3 py-2.5 px-3 -mx-3 rounded-field cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-dusk-500 ${isCurrent ? 'bg-dusk-soft' : ''}`}
    >
      <span
        className="flex-shrink-0 w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center"
        style={{
          borderColor: task.completed ? 'transparent' : 'rgba(245,241,232,0.44)',
          background: task.completed ? '#A6A7E4' : 'transparent',
        }}
      >
        {task.completed && (
          <svg viewBox="0 0 24 24" className="w-3 h-3 text-ink-900" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        )}
      </span>
      <Icon size={16} strokeWidth={1.75} className={isPast && !task.completed ? 'text-paper-44' : 'text-dusk-400'} />
      <span className={`flex-1 text-[15px] font-medium ${isPast && !task.completed ? 'text-paper-56' : 'text-paper'}`}>
        {label}
      </span>
      {isCurrent && <span className="text-[11px] text-dusk-400 font-medium">← nu</span>}
      <span className="tnum text-[13px] text-paper-56">{time}</span>
    </m.div>
  );
}
