'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Clock, AlertTriangle, Pause, Play } from 'lucide-react'
import { cn, formatTime } from '../utils'
import { Button } from '@/components/ui/button'

interface TestTimerProps {
  timeRemaining: number // in seconds
  urgencyLevel: 'normal' | 'warning' | 'critical'
  isPaused?: boolean
  onPause?: () => void
  onResume?: () => void
}

export function TestTimer({ 
  timeRemaining, 
  urgencyLevel, 
  isPaused = false,
  onPause,
  onResume 
}: TestTimerProps) {
  const [displayTime, setDisplayTime] = useState(timeRemaining)
  const [prevTime, setPrevTime] = useState(timeRemaining)

  useEffect(() => {
    setDisplayTime(timeRemaining)
  }, [timeRemaining])

  const minutes = Math.floor(displayTime / 60)
  const seconds = displayTime % 60

  const getStyles = () => {
    switch (urgencyLevel) {
      case 'critical':
        return {
          bg: 'bg-gradient-to-r from-red-500 via-red-600 to-red-500',
          shadow: 'shadow-lg shadow-red-500/40',
          ring: 'ring-2 ring-red-400/50',
          text: 'text-white'
        }
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500',
          shadow: 'shadow-lg shadow-amber-500/30',
          ring: 'ring-2 ring-amber-400/50',
          text: 'text-white'
        }
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800',
          shadow: 'shadow-lg shadow-gray-900/20',
          ring: '',
          text: 'text-white'
        }
    }
  }

  const styles = getStyles()
  const totalSeconds = 60 * 60 // Assume 1 hour max
  const progress = (displayTime / totalSeconds) * 100

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 relative overflow-hidden",
        styles.bg,
        styles.shadow,
        styles.ring
      )}
    >
      {/* Animated progress background */}
      {urgencyLevel !== 'normal' && (
        <motion.div
          className="absolute inset-0 bg-white/10"
          animate={{
            opacity: [0, 0.2, 0],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
      
      {/* Clock icon with animation */}
      <motion.div
        animate={urgencyLevel === 'critical' ? { 
          scale: [1, 1.1, 1],
        } : {}}
        transition={{
          duration: 0.5,
          repeat: urgencyLevel === 'critical' ? Infinity : 0,
        }}
      >
        <Clock className="h-5 w-5 text-white" />
      </motion.div>
      
      {/* Time display */}
      <div className="flex items-center gap-2">
        {urgencyLevel === 'critical' && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <AlertTriangle className="h-4 w-4 text-white/90" />
          </motion.div>
        )}
        
        <div className="flex items-center font-mono">
          <motion.span
            key={minutes}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-2xl font-bold tracking-wider text-white"
          >
            {minutes.toString().padStart(2, '0')}
          </motion.span>
          <motion.span
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-2xl font-bold text-white mx-0.5"
          >
            :
          </motion.span>
          <motion.span
            key={seconds}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-2xl font-bold tracking-wider text-white"
          >
            {seconds.toString().padStart(2, '0')}
          </motion.span>
        </div>
      </div>

      {/* Status badges */}
      {urgencyLevel === 'warning' && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <Badge className="bg-white/20 text-white border-0 text-xs font-medium backdrop-blur-sm">
            Time running low
          </Badge>
        </motion.div>
      )}

      {urgencyLevel === 'critical' && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center"
        >
          <Badge className="bg-white/30 text-white border-0 text-xs font-medium backdrop-blur-sm animate-pulse">
            Only {minutes} min left!
          </Badge>
        </motion.div>
      )}

      {/* Pause/Resume button */}
      {onPause && onResume && (
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={isPaused ? onResume : onPause}
            className="h-8 w-8 ml-1 text-white hover:bg-white/20 border border-white/10"
          >
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}
