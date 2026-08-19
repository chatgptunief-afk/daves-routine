import { Task } from '@/types';

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

// Standaardroutine — zie DAVES-ROUTINE-REDESIGN.md §16.
// LET OP: `tier` op een Task is alleen een hint/voorstel. De daadwerkelijke ankers-selectie
// (max 5, altijd uit domain 'ritme') leeft in AppState.ankerIds en wordt gekozen in
// /ik/ankers. Gebed en Zuiverheid zijn structureel altijd non-negotiable en tellen NOOIT
// mee voor de 5-cap — zij hebben hun eigen, aparte DayRecord-velden (prayersMade, purityHeld).
export const DEFAULT_TASKS: Omit<Task, 'completed'>[] = [
  // Gebed — vaste vijf, altijd anker, altijd domein 'gebed', tijden komen uit prayerTimes
  { id: 'prayer-fajr', title: 'Fajr', prayer: 'fajr', domain: 'gebed', phase: 'doorlopend', tier: 'anker', icon: 'sunrise', days: ALL_DAYS, order: 1 },
  { id: 'prayer-dhuhr', title: 'Dhuhr', prayer: 'dhuhr', domain: 'gebed', phase: 'doorlopend', tier: 'anker', icon: 'sun', days: ALL_DAYS, order: 2 },
  { id: 'prayer-asr', title: 'Asr', prayer: 'asr', domain: 'gebed', phase: 'doorlopend', tier: 'anker', icon: 'sun', days: ALL_DAYS, order: 3 },
  { id: 'prayer-maghrib', title: 'Maghrib', prayer: 'maghrib', domain: 'gebed', phase: 'doorlopend', tier: 'anker', icon: 'sunset', days: ALL_DAYS, order: 4 },
  { id: 'prayer-isha', title: 'Isha', prayer: 'isha', domain: 'gebed', phase: 'doorlopend', tier: 'anker', icon: 'moon', days: ALL_DAYS, order: 5 },

  // Zuiverheid — één doorlopende staat
  { id: 'purity-1', title: 'Zuiverheid vandaag', domain: 'zuiverheid', phase: 'doorlopend', tier: 'anker', icon: 'shield-check', days: ALL_DAYS, order: 1 },

  // Ritme — ochtend
  { id: 'morning-1', title: 'Wakker zonder snooze', cue: 'Zodra de wekker gaat', domain: 'ritme', phase: 'ochtend', tier: 'anker', icon: 'alarm-clock', days: ALL_DAYS, order: 1 },
  { id: 'morning-2', title: 'Glas water', cue: 'Na het opstaan', domain: 'ritme', phase: 'ochtend', tier: 'ritme', icon: 'droplet', days: ALL_DAYS, order: 2 },
  { id: 'morning-3', title: 'Stretchen', cue: 'Na het Fajr-gebed', domain: 'ritme', phase: 'ochtend', tier: 'ritme', icon: 'wind', days: ALL_DAYS, order: 3 },
  { id: 'morning-4', title: 'Koude douche', cue: 'Na het Fajr-gebed', domain: 'ritme', phase: 'ochtend', tier: 'anker', icon: 'snowflake', days: ALL_DAYS, order: 4 },
  { id: 'morning-5', title: 'Ontbijt', domain: 'ritme', phase: 'ochtend', tier: 'ritme', icon: 'apple', days: ALL_DAYS, order: 5 },
  { id: 'morning-6', title: 'Dag plannen', cue: 'Vóór het werk', domain: 'ritme', phase: 'ochtend', tier: 'ritme', icon: 'clipboard-list', days: ALL_DAYS, order: 6 },

  // Ritme — doorlopend
  { id: 'daily-1', title: '2L water', domain: 'ritme', phase: 'doorlopend', tier: 'ritme', icon: 'droplets', days: ALL_DAYS, order: 1 },
  { id: 'daily-2', title: 'Sporten', cue: '30 minuten', domain: 'ritme', phase: 'doorlopend', tier: 'anker', icon: 'dumbbell', days: ALL_DAYS, order: 2 },
  { id: 'daily-3', title: 'Gezond eten', domain: 'ritme', phase: 'doorlopend', tier: 'ritme', icon: 'salad', days: ALL_DAYS, order: 3 },
  { id: 'daily-4', title: 'Schermtijd beperken', domain: 'ritme', phase: 'doorlopend', tier: 'ritme', icon: 'monitor-off', days: ALL_DAYS, order: 4 },
  { id: 'daily-5', title: 'Lezen / studeren', domain: 'ritme', phase: 'doorlopend', tier: 'ritme', icon: 'book-open', days: ALL_DAYS, order: 5 },
  { id: 'daily-6', title: 'Buiten zijn', domain: 'ritme', phase: 'doorlopend', tier: 'ritme', icon: 'footprints', days: ALL_DAYS, order: 6 },

  // Ritme — avond
  { id: 'evening-1', title: 'Reflectie', cue: 'Na Isha', domain: 'ritme', phase: 'avond', tier: 'ritme', icon: 'pen-line', days: ALL_DAYS, order: 1 },
  { id: 'evening-2', title: 'Schermen uit', cue: 'Om 21:00', domain: 'ritme', phase: 'avond', tier: 'ritme', icon: 'monitor-off', days: ALL_DAYS, order: 2 },
  { id: 'evening-3', title: 'Avond stretchen', domain: 'ritme', phase: 'avond', tier: 'ritme', icon: 'wind', days: ALL_DAYS, order: 3 },
  { id: 'evening-4', title: 'Morgen voorbereiden', domain: 'ritme', phase: 'avond', tier: 'ritme', icon: 'shirt', days: ALL_DAYS, order: 4 },
  { id: 'evening-5', title: 'Op tijd slapen', cue: 'Om 23:00', domain: 'ritme', phase: 'avond', tier: 'anker', icon: 'bed', days: ALL_DAYS, order: 5 },
];

export function getInitialTasks(): Task[] {
  return DEFAULT_TASKS.map(task => ({ ...task, completed: false }));
}

/** Filtert een blueprint naar de taken die op een gegeven weekdag (0=zo..6=za) horen. */
export function tasksForWeekday(blueprint: Task[], weekdayNum: number): Task[] {
  return blueprint
    .filter(t => !t.archivedAt && t.days.includes(weekdayNum))
    .map(t => ({ ...t, completed: false }));
}

// Aanbevolen default-ankers (max 5) voor een verse installatie — gebruiker past aan in /ik/ankers.
export const DEFAULT_ANKER_IDS = ['morning-1', 'morning-4', 'evening-5', 'purity-1', 'daily-2'];
