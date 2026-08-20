'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { AppState, Task, Goal, LogEntry, PrayerTimes } from '@/types';
import {
  loadState, saveState, getCompletionPercentage, computeStreak, consecutiveMissedDays,
  computeDayRecord, computePurityStreak, computeTaskStreak,
} from '@/lib/storage';
import { todayString, weekday } from '@/lib/date';
import { calculatePrayerTimes, manualToPrayerTimes, DEFAULT_MANUAL_TIMES } from '@/lib/prayerTimes';

function resolvePrayerTimes(state: AppState): PrayerTimes {
  const today = todayString();
  if (state.prayerTimesCache && state.prayerTimesCache.date === today) return state.prayerTimesCache;

  if (state.settings.prayerTimeSource === 'calculated' && state.settings.location) {
    const tzOffsetHours = -new Date().getTimezoneOffset() / 60;
    return calculatePrayerTimes(today, state.settings.location, tzOffsetHours);
  }
  return manualToPrayerTimes(today, state.settings.manualPrayerTimes ?? DEFAULT_MANUAL_TIMES);
}

export function useAppState() {
  const [state, setState] = useState<AppState | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    loadState().then(loaded => {
      const times = resolvePrayerTimes(loaded);
      setState({ ...loaded, prayerTimesCache: times });
      setIsLoaded(true);
    });
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(t => (t === msg ? null : t)), 2400);
  }, []);

  const updateState = useCallback((updater: (prev: AppState) => AppState) => {
    setState(prev => {
      if (!prev) return prev;
      const next = updater(prev);
      saveState(next).catch(() => showToast('Kon niet opslaan — je wijziging staat nog in dit scherm.'));
      return next;
    });
  }, [showToast]);

  // Houdt de gebedstijden-cache vers: herberekent zodra de dag verandert (sessie bleef open
  // over middernacht) of zodra instellingen 'm hebben leeggemaakt. Stopt vanzelf na één pas.
  useEffect(() => {
    if (!state) return;
    const today = todayString();
    if (!state.prayerTimesCache || state.prayerTimesCache.date !== today) {
      const times = resolvePrayerTimes(state);
      setState(prev => (prev ? { ...prev, prayerTimesCache: times } : prev));
    }
  }, [state]);

  // ---- Taken ----

  const toggleTask = useCallback((taskId: string) => {
    updateState(prev => {
      const updatedTasks = prev.todayTasks.map(t => (t.id === taskId ? { ...t, completed: !t.completed } : t));
      const task = prev.todayTasks.find(t => t.id === taskId);
      let logEntries = prev.logEntries;

      // Als een taak aan een doel hangt, log automatisch een LogEntry bij het aanvinken
      // (en verwijder de bijbehorende auto-entry bij uitvinken — nooit dubbel tellen).
      if (task?.goalId && task.amountPerCompletion) {
        const today = todayString();
        if (!task.completed) {
          const entry: LogEntry = {
            id: `auto-${task.id}-${today}`, goalId: task.goalId, date: today,
            amount: task.amountPerCompletion, source: 'task',
          };
          logEntries = [...logEntries.filter(e => e.id !== entry.id), entry];
        } else {
          logEntries = logEntries.filter(e => e.id !== `auto-${task.id}-${today}`);
        }
      }

      return { ...prev, todayTasks: updatedTasks, logEntries };
    });
  }, [updateState]);

  const skipTask = useCallback((taskId: string) => {
    updateState(prev => ({
      ...prev,
      todayTasks: prev.todayTasks.filter(t => t.id !== taskId),
    }));
  }, [updateState]);

  const addTask = useCallback((task: Omit<Task, 'completed'>) => {
    updateState(prev => {
      const full: Task = { ...task, completed: false };
      const today = todayString();
      const belongsToday = task.days.includes(weekday(today));
      return {
        ...prev,
        taskBlueprint: [...prev.taskBlueprint, full],
        todayTasks: belongsToday ? [...prev.todayTasks, full] : prev.todayTasks,
      };
    });
  }, [updateState]);

  const updateTask = useCallback((taskId: string, patch: Partial<Omit<Task, 'id' | 'completed'>>) => {
    updateState(prev => ({
      ...prev,
      taskBlueprint: prev.taskBlueprint.map(t => (t.id === taskId ? { ...t, ...patch } : t)),
      todayTasks: prev.todayTasks.map(t => (t.id === taskId ? { ...t, ...patch } : t)),
    }));
  }, [updateState]);

  const archiveTask = useCallback((taskId: string) => {
    updateState(prev => ({
      ...prev,
      taskBlueprint: prev.taskBlueprint.map(t => (t.id === taskId ? { ...t, archivedAt: todayString() } : t)),
      todayTasks: prev.todayTasks.filter(t => t.id !== taskId),
      ankerIds: prev.ankerIds.filter(id => id !== taskId),
      frogTaskId: prev.frogTaskId === taskId ? null : prev.frogTaskId,
    }));
  }, [updateState]);

  const reorderTasks = useCallback((taskIds: string[]) => {
    updateState(prev => {
      const orderMap = new Map(taskIds.map((id, i) => [id, i]));
      const reorder = (t: Task) => ({ ...t, order: orderMap.get(t.id) ?? t.order });
      return {
        ...prev,
        taskBlueprint: prev.taskBlueprint.map(reorder),
        todayTasks: prev.todayTasks.map(reorder),
      };
    });
  }, [updateState]);

  // ---- Ankers ----

  const setAnkerIds = useCallback((ids: string[]) => {
    updateState(prev => ({ ...prev, ankerIds: ids.slice(0, 5) }));
  }, [updateState]);

  // ---- Eerste Steen ----

  const chooseFirstStone = useCallback((taskId: string | null) => {
    updateState(prev => ({ ...prev, frogTaskId: taskId }));
  }, [updateState]);

  // ---- Doelen ----

  const addGoal = useCallback((goal: Omit<Goal, 'id'>) => {
    updateState(prev => ({ ...prev, goals: [...prev.goals, { ...goal, id: `goal-${Date.now()}` }] }));
  }, [updateState]);

  const updateGoal = useCallback((goalId: string, patch: Partial<Omit<Goal, 'id'>>) => {
    updateState(prev => ({ ...prev, goals: prev.goals.map(g => (g.id === goalId ? { ...g, ...patch } : g)) }));
  }, [updateState]);

  const archiveGoal = useCallback((goalId: string) => {
    updateState(prev => ({ ...prev, goals: prev.goals.map(g => (g.id === goalId ? { ...g, archivedAt: todayString() } : g)) }));
  }, [updateState]);

  const logGoalEntry = useCallback((goalId: string, amount: number, note?: string) => {
    updateState(prev => ({
      ...prev,
      logEntries: [...prev.logEntries, {
        id: `log-${Date.now()}`, goalId, date: todayString(), amount, note, source: 'manual',
      }],
    }));
  }, [updateState]);

  // ---- Dagafsluiting ----

  const completeDagafsluiting = useCallback((reflection: string, tomorrowsFirstStoneId: string | null) => {
    // reflectie + gekozen eerste steen worden bewaard; computeDayRecord leest ze uit
    // AppState.pendingReflection / frogTaskId bij de eerstvolgende rollover (middernacht).
    updateState(prev => ({
      ...prev,
      frogTaskId: tomorrowsFirstStoneId,
      pendingReflection: reflection || null,
    }));
    showToast('Dag afgesloten.');
  }, [updateState, showToast]);

  // ---- Profiel / instellingen ----

  const setUserName = useCallback((name: string) => {
    updateState(prev => ({ ...prev, userName: name }));
  }, [updateState]);

  const setIdentityStatement = useCallback((statement: string) => {
    updateState(prev => ({ ...prev, identityStatement: statement }));
  }, [updateState]);

  const updateSettings = useCallback((patch: Partial<AppState['settings']>) => {
    updateState(prev => ({ ...prev, settings: { ...prev.settings, ...patch }, prayerTimesCache: null }));
  }, [updateState]);

  const toggleNotifications = useCallback(() => {
    updateState(prev => ({ ...prev, settings: { ...prev.settings, notificationsEnabled: !prev.settings.notificationsEnabled } }));
  }, [updateState]);

  const completeOnboarding = useCallback(() => {
    updateState(prev => ({ ...prev, onboardingComplete: true }));
  }, [updateState]);

  const markCheckinDone = useCallback(() => {
    updateState(prev => ({ ...prev, lastCheckinDate: todayString() }));
  }, [updateState]);

  // ---- Afgeleide waarden ----

  const completedCount = state?.todayTasks.filter(t => t.completed).length ?? 0;
  const totalCount = state?.todayTasks.length ?? 0;
  const completionPct = state ? getCompletionPercentage(state.todayTasks) : 0;

  const gebedTasks = useMemo(() => state?.todayTasks.filter(t => t.domain === 'gebed').sort((a, b) => a.order - b.order) ?? [], [state]);
  const zuiverheidTasks = useMemo(() => state?.todayTasks.filter(t => t.domain === 'zuiverheid') ?? [], [state]);
  const ritmeTasks = useMemo(() => state?.todayTasks.filter(t => t.domain === 'ritme').sort((a, b) => a.order - b.order) ?? [], [state]);

  const ankerTasks = useMemo(
    () => (state ? ritmeTasks.filter(t => state.ankerIds.includes(t.id)) : []),
    [state, ritmeTasks]
  );
  const ankersCompletedCount = ankerTasks.filter(t => t.completed).length;
  const allAnkersDone = ankerTasks.length > 0 && ankerTasks.every(t => t.completed);

  const firstStoneTask = state?.frogTaskId
    ? state.todayTasks.find(t => t.id === state.frogTaskId) ?? null
    : null;

  const streak = useMemo(() => (state ? computeStreak(state.history) : { current: 0, longest: 0, ritme30: 0 }), [state]);
  const missedDaysInARow = useMemo(() => (state ? consecutiveMissedDays(state.history) : 0), [state]);
  const purityStreak = useMemo(() => (state ? computePurityStreak(state.history) : 0), [state]);

  // Eigen, doorlopende streak per Clean Soul-gewoonte — onafhankelijk van elkaar, zodat één
  // gemiste dag bij de ene gewoonte niet de streak van een ándere gewoonte breekt.
  const zuiverheidStreaks = useMemo(() => {
    if (!state) return {};
    const map: Record<string, number> = {};
    for (const t of zuiverheidTasks) map[t.id] = computeTaskStreak(state.history, t.id);
    return map;
  }, [state, zuiverheidTasks]);

  const todayPreview = useMemo(() => (state ? computeDayRecord(state, todayString()) : null), [state]);

  return {
    state,
    isLoaded,
    toast,
    // taken
    toggleTask, skipTask, addTask, updateTask, archiveTask, reorderTasks,
    // ankers
    setAnkerIds, ankerTasks, ankersCompletedCount, allAnkersDone,
    // eerste steen
    chooseFirstStone, firstStoneTask,
    // doelen
    addGoal, updateGoal, archiveGoal, logGoalEntry,
    // dagafsluiting
    completeDagafsluiting,
    // profiel
    setUserName, setIdentityStatement, updateSettings, toggleNotifications, completeOnboarding, markCheckinDone,
    // afgeleid
    completedCount, totalCount, completionPct,
    gebedTasks, zuiverheidTasks, ritmeTasks,
    streak, missedDaysInARow, todayPreview, purityStreak, zuiverheidStreaks,
  };
}
