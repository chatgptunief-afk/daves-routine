'use client';
import { m, AnimatePresence } from 'framer-motion';
import { Task } from '@/types';
import { TaskRow } from './TaskRow';
import { ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';

interface PhaseGroupProps {
  title: string;
  tasks: Task[];
  ankerIds: string[];
  onToggle: (id: string) => void;
  isCurrentPhase: boolean;
}

export function PhaseGroup({ title, tasks, ankerIds, onToggle, isCurrentPhase }: PhaseGroupProps) {
  const [isOpen, setIsOpen] = useState(isCurrentPhase);

  useEffect(() => {
    if (isCurrentPhase) setIsOpen(true);
  }, [isCurrentPhase]);

  if (tasks.length === 0) return null;

  const completed = tasks.filter(t => t.completed).length;
  const total = tasks.length;
  const allDone = completed === total;

  return (
    <div>
      <button
        onClick={() => setIsOpen(o => !o)}
        className="tap w-full flex items-center gap-3 py-1.5 text-left"
      >
        <span className={`eyebrow flex-1 ${allDone ? 'opacity-50' : ''}`}>{title}</span>
        <span className="tnum text-[12px] text-paper-56">{completed}/{total}</span>
        <m.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}>
          <ChevronDown size={14} className="text-paper-56" />
        </m.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-1">
              {tasks.map(task => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onToggle={onToggle}
                  isAnker={ankerIds.includes(task.id)}
                />
              ))}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
