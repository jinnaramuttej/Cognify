'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Flame, Check, Star, Zap, Target, Trophy } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

// Types
export interface StudyStreakData {
  currentStreak: number
  longestStreak: number
  weeklyActivity: {
    date: string
    hasStudied: boolean
    minutes?: number
  }[]
  todayGoal: {
    current: number
    target: number
    unit: 'minutes' | 'pages' | 'chapters'
  }
  xp: {
    current: number
    level: number
    nextLevelXp: number
  }
  nextAchievement?: {
    name: string
    description: string
    progress: number
    target: number
    xpReward: number
  }
}

export interface StudyStreakWidgetProps {
  data: StudyStreakData
  className?: string
}

// Animated flame component
const AnimatedFlame: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <motion.div
      className={`relative ${sizeClasses[size]}`}
      animate={{
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 0.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <Flame
        className={`${sizeClasses[size]} text-orange-500`}
        style={{
          filter: 'drop-shadow(0 0 6px rgba(249, 115, 22, 0.6))',
        }}
      />
      <motion.div
        className="absolute inset-0"
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <Flame className={`${sizeClasses[size]} text-yellow-400 opacity-50`} />
      </motion.div>
    </motion.div>
  )
}

// Day cell component
const DayCell: React.FC<{
  day: StudyStreakData['weeklyActivity'][0]
  dayName: string
  isToday: boolean
}> = ({ day, dayName, isToday }) => {
  return (
    <motion.div
      className={`flex flex-col items-center gap-1 ${isToday ? 'scale-110' : ''}`}
      whileHover={{ scale: 1.05 }}
    >
      <span className={`text-xs ${isToday ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
        {dayName}
      </span>
      <motion.div
        className={`flex h-8 w-8 items-center justify-center rounded-lg border-2 transition-all ${
          day.hasStudied
            ? 'border-green-500 bg-green-100 dark:bg-green-900/30'
            : isToday
              ? 'border-primary/30 bg-primary/5'
              : 'border-muted bg-muted/20'
        }`}
        whileHover={{ scale: 1.1 }}
        animate={
          isToday && day.hasStudied
            ? {
                boxShadow: [
                  '0 0 0px rgba(34, 197, 94, 0)',
                  '0 0 15px rgba(34, 197, 94, 0.5)',
                  '0 0 0px rgba(34, 197, 94, 0)',
                ],
              }
            : {}
        }
        transition={{ duration: 2, repeat: Infinity }}
      >
        {day.hasStudied ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
          >
            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          </motion.div>
        ) : isToday ? (
          <Target className="h-4 w-4 text-primary/40" />
        ) : (
          <span className="text-xs text-muted-foreground/50">-</span>
        )}
      </motion.div>
      {day.minutes !== undefined && day.hasStudied && (
        <span className="text-[10px] text-muted-foreground">{day.minutes}m</span>
      )}
    </motion.div>
  )
}

// XP Bar component
const XPBar: React.FC<{ current: number; level: number; nextLevelXp: number }> = ({
  current,
  level,
  nextLevelXp,
}) => {
  const progress = (current / nextLevelXp) * 100
  const prevLevelXp = level * 100 // Simplified XP calculation
  const xpInCurrentLevel = current - prevLevelXp

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-xs font-bold text-white shadow-sm">
            {level}
          </div>
          <span className="text-sm font-medium">Level {level}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Zap className="h-3 w-3 text-yellow-500" />
          <span className="font-mono">
            {xpInCurrentLevel}/{nextLevelXp - prevLevelXp}
          </span>
        </div>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 opacity-50 blur-sm"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

// Today's goal component
const TodayGoal: React.FC<StudyStreakData['todayGoal']> = ({ current, target, unit }) => {
  const progress = Math.min((current / target) * 100, 100)
  const isComplete = current >= target

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Today&apos;s Goal</span>
        <span className={isComplete ? 'text-green-600 font-medium' : ''}>
          {current}/{target} {unit}
        </span>
      </div>
      <div className="relative h-3 overflow-hidden rounded-full bg-muted">
        <motion.div
          className={`absolute inset-y-0 left-0 rounded-full ${
            isComplete
              ? 'bg-gradient-to-r from-green-400 to-emerald-500'
              : 'bg-gradient-to-r from-primary to-primary/80'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        {isComplete && (
          <motion.div
            className="absolute right-2 top-1/2 -translate-y-1/2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
          >
            <Check className="h-4 w-4 text-white" />
          </motion.div>
        )}
      </div>
    </div>
  )
}

// Next achievement preview
const NextAchievement: React.FC<NonNullable<StudyStreakData['nextAchievement']>> = ({
  name,
  description,
  progress,
  target,
  xpReward,
}) => {
  const progressPercent = (progress / target) * 100

  return (
    <motion.div
      className="rounded-lg border bg-muted/30 p-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-md">
          <Trophy className="h-5 w-5" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{name}</span>
            <Badge variant="outline" className="text-xs">
              <Zap className="mr-1 h-3 w-3 text-yellow-500" />
              +{xpReward} XP
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{description}</p>
          <div className="flex items-center gap-2">
            <Progress value={progressPercent} className="h-1.5 flex-1" />
            <span className="text-xs text-muted-foreground">
              {progress}/{target}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export const StudyStreakWidget: React.FC<StudyStreakWidgetProps> = ({ data, className }) => {
  // Safety check for undefined data
  if (!data || !data.currentStreak) {
    console.warn('StudyStreakWidget: data prop is undefined or invalid')
    return null
  }
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const today = new Date().getDay()

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <AnimatedFlame size="sm" />
          Study Streak
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Current streak display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AnimatedFlame size="md" />
            <div>
              <motion.div
                className="text-3xl font-bold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              >
                {data.currentStreak}
              </motion.div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-4 w-4 text-yellow-500" />
              Best: {data.longestStreak} days
            </div>
          </div>
        </div>

        {/* 7-day calendar */}
        <div className="space-y-2">
          <div className="flex justify-between px-1">
            {data.weeklyActivity.map((day, index) => {
              const dayIndex = (today - 6 + index + 7) % 7
              const isToday = index === data.weeklyActivity.length - 1
              return (
                <DayCell
                  key={day.date}
                  day={day}
                  dayName={dayNames[(today - 6 + index + 7) % 7]}
                  isToday={isToday}
                />
              )
            })}
          </div>
        </div>

        {/* Today's goal */}
        <TodayGoal {...data.todayGoal} />

        {/* XP Progress */}
        <XPBar {...data.xp} />

        {/* Next achievement */}
        {data.nextAchievement && <NextAchievement {...data.nextAchievement} />}

        {/* Motivational message */}
        {data.currentStreak > 0 && (
          <motion.div
            className="rounded-lg bg-gradient-to-r from-orange-500/10 to-yellow-500/10 p-3 text-center"
            animate={{
              background: [
                'linear-gradient(to right, rgba(249, 115, 22, 0.1), rgba(234, 179, 8, 0.1))',
                'linear-gradient(to right, rgba(234, 179, 8, 0.15), rgba(249, 115, 22, 0.15))',
                'linear-gradient(to right, rgba(249, 115, 22, 0.1), rgba(234, 179, 8, 0.1))',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
              {data.currentStreak >= 7
                ? '🔥 Amazing! You\'re on fire!'
                : data.currentStreak >= 3
                  ? '💪 Great consistency! Keep it up!'
                  : '📚 Keep studying to maintain your streak!'}
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}

export default StudyStreakWidget
