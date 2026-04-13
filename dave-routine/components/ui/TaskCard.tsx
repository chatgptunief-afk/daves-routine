'use client';
import { motion } from 'framer-motion';
import { Task } from '@/types';
import { Check } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
}

export function TaskCard({ task, onToggle }: TaskCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 cursor-pointer select-none
        ${task.completed
          ? 'bg-violet-950/40 border-violet-500/30 shadow-[0_0_20px_rgba(124,58,237,0.15)]'
          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
        }`}
      onClick={() => onToggle(task.id)}
      whileTap={{ scale: 0.98 }}
    >
      {/* Checkbox */}
      <div className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300
        ${task.completed ? 'bg-violet-500 border-violet-500' : 'border-white/30'}`}>
        {task.completed && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          >
            <Check size={14} className="text-white" strokeWidth={3} />
          </motion.div>
        )}
      </div>

      {/* Icon + Text */}
      <span className="text-2xl flex-shrink-0">{task.icon}</span>
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-sm leading-tight transition-all duration-300 ${task.completed ? 'line-through text-white/40' : 'text-white'}`}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-white/40 mt-0.5 truncate">{task.description}</p>
        )}
      </div>

      {/* Completion glow */}
      {task.completed && (
        <motion.div
          className="absolute inset-0 rounded-2xl bg-violet-500/5 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}
    </motion.div>
  );
}
