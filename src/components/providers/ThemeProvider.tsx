'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/lib/theme-store';

/**
 * ThemeProvider — applies the persisted theme class to <html> on mount.
 * We use our own Zustand store (theme-store) as the single source of truth,
 * rather than next-themes, to avoid two systems fighting each other.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useThemeStore((s) => s.mode);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(mode);
  }, [mode]);

  return <>{children}</>;
}