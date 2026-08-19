'use client';
import { m, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface CheckProps {
  checked: boolean;
  size?: number;
  fillColor?: string; // achtergrond zodra afgevinkt
  markColor?: string; // kleur van het vinkje zelf
  ringColor?: string; // rand-kleur wanneer niet afgevinkt
  celebratory?: boolean; // zachte lichtring bij het afvinken — alleen voor Ankers/Eerste Steen
}

// Eén gedeeld vinkje voor de hele app — TaskRow, PrayerRow, Zuiverheid, Eerste Steen delen
// dit component zodat "iets afvinken" overal exact hetzelfde voelt. Het vinkje wordt getekend
// (stroke-draw), niet ingezoomd of laten knallen — fysiek en precies i.p.v. speels.
export function Check({
  checked,
  size = 24,
  fillColor = 'var(--color-ember-500)',
  markColor = 'var(--color-ember-ink)',
  ringColor = 'rgba(245,241,232,0.4)',
  celebratory = false,
}: CheckProps) {
  const reduceMotion = useReducedMotion();
  const [showRing, setShowRing] = useState(false);
  const [wasChecked, setWasChecked] = useState(checked);

  useEffect(() => {
    if (checked && !wasChecked && celebratory) {
      setShowRing(true);
      const t = setTimeout(() => setShowRing(false), 420);
      return () => clearTimeout(t);
    }
    setWasChecked(checked);
  }, [checked, wasChecked, celebratory]);

  return (
    <span className="relative flex-shrink-0 inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <AnimatePresence>
        {showRing && (
          <m.span
            initial={{ scale: 1, opacity: 0.55 }}
            animate={{ scale: 2.4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 rounded-full"
            style={{ background: fillColor }}
          />
        )}
      </AnimatePresence>

      <svg width={size} height={size} viewBox="0 0 24 24" className="relative">
        <circle
          cx={12} cy={12} r={10.25}
          fill="none"
          stroke={ringColor}
          strokeWidth={1.5}
        />
        <m.circle
          cx={12} cy={12} r={10.25}
          fill={fillColor}
          initial={false}
          animate={{ scale: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
          style={{ transformOrigin: '12px 12px' }}
          transition={{ duration: reduceMotion ? 0 : 0.18, ease: [0.16, 1, 0.3, 1] }}
        />
        <m.path
          d="M7 12.5l3.2 3.2L17 9"
          fill="none"
          stroke={markColor}
          strokeWidth={2.1}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={checked ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
          transition={{
            pathLength: { duration: reduceMotion ? 0 : 0.22, ease: [0.16, 1, 0.3, 1], delay: reduceMotion ? 0 : 0.05 },
            opacity: { duration: 0.1 },
          }}
        />
      </svg>
    </span>
  );
}
