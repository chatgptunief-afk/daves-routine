import { AppState, DayRecord, Task } from '@/types';
import { getInitialTasks, DEFAULT_ANKER_IDS, tasksForWeekday } from './tasks';
import { DEFAULT_MANUAL_TIMES } from './prayerTimes';
import { todayString, addDays, isBefore, lastNDays, daysBetween, weekday } from './date';
import { get, set } from 'idb-keyval';

const STORAGE_KEY = 'dave-routine-state-v6';
const RECOVERY_WINDOW_DAYS = 30;
// DayRecord[] wordt NOOIT gepruned — dat is het product (zie §18 De Muur). Een paar duizend
// kleine JSON-objecten na jaren gebruik is verwaarloosbaar qua opslag.

export function getDefaultState(): AppState {
  const blueprint = getInitialTasks();
  const today = todayString();
  return {
    userName: 'Dave',
    identityStatement: '',
    taskBlueprint: blueprint,
    todayTasks: tasksForWeekday(blueprint, weekday(today)),
    goals: [],
    logEntries: [],
    history: [],
    lastResetDate: today,
    settings: {
      notificationsEnabled: false,
      eveningNudgeTime: null,
      prayerTimeSource: 'manual',
      location: null,
      manualPrayerTimes: { ...DEFAULT_MANUAL_TIMES },
      reducedMotionOverride: false,
      highContrast: false,
      notifMorningEnabled: true,
      notifMorningTime: '07:30',
      notifRoutineEnabled: false,
      notifEveningEnabled: true,
      notifEveningTime: '21:30',
      notifPrayerEnabled: false,
      notifPromptShown: false,
    },
    ankerIds: [...DEFAULT_ANKER_IDS],
    frogTaskId: null,
    pendingReflection: null,
    recoveryLastUsedAt: null,
    lastCheckinDate: null,
    onboardingComplete: false,
    prayerTimesCache: null,
  };
}

// ---------------------------------------------------------------------------
// Laden / opslaan
// ---------------------------------------------------------------------------

export async function loadState(): Promise<AppState> {
  if (typeof window === 'undefined') return getDefaultState();

  let state: AppState | null = null;

  try {
    const idbRaw = await get<AppState | LegacyState>(STORAGE_KEY);
    if (idbRaw) state = normalizeMaybeLegacy(idbRaw);
  } catch {
    // IDB kan geblokkeerd zijn in privénavigatie
  }

  if (!state) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        state = normalizeMaybeLegacy(JSON.parse(raw));
        try { await set(STORAGE_KEY, state); } catch {}
      }
    } catch {}
  }

  if (!state) state = migrateFromV5();
  if (!state) state = getDefaultState();

  state = validateStructure(state);

  const today = todayString();
  if (state.lastResetDate !== today) {
    state = rolloverToToday(state, today);
    saveState(state).catch(() => {});
  }

  return state;
}

export async function saveState(state: AppState): Promise<void> {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  try { await set(STORAGE_KEY, state); } catch {}
}

// ---------------------------------------------------------------------------
// Structuurvalidatie — voorkomt crashes op ontbrekende velden
// ---------------------------------------------------------------------------

