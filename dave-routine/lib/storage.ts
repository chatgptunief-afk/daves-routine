import { AppState, SingleStreakData, StreakData, Task } from '@/types';
import { getInitialTasks, getTodayDateString } from './tasks';

const STORAGE_KEY = 'dave-routine-state-v5';

function createEmptySingleStreak(): SingleStreakData {
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedDate: null,
    history: {},
  };
}

export function getDefaultState(): AppState {
  const initialBlueprints = getInitialTasks();
  return {
    userName: 'Dave',
    taskBlueprint: initialBlueprints,
    todayTasks: initialBlueprints,
    streaks: {
      routine: createEmptySingleStreak(),
      prayer: createEmptySingleStreak(),
      cleansoul: createEmptySingleStreak(),
      ultimate: createEmptySingleStreak(),
    },
    lastResetDate: getTodayDateString(),
    notificationsEnabled: false,
    soulCoins: 0,
    freezes: 0,
    categoryXP: {},
    frogTaskId: null,
    lastCheckinDate: null,
  };
}

export function loadState(): AppState {
  if (typeof window === 'undefined') return getDefaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return migrateLegacyState();
    const state: AppState = JSON.parse(raw);

    // Safety checks for missing fields
    if (!state.userName) state.userName = 'Dave';
    if (!state.taskBlueprint) state.taskBlueprint = getInitialTasks();
    if (state.soulCoins === undefined) state.soulCoins = 0;
    if (state.freezes === undefined) state.freezes = 0;
    if (!state.categoryXP) state.categoryXP = {};
    if (state.frogTaskId === undefined) state.frogTaskId = null;
    if (state.lastCheckinDate === undefined) state.lastCheckinDate = null;

    const today = getTodayDateString();
    if (state.lastResetDate !== today) {
      return resetDayTasks(state, today);
    }
    return state;
  } catch {
    return getDefaultState();
  }
}

function migrateLegacyState(): AppState {
  const defaults = getDefaultState();

  // Try v4 first (most recent)
  const oldRaw4 = localStorage.getItem('dave-routine-state-v4');
  if (oldRaw4) {
    try {
      const oldState = JSON.parse(oldRaw4);
      defaults.userName = oldState.userName || 'Dave';
      defaults.taskBlueprint = oldState.taskBlueprint || getInitialTasks();
      if (oldState.streaks) defaults.streaks = oldState.streaks;
      defaults.lastResetDate = oldState.lastResetDate || getTodayDateString();
      defaults.notificationsEnabled = oldState.notificationsEnabled || false;
      // Preserve today's progress if same day
      if (defaults.lastResetDate === getTodayDateString()) {
        defaults.todayTasks = oldState.todayTasks || defaults.taskBlueprint;
      } else {
        return resetDayTasks(defaults, getTodayDateString());
      }
      // New v5 fields default to zero/null on migration
      defaults.soulCoins = 0;
      defaults.freezes = 0;
      defaults.categoryXP = {};
      defaults.frogTaskId = null;
      defaults.lastCheckinDate = null;
      return defaults;
    } catch (e) {
      console.error('V4 Migration failed', e);
    }
  }

  // Try v3
  const oldRaw3 = localStorage.getItem('dave-routine-state-v3');
  if (oldRaw3) {
    try {
      const oldState = JSON.parse(oldRaw3);
      if (oldState.streaks) {
        defaults.streaks = oldState.streaks;
        defaults.lastResetDate = oldState.lastResetDate || getTodayDateString();
        if (defaults.lastResetDate === getTodayDateString()) {
          defaults.todayTasks = oldState.todayTasks || defaults.taskBlueprint;
        } else {
          return resetDayTasks(defaults, getTodayDateString());
        }
        return defaults;
      }
    } catch (e) {
      console.error('V3 Migration failed', e);
    }
  }

  // Try v2
  const oldRaw2 = localStorage.getItem('dave-routine-state-v2');
  if (oldRaw2) {
    try {
      const oldState = JSON.parse(oldRaw2);
      if (oldState.streaks) {
        defaults.streaks.routine = oldState.streaks.routine || createEmptySingleStreak();
        defaults.streaks.prayer = oldState.streaks.prayer || createEmptySingleStreak();
        defaults.streaks.cleansoul = oldState.streaks.nofap || createEmptySingleStreak();
        defaults.streaks.ultimate = oldState.streaks.ultimate || createEmptySingleStreak();
        defaults.lastResetDate = oldState.lastResetDate || getTodayDateString();
        if (defaults.lastResetDate !== getTodayDateString()) {
          return resetDayTasks(defaults, getTodayDateString());
        }
        return defaults;
      }
    } catch (e) {
      console.error('V2 Migration failed', e);
    }
  }

  return defaults;
}

