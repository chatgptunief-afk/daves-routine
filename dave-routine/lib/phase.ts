// Fase-afleiding en Boog-posities. Enige plek waar kloktijd -> fase wordt vertaald.
// Zie DAVES-ROUTINE-REDESIGN.md §1.3 (Deel 1) en §26.6.

import { Phase, PrayerTimes } from '@/types';
import { prayerTimesToDates } from './prayerTimes';

export interface PhaseWindow {
  phase: Phase;
  label: string;
}

export function getCurrentPhase(now: Date, times: PrayerTimes): Phase {
  const t = prayerTimesToDates(times);
  if (now < t.fajr) return 'nacht';
  if (now >= t.fajr && now < t.sunrise) return 'fajr';
  if (now >= t.sunrise && now < t.dhuhr) return 'ochtend';
  if (now >= t.dhuhr && now < t.asr) return 'middag';
  if (now >= t.asr && now < t.maghrib) return 'avond';
  if (now >= t.maghrib && now < t.isha) return 'avond';
  return 'nacht'; // na Isha
}

export type Atmosphere = 'nacht' | 'fajr' | 'ochtend' | 'middag' | 'namiddag' | 'maghrib' | 'isha';

/** Fijnere sfeer-indeling dan Phase (7 in plaats van 5) — alleen voor de achtergrondlaag. */
export function getCurrentAtmosphere(now: Date, times: PrayerTimes): Atmosphere {
  const t = prayerTimesToDates(times);
  if (now < t.fajr) return 'nacht';
  if (now < t.sunrise) return 'fajr';
  if (now < t.dhuhr) return 'ochtend';
  if (now < t.asr) return 'middag';
  if (now < t.maghrib) return 'namiddag';
  if (now < t.isha) return 'maghrib';
  return 'isha';
}

/** Welk gebed is "nu" actief (voor de halo op de PrayerRow) — vanaf zijn tijd tot het volgende. */
export function getCurrentPrayerWindow(now: Date, times: PrayerTimes): keyof Omit<PrayerTimes, 'date'> | null {
  const t = prayerTimesToDates(times);
  if (now >= t.fajr && now < t.sunrise) return 'fajr';
  if (now >= t.dhuhr && now < t.asr) return 'dhuhr';
  if (now >= t.asr && now < t.maghrib) return 'asr';
  if (now >= t.maghrib && now < t.isha) return 'maghrib';
  if (now >= t.isha) return 'isha';
  return null;
}

export function momentLine(now: Date, times: PrayerTimes): string {
  const window = getCurrentPrayerWindow(now, times);
  const names: Record<string, string> = { fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' };
  if (window) return `Het is ${names[window]}.`;

  // tussen sunrise en dhuhr, of vóór fajr: tel af naar het eerstvolgende gebed
  const t = prayerTimesToDates(times);
  const upcoming: [string, Date][] = [
    ['Fajr', t.fajr], ['Dhuhr', t.dhuhr], ['Asr', t.asr], ['Maghrib', t.maghrib], ['Isha', t.isha],
  ];
  const next = upcoming.find(([, time]) => time > now);
  if (!next) return 'De nacht is stil.';
  const minutes = Math.round((next[1].getTime() - now.getTime()) / 60000);
  if (minutes <= 1) return `Bijna tijd voor ${next[0]}.`;
  if (minutes < 60) return `Nog ${minutes} minuten tot ${next[0]}.`;
  const hours = Math.round(minutes / 60);
  return `Nog ${hours} uur tot ${next[0]}.`;
}

// ---- Boog-geometrie ----
// t = 0 bij Fajr, t = 1 bij Isha. Bewust géén kloktijd-schaal (zie §1.3): de boog "ademt"
// mee met de seizoenen, want de dag tussen Fajr en Isha is in juni langer dan in december.

export function arcPosition(time: Date, times: PrayerTimes): number {
  const t = prayerTimesToDates(times);
  const start = t.fajr.getTime();
  const end = t.isha.getTime();
  if (end <= start) return 0.5; // defensief, zou niet moeten voorkomen
  const ratio = (time.getTime() - start) / (end - start);
  return Math.max(0.02, Math.min(0.98, ratio));
}

/** Inverse van arcPosition: gegeven t (0=Fajr, 1=Isha), welke kloktijd hoort daarbij.
 *  Gebruikt door de Boog om tijdens scrubben een tijd te tonen die bij de aanraakpositie hoort. */
export function timeAtArcPosition(t: number, times: PrayerTimes): Date {
  const tm = prayerTimesToDates(times);
  const start = tm.fajr.getTime();
  const end = tm.isha.getTime();
  const clamped = Math.max(0, Math.min(1, t));
  return new Date(start + clamped * (end - start));
}

export interface ArcMarkers {
  fajr: number; dhuhr: number; asr: number; maghrib: number; isha: number;
}

export function arcMarkerPositions(times: PrayerTimes): ArcMarkers {
  const t = prayerTimesToDates(times);
  return {
    fajr: arcPosition(t.fajr, times),
    dhuhr: arcPosition(t.dhuhr, times),
    asr: arcPosition(t.asr, times),
    maghrib: arcPosition(t.maghrib, times),
    isha: arcPosition(t.isha, times),
  };
}

const ARC_R = 140;
const ARC_CX = 160;
const ARC_CY = 168;
export const ARC_PATH_LENGTH = Math.PI * ARC_R;
export { ARC_R, ARC_CX, ARC_CY };

export function pointOnArc(t: number): { x: number; y: number } {
  const angle = Math.PI - t * Math.PI; // t=0 -> 180° (links), t=1 -> 0° (rechts)
  return {
    x: ARC_CX + ARC_R * Math.cos(angle),
    y: ARC_CY - ARC_R * Math.sin(angle),
  };
}

export function fillDashOffset(completionRatio: number): number {
  const clamped = Math.max(0, Math.min(1, completionRatio));
  return ARC_PATH_LENGTH * (1 - clamped);
}

/** Niet-lineaire luminantie: boven 70% voltooiing schuift de felste stop naar voren. Zie §26.6. */
export function gradientBrightShift(completionRatio: number): number {
  return completionRatio > 0.7 ? (completionRatio - 0.7) / 0.3 : 0;
}
