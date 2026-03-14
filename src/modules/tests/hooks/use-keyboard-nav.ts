import { useEffect, useCallback } from 'react'

interface UseKeyboardNavOptions {
  onNavigate: (direction: 'prev' | 'next') => void
  onSelectAnswer: (answer: 'A' | 'B' | 'C' | 'D') => void
  onToggleReview: () => void
  onClear: () => void
  onSubmit: () => void
  enabled?: boolean
}

export function useKeyboardNav({
  onNavigate,
  onSelectAnswer,
  onToggleReview,
  onClear,
  onSubmit,
  enabled = true
}: UseKeyboardNavOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      // Don't handle if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      switch (event.key.toLowerCase()) {
        case 'arrowleft':
        case 'a':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            onNavigate('prev')
          }
          break
        case 'arrowright':
        case 'd':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            onNavigate('next')
          }
          break
        case '1':
          event.preventDefault()
          onSelectAnswer('A')
          break
        case '2':
          event.preventDefault()
          onSelectAnswer('B')
          break
        case '3':
          event.preventDefault()
          onSelectAnswer('C')
          break
        case '4':
          event.preventDefault()
          onSelectAnswer('D')
          break
        case 'm':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            onToggleReview()
          }
          break
        case 'delete':
        case 'backspace':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            onClear()
          }
          break
        case 'enter':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            onSubmit()
          }
          break
      }
    },
    [enabled, onNavigate, onSelectAnswer, onToggleReview, onClear, onSubmit]
  )

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [enabled, handleKeyDown])
}
