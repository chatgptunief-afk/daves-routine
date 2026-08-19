'use client';
import { m, AnimatePresence } from 'framer-motion';
import { Task } from '@/types';
import { TaskCard } from './TaskCard';
import { ChevronDown, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

interface RoutineSectionProps {
  title: string;
  emoji: string;
  tasks: Task[];
  onToggle: (id: string) => void;
  accentColor: string; // CSS color value
  defaultOpen?: boolean;
}

export function RoutineSection({ title, emoji, tasks, onToggle, accentColor, defaultOpen = true }: RoutineSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const completed = tasks.filter(t => t.completed).length;
  const total = tasks.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const isDone = total > 0 && completed === total;

  const [prevDone, setPrevDone] = useState(isDone);
  if (isDone !== prevDone) {
    setPrevDone(isDone);
    if (isDone) setIsOpen(false);
  }

  if (total === 0) return null;

  return (
    <div>
      <button
        onClick={() => setIsOpen(o => !o)}
        className="tap w-full flex items-center gap-3 py-1 text-left"
      >
        <span className={`text-lg flex-shrink-0 ${isDone ? 'opacity-45' : ''}`}>{emoji}</span>
        <div className="flex-1 min-w-0">
          <h2 className={`font-display font-semibold text-[15px] ${isDone ? 'text-text-secondary' : 'text-text'}`}>{title}</h2>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <AnimatePresence mode="wait">
            {isDone ? (
              <m.div
                key="done"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-1 text-accent text-[11px] font-medium"
              >
                <CheckCircle2 size={12} /> Klaar
              </m.div>
            ) : (
              <m.div
                key="progress"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2 w-20"
              >
                <div className="flex-1 h-1 rounded-full bg-white/[0.07] overflow-hidden">
                  <m.div
                    className="h-full rounded-full"
                    style={{ background: accentColor }}
                    initial={false}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                  />
                </div>
                <span className="tnum text-[11px] text-text-tertiary flex-shrink-0">{completed}/{total}</span>
              </m.div>
            )}
          </AnimatePresence>
          <m.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}>
            <ChevronDown size={16} className="text-text-tertiary" />
          </m.div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-1">
              {tasks.map(task => (
                <TaskCard key={task.id} task={task} onToggle={onToggle} />
              ))}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
