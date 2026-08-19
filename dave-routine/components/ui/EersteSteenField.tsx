'use client';
import { m, AnimatePresence } from 'framer-motion';
import { Task } from '@/types';
import { getIcon } from '@/lib/icons';
import { useState, useCallback } from 'react';

interface EersteSteenFieldProps {
  task: Task | null;
  onToggle: (id: string) => void;
  dayIsOver: boolean; // na Dagafsluiting-venster, nog niet gelegd
}

export function EersteSteenField({ task, onToggle, dayIsOver }: EersteSteenFieldProps) {
  const [showBloom, setShowBloom] = useState(false);
  if (!task) return null;
  const Icon = getIcon(task.icon);

  const handleToggle = useCallback(() => {
    if (!task.completed) {
      setShowBloom(true);
      setTimeout(() => setShowBloom(false), 900);
      try { if ('vibrate' in navigator) navigator.vibrate([12, 40, 12]); } catch {}
    }
    onToggle(task.id);
  }, [task, onToggle]);

  return (
    <div>
      <div className="eyebrow mb-2">Eerste Steen</div>
      <m.div
        layout
        className="relative overflow-hidden rounded-field bg-ember-soft border border-ember-500/28 p-5"
      >
        <AnimatePresence>
          {showBloom && (
            <m.div
              initial={{ opacity: 0.9, scale: 0.6 }}
              animate={{ opacity: 0, scale: 2.2 }}
              transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(circle at 30% 30%, rgba(232,147,74,0.5), transparent 60%)' }}
            />
          )}
        </AnimatePresence>

        <button onClick={handleToggle} className="tap relative w-full flex items-center gap-3.5 text-left">
          <Icon size={26} strokeWidth={1.5} className="flex-shrink-0 text-ember-400" />
          <div className="flex-1 min-w-0">
            <p className={`font-display text-[19px] font-medium leading-tight ${task.completed ? 'text-paper-56' : 'text-paper'}`}>
              {task.title}
            </p>
            <p className="text-paper-56 text-[13px] mt-0.5">
              {task.completed ? 'Gelegd.' : task.cue || (dayIsOver ? 'De steen ligt er nog niet. Morgen weer.' : '')}
            </p>
          </div>
          <span
            className="flex-shrink-0 w-9 h-9 rounded-full border-2 flex items-center justify-center"
            style={{
              borderColor: task.completed ? 'transparent' : 'rgba(232,147,74,0.4)',
              background: task.completed ? '#E8934A' : 'transparent',
            }}
          >
            {task.completed && (
              <m.svg
                initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                viewBox="0 0 24 24" className="w-4 h-4 text-ember-ink" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="M20 6 9 17l-5-5" />
              </m.svg>
            )}
          </span>
        </button>
      </m.div>
    </div>
  );
}