export function saveState(state: AppState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state', e);
  }
}

function processStreakReset(
  streak: SingleStreakData,
  prevCompleted: boolean,
  lastResetWasYesterday: boolean,
  freezesAvailable: number
): { newStreak: SingleStreakData; freezeUsed: boolean } {
  let newStreak = { ...streak };
  let freezeUsed = false;

  if (prevCompleted) {
    // Completed yesterday → keep streak
    newStreak.currentStreak = streak.currentStreak;
  } else if (lastResetWasYesterday && freezesAvailable > 0) {
    // Missed exactly yesterday but have a freeze → save streak
    newStreak.currentStreak = streak.currentStreak;
    freezeUsed = true;
  } else {
    // Missed one or more days without a freeze → reset
    newStreak.currentStreak = 0;
  }
  return { newStreak, freezeUsed };
}

function resetDayTasks(prevState: AppState, today: string): AppState {
  const yesterday = getPreviousDay(today);
  // True only if the app was LAST used exactly yesterday
  const lastResetWasYesterday = prevState.lastResetDate === yesterday;

  // prevCompleted = was yesterday (= lastResetDate) actually completed?
  // If lastResetDate is 2+ days ago this is false even if that day was completed,
  // because they skipped at least one day since then.
  const routineCompleted   = lastResetWasYesterday && (prevState.streaks.routine.history[prevState.lastResetDate]   || false);
  const prayerCompleted    = lastResetWasYesterday && (prevState.streaks.prayer.history[prevState.lastResetDate]    || false);
  const cleansoulCompleted = lastResetWasYesterday && (prevState.streaks.cleansoul.history[prevState.lastResetDate] || false);
  const ultimateCompleted  = lastResetWasYesterday && (prevState.streaks.ultimate.history[prevState.lastResetDate]  || false);

  let remainingFreezes = prevState.freezes ?? 0;

  const routine = processStreakReset(
    prevState.streaks.routine, routineCompleted, lastResetWasYesterday, remainingFreezes
  );
  if (routine.freezeUsed) remainingFreezes = Math.max(0, remainingFreezes - 1);

  const prayer = processStreakReset(
    prevState.streaks.prayer, prayerCompleted, lastResetWasYesterday, remainingFreezes
  );
  if (prayer.freezeUsed) remainingFreezes = Math.max(0, remainingFreezes - 1);

  const cleansoul = processStreakReset(
    prevState.streaks.cleansoul, cleansoulCompleted, lastResetWasYesterday, remainingFreezes
  );
  if (cleansoul.freezeUsed) remainingFreezes = Math.max(0, remainingFreezes - 1);

  const ultimate = processStreakReset(
    prevState.streaks.ultimate, ultimateCompleted, lastResetWasYesterday, remainingFreezes
  );
  if (ultimate.freezeUsed) remainingFreezes = Math.max(0, remainingFreezes - 1);

  const newStreaks: StreakData = {
    routine: routine.newStreak,
    prayer: prayer.newStreak,
    cleansoul: cleansoul.newStreak,
    ultimate: ultimate.newStreak,
  };

  // Use Blueprint to generate today's tasks (reset completion)
  const freshTasks = prevState.taskBlueprint.map(task => ({
    ...task,
    completed: false,
  }));

  return {
    ...prevState,
    todayTasks: freshTasks,
    lastResetDate: today,
    streaks: newStreaks,
    freezes: remainingFreezes,
  };
}

