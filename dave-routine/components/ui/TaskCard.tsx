'use client';
import { m, AnimatePresence } from 'framer-motion';
import { Task } from '@/types';
import { Check } from 'lucide-react';
import { useState, useCallback } from 'react';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  isFrog?: boolean;
}

function CompletionBurst() {
  const particles = Array.from({ length: 6 });
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-card">
      {particles.map((_, i) => {
        const angle = (i / particles.length) * 360;
        const x = Math.cos((angle * Math.PI) / 180) * 34;
        const y = Math.sin((angle * Math.PI) / 180) * 34;
        return (
          <m.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-accent"
            style={{ top: '50%', left: '50%', marginTop: -3, marginLeft: -3 }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x, y, opacity: 0, scale: 0 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          />
        );
      })}
    </div>
  );
}

export function TaskCard({ task, onToggle, isFrog = false }: TaskCardProps) {
  const [showBurst, setShowBurst] = useState(false);

  const handleToggle = useCallback(() => {
    if (!task.completed) {
      setShowBurst(true);
      setTimeout(() => setShowBurst(false), 550);
      try {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate(12);
        }
      } catch {}
    }
    onToggle(task.id);
  }, [task.completed, task.id, onToggle]);

  return (
    <m.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
      className={`tap relative flex items-center gap-3.5 p-4 rounded-card border cursor-pointer select-none
        ${task.completed
          ? 'bg-accent-soft border-accent/25'
          : 'bg-surface border-border active:border-border-strong'
        }`}
      onClick={handleToggle}
    >
      {isFrog && !task.completed && (
        <span className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-accent flex items-center justify-center text-[10px] shadow-md shadow-black/30 z-10">
          🐸
        </span>
      )}

      <AnimatePresence>
        {showBurst && <CompletionBurst />}
      </AnimatePresence>

      <div
        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-200
          ${task.completed ? 'bg-accent border-accent' : 'border-white/25'}`}
      >
        {task.completed && (
          <m.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          >
            <Check size={13} className="text-accent-ink" strokeWidth={3} />
          </m.div>
        )}
      </div>

      <span className="text-xl flex-shrink-0 leading-none">{task.icon}</span>
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-sm leading-tight transition-colors duration-200 ${task.completed ? 'text-text-tertiary line-through' : 'text-text'}`}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-text-tertiary mt-0.5 truncate">{task.description}</p>
        )}
      </div>

      {isFrog && !task.completed && (
        <span className="text-[10px] font-semibold uppercase tracking-wide text-accent-strong bg-accent-soft px-1.5 py-0.5 rounded-full flex-shrink-0">
          Prio
        </span>
      )}
    </m.div>
  );
}
