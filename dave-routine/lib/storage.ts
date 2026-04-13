import { AppState, SingleStreakData, StreakData, Task } from '@/types';
import { getInitialTasks, getTodayDateString } from './tasks';

const STORAGE_KEY = 'dave-routine-state-v3'; // Increased version to clear old struct

function createEmptySingleStreak(): SingleStreakData {
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedDate: null,
    history: {},
  };
}

export function getDefaultState(): AppState {
  return {
    todayTasks: getInitialTasks(),
    streaks: {
      routine: createEmptySingleStreak(),
      prayer: createEmptySingleStreak(),
      cleansoul: createEmptySingleStreak(),
      ultimate: createEmptySingleStreak(),
    },
    lastResetDate: getTodayDateString(),
    notificationsEnabled: false,
  };
}

export function loadState(): AppState {
  if (typeof window === 'undefined') return getDefaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return migrateLegacyState(); 
    const state: AppState = JSON.parse(raw);
    
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
  const oldRaw2 = localStorage.getItem('dave-routine-state-v2');
  const defaults = getDefaultState();
  
  if (oldRaw2) {
    try {
      const oldState = JSON.parse(oldRaw2);
      if (oldState.streaks) {
        defaults.streaks.routine = oldState.streaks.routine || createEmptySingleStreak();
        defaults.streaks.prayer = oldState.streaks.prayer || createEmptySingleStreak();
        defaults.streaks.cleansoul = oldState.streaks.nofap || createEmptySingleStreak(); // Migrate from nofap
        defaults.streaks.ultimate = oldState.streaks.ultimate || createEmptySingleStreak();
        defaults.lastResetDate = oldState.lastResetDate || getTodayDateString();
        
        if (defaults.lastResetDate !== getTodayDateString()) {
           return resetDayTasks(defaults, getTodayDateString());
        }
        return defaults;
      }
    } catch (e) {
      console.error("V2 Migration failed");
    }
  }

  // Fallback to V1
  const oldRaw1 = localStorage.getItem('dave-routine-state');
  if (oldRaw1) {
    try {
      const oldState = JSON.parse(oldRaw1);
      if (oldState.streak && !oldState.streaks) {
        defaults.streaks.routine = oldState.streak;
        defaults.lastResetDate = oldState.lastResetDate || getTodayDateString();
        if (defaults.lastResetDate !== getTodayDateString()) {
           return resetDayTasks(defaults, getTodayDateString());
        }
        return defaults;
      }
    } catch (e) {
      console.error("V1 Migration failed");
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

function processStreakReset(streak: SingleStreakData, prevStateHistory: boolean, missedYesterday: boolean): SingleStreakData {
  let newStreak = { ...streak };
  if (prevStateHistory) {
    newStreak.currentStreak = streak.currentStreak;
  } else if (missedYesterday) {
    newStreak.currentStreak = 0;
  }
  return newStreak;
}

function resetDayTasks(prevState: AppState, today: string): AppState {
  const yesterday = getPreviousDay(today);
  const missedYesterday = prevState.lastResetDate === yesterday;

  const newStreaks: StreakData = {
    routine: processStreakReset(prevState.streaks.routine, prevState.streaks.routine.history[prevState.lastResetDate] || false, missedYesterday && !prevState.streaks.routine.history[prevState.lastResetDate]),
    prayer: processStreakReset(prevState.streaks.prayer, prevState.streaks.prayer.history[prevState.lastResetDate] || false, missedYesterday && !prevState.streaks.prayer.history[prevState.lastResetDate]),
    cleansoul: processStreakReset(prevState.streaks.cleansoul, prevState.streaks.cleansoul.history[prevState.lastResetDate] || false, missedYesterday && !prevState.streaks.cleansoul.history[prevState.lastResetDate]),
    ultimate: processStreakReset(prevState.streaks.ultimate, prevState.streaks.ultimate.history[prevState.lastResetDate] || false, missedYesterday && !prevState.streaks.ultimate.history[prevState.lastResetDate]),
  };
  
  const freshTasks = getInitialTasks();
  
  return {
    ...prevState,
    todayTasks: freshTasks,
    lastResetDate: today,
    streaks: newStreaks,
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
    lastCompletedDate: isCompleted ? today : (streak.lastCompletedDate === today ? getPreviousDay(today) : streak.lastCompletedDate),
    history: newHistory,
  };
}

export function updateStreakOnComplete(state: AppState): AppState {
  const today = getTodayDateString();
  
  const routineTasks = state.todayTasks.filter(t => t.category === 'morning' || t.category === 'daily' || t.category === 'evening');
  const prayerTasks = state.todayTasks.filter(t => t.category === 'prayer');
  const cleanSoulTasks = state.todayTasks.filter(t => t.category === 'cleansoul');

  const routineDone = routineTasks.length > 0 && routineTasks.every(t => t.completed);
  const prayerDone = prayerTasks.length > 0 && prayerTasks.every(t => t.completed);
  const cleanSoulDone = cleanSoulTasks.length > 0 && cleanSoulTasks.every(t => t.completed);
  
  const ultimateDone = routineDone && prayerDone && cleanSoulDone;

  return {
    ...state,
    streaks: {
      routine: updateSingleStreak(state.streaks.routine, today, routineDone),
      prayer: updateSingleStreak(state.streaks.prayer, today, prayerDone),
      cleansoul: updateSingleStreak(state.streaks.cleansoul, today, cleanSoulDone),
      ultimate: updateSingleStreak(state.streaks.ultimate, today, ultimateDone),
    },
  };
}

export function getCompletionPercentage(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  const done = tasks.filter(t => t.completed).length;
  return Math.round((done / tasks.length) * 100);
}
