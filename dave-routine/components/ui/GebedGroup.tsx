'use client';
import { Task, PrayerTimes, Prayer } from '@/types';
import { PrayerRow } from './PrayerRow';
import { getCurrentPrayerWindow } from '@/lib/phase';
import { timeStringToDate, todayString } from '@/lib/date';

interface GebedGroupProps {
  tasks: Task[];
  times: PrayerTimes;
  now: Date;
  onToggle: (id: string) => void;
}

const ORDER: Prayer[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export function GebedGroup({ tasks, times, now, onToggle }: GebedGroupProps) {
  if (tasks.length === 0) return null;
  const currentWindow = getCurrentPrayerWindow(now, times);
  const completedCount = tasks.filter(t => t.completed).length;
  const today = todayString(now);

  const byPrayer = new Map(tasks.filter(t => t.prayer).map(t => [t.prayer as Prayer, t]));

  return (
    <div>
      <div className="flex items-center gap-3 py-1.5">
        <span className="eyebrow flex-1">Gebed</span>
        <span className="tnum text-[12px] text-paper-56">{completedCount}/5</span>
      </div>
      <div className="space-y-0.5">
        {ORDER.map(p => {
          const task = byPrayer.get(p);
          if (!task) return null;
          const isCurrent = currentWindow === p;
          const isPast = !isCurrent && timeStringToDate(today, times[p]) < now;
          return (
            <PrayerRow
              key={p}
              task={task}
              time={times[p]}
              isCurrent={isCurrent}
              isPast={isPast}
              onToggle={onToggle}
            />
          );
        })}
      </div>
    </div>
  );
}
