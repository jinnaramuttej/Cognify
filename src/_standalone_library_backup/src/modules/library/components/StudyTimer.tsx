'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Brain,
  Target,
  Zap,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Settings,
  ChevronUp,
  ChevronDown,
  Clock,
  Trophy,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
export interface StudyTimerProps {
  focusDuration?: number // in minutes
  breakDuration?: number // in minutes
  onSessionComplete?: (sessions: number, totalMinutes: number) => void
  onXPUpdate?: (xp: number) => void
  className?: string
  autoStartBreak?: boolean
  xpPerMinute?: number
}

type TimerMode = 'focus' | 'break'

// Format time as MM:SS
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function StudyTimer({
  focusDuration = 25,
  breakDuration = 5,
  onSessionComplete,
  onXPUpdate,
  className,
  autoStartBreak = false,
  xpPerMinute = 2,
}: StudyTimerProps) {
  const [mode, setMode] = useState<TimerMode>('focus')
  const [timeRemaining, setTimeRemaining] = useState(focusDuration * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [sessionsCompleted, setSessionsCompleted] = useState(0)
  const [totalFocusTime, setTotalFocusTime] = useState(0)
  const [xpEarned, setXpEarned] = useState(0)
  
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [customFocus, setCustomFocus] = useState(focusDuration)
  const [customBreak, setCustomBreak] = useState(breakDuration)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('/notification.mp3')
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])
  
  // Play notification sound
  const playNotification = useCallback(() => {
    if (!isMuted && audioRef.current) {
      audioRef.current.play().catch(() => {
        // Ignore autoplay errors
      })
    }
  }, [isMuted])
  
  // Timer tick
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }
    
    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Timer completed
          playNotification()
          
          const wasFocus = mode === 'focus'
          const newMode: TimerMode = wasFocus ? 'break' : 'focus'
          const newDuration = wasFocus ? customBreak * 60 : customFocus * 60
          
          if (wasFocus) {
            const newSessions = sessionsCompleted + 1
            const newTotalTime = totalFocusTime + customFocus * 60
            const newXP = xpEarned + customFocus * xpPerMinute
            
            setSessionsCompleted(newSessions)
            setTotalFocusTime(newTotalTime)
            setXpEarned(newXP)
            
            onSessionComplete?.(newSessions, Math.floor(newTotalTime / 60))
            onXPUpdate?.(newXP)
          }
          
          setMode(newMode)
          setIsRunning(autoStartBreak && wasFocus)
          
          return newDuration
        }
        
        return prev - 1
      })
    }, 1000)
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, mode, customFocus, customBreak, autoStartBreak, xpPerMinute, playNotification, onSessionComplete, onXPUpdate, sessionsCompleted, totalFocusTime, xpEarned])
  
  // Start timer
  const handleStart = useCallback(() => {
    setIsRunning(true)
  }, [])
  
  // Pause timer
  const handlePause = useCallback(() => {
    setIsRunning(false)
  }, [])
  
  // Reset timer
  const handleReset = useCallback(() => {
    setTimeRemaining(mode === 'focus' ? customFocus * 60 : customBreak * 60)
    setIsRunning(false)
  }, [mode, customFocus, customBreak])
  
  // Skip to break/focus
  const handleSkip = useCallback(() => {
    const newMode: TimerMode = mode === 'focus' ? 'break' : 'focus'
    setMode(newMode)
    setTimeRemaining(newMode === 'focus' ? customFocus * 60 : customBreak * 60)
    setIsRunning(false)
  }, [mode, customFocus, customBreak])
  
  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }, [isFullscreen])
  
  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])
  
  // Handle duration change when not running
  const handleFocusDurationChange = useCallback((newDuration: number) => {
    setCustomFocus(newDuration)
    if (!isRunning && mode === 'focus') {
      setTimeRemaining(newDuration * 60)
    }
  }, [isRunning, mode])
  
  const handleBreakDurationChange = useCallback((newDuration: number) => {
    setCustomBreak(newDuration)
    if (!isRunning && mode === 'break') {
      setTimeRemaining(newDuration * 60)
    }
  }, [isRunning, mode])
  
  // Progress calculation
  const totalDuration = mode === 'focus' ? customFocus * 60 : customBreak * 60
  const progress = ((totalDuration - timeRemaining) / totalDuration) * 100
  
  // Circle progress for SVG
  const radius = 120
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference
  
  return (
    <div
      ref={containerRef}
      className={cn(
        'relative bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 overflow-hidden',
        isFullscreen && 'fixed inset-0 z-50 rounded-none',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center',
            mode === 'focus' ? 'bg-blue-100' : 'bg-green-100'
          )}>
            {mode === 'focus' ? (
              <Brain className="h-5 w-5 text-blue-600" />
            ) : (
              <Coffee className="h-5 w-5 text-green-600" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              {mode === 'focus' ? 'Focus Time' : 'Break Time'}
            </h3>
            <p className="text-xs text-gray-500">
              Session {sessionsCompleted + 1}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* XP Badge */}
          <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100">
            <Zap className="h-3 w-3 mr-1" />
            {xpEarned} XP
          </Badge>
          
          {/* Sound Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMuted(!isMuted)}
            className="h-8 w-8 p-0"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4 text-gray-400" />
            ) : (
              <Volume2 className="h-4 w-4 text-gray-500" />
            )}
          </Button>
          
          {/* Settings Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="h-8 w-8 p-0"
            title="Settings"
          >
            <Settings className={cn('h-4 w-4', showSettings ? 'text-blue-500' : 'text-gray-500')} />
          </Button>
          
          {/* Fullscreen Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="h-8 w-8 p-0"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4 text-gray-500" />
            ) : (
              <Maximize2 className="h-4 w-4 text-gray-500" />
            )}
          </Button>
        </div>
      </div>
      
      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-gray-100"
          >
            <div className="px-6 py-4 grid grid-cols-2 gap-4">
              {/* Focus Duration */}
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Focus Duration (min)</label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFocusDurationChange(Math.max(1, customFocus - 5))}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{customFocus}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFocusDurationChange(Math.min(60, customFocus + 5))}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Break Duration */}
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Break Duration (min)</label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBreakDurationChange(Math.max(1, customBreak - 1))}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{customBreak}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBreakDurationChange(Math.min(30, customBreak + 1))}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Timer Display */}
      <div className={cn(
        'flex flex-col items-center justify-center py-8',
        isFullscreen && 'min-h-screen'
      )}>
        {/* Circular Progress */}
        <div className="relative">
          <svg
            width={280}
            height={280}
            className="transform -rotate-90"
          >
            {/* Background circle */}
            <circle
              cx={140}
              cy={140}
              r={radius}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth={8}
            />
            
            {/* Progress circle */}
            <motion.circle
              cx={140}
              cy={140}
              r={radius}
              fill="none"
              stroke={mode === 'focus' ? '#2563EB' : '#10B981'}
              strokeWidth={8}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5, ease: 'linear' }}
              style={{
                filter: `drop-shadow(0 0 10px ${mode === 'focus' ? '#2563EB40' : '#10B98140'})`,
              }}
            />
          </svg>
          
          {/* Time display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              key={timeRemaining}
              initial={{ scale: 1.1, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="text-5xl font-bold text-gray-900 font-mono tracking-wider"
            >
              {formatTime(timeRemaining)}
            </motion.div>
            
            <div className="mt-2 flex items-center gap-2">
              {mode === 'focus' ? (
                <>
                  <Target className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-blue-600 font-medium">Stay focused</span>
                </>
              ) : (
                <>
                  <Coffee className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600 font-medium">Take a break</span>
                </>
              )}
            </div>
          </div>
          
          {/* Pulsing animation when running */}
          {isRunning && (
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                boxShadow: mode === 'focus'
                  ? ['0 0 0 0 rgba(37, 99, 235, 0.1)', '0 0 0 20px rgba(37, 99, 235, 0)']
                  : ['0 0 0 0 rgba(16, 185, 129, 0.1)', '0 0 0 20px rgba(16, 185, 129, 0)'],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-3 mt-8">
          {/* Reset */}
          <Button
            variant="outline"
            size="lg"
            onClick={handleReset}
            className="h-12 w-12 rounded-full p-0"
            title="Reset"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
          
          {/* Play/Pause */}
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              onClick={isRunning ? handlePause : handleStart}
              size="lg"
              className={cn(
                'h-16 w-16 rounded-full p-0 shadow-lg',
                mode === 'focus'
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                  : 'bg-green-600 hover:bg-green-700 shadow-green-200'
              )}
            >
              {isRunning ? (
                <Pause className="h-7 w-7 text-white" />
              ) : (
                <Play className="h-7 w-7 text-white ml-1" />
              )}
            </Button>
          </motion.div>
          
          {/* Skip */}
          <Button
            variant="outline"
            size="lg"
            onClick={handleSkip}
            className="h-12 w-12 rounded-full p-0"
            title="Skip"
          >
            <Clock className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Stats Footer */}
      <div className={cn(
        'grid grid-cols-3 divide-x divide-gray-100 border-t border-gray-100',
        isFullscreen && 'absolute bottom-0 left-0 right-0 bg-white'
      )}>
        <div className="text-center py-4 px-2">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Trophy className="h-4 w-4 text-amber-500" />
            <span className="text-lg font-bold text-gray-900">{sessionsCompleted}</span>
          </div>
          <p className="text-xs text-gray-500">Sessions</p>
        </div>
        
        <div className="text-center py-4 px-2">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Clock className="h-4 w-4 text-blue-500" />
            <span className="text-lg font-bold text-gray-900">
              {Math.floor(totalFocusTime / 60)}
            </span>
          </div>
          <p className="text-xs text-gray-500">Minutes</p>
        </div>
        
        <div className="text-center py-4 px-2">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Zap className="h-4 w-4 text-amber-500" />
            <span className="text-lg font-bold text-gray-900">{xpEarned}</span>
          </div>
          <p className="text-xs text-gray-500">XP Earned</p>
        </div>
      </div>
      
      {/* Fullscreen motivational message */}
      <AnimatePresence>
        {isFullscreen && isRunning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-24 left-0 right-0 text-center"
          >
            <p className="text-sm text-gray-400">
              {mode === 'focus'
                ? '🎯 You\'re doing great! Stay focused!'
                : '☕ Relax and recharge. You earned this break!'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default StudyTimer
