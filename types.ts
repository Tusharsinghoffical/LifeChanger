
export type HabitCategory = 'Health' | 'Productivity' | 'Personal' | 'Finance' | 'Social' | 'Mindfulness';

export interface Habit {
  id: string;
  name: string;
  category: HabitCategory;
  color: string;
  createdAt: string;
  completedDates: string[]; // Array of YYYY-MM-DD
}

export interface ProgressStats {
  totalCompletions: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
}

export type TimeRange = 'weekly' | 'monthly' | 'yearly';
export type ViewMode = 'weekly' | 'monthly' | 'yearly';

export interface Theme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  gradient: string;
  shadow: string;
  isDark: boolean;
}
