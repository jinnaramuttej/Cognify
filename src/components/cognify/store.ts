import { create } from 'zustand';

interface AppState {
  streak: number;
  setStreak: (streak: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  streak: 0,
  setStreak: (streak) => set({ streak }),
}));