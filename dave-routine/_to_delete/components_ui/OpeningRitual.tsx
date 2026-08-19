'use client';
import { m, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

interface OpeningRitualProps {
  show: boolean;
  userName: string;
  onDone: () => void;
}

const BREATH_SECONDS = 4;

function useBreathPhase(active: boolean) {
  const [phase, setPhase] = useState<'in' | 'out'>('in');

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setPhase(p => (p === 'in' ? 'out' : 'in'));
    }, BREATH_SECONDS * 1000);
    return () => clearInterval(id);
  }, [active]);

  return phase;
}

const noopSubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

export function OpeningRitual({ show, userName, onDone }: OpeningRitualProps) {
  const reduceMotion = useReducedMotion();
  const phase = useBreathPhase(show);
  const mounted = useMounted();

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {show && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-between overflow-hidden select-none"
          style={{ background: 'radial-gradient(140% 90% at 50% 100%, #201409 0%, #0c0b10 55%, #08070c 100%)' }}
        >
          <m.div
            animate={reduceMotion ? {} : { opacity: [0.5, 0.85, 0.5] }}
            transition={{ duration: BREATH_SECONDS * 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120vw] h-64 pointer-events-none"
            style={{ background: 'radial-gradient(closest-side, rgba(226,145,74,0.16), transparent)' }}
          />

          <div className="pt-16 text-center px-8">
            <p className="text-text-secondary text-sm">Goedemorgen, {userName}</p>
          </div>

          <div className="flex flex-col items-center gap-10 px-8">
            <div className="relative flex items-center justify-center w-44 h-44">
              {!reduceMotion && (
                <m.div
                  animate={{ scale: phase === 'in' ? [1, 1.22] : [1.22, 1] }}
                  transition={{ duration: BREATH_SECONDS, ease: [0.45, 0, 0.55, 1] }}
                  className="absolute rounded-full border border-accent/25"
                  style={{ width: 176, height: 176 }}
                />
              )}
              <m.div
                animate={reduceMotion ? {} : { scale: phase === 'in' ? [1, 1.14] : [1.14, 1] }}
                transition={{ duration: BREATH_SECONDS, ease: [0.45, 0, 0.55, 1] }}
                className="w-28 h-28 rounded-full flex items-center justify-center"
                style={{ background: 'radial-gradient(circle at 35% 30%, rgba(226,145,74,0.35), rgba(226,145,74,0.06))', border: '1px solid rgba(226,145,74,0.3)' }}
              />
            </div>

            <AnimatePresence mode="wait">
              <m.p
                key={phase}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="font-display text-2xl font-medium text-text tracking-tight"
              >
                {phase === 'in' ? 'Adem in' : 'Adem uit'}
              </m.p>
            </AnimatePresence>

            <p className="text-text-tertiary text-sm text-center max-w-[240px] leading-relaxed">
              Voordat je begint, kom even tot rust.
            </p>
          </div>

          <div className="w-full px-8 pb-12 flex flex-col items-center gap-4">
            <m.button
              whileTap={{ scale: 0.97 }}
              onClick={onDone}
              className="w-full max-w-xs bg-accent text-accent-ink font-semibold py-3.5 rounded-control"
            >
              Begin de dag
            </m.button>
            <button onClick={onDone} className="text-text-tertiary text-xs">
              Overslaan
            </button>
          </div>
        </m.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
