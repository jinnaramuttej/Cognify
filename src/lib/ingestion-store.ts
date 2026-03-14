import { create } from 'zustand';
import type { IngestionLog } from '@/lib/teacher-service';

interface IngestionState {
  logs: IngestionLog[];
  addLog: (log: IngestionLog) => void;
  updateLog: (id: string, updates: Partial<IngestionLog>) => void;
}

export const useIngestionStore = create<IngestionState>((set) => ({
  logs: [],
  addLog: (log) => set((state) => ({ logs: [log, ...state.logs] })),
  updateLog: (id, updates) =>
    set((state) => ({
      logs: state.logs.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    })),
}));
