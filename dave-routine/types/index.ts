// Dave's Routine — v6 datamodel ("Dagboog")
// Eén bron van waarheid voor tijd, domein en record. Zie DAVES-ROUTINE-REDESIGN.md §10.

export type Phase = 'fajr' | 'ochtend' | 'middag' | 'avond' | 'nacht' | 'doorlopend';
export type Domain = 'gebed' | 'ritme' | 'zuiverheid';
export type Tier = 'anker' | 'ritme';
export type DomainColor = 'ember' | 'dusk' | 'grove';

// Naam van een lucide-react icoon (bv. "sunrise", "droplet", "book-open").
// GEEN emoji — zie Visuele Regel 1.
export type IconName = string;

export interface PrayerName {
  fajr: 'fajr';
  dhuhr: 'dhuhr';
  asr: 'asr';
  maghrib: 'maghrib';
  isha: 'isha';
}
export type Prayer = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface PrayerTimes {
  date: string; // YYYY-MM-DD waarvoor deze tijden berekend zijn
  fajr: string; // "HH:mm" — 24-uurs, lokale tijd als string opgeslagen (geen TZ-gedoe)
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export interface Task {
  id: string;
  title: string;
  cue?: string; // "Na het Fajr-gebed" — context-cue, zie §7.3
  domain: Domain;
  phase: Phase;
  tier: Tier;
  icon: IconName;
  prayer?: Prayer; // alleen gezet als domain === 'gebed'
  days: number[]; // 0=zo .. 6=za, weekdag-recurrence
  goalId?: string; // optioneel gekoppeld doel
  amountPerCompletion?: number; // hoeveel dit toevoegt aan het gekoppelde doel per keer
  order: number;
  archivedAt?: string | null;
  completed: boolean; // alleen relevant binnen todayTasks
}

export type GoalUnit = 'minuten' | 'uren' | 'keer' | 'km' | 'bladzijden' | 'liter' | string;
export type GoalPeriod = 'week' | 'maand' | 'kwartaal' | 'jaar' | 'doorlopend';

export interface Goal {
  id: string;
  title: string;
  unit: GoalUnit;
  target: number;
  period: GoalPeriod;
  startDate: string; // YYYY-MM-DD — ankerpunt voor periodeberekening
  color: DomainColor;
  archivedAt?: string | null;
}

export interface LogEntry {
  id: string;
  goalId: string;
  date: string; // YYYY-MM-DD
  amount: number;
  note?: string;
  source: 'manual' | 'task';
}

export interface DayRecord {
  date: string; // YYYY-MM-DD
  completedTaskIds: string[];
  ankerIds: string[]; // welke ankers die dag actief waren
  ankersMade: boolean; // alle actieve ankers die dag gehaald
  prayersMade: number; // 0-5
  purityHeld: boolean | null; // null = geen zuiverheids-anker die dag
  reflection?: string;
  tomorrowsFirstStoneId?: string | null;
  recoveryUsed?: boolean;
  skippedTaskIds?: string[];
}

export interface AppSettings {
  notificationsEnabled: boolean; // hoofdschakelaar
  eveningNudgeTime?: string | null; // "HH:mm", optioneel, geen streak-waarschuwingen ooit
  prayerTimeSource: 'calculated' | 'manual';
  location: { lat: number; lng: number } | null;
  manualPrayerTimes: Omit<PrayerTimes, 'date'> | null;
  reducedMotionOverride: boolean;
  highContrast: boolean;
  // Meldingen — elk los uitzetbaar, geen enkele staat standaard "aan" zonder reden.
  // Zie NotificationScheduler.tsx: dit zijn puur voorkeuren, de planner beslist zelf
  // of er op basis van échte data (ankers, gebedstijden) iets te melden valt.
  notifMorningEnabled: boolean;
  notifMorningTime: string; // "HH:mm"
  notifRoutineEnabled: boolean;
  notifEveningEnabled: boolean;
  notifEveningTime: string; // "HH:mm"
  notifPrayerEnabled: boolean;
  notifPromptShown: boolean; // is de eenmalige "wil je meldingen"-ask al getoond
}

export interface AppState {
  userName: string;
  identityStatement: string; // "Iemand die opstaat voordat hij er zin in heeft."
  taskBlueprint: Task[];
  todayTasks: Task[];
  goals: Goal[];
  logEntries: LogEntry[];
  history: DayRecord[]; // NOOIT gepruned — dit is de Muur
  lastResetDate: string;
  settings: AppSettings;
  ankerIds: string[]; // max 5, gekozen in /ik/ankers
  frogTaskId: string | null; // "De Eerste Steen" — gekozen tijdens Dagafsluiting
  pendingReflection: string | null; // reflectiezin uit Dagafsluiting, wacht op de rollover
  recoveryLastUsedAt: string | null; // datum, voor de 1-gratis-misser-per-30-dagen-regel
  lastCheckinDate: string | null;
  onboardingComplete: boolean;
  prayerTimesCache: PrayerTimes | null;
}
