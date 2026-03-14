import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  mode: 'light' | 'dark';
  toggleTheme: () => void;
  applyTheme: (mode: 'light' | 'dark') => void;
}

function applyClassToDOM(mode: 'light' | 'dark') {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(mode);
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'dark',
      applyTheme: (mode) => {
        applyClassToDOM(mode);
        set({ mode });
      },
      toggleTheme: () => {
        const next = get().mode === 'light' ? 'dark' : 'light';
        applyClassToDOM(next);
        set({ mode: next });
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        // Apply the persisted theme to the DOM as soon as the store hydrates
        if (state) applyClassToDOM(state.mode);
      },
    }
  )
);