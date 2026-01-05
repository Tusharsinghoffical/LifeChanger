
import { HabitCategory, Theme } from './types';

export const CATEGORIES: HabitCategory[] = [
  'Health',
  'Productivity',
  'Personal',
  'Finance',
  'Social',
  'Mindfulness'
];

export const CATEGORY_COLORS: Record<HabitCategory, string> = {
  Health: '#10b981',
  Productivity: '#6366f1',
  Personal: '#f59e0b',
  Finance: '#8b5cf6',
  Social: '#f43f5e',
  Mindfulness: '#0ea5e9'
};

export const THEMES: Theme[] = [
  {
    id: 'midnight',
    name: 'Midnight Noir',
    primary: '#818cf8',
    secondary: '#0f172a', // Deep navy slate
    accent: '#312e81',
    gradient: 'from-slate-950 to-indigo-950',
    shadow: 'shadow-indigo-900/20',
    isDark: true
  },
  {
    id: 'indigo',
    name: 'Midnight Indigo',
    primary: '#6366f1',
    secondary: '#ffffff',
    accent: '#e0e7ff',
    gradient: 'from-indigo-600 to-blue-900',
    shadow: 'shadow-indigo-200',
    isDark: false
  },
  {
    id: 'emerald',
    name: 'Emerald Garden',
    primary: '#10b981',
    secondary: '#ffffff',
    accent: '#d1fae5',
    gradient: 'from-emerald-600 to-teal-800',
    shadow: 'shadow-emerald-200',
    isDark: false
  },
  {
    id: 'rose',
    name: 'Velvet Rose',
    primary: '#f43f5e',
    secondary: '#ffffff',
    accent: '#ffe4e6',
    gradient: 'from-rose-600 to-pink-900',
    shadow: 'shadow-rose-200',
    isDark: false
  },
  {
    id: 'amber',
    name: 'Golden Amber',
    primary: '#f59e0b',
    secondary: '#ffffff',
    accent: '#fef3c7',
    gradient: 'from-amber-500 to-orange-800',
    shadow: 'shadow-amber-200',
    isDark: false
  },
  {
    id: 'violet',
    name: 'Royal Violet',
    primary: '#8b5cf6',
    secondary: '#ffffff',
    accent: '#ede9fe',
    gradient: 'from-violet-600 to-purple-900',
    shadow: 'shadow-violet-200',
    isDark: false
  }
];

export const INITIAL_HABITS = [
  {
    id: '1',
    name: 'Morning Meditation',
    category: 'Mindfulness' as HabitCategory,
    color: '#0ea5e9',
    createdAt: new Date().toISOString(),
    completedDates: []
  },
  {
    id: '2',
    name: 'Stay Hydrated',
    category: 'Health' as HabitCategory,
    color: '#10b981',
    createdAt: new Date().toISOString(),
    completedDates: []
  },
  {
    id: '3',
    name: 'Deep Work Session',
    category: 'Productivity' as HabitCategory,
    color: '#6366f1',
    createdAt: new Date().toISOString(),
    completedDates: []
  }
];
