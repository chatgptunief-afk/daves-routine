'use client';
import { useState, useEffect, useCallback } from 'react';
import { AppState } from '@/types';
import { loadState, saveState, getCompletionPercentage, updateStreakOnComplete } from '@/lib/storage';

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

  const toggleTask = useCallback((taskId: string) => {
    updateState(prev => {
      const updatedTasks = prev.todayTasks.map(t =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );
      const newState = { ...prev, todayTasks: updatedTasks };
      return updateStreakOnComplete(newState);
    });
  }, [updateState]);

  const toggleNotifications = useCallback(() => {
    updateState(prev => ({ ...prev, notificationsEnabled: !prev.notificationsEnabled }));
  }, [updateState]);

  const completedCount = state?.todayTasks.filter(t => t.completed).length ?? 0;
  const totalCount = state?.todayTasks.length ?? 0;
  const completionPct = state ? getCompletionPercentage(state.todayTasks) : 0;
  
  const morningTasks = state?.todayTasks.filter(t => t.category === 'morning') ?? [];
  const dailyTasks = state?.todayTasks.filter(t => t.category === 'daily') ?? [];
  const eveningTasks = state?.todayTasks.filter(t => t.category === 'evening') ?? [];
  const prayerTasks = state?.todayTasks.filter(t => t.category === 'prayer') ?? [];
  const cleanSoulTasks = state?.todayTasks.filter(t => t.category === 'cleansoul') ?? [];

  const allDone = state?.streaks.ultimate.history[state?.lastResetDate] ?? false;

  return {
    state,
    isLoaded,
    toggleTask,
    toggleNotifications,
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
