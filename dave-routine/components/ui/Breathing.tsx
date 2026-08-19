'use client';
import { m, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Sheet } from './Sheet';

const BREATH_SECONDS = 4;

function useBreathPhase(active: boolean) {
  const [phase, setPhase] = useState<'in' | 'out'>('in');
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setPhase(p => (p === 'in' ? 'out' : 'in')), BREATH_SECONDS * 1000);
    return () => clearInterval(id);
  }, [active]);
  return phase;
}

interface BreathingProps {
  open: boolean;
  onClose: () => void;
}

// Opt-in ademhalingsgebaar — nooit een poort. Zie §26.4: de oude blokkerende OpeningRitual
// is hier vervangen door een sheet die de gebruiker zelf opent via het wind-icoon.
export function Breathing({ open, onClose }: BreathingProps) {
  const reduceMotion = useReducedMotion();
  const phase = useBreathPhase(open);

  return (
    <Sheet open={open} onClose={onClose} title="Adem">
      <div className="flex flex-col items-center gap-8 py-6">
        <div className="relative flex items-center justify-center w-40 h-40">
          {!reduceMotion && (
            <m.div
              animate={{ scale: phase === 'in' ? [1, 1.22] : [1.22, 1] }}
              transition={{ duration: BREATH_SECONDS, ease: [0.45, 0, 0.55, 1] }}
              className="absolute rounded-full border border-ember-500/25"
              style={{ width: 160, height: 160 }}
            />
          )}
          <m.div
            animate={reduceMotion ? {} : { scale: phase === 'in' ? [1, 1.14] : [1.14, 1] }}
            transition={{ duration: BREATH_SECONDS, ease: [0.45, 0, 0.55, 1] }}
            className="w-24 h-24 rounded-full"
            style={{ background: 'radial-gradient(circle at 35% 30%, rgba(232,147,74,0.35), rgba(232,147,74,0.06))', border: '1px solid rgba(232,147,74,0.3)' }}
          />
        </div>

        <AnimatePresence mode="wait">
          <m.p
            key={phase}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-[22px] font-medium text-paper"
          >
            {phase === 'in' ? 'Adem in' : 'Adem uit'}
          </m.p>
        </AnimatePresence>

        <p className="text-paper-56 text-[14px] text-center max-w-[240px] leading-relaxed">
          Kom even tot rust voordat je verder gaat.
        </p>
      </div>
    </Sheet>
  );
}