function getPreviousDay(dateStr: string): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function updateSingleStreak(streak: SingleStreakData, today: string, isCompleted: boolean): SingleStreakData {
  const newHistory = { ...streak.history, [today]: isCompleted };

  let currentStreak = streak.currentStreak;
  if (isCompleted && streak.lastCompletedDate !== today) {
    const yesterday = getPreviousDay(today);
    if (streak.lastCompletedDate === yesterday || streak.currentStreak === 0) {
      currentStreak = streak.currentStreak + 1;
    } else if (!streak.lastCompletedDate) {
      currentStreak = 1;
    }
  } else if (!isCompleted && streak.lastCompletedDate === today) {
    currentStreak = Math.max(0, currentStreak - 1);
  }

  const longestStreak = Math.max(streak.longestStreak, currentStreak);

  return {
    currentStreak,
    longestStreak,
    lastCompletedDate: isCompleted
      ? today
      : streak.lastCompletedDate === today
      ? getPreviousDay(today)
      : streak.lastCompletedDate,
    history: newHistory,
  };
}

export function updateStreakOnComplete(state: AppState): AppState {
  const today = getTodayDateString();

  const routineTasks = state.todayTasks.filter(
    t => t.category === 'morning' || t.category === 'daily' || t.category === 'evening'
  );
  const prayerTasks = state.todayTasks.filter(t => t.category === 'prayer');
  const cleanSoulTasks = state.todayTasks.filter(t => t.category === 'cleansoul');

  const routineDone = routineTasks.length === 0 || routineTasks.every(t => t.completed);
  const prayerDone = prayerTasks.length === 0 || prayerTasks.every(t => t.completed);
  const cleanSoulDone = cleanSoulTasks.length === 0 || cleanSoulTasks.every(t => t.completed);

  const ultimateDone = routineDone && prayerDone && cleanSoulDone;

  return {
    ...state,
    streaks: {
      routine: updateSingleStreak(state.streaks.routine, today, routineDone && routineTasks.length > 0),
      prayer: updateSingleStreak(state.streaks.prayer, today, prayerDone && prayerTasks.length > 0),
      cleansoul: updateSingleStreak(state.streaks.cleansoul, today, cleanSoulDone && cleanSoulTasks.length > 0),
      ultimate: updateSingleStreak(
        state.streaks.ultimate,
        today,
        ultimateDone && (routineTasks.length > 0 || prayerTasks.length > 0 || cleanSoulTasks.length > 0)
      ),
    },
  };
}

export function getCompletionPercentage(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  const done = tasks.filter(t => t.completed).length;
  return Math.round((done / tasks.length) * 100);
}

// XP thresholds for category levels
export const XP_THRESHOLDS = [0, 100, 250, 500, 1000, 2000];

export function getLevelFromXP(xp: number): number {
  let level = 1;
  for (let i = 0; i < XP_THRESHOLDS.length; i++) {
    if (xp >= XP_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return Math.min(level, XP_THRESHOLDS.length);
}

export function getXPProgress(xp: number): { level: number; current: number; next: number; pct: number } {
  const level = getLevelFromXP(xp);
  const currentThreshold = XP_THRESHOLDS[level - 1] ?? 0;
  const nextThreshold = XP_THRESHOLDS[level] ?? XP_THRESHOLDS[XP_THRESHOLDS.length - 1];
  const current = xp - currentThreshold;
  const next = nextThreshold - currentThreshold;
  const pct = next > 0 ? Math.round((current / next) * 100) : 100;
  return { level, current, next, pct };
}
