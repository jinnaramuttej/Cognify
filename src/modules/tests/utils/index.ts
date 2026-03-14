import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { THEME, type FocusLevel } from '../types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================
// THEME COLORS
// ============================================

export const COLORS = {
  primary: THEME.primary,
  primaryHover: THEME.primaryHover,
  primaryLight: THEME.primaryLight,
  secondary: THEME.secondary,
  border: THEME.border,
  success: THEME.success,
  warning: THEME.warning,
  error: THEME.error,
  
  // Status colors
  status: {
    draft: '#9CA3AF',
    upcoming: '#3B82F6',
    active: '#10B981',
    closed: '#EF4444'
  },
  
  // Difficulty colors
  difficulty: {
    easy: '#10B981',
    medium: '#F59E0B',
    hard: '#EF4444',
    mixed: '#6B7280'
  },
  
  // Subject colors
  subject: {
    physics: '#3B82F6',
    chemistry: '#10B981',
    math: '#8B5CF6',
    biology: '#F59E0B'
  },
  
  // Focus level colors
  focus: {
    strong: '#10B981',
    moderate: '#F59E0B',
    needs_attention: '#EF4444'
  }
}

// ============================================
// TIME FORMATTING
// ============================================

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function formatTimeShort(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}m ${secs}s`
}

export function formatTimeReadable(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes} minutes`
}

// ============================================
// FOCUS LEVEL
// ============================================

export function getFocusLevel(accuracy: number): FocusLevel {
  if (accuracy >= 80) return 'strong'
  if (accuracy >= 60) return 'moderate'
  return 'needs_attention'
}

export function getFocusLevelColor(level: FocusLevel): string {
  return COLORS.focus[level]
}

export function getFocusLevelBg(level: FocusLevel): string {
  switch (level) {
    case 'strong':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'moderate':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'needs_attention':
      return 'bg-red-50 text-red-700 border-red-200'
  }
}

// ============================================
// DIFFICULTY
// ============================================

export function getDifficultyColor(difficulty: string): string {
  return COLORS.difficulty[difficulty as keyof typeof COLORS.difficulty] || COLORS.difficulty.mixed
}

export function getDifficultyBg(difficulty: string): string {
  switch (difficulty) {
    case 'easy':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'medium':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'hard':
      return 'bg-red-50 text-red-700 border-red-200'
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200'
  }
}

// ============================================
// STATUS
// ============================================

export function getStatusColor(status: string): string {
  return COLORS.status[status as keyof typeof COLORS.status] || COLORS.status.draft
}

export function getStatusBg(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'upcoming':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'closed':
      return 'bg-red-50 text-red-700 border-red-200'
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200'
  }
}

// ============================================
// SUBJECT
// ============================================

export function getSubjectColor(subject: string): string {
  return COLORS.subject[subject.toLowerCase() as keyof typeof COLORS.subject] || '#6B7280'
}

export function getSubjectBg(subject: string): string {
  switch (subject.toLowerCase()) {
    case 'physics':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'chemistry':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'math':
    case 'mathematics':
      return 'bg-purple-50 text-purple-700 border-purple-200'
    case 'biology':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200'
  }
}

// ============================================
// SCORE & PERCENTAGE
// ============================================

export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100 * 100) / 100
}

export function getScoreColor(percentage: number): string {
  if (percentage >= 80) return COLORS.success
  if (percentage >= 60) return COLORS.warning
  return COLORS.error
}

// ============================================
// ARRAY UTILITIES
// ============================================

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key])
    if (!result[groupKey]) {
      result[groupKey] = []
    }
    result[groupKey].push(item)
    return result
  }, {} as Record<string, T[]>)
}

// ============================================
// MATH UTILITIES
// ============================================

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t
}

// ============================================
// STRING UTILITIES
// ============================================

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

// ============================================
// DATE UTILITIES
// ============================================

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function getTimeAgo(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'Just now'
}

// ============================================
// VALIDATION
// ============================================

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isPositiveNumber(value: number): boolean {
  return !isNaN(value) && value > 0
}
