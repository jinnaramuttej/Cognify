import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role?: 'student' | 'teacher' | 'admin';
  isAdmin?: boolean;
  streak?: number;
  longest_streak?: number;
  total_xp?: number;
  class?: string;
  stream?: string;
}

export interface DashboardStats {
  streak: { current_streak: number; longest_streak: number };
  todayStudyTime: number; // seconds
  totalStudyTime: number; // seconds
  accuracy: number; // percentage
  questionsAttempted: number;
  recentSessions: Array<{
    id: string;
    start_time: string;
    duration_seconds: number;
  }>;
}

interface UserStoreState {
  profile: UserProfile | null;
  stats: DashboardStats | null;
  isHydrated: boolean;
  setProfile: (profile: UserProfile | null) => void;
  setStats: (stats: DashboardStats | null) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStoreState>()(
  persist(
    (set, get) => ({
      profile: null,
      stats: null,
      isHydrated: false,

      setProfile: (profile) => set({ profile }),
      setStats: (stats) => set({ stats }),

      updateProfile: (updates) => {
        const current = get().profile;
        if (!current) return;
        set({ profile: { ...current, ...updates } });
      },

      clearUser: () => set({ profile: null, stats: null }),
    }),
    {
      name: 'cognify-user-store',
      onRehydrateStorage: () => (state) => {
        if (state) state.isHydrated = true;
      },
    }
  )
);
