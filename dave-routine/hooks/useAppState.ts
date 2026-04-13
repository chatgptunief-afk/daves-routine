'use client';
import { useState, useEffect, useCallback } from 'react';
import { AppState, Task } from '@/types';
import {
  loadState, saveState, getCompletionPercentage, updateStreakOnComplete,
} from '@/lib/storage';
import { getTodayDateString } from '@/lib/tasks';

export function useAppState() {
  const [state, setState] = useState<AppState | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loaded = loadState();
    setState(loaded);
    setIsLoaded(true);
  }, []);

  const updateState = useCallback((updater: (prev: AppState) => AppState) => {
    setState(prev => {
      if (!prev) return prev;
      const next = updater(prev);
      saveState(next);
      return next;
    });
  }, []);

  // Toggle task: award coins + XP on completion, subtract on un-completion
  const toggleTask = useCallback((taskId: string) => {
    updateState(prev => {
      const task = prev.todayTasks.find(t => t.id === taskId);
      if (!task) return prev;

      const wasCompleted = task.completed;
      const updatedTasks = prev.todayTasks.map(t =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );

      // Award/remove coins and XP
      const coinDelta = wasCompleted ? -1 : 1;
      const xpDelta = wasCompleted ? -10 : 10;
      const catKey = task.category;
      const currentXP = prev.categoryXP[catKey] ?? 0;

      const newState = {
        ...prev,
        todayTasks: updatedTasks,
        soulCoins: Math.max(0, (prev.soulCoins ?? 0) + coinDelta),
        categoryXP: {
          ...prev.categoryXP,
          [catKey]: Math.max(0, currentXP + xpDelta),
        },
      };
      return updateStreakOnComplete(newState);
    });
  }, [updateState]);

  const toggleNotifications = useCallback(() => {
    updateState(prev => ({ ...prev, notificationsEnabled: !prev.notificationsEnabled }));
  }, [updateState]);

  // Profile management
  const setUserName = useCallback((name: string) => {
    updateState(prev => ({ ...prev, userName: name }));
  }, [updateState]);

  const addTask = useCallback((task: Task) => {
    updateState(prev => ({
      ...prev,
      taskBlueprint: [...prev.taskBlueprint, task],
      todayTasks: [...prev.todayTasks, task],
    }));
  }, [updateState]);

  const deleteTask = useCallback((taskId: string) => {
    updateState(prev => {
      const newBlueprint = prev.taskBlueprint.filter(t => t.id !== taskId);
      const newToday = prev.todayTasks.filter(t => t.id !== taskId);
      // Clear frog if it was the deleted task
      const newFrogId = prev.frogTaskId === taskId ? null : prev.frogTaskId;
      const newState = { ...prev, taskBlueprint: newBlueprint, todayTasks: newToday, frogTaskId: newFrogId };
      return updateStreakOnComplete(newState);
    });
  }, [updateState]);

  // Soul Coins: buy streak freeze (50 coins)
  const buyFreeze = useCallback(() => {
    updateState(prev => {
      if ((prev.soulCoins ?? 0) < 50) return prev;
      return {
        ...prev,
        soulCoins: prev.soulCoins - 50,
        freezes: (prev.freezes ?? 0) + 1,
      };
    });
  }, [updateState]);

  // Frog of the Day
  const setFrogTask = useCallback((taskId: string | null) => {
    updateState(prev => ({ ...prev, frogTaskId: taskId }));
  }, [updateState]);

  // Daily Check-in: mark today as checked in
  const markCheckinDone = useCallback(() => {
    updateState(prev => ({ ...prev, lastCheckinDate: getTodayDateString() }));
  }, [updateState]);

  // Derived values
  const completedCount = state?.todayTasks.filter(t => t.completed).length ?? 0;
  const totalCount = state?.todayTasks.length ?? 0;
  const completionPct = state ? getCompletionPercentage(state.todayTasks) : 0;

  const morningTasks = state?.todayTasks.filter(t => t.category === 'morning') ?? [];
  const dailyTasks = state?.todayTasks.filter(t => t.category === 'daily') ?? [];
  const eveningTasks = state?.todayTasks.filter(t => t.category === 'evening') ?? [];
  const prayerTasks = state?.todayTasks.filter(t => t.category === 'prayer') ?? [];
  const cleanSoulTasks = state?.todayTasks.filter(t => t.category === 'cleansoul') ?? [];

  const allDone = state?.streaks.ultimate.history[state?.lastResetDate] ?? false;

  const needsCheckin = state
    ? state.lastCheckinDate !== getTodayDateString()
    : false;


  return {
    state,
    isLoaded,
    toggleTask,
    toggleNotifications,
    setUserName,
    addTask,
    deleteTask,
    buyFreeze,
    setFrogTask,
    markCheckinDone,
    needsCheckin,
    completedCount,
    totalCount,
    completionPct,
    allDone,
    morningTasks,
    dailyTasks,
    eveningTasks,
    prayerTasks,
    cleanSoulTasks,
  };
}
