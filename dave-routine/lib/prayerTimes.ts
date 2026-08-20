// Zelfstandige gebedstijdberekening (geen npm-dependency).
// Standaard NOAA-achtige lage-precisie zonpositie + hoekmethode (MWL: Fajr 18°, Isha 17°,
// Asr = Shafi'i schaduwfactor 1). Nauwkeurig genoeg voor een persoonlijke app; de gebruiker
// kan altijd handmatige tijden invoeren in Instellingen — dat is het aanbevolen startpunt.
// Zie DAVES-ROUTINE-REDESIGN.md §7.3 / Deel 1.

import { PrayerTimes } from '@/types';
import { parseDateString } from './date';

export interface Coords { lat: number; lng: number; }

const FAJR_ANGLE = 18;
const ISHA_ANGLE = 17;
const ASR_FACTOR = 1; // Shafi'i / standaard

// Fallback voor als er nog geen locatie/handmatige tijden zijn (grove NL/BE-gemiddelden).
export const DEFAULT_MANUAL_TIMES: Omit<PrayerTimes, 'date'> = {
  fajr: '05:30',
  sunrise: '07:10',
  dhuhr: '13:15',
  asr: '16:45',
  maghrib: '19:30',
  isha: '21:00',
};

function sinD(d: number) { return Math.sin((d * Math.PI) / 180); }
function cosD(d: number) { return Math.cos((d * Math.PI) / 180); }
function tanD(d: number) { return Math.tan((d * Math.PI) / 180); }
function arcsinD(x: number) { return (Math.asin(x) * 180) / Math.PI; }
function arccosD(x: number) { return (Math.acos(Math.max(-1, Math.min(1, x))) * 180) / Math.PI; }
function arctanD(x: number) { return (Math.atan(x) * 180) / Math.PI; }
function arctan2D(y: number, x: number) { return (Math.atan2(y, x) * 180) / Math.PI; }
function arccotD(x: number) { return arctanD(1 / x); }
function fixAngle(a: number) { a = a % 360; return a < 0 ? a + 360 : a; }
function fixHour(h: number) { h = h % 24; return h < 0 ? h + 24 : h; }

function julianDay(year: number, month: number, day: number): number {
  if (month <= 2) { year -= 1; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
}

function sunPosition(jd: number): { declination: number; equation: number } {
  const D = jd - 2451545.0;
  const g = fixAngle(357.529 + 0.98560028 * D);
  const q = fixAngle(280.459 + 0.98564736 * D);
  const L = fixAngle(q + 1.915 * sinD(g) + 0.02 * sinD(2 * g));
  const e = 23.439 - 0.00000036 * D;
  let RA = arctan2D(cosD(e) * sinD(L), cosD(L)) / 15;
  RA = fixHour(RA);
  const eqt = q / 15 - RA;
  const decl = arcsinD(sinD(e) * sinD(L));
  return { declination: decl, equation: eqt };
}

function sunAngleTime(jd: number, angle: number, lat: number, direction: 'before' | 'after'): number {
  const { declination: decl, equation: eqt } = sunPosition(jd);
  const noon = fixHour(12 - eqt);
  const cosArg =
    (-sinD(angle) - sinD(decl) * sinD(lat)) / (cosD(decl) * cosD(lat));
  const t = arccosD(cosArg) / 15;
  return direction === 'before' ? noon - t : noon + t;
}

function asrTime(jd: number, factor: number, lat: number): number {
  const { declination: decl } = sunPosition(jd);
  const angle = -arccotD(factor + tanD(Math.abs(lat - decl)));
  return sunAngleTime(jd, angle, lat, 'after');
}

function hourToHHMM(hour: number): string {
  const h = fixHour(hour);
  const whole = Math.floor(h);
  const minutes = Math.round((h - whole) * 60);
  const finalH = fixHour(minutes === 60 ? whole + 1 : whole);
  const finalM = minutes === 60 ? 0 : minutes;
  return `${String(finalH).padStart(2, '0')}:${String(finalM).padStart(2, '0')}`;
}

/**
 * Berekent gebedstijden voor een gegeven lokale kalenderdatum en coördinaten.
 * timezoneOffsetHours = UTC-offset van de gebruiker op die datum (bv. 2 voor zomertijd
 * in Brussel). Gebruik `-new Date(...).getTimezoneOffset() / 60` op de client.
 */
export function calculatePrayerTimes(
  dateStr: string,
  coords: Coords,
  timezoneOffsetHours: number
): PrayerTimes {
  const d = parseDateString(dateStr);
  const jd = julianDay(d.getFullYear(), d.getMonth() + 1, d.getDate()) - coords.lng / (15 * 24);

  const raw = {
    fajr: sunAngleTime(jd, FAJR_ANGLE, coords.lat, 'before'),
    sunrise: sunAngleTime(jd, 0.833, coords.lat, 'before'),
    dhuhr: fixHour(12 - sunPosition(jd).equation),
    asr: asrTime(jd, ASR_FACTOR, coords.lat),
    maghrib: sunAngleTime(jd, 0.833, coords.lat, 'after'),
    isha: sunAngleTime(jd, ISHA_ANGLE, coords.lat, 'after'),
  };

  const adjust = (h: number) => h + timezoneOffsetHours - coords.lng / 15;

  return {
    date: dateStr,
    fajr: hourToHHMM(adjust(raw.fajr)),
    sunrise: hourToHHMM(adjust(raw.sunrise)),
    dhuhr: hourToHHMM(adjust(raw.dhuhr) + 1 / 60), // +1 min, gangbare correctie voor werkelijke zenit-doorgang
    asr: hourToHHMM(adjust(raw.asr)),
    maghrib: hourToHHMM(adjust(raw.maghrib)),
    isha: hourToHHMM(adjust(raw.isha)),
  };
}

export function manualToPrayerTimes(dateStr: string, manual: Omit<PrayerTimes, 'date'>): PrayerTimes {
  return { date: dateStr, ...manual };
}

/** Zet gebedstijden om naar echte Date-objecten voor vandaag, voor gebruik in de Boog. */
export function prayerTimesToDates(times: PrayerTimes) {
  const [y, m, d] = times.date.split('-').map(Number);
  const toDate = (hhmm: string) => {
    const [h, min] = hhmm.split(':').map(Number);
    return new Date(y, m - 1, d, h, min, 0, 0);
  };
  return {
    fajr: toDate(times.fajr),
    sunrise: toDate(times.sunrise),
    dhuhr: toDate(times.dhuhr),
    asr: toDate(times.asr),
    maghrib: toDate(times.maghrib),
    isha: toDate(times.isha),
  };
}
