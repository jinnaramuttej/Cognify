import { create } from 'zustand'
import type { Test, Question, QuestionState } from '../types'

interface TestSessionState {
  // Test data
  test: Test | null
  questions: Question[]
  attemptId: string | null
  
  // Current state
  currentQuestionIndex: number
  answers: Map<string, QuestionState>
  timeRemaining: number
  isPaused: boolean
  startedAt: Date | null
  
  // Actions
  initSession: (test: Test, questions: Question[], attemptId: string, timeLimit: number) => void
  setCurrentQuestion: (index: number) => void
  selectAnswer: (questionId: string, answer: string | null) => void
  toggleMarkForReview: (questionId: string) => void
  clearAnswer: (questionId: string) => void
  decrementTimer: () => void
  pauseSession: () => void
  resumeSession: () => void
  getTimeRemaining: () => number
  getQuestionState: (questionId: string) => QuestionState | undefined
  getAllAnswers: () => { questionId: string; selectedAnswer: string | null; isMarkedForReview: boolean }[]
  resetSession: () => void
}

export const useTestSession = create<TestSessionState>((set, get) => ({
  test: null,
  questions: [],
  attemptId: null,
  currentQuestionIndex: 0,
  answers: new Map(),
  timeRemaining: 0,
  isPaused: false,
  startedAt: null,

  initSession: (test, questions, attemptId, timeLimit) => {
    const answersMap = new Map<string, QuestionState>()
    questions.forEach((q) => {
      answersMap.set(q.id, {
        questionId: q.id,
        selectedAnswer: null,
        isMarkedForReview: false,
        status: 'unattempted',
        timeSpent: 0
      })
    })
    
    set({
      test,
      questions,
      attemptId,
      currentQuestionIndex: 0,
      answers: answersMap,
      timeRemaining: timeLimit * 60, // Convert minutes to seconds
      isPaused: false,
      startedAt: new Date()
    })
  },

  setCurrentQuestion: (index) => {
    set({ currentQuestionIndex: index })
  },

  selectAnswer: (questionId, answer) => {
    const state = get()
    const currentAnswer = state.answers.get(questionId)
    if (currentAnswer) {
      const newAnswers = new Map(state.answers)
      newAnswers.set(questionId, {
        ...currentAnswer,
        selectedAnswer: answer,
        status: 'attempted'
      })
      set({ answers: newAnswers })
    }
  },

  toggleMarkForReview: (questionId) => {
    const state = get()
    const currentAnswer = state.answers.get(questionId)
    if (currentAnswer) {
      const newAnswers = new Map(state.answers)
      const newStatus = currentAnswer.isMarkedForReview
        ? currentAnswer.selectedAnswer ? 'attempted' : 'unattempted'
        : 'marked_for_review'
      newAnswers.set(questionId, {
        ...currentAnswer,
        isMarkedForReview: !currentAnswer.isMarkedForReview,
        status: newStatus
      })
      set({ answers: newAnswers })
    }
  },

  clearAnswer: (questionId) => {
    const state = get()
    const currentAnswer = state.answers.get(questionId)
    if (currentAnswer) {
      const newAnswers = new Map(state.answers)
      newAnswers.set(questionId, {
        ...currentAnswer,
        selectedAnswer: null,
        status: 'unattempted'
      })
      set({ answers: newAnswers })
    }
  },

  decrementTimer: () => {
    const state = get()
    if (state.timeRemaining > 0 && !state.isPaused) {
      set({ timeRemaining: state.timeRemaining - 1 })
    }
  },

  pauseSession: () => {
    set({ isPaused: true })
  },

  resumeSession: () => {
    set({ isPaused: false })
  },

  getTimeRemaining: () => {
    return get().timeRemaining
  },

  getQuestionState: (questionId) => {
    return get().answers.get(questionId)
  },

  getAllAnswers: () => {
    const state = get()
    const result: { questionId: string; selectedAnswer: string | null; isMarkedForReview: boolean }[] = []
    state.answers.forEach((value) => {
      result.push({
        questionId: value.questionId,
        selectedAnswer: value.selectedAnswer,
        isMarkedForReview: value.isMarkedForReview
      })
    })
    return result
  },

  resetSession: () => {
    set({
      test: null,
      questions: [],
      attemptId: null,
      currentQuestionIndex: 0,
      answers: new Map(),
      timeRemaining: 0,
      isPaused: false,
      startedAt: null
    })
  }
}))