function validateStructure(raw: AppState): AppState {
  const state = { ...raw };
  if (!state.userName) state.userName = 'Dave';
  if (state.identityStatement === undefined) state.identityStatement = '';
  if (!Array.isArray(state.taskBlueprint)) state.taskBlueprint = getInitialTasks();
  if (!Array.isArray(state.todayTasks)) state.todayTasks = state.taskBlueprint.map(t => ({ ...t }));
  if (!Array.isArray(state.goals)) state.goals = [];
  if (!Array.isArray(state.logEntries)) state.logEntries = [];
  if (!Array.isArray(state.history)) state.history = [];
  if (!Array.isArray(state.ankerIds)) state.ankerIds = [...DEFAULT_ANKER_IDS];
  if (state.frogTaskId === undefined) state.frogTaskId = null;
  if (state.pendingReflection === undefined) state.pendingReflection = null;
  if (state.recoveryLastUsedAt === undefined) state.recoveryLastUsedAt = null;
  if (state.lastCheckinDate === undefined) state.lastCheckinDate = null;
  if (state.onboardingComplete === undefined) state.onboardingComplete = false;
  if (state.prayerTimesCache === undefined) state.prayerTimesCache = null;
  if (!state.lastResetDate) state.lastResetDate = todayString();
  if (!state.settings) {
    state.settings = {
      notificationsEnabled: false, eveningNudgeTime: null, prayerTimeSource: 'manual',
      location: null, manualPrayerTimes: { ...DEFAULT_MANUAL_TIMES },
      reducedMotionOverride: false, highContrast: false,
      notifMorningEnabled: true, notifMorningTime: '07:30',
      notifRoutineEnabled: false,
      notifEveningEnabled: true, notifEveningTime: '21:30',
      notifPrayerEnabled: false, notifPromptShown: false,
    };
  } else {
    if (state.settings.manualPrayerTimes === undefined) state.settings.manualPrayerTimes = { ...DEFAULT_MANUAL_TIMES };
    if (state.settings.prayerTimeSource === undefined) state.settings.prayerTimeSource = 'manual';
    if (state.settings.location === undefined) state.settings.location = null;
    if (state.settings.reducedMotionOverride === undefined) state.settings.reducedMotionOverride = false;
    if (state.settings.highContrast === undefined) state.settings.highContrast = false;
    // Meldingen-granulariteit toegevoegd na v6 — bestaande gebruikers krijgen kalme defaults,
    // nooit een notificatiesoort die stilletjes "aan" springt zonder dat ze dat kozen.
    if (state.settings.notifMorningEnabled === undefined) state.settings.notifMorningEnabled = true;
    if (state.settings.notifMorningTime === undefined) state.settings.notifMorningTime = '07:30';
    if (state.settings.notifRoutineEnabled === undefined) state.settings.notifRoutineEnabled = false;
    if (state.settings.notifEveningEnabled === undefined) state.settings.notifEveningEnabled = true;
    if (state.settings.notifEveningTime === undefined) state.settings.notifEveningTime = '21:30';
    if (state.settings.notifPrayerEnabled === undefined) state.settings.notifPrayerEnabled = false;
    if (state.settings.notifPromptShown === undefined) state.settings.notifPromptShown = false;
  }
  return state;
}

// ---------------------------------------------------------------------------
// Migratie van v5 (coins/XP/streaks-per-domein) naar v6 (DayRecord[])
// ---------------------------------------------------------------------------

interface LegacySingleStreak { currentStreak: number; longestStreak: number; lastCompletedDate: string | null; history: Record<string, boolean>; }
interface LegacyState {
  userName?: string;
  taskBlueprint?: unknown[];
  todayTasks?: unknown[];
  streaks?: { routine: LegacySingleStreak; prayer: LegacySingleStreak; cleansoul: LegacySingleStreak; ultimate: LegacySingleStreak };
  lastResetDate?: string;
  notificationsEnabled?: boolean;
  soulCoins?: number;
  freezes?: number;
  categoryXP?: Record<string, number>;
  frogTaskId?: string | null;
  lastCheckinDate?: string | null;
  // v6-merker: als dit veld bestaat is het al een v6 AppState, geen legacy
  history?: unknown;
}

function looksLikeV6(raw: unknown): raw is AppState {
  return !!raw && typeof raw === 'object' && Array.isArray((raw as LegacyState).history);
}

function normalizeMaybeLegacy(raw: AppState | LegacyState): AppState {
  if (looksLikeV6(raw)) return raw as AppState;
  return convertLegacyToV6(raw as LegacyState) ?? getDefaultState();
}

const EMOJI_TO_ICON: Record<string, string> = {
  '🌅': 'sunrise', '☀️': 'sun', '🌤️': 'sun', '🌆': 'sunset', '🌙': 'moon', '🛡️': 'shield-check',
  '⏰': 'alarm-clock', '💧': 'droplet', '🧘': 'wind', '🚿': 'snowflake', '🥗': 'salad',
  '📋': 'clipboard-list', '🚶': 'footprints', '🥤': 'droplets', '🏃': 'dumbbell', '🍎': 'apple',
  '📱': 'monitor-off', '📚': 'book-open', '🌿': 'footprints', '📔': 'pen-line', '🌛': 'monitor-off',
  '👕': 'shirt', '😴': 'bed', '🛏️': 'bed',
};

