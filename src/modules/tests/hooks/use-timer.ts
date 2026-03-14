import { useEffect, useRef, useCallback } from 'react'
import { useTestSession } from './use-test-session'

export function useTimer(onTimeEnd: () => void, isActive: boolean = true) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const decrementTimer = useTestSession((state) => state.decrementTimer)
  const timeRemaining = useTestSession((state) => state.timeRemaining)
  const isPaused = useTestSession((state) => state.isPaused)

  useEffect(() => {
    if (!isActive || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    intervalRef.current = setInterval(() => {
      decrementTimer()
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isActive, isPaused, decrementTimer])

  useEffect(() => {
    if (timeRemaining === 0 && isActive) {
      onTimeEnd()
    }
  }, [timeRemaining, isActive, onTimeEnd])

  const getUrgencyLevel = useCallback(() => {
    const minutes = Math.floor(timeRemaining / 60)
    if (minutes <= 5) return 'critical'
    if (minutes <= 10) return 'warning'
    return 'normal'
  }, [timeRemaining])

  return {
    timeRemaining,
    isPaused,
    urgencyLevel: getUrgencyLevel()
  }
}
