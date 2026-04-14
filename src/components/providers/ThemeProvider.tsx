'use client';

import { useEffect } from 'react';

/**
 * ThemeProvider — applies the persisted theme class to <html> on mount.
 * We use our own Zustand store (theme-store) as the single source of truth,
 * rather than next-themes, to avoid two systems fighting each other.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light');
    root.classList.add('dark');
  }, []);

  return <>{children}</>;
}