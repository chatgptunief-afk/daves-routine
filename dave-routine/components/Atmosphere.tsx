'use client';
import { useEffect, useState } from 'react';
import { m, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useApp } from './AppStateProvider';
import { getCurrentAtmosphere, type Atmosphere as AtmospherePhase } from '@/lib/phase';

// Zeven sferen — de achtergrond IS de klok. Elke sfeer combineert een horizon-gloed met een
// tegengesteld, veel zwakker tegenlicht — zo oogt geen enkele fase als één platte radial-blob,
// maar als lucht met een richting erin. Zie §23.4.
const ATMOSPHERES: Record<AtmospherePhase, { base: string; light: string }> = {
  nacht: {
    base: '#07070C',
    light: 'radial-gradient(60vw 30vh at 50% 105%, rgba(142,143,214,0.05), transparent 70%), radial-gradient(40vw 20vh at 15% -5%, rgba(245,241,232,0.03), transparent 70%)',
  },
  fajr: {
    base: '#0A0A0F',
    light: 'radial-gradient(120vw 42vh at 50% 102%, rgba(232,147,74,0.20), transparent 68%), radial-gradient(60vw 30vh at 50% 100%, rgba(166,167,228,0.10), transparent 70%)',
  },
  ochtend: {
    base: '#0C0B12',
    light: 'radial-gradient(90vw 65vh at 85% -5%, rgba(242,209,150,0.14), transparent 70%), radial-gradient(70vw 40vh at 50% 105%, rgba(232,147,74,0.05), transparent 75%)',
  },
  middag: {
    base: '#14131A',
    light: 'radial-gradient(110vw 65vh at 50% -8%, rgba(245,241,232,0.09), transparent 78%), radial-gradient(60vw 30vh at 50% 105%, rgba(245,241,232,0.03), transparent 75%)',
  },
  namiddag: {
    base: '#100E14',
    light: 'radial-gradient(90vw 65vh at 100% 35%, rgba(232,147,74,0.16), transparent 70%), radial-gradient(50vw 30vh at 0% 90%, rgba(201,117,47,0.06), transparent 70%)',
  },
  maghrib: {
    base: '#0D0910',
    light: 'linear-gradient(0deg, rgba(226,120,90,0.22) 0%, rgba(201,117,47,0.08) 22%, transparent 48%), radial-gradient(70vw 30vh at 50% 100%, rgba(226,120,90,0.14), transparent 70%)',
  },
  isha: {
    base: '#0A0912',
    light: 'radial-gradient(120vw 42vh at 50% 104%, rgba(142,143,214,0.16), transparent 68%), radial-gradient(50vw 25vh at 80% 0%, rgba(166,167,228,0.05), transparent 70%)',
  },
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
      {/* Korrel — voorkomt dat de gradient plat/digitaal oogt. Vast, wisselt niet mee met de sfeer. */}
      <div className="grain" />
    </div>
  );
}
