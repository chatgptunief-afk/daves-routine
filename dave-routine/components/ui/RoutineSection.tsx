'use client';
import { m, AnimatePresence } from 'framer-motion';
import { Task } from '@/types';
import { TaskCard } from './TaskCard';
import { ChevronDown, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface RoutineSectionProps {
  title: string;
  emoji: string;
  tasks: Task[];
  onToggle: (id: string) => void;
  accentColor: string;
  defaultOpen?: boolean;
}

export function RoutineSection({ title, emoji, tasks, onToggle, accentColor, defaultOpen = true }: RoutineSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const completed = tasks.filter(t => t.completed).length;
  const total = tasks.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  const isDone = total > 0 && completed === total;

  useEffect(() => {
    if (isDone) setIsOpen(false);
  }, [isDone]);

  return (
    <div className={`rounded-3xl border transition-all duration-700 overflow-hidden ${
      isDone 
        ? 'border-amber-500/10 bg-black/20 opacity-[0.65] grayscale-[0.2]' 
        : 'border-white/10 bg-white/[0.03]'
    }`}>
      {/* Section Header */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className="w-full flex items-center gap-3 p-5 text-left"
      >
        <span className="text-2xl grayscale-0">{emoji}</span>
        <div className="flex-1">
          <h2 className="font-bold text-white text-base">{title}</h2>
          <div className="h-4 mt-1 relative flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {isDone ? (
                <m.div
                  key="done"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-1.5 text-amber-400 font-medium text-[11px] tracking-wider uppercase"
                >
                  <CheckCircle2 size={12} /> Voltooid
                </m.div>
              ) : (
                <m.div 
                  key="progress"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2"
                >
                  <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                    <m.div
                      className={`h-full rounded-full ${accentColor}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="text-[10px] text-white/50 flex-shrink-0 uppercase tracking-widest">{completed}/{total}</span>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <m.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={18} className="text-white/40" />
        </m.div>
      </button>

      {/* Tasks */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 flex flex-col gap-2">
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
