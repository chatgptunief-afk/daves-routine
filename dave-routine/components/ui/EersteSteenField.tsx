'use client';
import { m, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Task } from '@/types';
import { Check } from './Check';
import { useState, useCallback } from 'react';

interface EersteSteenFieldProps {
  task: Task | null;
  onToggle: (id: string) => void;
  dayIsOver: boolean; // na Dagafsluiting-venster, nog niet gelegd
}

// De belangrijkste taak van de dag krijgt geen kaart — een kaart zou hem verlagen tot
// "nog een taakje". In plaats daarvan: veel witruimte, groot serif-lettertype, en een
// gloed die vanuit het vinkje zelf de ruimte in trekt op het moment van afvinken.
export function EersteSteenField({ task, onToggle, dayIsOver }: EersteSteenFieldProps) {
  const reduceMotion = useReducedMotion();
  const [showBloom, setShowBloom] = useState(false);

  const handleToggle = useCallback(() => {
    if (!task) return;
    if (!task.completed) {
      setShowBloom(true);
      setTimeout(() => setShowBloom(false), 1100);
      try { if ('vibrate' in navigator) navigator.vibrate([12, 40, 12]); } catch {}
    }
    onToggle(task.id);
  }, [task, onToggle]);

  if (!task) return null;

  return (
    <div className="relative">
      <AnimatePresence>
        {showBloom && !reduceMotion && (
          <m.div
            initial={{ opacity: 0.55, scale: 0.4 }}
            animate={{ opacity: 0, scale: 3.2 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="absolute -inset-6 pointer-events-none"
            style={{ background: 'radial-gradient(circle at 14% 40%, rgba(232,147,74,0.5), transparent 60%)' }}
          />
        )}
      </AnimatePresence>

      <button onClick={handleToggle} className="tap relative w-full flex items-start gap-4 text-left">
        <div className="pt-0.5">
          <Check checked={task.completed} size={26} celebratory />
        </div>
        <div className="flex-1 min-w-0 pt-px">
          <p className="eyebrow text-ember-400 mb-1">Eerste Steen</p>
          <p className={`font-display text-[22px] font-normal leading-[1.15] ${task.completed ? 'text-paper-56 line-through decoration-paper-44' : 'text-paper'}`}>
            {task.title}
          </p>
          {(task.cue || (dayIsOver && !task.completed)) && (
            <p className="text-paper-56 text-[13px] mt-1">
              {task.completed ? '' : task.cue || 'De steen ligt er nog niet. Morgen weer.'}
            </p>
          )}
        </div>
      </button>
    </div>
  );
}
