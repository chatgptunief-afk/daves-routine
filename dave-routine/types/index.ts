export type TaskCategory = 'morning' | 'daily' | 'evening' | 'prayer' | 'cleansoul';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  icon: string;
  completed: boolean;
  order: number;
}

export interface DayRecord {
  date: string; // YYYY-MM-DD
  tasks: Task[];
  completedAt?: string;
  allCompleted: boolean;
  completionPercentage: number;
}

export interface SingleStreakData {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  history: Record<string, boolean>; // date -> allCompleted for this specific streak
}

export interface StreakData {
  routine: SingleStreakData;
  prayer: SingleStreakData;
  cleansoul: SingleStreakData;
  ultimate: SingleStreakData;
}

export interface AppState {
  todayTasks: Task[];
  streaks: StreakData;
  lastResetDate: string;
  notificationsEnabled: boolean;
}
