import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'dark' | 'light';

const THEME_KEY = 'cognideck_theme';

export const LightColors = {
  primary: '#6366F1',
  primaryLight: '#C7D2FE',
  primaryDark: '#4F46E5',
  accent: '#38BDF8',

  background: '#F8FAFC',
  backgroundLight: '#F1F5F9',
  surface: '#FFFFFF',
  surfaceLight: '#F1F5F9',
  surfaceHighlight: '#E2E8F0',

  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textDark: '#0F172A',

  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  danger: '#EF4444',
  dangerLight: 'rgba(239, 68, 68, 0.1)',
  dangerGlow: 'rgba(239, 68, 68, 0.3)',
  warning: '#F59E0B',
  warningLight: 'rgba(245, 158, 11, 0.1)',
  warningGlow: 'rgba(245, 158, 11, 0.3)',
  success: '#22C55E',
  successLight: 'rgba(34, 197, 94, 0.1)',
  successGlow: 'rgba(34, 197, 94, 0.3)',

  hard: '#EF4444',
  ok: '#F59E0B',
  easy: '#22C55E',

  graphBg: '#F1F5F9',
  graphNode: '#6366F1',
  graphLine: 'rgba(99, 102, 241, 0.2)',
};

export const DarkColors = {
  primary: '#818CF8',
  primaryLight: '#C7D2FE',
  primaryDark: '#4F46E5',
  accent: '#38BDF8',

  background: '#0F172A',
  backgroundLight: '#1E293B',
  surface: '#1E293B',
  surfaceLight: '#334155',
  surfaceHighlight: '#475569',

  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textDark: '#0F172A',

  border: '#334155',
  borderLight: '#1E293B',

  danger: '#F87171',
  dangerLight: 'rgba(248, 113, 113, 0.15)',
  dangerGlow: 'rgba(248, 113, 113, 0.4)',
  warning: '#FBBF24',
  warningLight: 'rgba(251, 191, 36, 0.15)',
  warningGlow: 'rgba(251, 191, 36, 0.4)',
  success: '#34D399',
  successLight: 'rgba(52, 211, 153, 0.15)',
  successGlow: 'rgba(52, 211, 153, 0.4)',

  hard: '#F87171',
  ok: '#FBBF24',
  easy: '#34D399',

  graphBg: '#0B1120',
  graphNode: '#818CF8',
  graphLine: 'rgba(129, 140, 248, 0.2)',
};

type ColorsType = typeof DarkColors;

interface ThemeContextValue {
  mode: ThemeMode;
  colors: ColorsType;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'dark',
  colors: DarkColors,
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('dark');

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then(v => {
      if (v === 'light' || v === 'dark') setMode(v);
    });
  }, []);

  const toggle = () => {
    const next = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    AsyncStorage.setItem(THEME_KEY, next);
  };

  const colors = mode === 'dark' ? DarkColors : LightColors;

  return (
    <ThemeContext.Provider value={{ mode, colors, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
