'use client';
import { useEffect, useState } from 'react';
import { m, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useApp } from './AppStateProvider';
import { getCurrentAtmosphere, type Atmosphere as AtmospherePhase } from '@/lib/phase';

// Zeven sferen — de achtergrond IS de klok. Zie §23.4.
const ATMOSPHERES: Record<AtmospherePhase, { base: string; light: string }> = {
  nacht: { base: '#07070C', light: 'linear-gradient(transparent, transparent)' },
  fajr: { base: '#0A0A0F', light: 'radial-gradient(120vw 40vh at 50% 100%, rgba(232,147,74,0.18), transparent 70%)' },
  ochtend: { base: '#0C0B12', light: 'radial-gradient(90vw 60vh at 85% 0%, rgba(242,209,150,0.12), transparent 70%)' },
  middag: { base: '#14131A', light: 'radial-gradient(100vw 60vh at 50% 0%, rgba(245,241,232,0.08), transparent 75%)' },
  namiddag: { base: '#100E14', light: 'radial-gradient(90vw 60vh at 100% 40%, rgba(232,147,74,0.14), transparent 70%)' },
  maghrib: { base: '#0D0910', light: 'linear-gradient(0deg, rgba(226,120,90,0.20) 0%, transparent 45%)' },
  isha: { base: '#0A0912', light: 'radial-gradient(120vw 40vh at 50% 100%, rgba(142,143,214,0.14), transparent 70%)' },
};

/**
 * Vaste laag op z-0, achter alle inhoud. Twee gestapelde lagen crossfaden op sfeer-wissel
 * (§26.1/§23.4) — nooit een geanimeerde gradient-string, altijd een opacity-crossfade
 * tussen twee statische lagen. Bij prefers-reduced-motion: jump-cut, geen crossfade.
 */
export function Atmosphere() {
  const { state } = useApp();
  const reduceMotion = useReducedMotion();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60000);
    const onFocus = () => setNow(new Date());
    window.addEventListener('focus', onFocus);
    return () => { clearInterval(id); window.removeEventListener('focus', onFocus); };
  }, []);

  const times = state?.prayerTimesCache;
  const atmosphere: AtmospherePhase = now && times ? getCurrentAtmosphere(now, times) : 'nacht';
  const { base, light } = ATMOSPHERES[atmosphere];

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <AnimatePresence>
        <m.div
          key={atmosphere}
          className="absolute inset-0"
          style={{ background: `${light}, ${base}` }}
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 1.2, ease: 'linear' }}
        />
      </AnimatePresence>
    </div>
  );
}
