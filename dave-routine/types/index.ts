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
  userName: string;
  taskBlueprint: Task[]; // The master definitions of user tasks
  todayTasks: Task[];    // The tasks initialized for today
  streaks: StreakData;
  lastResetDate: string;
  notificationsEnabled: boolean;
  // New v5 fields
  soulCoins: number;        // +1 per completed task
  freezes: number;          // streak freeze inventory (costs 50 coins each)
  categoryXP: Record<string, number>;  // XP per task category
  frogTaskId: string | null;  // "Frog of the Day" task id
  lastCheckinDate: string | null; // date of last daily mindful check-in
}
