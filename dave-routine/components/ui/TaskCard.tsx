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

// Golden particle burst on completion
function GoldenBurst() {
  const particles = Array.from({ length: 8 });
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      {particles.map((_, i) => {
        const angle = (i / particles.length) * 360;
        const x = Math.cos((angle * Math.PI) / 180) * 40;
        const y = Math.sin((angle * Math.PI) / 180) * 40;
        return (
          <m.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-yellow-400"
            style={{ top: '50%', left: '50%', marginTop: -3, marginLeft: -3 }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x, y, opacity: 0, scale: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
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
      setTimeout(() => setShowBurst(false), 600);
      try {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate([10, 30, 10]);
        }
      } catch (e) {}
    }
    onToggle(task.id);
  }, [task.completed, task.id, onToggle]);

  return (
    <m.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 cursor-pointer select-none
        ${isFrog
          ? task.completed
            ? 'bg-amber-950/40 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
            : 'bg-amber-950/20 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
          : task.completed
            ? 'bg-violet-950/40 border-violet-500/30 shadow-[0_0_20px_rgba(124,58,237,0.15)]'
            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
        }`}
      onClick={handleToggle}
      whileTap={{ scale: 0.97 }}
    >
      {/* Frog badge */}
      {isFrog && (
        <m.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -left-2 text-sm leading-none bg-amber-500 rounded-full w-6 h-6 flex items-center justify-center shadow-lg shadow-amber-500/40 z-10"
        >
          🐸
        </m.div>
      )}

      {/* Golden burst on completion */}
      <AnimatePresence>
        {showBurst && <GoldenBurst />}
      </AnimatePresence>

      {/* Checkbox */}
      <m.div
        animate={showBurst ? { scale: [1, 1.4, 1], rotate: [0, 15, -15, 0] } : {}}
        transition={{ duration: 0.4 }}
        className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300
          ${task.completed
            ? isFrog ? 'bg-amber-500 border-amber-500' : 'bg-violet-500 border-violet-500'
            : isFrog ? 'border-amber-500/50' : 'border-white/30'
          }`}
      >
        {task.completed && (
          <m.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          >
            <Check size={14} className="text-white" strokeWidth={3} />
          </m.div>
        )}
      </m.div>

      {/* Icon + Text */}
      <span className="text-2xl flex-shrink-0">{task.icon}</span>
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-sm leading-tight transition-all duration-300 ${task.completed ? 'line-through text-white/50' : 'text-white'}`}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-white/50 mt-0.5 truncate">{task.description}</p>
        )}
      </div>

      {/* Frog "Prioriteit" label */}
      {isFrog && !task.completed && (
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/80 bg-amber-500/10 px-1.5 py-0.5 rounded-md flex-shrink-0">
          Prio
        </span>
      )}

      {/* Completion glow overlay */}
      {task.completed && (
        <m.div
          className={`absolute inset-0 rounded-2xl pointer-events-none ${isFrog ? 'bg-amber-500/5' : 'bg-violet-500/5'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}
    </m.div>
  );
}
