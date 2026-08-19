import { Goal, LogEntry } from '@/types';
import { parseDateString, todayString, addDays } from './date';

export type PaceStatus = 'voor' | 'op schema' | 'achter';

export interface PeriodBounds { start: string; end: string; }

/** Bepaalt de start/eind-datum van de LOPENDE periode voor een doel, gegeven vandaag. */
export function currentPeriodBounds(goal: Goal, today: string = todayString()): PeriodBounds {
  if (goal.period === 'doorlopend') {
    return { start: goal.startDate, end: today };
  }

  const start = parseDateString(goal.startDate);
  const now = parseDateString(today);

  if (goal.period === 'week') {
    // weken van 7 dagen vanaf startDate, doorlopend
    const daysSinceStart = Math.floor((now.getTime() - start.getTime()) / 86400000);
    const weekIndex = Math.floor(daysSinceStart / 7);
    const periodStart = addDays(goal.startDate, weekIndex * 7);
    const periodEnd = addDays(periodStart, 6);
    return { start: periodStart, end: periodEnd };
  }

  if (goal.period === 'maand') {
    const periodStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { start: todayString(periodStartDate), end: todayString(periodEndDate) };
  }

  if (goal.period === 'kwartaal') {
    const q = Math.floor(now.getMonth() / 3);
    const periodStartDate = new Date(now.getFullYear(), q * 3, 1);
    const periodEndDate = new Date(now.getFullYear(), q * 3 + 3, 0);
    return { start: todayString(periodStartDate), end: todayString(periodEndDate) };
  }

  // jaar
  const periodStartDate = new Date(now.getFullYear(), 0, 1);
  const periodEndDate = new Date(now.getFullYear(), 11, 31);
  return { start: todayString(periodStartDate), end: todayString(periodEndDate) };
}

export function entriesInPeriod(entries: LogEntry[], goalId: string, bounds: PeriodBounds): LogEntry[] {
  return entries.filter(e => e.goalId === goalId && e.date >= bounds.start && e.date <= bounds.end);
}

export function totalForPeriod(entries: LogEntry[], goalId: string, bounds: PeriodBounds): number {
  return entriesInPeriod(entries, goalId, bounds).reduce((sum, e) => sum + e.amount, 0);
}

export function expectedPace(goal: Goal, bounds: PeriodBounds, today: string = todayString()): number {
  if (goal.period === 'doorlopend') return goal.target; // geen tijdas, geen pace-verwachting
  const start = parseDateString(bounds.start).getTime();
  const end = parseDateString(bounds.end).getTime();
  const now = Math.min(Math.max(parseDateString(today).getTime(), start), end);
  const totalDays = Math.max(1, Math.round((end - start) / 86400000) + 1);
  const elapsedDays = Math.round((now - start) / 86400000) + 1;
  return goal.target * (elapsedDays / totalDays);
}

export function paceStatus(actual: number, expected: number): PaceStatus {
  if (expected <= 0) return 'op schema';
  if (actual > expected * 1.05) return 'voor';
  if (actual < expected * 0.95) return 'achter';
  return 'op schema';
}

export interface GoalProgress {
  actual: number;
  expected: number;
  status: PaceStatus;
  percentage: number; // t.o.v. target, kan >100
  remaining: number; // kan negatief zijn (overschreden)
  bounds: PeriodBounds;
}

export function computeGoalProgress(goal: Goal, entries: LogEntry[], today: string = todayString()): GoalProgress {
  const bounds = currentPeriodBounds(goal, today);
  const actual = totalForPeriod(entries, goal.id, bounds);
  const expected = expectedPace(goal, bounds, today);
  return {
    actual,
    expected,
    status: paceStatus(actual, expected),
    percentage: goal.target > 0 ? Math.round((actual / goal.target) * 100) : 0,
    remaining: goal.target - actual,
    bounds,
  };
}

/** Laatste N afgeronde periodes (voor de sparkline op het detailscherm). */
export function historicalPeriods(goal: Goal, entries: LogEntry[], count: number, today: string = todayString()): { label: string; total: number }[] {
  const results: { label: string; total: number }[] = [];
  let cursor = today;
  for (let i = 0; i < count; i++) {
    const bounds = currentPeriodBoundsBefore(goal, cursor);
    const total = totalForPeriod(entries, goal.id, bounds);
    results.unshift({ label: bounds.start, total });
    cursor = addDays(bounds.start, -1);
    if (goal.period === 'doorlopend') break; // geen zinvolle periodes om terug te tellen
  }
  return results;
}

function currentPeriodBoundsBefore(goal: Goal, refDate: string): PeriodBounds {
  return currentPeriodBounds(goal, refDate);
}
