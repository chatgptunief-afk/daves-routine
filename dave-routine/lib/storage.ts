import { AppState, SingleStreakData, StreakData, Task } from '@/types';
import { getInitialTasks, getTodayDateString } from './tasks';
import { get, set } from 'idb-keyval';

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

export async function loadState(): Promise<AppState> {
  if (typeof window === 'undefined') return getDefaultState();
  try {
    let state: AppState | null = null;
    
    // 1. Try to read from IndexedDB
    const idbRaw = await get<AppState>(STORAGE_KEY);
    if (idbRaw) {
      state = idbRaw;
    } else {
      // 2. Fallback to localStorage (Migration)
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        state = JSON.parse(raw);
        // Save to IndexedDB for next time
        await set(STORAGE_KEY, state);
      }
    }

    if (!state) return migrateLegacyState();
    
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
      const resetState = resetDayTasks(state, today);
      await set(STORAGE_KEY, resetState);
      return resetState;
    }
    return state;
  } catch (e) {
    console.error('Failed to load state from idb', e);
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

export async function saveState(state: AppState): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    // Keep a backup in localstorage just in case
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    // Persist primarily to IndexedDB
    await set(STORAGE_KEY, state);
  } catch (e) {
    console.error('Failed to save state to idb', e);
  }
}

function getNextDaySafe(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + 1));
  return date.toISOString().split('T')[0];
}

function resetDayTasks(prevState: AppState, today: string): AppState {
  if (prevState.lastResetDate >= today) {
    return prevState; // Already reset or future time
  }

  let freezesToUse = 0;
  let sufficientFreezes = true;
  const daysToEvaluate: string[] = [];
  
  // Gather all days from lastResetDate up to yesterday
  for (let d = prevState.lastResetDate; d < today; d = getNextDaySafe(d)) {
    daysToEvaluate.push(d);
  }

  let daysFailed = 0;
  
  // A day is failed if ANY active streak (currentStreak > 0) was NOT completed
  daysToEvaluate.forEach(d => {
    let dayHasFailure = false;
    ['routine', 'prayer', 'cleansoul', 'ultimate'].forEach(key => {
      const streak = prevState.streaks[key as keyof StreakData];
      if (streak.currentStreak > 0 && !streak.history[d]) {
        dayHasFailure = true;
      }
    });
    if (dayHasFailure) {
      daysFailed++;
    }
  });

  let remainingFreezes = prevState.freezes ?? 0;
  if (daysFailed > 0) {
    if (remainingFreezes >= daysFailed) {
      freezesToUse = daysFailed;
      remainingFreezes -= daysFailed;
      sufficientFreezes = true;
    } else {
      sufficientFreezes = false;
      // Not enough freezes -> we do NOT drain their freezes for a lost streak
    }
  }

  // Deep clone streaks
  const newStreaks = JSON.parse(JSON.stringify(prevState.streaks)) as StreakData;

  if (!sufficientFreezes) {
    // Reset any streak that failed on ANY of the evaluated days
    daysToEvaluate.forEach(d => {
      ['routine', 'prayer', 'cleansoul', 'ultimate'].forEach(key => {
        const streak = newStreaks[key as keyof StreakData];
        if (streak.currentStreak > 0 && !streak.history[d]) {
          streak.currentStreak = 0;
        }
      });
    });
  }

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

function updateSingleStreak(streak: SingleStreakData, today: string, isCompleted: boolean): SingleStreakData {
  const wasCompletedToday = streak.history[today] || false;
  let currentStreak = streak.currentStreak;

  if (isCompleted && !wasCompletedToday) {
    currentStreak++; // Just completed today
  } else if (!isCompleted && wasCompletedToday) {
    currentStreak = Math.max(0, currentStreak - 1); // Just un-completed today
  }

  const newHistory = { ...streak.history, [today]: isCompleted };
  const longestStreak = Math.max(streak.longestStreak, currentStreak);

  return {
    currentStreak,
    longestStreak,
    lastCompletedDate: isCompleted ? today : (streak.lastCompletedDate === today ? null : streak.lastCompletedDate),
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
