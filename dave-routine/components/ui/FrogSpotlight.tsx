'use client';
import { m, AnimatePresence } from 'framer-motion';
import { Target, Check } from 'lucide-react';
import { useState, useCallback } from 'react';
import { Task } from '@/types';

interface FrogSpotlightProps {
  task: Task;
  onToggle: (id: string) => void;
}

export function FrogSpotlight({ task, onToggle }: FrogSpotlightProps) {
  const [justCompleted, setJustCompleted] = useState(false);

  const handleToggle = useCallback(() => {
    if (!task.completed) {
      setJustCompleted(true);
      setTimeout(() => setJustCompleted(false), 900);
      try {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) navigator.vibrate([14, 40, 14]);
      } catch {}
    }
    onToggle(task.id);
  }, [task.completed, task.id, onToggle]);

  return (
    <m.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      className="relative overflow-hidden rounded-card"
      style={{
        background: task.completed
          ? 'linear-gradient(160deg, rgba(226,145,74,0.14), rgba(226,145,74,0.04))'
          : 'linear-gradient(160deg, rgba(226,145,74,0.12), rgba(21,19,25,0.4))',
        border: '1px solid rgba(226,145,74,0.28)',
      }}
    >
      <AnimatePresence>
        {justCompleted && (
          <m.div
            initial={{ opacity: 0.9, scale: 0.6 }}
            animate={{ opacity: 0, scale: 2.2 }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(circle at 30% 30%, rgba(226,145,74,0.5), transparent 60%)' }}
          />
        )}
      </AnimatePresence>

      <div className="relative p-5">
        <div className="flex items-center gap-1.5 mb-3">
          <Target size={13} className="text-accent-strong" strokeWidth={2.25} />
          <span className="text-accent-strong text-xs font-semibold">Belangrijkste taak vandaag</span>
        </div>

        <button onClick={handleToggle} className="tap w-full flex items-center gap-3.5 text-left">
          <span className="text-3xl flex-shrink-0 leading-none">{task.icon}</span>
          <div className="flex-1 min-w-0">
            <p className={`font-display text-lg font-semibold leading-tight ${task.completed ? 'text-text-secondary line-through' : 'text-text'}`}>
              {task.title}
            </p>
            {task.description && (
              <p className="text-text-tertiary text-sm mt-0.5 truncate">{task.description}</p>
            )}
          </div>
          <div
            className={`flex-shrink-0 w-9 h-9 rounded-full border-2 flex items-center justify-center transition-colors duration-200 ${
              task.completed ? 'bg-accent border-accent' : 'border-accent/40'
            }`}
          >
            {task.completed && (
              <m.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 25 }}>
                <Check size={16} className="text-accent-ink" strokeWidth={3} />
              </m.div>
            )}
          </div>
        </button>
      </div>
    </m.div>
  );
}
