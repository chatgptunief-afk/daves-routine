'use client';
import { m } from 'framer-motion';

interface MeterProps {
  percentage: number; // t.o.v. target, kan > 100
  paceMarkerPercentage: number | null; // waar je "zou moeten zijn"
  color?: string;
}

export function Meter({ percentage, paceMarkerPercentage, color = 'var(--color-ember-500)' }: MeterProps) {
  const filled = Math.min(100, percentage);
  const overflow = Math.max(0, Math.min(100, percentage - 100));

  return (
    <div className="relative h-1.5 rounded-full bg-white/[0.07] overflow-visible">
      <div className="absolute inset-0 rounded-full overflow-hidden flex">
        <m.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={false}
          animate={{ width: `${filled}%` }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        />
      </div>
      {overflow > 0 && (
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <m.div
            className="h-full rounded-full opacity-50"
            style={{ background: color }}
            initial={false}
            animate={{ width: `${overflow}%` }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          />
        </div>
      )}
      {paceMarkerPercentage !== null && paceMarkerPercentage > 0 && paceMarkerPercentage < 100 && (
        <div
          className="absolute top-1/2 -translate-y-1/2 w-[2px] h-3 rounded-full bg-paper"
          style={{ left: `${paceMarkerPercentage}%`, boxShadow: '0 0 0 1px rgba(10,10,15,0.6)' }}
        />
      )}
    </div>
  );
}