function convertLegacyToV6(legacy: LegacyState): AppState | null {
  if (!legacy || typeof legacy !== 'object') return null;
  const base = getDefaultState();

  base.userName = legacy.userName || base.userName;
  base.lastResetDate = legacy.lastResetDate || base.lastResetDate;
  base.settings.notificationsEnabled = legacy.notificationsEnabled ?? false;

  // Blueprint converteren (best-effort — onbekende vormen vallen terug op defaults)
  if (Array.isArray(legacy.taskBlueprint) && legacy.taskBlueprint.length > 0) {
    try {
      base.taskBlueprint = legacy.taskBlueprint.map((raw, i) => legacyTaskToV6(raw, i));
      base.todayTasks = base.taskBlueprint.map(t => ({ ...t, completed: false }));
    } catch {
      // val terug op default blueprint
    }
  }

  // Streak-geschiedenis -> DayRecord[]
  if (legacy.streaks) {
    const allDates = new Set<string>();
    (['routine', 'prayer', 'cleansoul', 'ultimate'] as const).forEach(k => {
      const s = legacy.streaks?.[k];
      if (s?.history) Object.keys(s.history).forEach(d => allDates.add(d));
    });
    const records: DayRecord[] = Array.from(allDates).sort().map(date => ({
      date,
      completedTaskIds: [],
      ankerIds: [],
      ankersMade: !!legacy.streaks?.routine.history[date],
      prayersMade: legacy.streaks?.prayer.history[date] ? 5 : 0,
      purityHeld: legacy.streaks?.cleansoul.history[date] ?? null,
      reflection: undefined,
      tomorrowsFirstStoneId: null,
      recoveryUsed: false,
    }));
    base.history = records;
  }

  base.onboardingComplete = true; // bestaande gebruiker, geen onboarding opnieuw tonen
  return base;
}

function legacyTaskToV6(raw: unknown, index: number): Task {
  const r = raw as Record<string, unknown>;
  const category = String(r.category ?? 'daily');
  const map: Record<string, { domain: Task['domain']; phase: Task['phase']; tier: Task['tier'] }> = {
    prayer: { domain: 'gebed', phase: 'doorlopend', tier: 'anker' },
    cleansoul: { domain: 'zuiverheid', phase: 'doorlopend', tier: 'anker' },
    morning: { domain: 'ritme', phase: 'ochtend', tier: 'ritme' },
    daily: { domain: 'ritme', phase: 'doorlopend', tier: 'ritme' },
    evening: { domain: 'ritme', phase: 'avond', tier: 'ritme' },
  };
  const m = map[category] ?? map.daily;
  const emoji = String(r.icon ?? '');
  return {
    id: String(r.id ?? `legacy-${index}`),
    title: String(r.title ?? 'Taak'),
    cue: r.description ? String(r.description) : undefined,
    domain: m.domain,
    phase: m.phase,
    tier: m.tier,
    icon: EMOJI_TO_ICON[emoji] ?? 'sparkles',
    days: [0, 1, 2, 3, 4, 5, 6],
    order: Number(r.order ?? index),
    completed: false,
  };
}

function migrateFromV5(): AppState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('dave-routine-state-v5');
    if (!raw) return null;
    return convertLegacyToV6(JSON.parse(raw));
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Rollover — schrijft een DayRecord voor de afgelopen dag(en) en start een nieuwe dag
// ---------------------------------------------------------------------------

export function computeDayRecord(state: AppState, date: string): DayRecord {
  const ankerTasks = state.todayTasks.filter(t => t.domain === 'ritme' && state.ankerIds.includes(t.id));
  const prayerTasks = state.todayTasks.filter(t => t.domain === 'gebed');
  const purityTasks = state.todayTasks.filter(t => t.domain === 'zuiverheid');

  const ankersMade = ankerTasks.length === 0 || ankerTasks.every(t => t.completed);
  const prayersMade = prayerTasks.filter(t => t.completed).length;
  const purityHeld = purityTasks.length > 0 ? purityTasks.every(t => t.completed) : null;

  return {
    date,
    completedTaskIds: state.todayTasks.filter(t => t.completed).map(t => t.id),
    ankerIds: [...state.ankerIds],
    ankersMade,
    prayersMade,
    purityHeld,
    reflection: state.pendingReflection ?? undefined,
    tomorrowsFirstStoneId: state.frogTaskId,
    recoveryUsed: false,
  };
}

function pickFallbackFirstStone(state: AppState, records: DayRecord[]): string | null {
  // Anker met het hoogste mispercentage over de laatste 14 dagen
  const recent = records.slice(-14);
  const ankerTasks = state.taskBlueprint.filter(t => t.domain === 'ritme' && state.ankerIds.includes(t.id) && !t.archivedAt);
  if (ankerTasks.length === 0) return null;
  let worst = ankerTasks[0];
  let worstRate = -1;
  for (const t of ankerTasks) {
    const missed = recent.filter(r => !r.completedTaskIds.includes(t.id)).length;
    const rate = recent.length > 0 ? missed / recent.length : 0;
    if (rate > worstRate) { worstRate = rate; worst = t; }
  }
  return worst.id;
}

