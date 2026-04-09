import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string; // ISO string for serialization
  structured?: {
    concept: string;
    steps: string[];
    finalAnswer: string;
  };
  imageUrl?: string;
}

export interface AISession {
  sessionId: string;
  topic: string | null;
  hintCount: number;
  mastery: number;
  stepsCompleted: number;
  timeSpent: number; // seconds
  startedAt: string; // ISO string
}

type TutorTone = 'friendly' | 'formal';
type TutorVerbosity = 'concise' | 'detailed';

interface AIStoreState {
  // Chat
  messages: AIMessage[];
  currentSession: AISession;
  isLoading: boolean;
  error: string | null;

  // Tutor Preferences (persisted)
  tone: TutorTone;
  verbosity: TutorVerbosity;
  allowAdvancedDives: boolean;

  // Hint tracking
  hintsUsed: number[];

  // Actions
  addMessage: (msg: AIMessage) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearHistory: () => void;
  newSession: () => void;
  incrementHint: (level: number) => void;
  setMastery: (mastery: number) => void;
  incrementStep: () => void;
  setTopic: (topic: string) => void;
  setTone: (tone: TutorTone) => void;
  setVerbosity: (verbosity: TutorVerbosity) => void;
  setAllowAdvancedDives: (allow: boolean) => void;
  tickTimer: () => void;
}

function createSession(): AISession {
  return {
    sessionId: `session_${Date.now()}`,
    topic: null,
    hintCount: 0,
    mastery: 0.62,
    stepsCompleted: 0,
    timeSpent: 0,
    startedAt: new Date().toISOString(),
  };
}

export const useAIStore = create<AIStoreState>()(
  persist(
    (set, get) => ({
      messages: [],
      currentSession: createSession(),
      isLoading: false,
      error: null,
      tone: 'friendly',
      verbosity: 'concise',
      allowAdvancedDives: false,
      hintsUsed: [],

      addMessage: (msg) =>
        set((state) => ({ messages: [...state.messages, msg] })),

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      clearHistory: () =>
        set({ messages: [], hintsUsed: [], error: null }),

      newSession: () =>
        set({
          messages: [],
          hintsUsed: [],
          error: null,
          currentSession: createSession(),
        }),

      incrementHint: (level) =>
        set((state) => ({
          hintsUsed: [...state.hintsUsed, level],
          currentSession: {
            ...state.currentSession,
            hintCount: state.currentSession.hintCount + 1,
          },
        })),

      setMastery: (mastery) =>
        set((state) => ({
          currentSession: { ...state.currentSession, mastery },
        })),

      incrementStep: () =>
        set((state) => ({
          currentSession: {
            ...state.currentSession,
            stepsCompleted: state.currentSession.stepsCompleted + 1,
          },
        })),

      setTopic: (topic) =>
        set((state) => ({
          currentSession: { ...state.currentSession, topic },
        })),

      setTone: (tone) => set({ tone }),
      setVerbosity: (verbosity) => set({ verbosity }),
      setAllowAdvancedDives: (allow) => set({ allowAdvancedDives: allow }),

      tickTimer: () =>
        set((state) => ({
          currentSession: {
            ...state.currentSession,
            timeSpent: state.currentSession.timeSpent + 1,
          },
        })),
    }),
    {
      name: 'cognify-ai-store',
      // Only persist preferences and session metadata, not the full message history during dev
      partialize: (state) => ({
        tone: state.tone,
        verbosity: state.verbosity,
        allowAdvancedDives: state.allowAdvancedDives,
        // Persist last 20 messages for session continuity
        messages: state.messages.slice(-20),
        currentSession: state.currentSession,
      }),
    }
  )
);
