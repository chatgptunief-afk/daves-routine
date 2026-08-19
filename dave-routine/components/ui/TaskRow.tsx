'use client';
import { m, AnimatePresence } from 'framer-motion';
import { Task } from '@/types';
import { getIcon } from '@/lib/icons';
import { useState, useCallback } from 'react';

interface TaskRowProps {
  task: Task;
  onToggle: (id: string) => void;
  domainColorClass?: string; // bv. 'text-ember-500' — kleur van het icoon/vinkje bij voltooiing
  isAnker?: boolean;
}

export function TaskRow({ task, onToggle, domainColorClass = 'text-ember-500', isAnker = false }: TaskRowProps) {
  const [showRing, setShowRing] = useState(false);
  const Icon = getIcon(task.icon);

  const handleToggle = useCallback(() => {
    if (!task.completed) {
      if (isAnker) {
        setShowRing(true);
        setTimeout(() => setShowRing(false), 320);
      }
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
      transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
      role="checkbox"
      aria-checked={task.completed}
      tabIndex={0}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      className="tap relative flex items-center gap-3.5 py-3.5 min-h-[56px] cursor-pointer select-none border-b border-line last:border-b-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ember-500 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-850 rounded-[4px]"
    >
      <span className="relative flex-shrink-0 w-6 h-6 rounded-full border-[1.5px] border-paper-44 flex items-center justify-center">
        <AnimatePresence>
          {showRing && (
            <m.span
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 2.6, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="absolute inset-0 rounded-full bg-ember-500"
            />
          )}
        </AnimatePresence>
        <m.span
          className="absolute inset-0 rounded-full bg-ember-500"
          initial={false}
          animate={{ scale: task.completed ? 1 : 0.5, opacity: task.completed ? 1 : 0 }}
          transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
        />
        {task.completed && (
          <svg viewBox="0 0 24 24" className="relative w-3.5 h-3.5 text-ember-ink" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        )}
      </span>

      <Icon size={18} strokeWidth={1.75} className={task.completed ? domainColorClass : 'text-paper-56'} />

      <div className="flex-1 min-w-0">
        <p className={`font-medium text-[16px] leading-tight ${task.completed ? 'text-paper-56' : 'text-paper'}`}>
          {task.title}
        </p>
        {task.cue && <p className="text-[13px] text-paper-56 mt-0.5 truncate">{task.cue}</p>}
      </div>
    </m.div>
  );
}