export function rolloverToToday(prevState: AppState, today: string): AppState {
  if (!isBefore(prevState.lastResetDate, today)) return prevState;

  // Sluit elke verstreken dag af met een DayRecord (meestal maar één dag, maar de app
  // moet ook correct zijn na dagen dicht te zijn geweest).
  let history = [...prevState.history];
  let cursor = prevState.lastResetDate;
  let workingState = prevState;

  while (isBefore(cursor, today)) {
    const record = computeDayRecord(workingState, cursor);

    // Herstel: precies één gratis misser per rollende 30 dagen, stil toegepast.
    if (!record.ankersMade) {
      const canRecover =
        !workingState.recoveryLastUsedAt ||
        !isWithinDays(workingState.recoveryLastUsedAt, cursor, RECOVERY_WINDOW_DAYS);
      if (canRecover) {
        record.recoveryUsed = true;
        workingState = { ...workingState, recoveryLastUsedAt: cursor };
      }
    }

    history.push(record);

    // volgende dag: taken resetten volgens weekdag-recurrence, ankerIds blijven
    const nextDate = addDays(cursor, 1);
    const freshTasks = tasksForWeekday(workingState.taskBlueprint, weekday(nextDate));
    workingState = { ...workingState, todayTasks: freshTasks, lastResetDate: nextDate, pendingReflection: null };
    cursor = nextDate;
  }

  // de eerste steen van morgen: wat gisteravond gekozen is, anders fallback
  const nextFirstStone =
    history[history.length - 1]?.tomorrowsFirstStoneId ?? pickFallbackFirstStone(workingState, history);

  return {
    ...workingState,
    history,
    frogTaskId: nextFirstStone,
    lastCheckinDate: null,
  };
}

function isWithinDays(dateA: string, dateB: string, n: number): boolean {
  return Math.abs(daysBetween(dateA, dateB)) <= n;
}

// ---------------------------------------------------------------------------
// Afgeleide streak / Ritme% — NOOIT gemuteerd, altijd herberekend uit history (fixt D2)
// ---------------------------------------------------------------------------

export interface StreakInfo {
  current: number;
  longest: number;
  ritme30: number; // percentage 0-100
}

export function computeStreak(history: DayRecord[]): StreakInfo {
  const sorted = [...history].sort((a, b) => (a.date < b.date ? -1 : 1));

  let current = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    const r = sorted[i];
    if (r.ankersMade || r.recoveryUsed) current++;
    else break;
  }

  let longest = 0;
  let running = 0;
  for (const r of sorted) {
    if (r.ankersMade || r.recoveryUsed) { running++; longest = Math.max(longest, running); }
    else running = 0;
  }

  const last30Dates = lastNDays(30);
  const byDate = new Map(sorted.map(r => [r.date, r]));
  const relevant = last30Dates.map(d => byDate.get(d)).filter((r): r is DayRecord => !!r);
  const made = relevant.filter(r => r.ankersMade).length;
  const ritme30 = relevant.length > 0 ? Math.round((made / relevant.length) * 100) : 0;

  return { current, longest, ritme30 };
}

/** Losse, doorlopende streak voor het zuiverheid-domein — apart van de ankers-streak,
 * want de Muur toont ze als twee onafhankelijke signalen (§18). */
export function computePurityStreak(history: DayRecord[]): number {
  const sorted = [...history].sort((a, b) => (a.date < b.date ? -1 : 1));
  let current = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].purityHeld === true) current++;
    else if (sorted[i].purityHeld === null) continue; // geen zuiverheids-anker die dag, telt niet mee, breekt niet
    else break;
  }
  return current;
}

/** Losse, doorlopende streak vóór één specifieke Clean Soul-gewoonte (los van de andere).
 * Zo breekt een gemiste dag bij "niet roken" niet de streak van "niet negatief praten". */
export function computeTaskStreak(history: DayRecord[], taskId: string): number {
  const sorted = [...history].sort((a, b) => (a.date < b.date ? -1 : 1));
  let current = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].completedTaskIds.includes(taskId)) current++;
    else break;
  }
  return current;
}

export function consecutiveMissedDays(history: DayRecord[]): number {
  const sorted = [...history].sort((a, b) => (a.date < b.date ? 1 : -1)); // nieuwste eerst
  let n = 0;
  for (const r of sorted) {
    if (!r.ankersMade && !r.recoveryUsed) n++;
    else break;
  }
  return n;
}

export function getCompletionPercentage(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  const done = tasks.filter(t => t.completed).length;
  return Math.round((done / tasks.length) * 100);
}
