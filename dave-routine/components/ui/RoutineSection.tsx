'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '@/types';
import { TaskCard } from './TaskCard';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

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

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] overflow-hidden">
      {/* Section Header */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className="w-full flex items-center gap-3 p-5 text-left"
      >
        <span className="text-2xl">{emoji}</span>
        <div className="flex-1">
          <h2 className="font-bold text-white text-base">{title}</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${accentColor}`}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
            <span className="text-xs text-white/50 flex-shrink-0">{completed}/{total}</span>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={18} className="text-white/40" />
        </motion.div>
      </button>

      {/* Tasks */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
