'use client';
import { m } from 'framer-motion';
import { Task } from '@/types';
import { getIcon } from '@/lib/icons';
import { Check } from './Check';
import { useCallback } from 'react';

interface TaskRowProps {
  task: Task;
  onToggle: (id: string) => void;
  domainColorClass?: string; // bv. 'text-ember-500' — kleur van het icoon/vinkje bij voltooiing
  isAnker?: boolean;
}

export function TaskRow({ task, onToggle, domainColorClass = 'text-ember-500', isAnker = false }: TaskRowProps) {
  const Icon = getIcon(task.icon);

  const handleToggle = useCallback(() => {
    if (!task.completed) {
      try { if ('vibrate' in navigator) navigator.vibrate(isAnker ? 12 : 10); } catch {}
    }
    onToggle(task.id);
  }, [task.completed, task.id, onToggle, isAnker]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleToggle(); }
  }, [handleToggle]);

  return (
    <m.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      role="checkbox"
      aria-checked={task.completed}
      tabIndex={0}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      className="tap relative flex items-center gap-3.5 py-3.5 min-h-[52px] cursor-pointer select-none border-b border-line last:border-b-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ember-500 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-850 rounded-[4px]"
    >
      <Check checked={task.completed} celebratory={isAnker} />

      <Icon size={16} strokeWidth={1.5} className={task.completed ? domainColorClass : 'text-paper-44'} />

      <div className="flex-1 min-w-0">
        <p className={`text-[15.5px] leading-tight transition-colors ${task.completed ? 'text-paper-44 line-through decoration-paper-44/60' : 'text-paper font-medium'}`}>
          {task.title}
        </p>
        {task.cue && !task.completed && <p className="text-[12.5px] text-paper-56 mt-0.5 truncate">{task.cue}</p>}
      </div>

      {isAnker && !task.completed && (
        <span className="w-[3px] h-[3px] rounded-full bg-ember-500 flex-shrink-0" aria-hidden="true" />
      )}
    </m.div>
  );
}
