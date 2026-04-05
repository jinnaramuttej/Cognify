'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  Send,
  Mic,
  Image as ImageIcon,
  Sparkles,
  BookOpen,
  Target,
  Lightbulb,
  RotateCcw,
  ChevronDown,
  CheckCircle,
  Clock,
  TrendingUp,
  MessageSquare,
  HelpCircle,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { CogniSplineAvatar } from '@/components/cogni/CogniSplineAvatar'
import { useAuth } from '@/contexts/AuthContext'

// =====================================================
// TYPES
// =====================================================

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  structured?: StructuredResponse
}

interface StructuredResponse {
  concept: string
  steps: string[]
  finalAnswer: string
}

interface ChatApiResponse {
  message: string
  structured: StructuredResponse
  topicsDiscussed: string[]
  status: 'success' | 'error'
}

interface SessionState {
  sessionId: string
  topic: string | null
  hintCount: number
  confidence: 'confident' | 'somewhat' | 'confused' | null
  timeSpent: number
  stepsCompleted: number
  mastery: number
}

type CogniAvatarState = 'idle' | 'listening' | 'thinking' | 'explaining' | 'encouraging'

// =====================================================
// CUSTOM ANIMATED ROBOT AVATAR (SVG fallback)
// =====================================================

function CogniRobotAvatar({ state }: { state: CogniAvatarState }) {
  const headAnimation = {
    idle: { y: [0, -5, 0], rotate: [0, 2, -2, 0] },
    listening: { y: [0, -3, 0], rotate: [0, -5, 5, 0], scale: [1, 1.02, 1] },
    thinking: { y: [0, -8, 0], rotate: [0, -8, 8, 0] },
    explaining: { y: [0, -3, 0], scale: [1, 1.05, 1] },
    encouraging: { y: [0, -10, 0], scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] },
  }

  const eyeAnimation = {
    idle: { scaleY: [1, 0.3, 1] },
    listening: { scaleX: [1, 1.2, 1] },
    thinking: { y: [-2, 2, -2] },
    explaining: { scaleY: [1, 0.5, 1] },
    encouraging: { scale: [1, 1.3, 1] },
  }

  const glowAnimation = {
    idle: { opacity: [0.3, 0.6, 0.3], scale: [0.95, 1, 0.95] },
    listening: { opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] },
    thinking: { opacity: [0.3, 0.8, 0.3], scale: [0.9, 1.05, 0.9] },
    explaining: { opacity: [0.4, 0.9, 0.4], scale: [0.95, 1.1, 0.95] },
    encouraging: { opacity: [0.5, 1, 0.5], scale: [0.9, 1.15, 0.9] },
  }

  const armAnimation = {
    idle: { rotate: [0, 5, 0] },
    listening: { rotate: [0, -15, 0] },
    thinking: { rotate: [0, 20, 0] },
    explaining: { rotate: [-20, 20, -20] },
    encouraging: { rotate: [-30, 30, -30] },
  }

  const transition = { duration: 2, repeat: Infinity, ease: 'easeInOut' as const }
  const eyeTransition = {
    duration: state === 'idle' ? 4 : state === 'thinking' ? 1.5 : 2,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  }

  return (
    <div className="relative w-64 h-64">
      <motion.div
        animate={glowAnimation[state]}
        transition={{ ...transition, duration: 3 }}
        className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/30 via-blue-500/20 to-purple-500/30 blur-xl"
      />
      <motion.svg
        viewBox="0 0 200 200"
        className="w-full h-full relative z-10"
        style={{ filter: 'drop-shadow(0 10px 30px rgba(59, 130, 246, 0.3))' }}
      >
        {/* Body */}
        <motion.g initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
          <ellipse cx="100" cy="150" rx="45" ry="35" fill="url(#bodyGradient)" />
          <motion.circle cx="100" cy="145" r="12" fill="url(#chestGlow)" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} />
          <circle cx="100" cy="145" r="8" fill="#3B82F6" />
          <path d="M70 135 L130 135" stroke="#1E40AF" strokeWidth="2" opacity="0.5" />
          <path d="M65 145 L135 145" stroke="#1E40AF" strokeWidth="2" opacity="0.3" />
          <path d="M70 155 L130 155" stroke="#1E40AF" strokeWidth="2" opacity="0.5" />
        </motion.g>
        {/* Left Arm */}
        <motion.g animate={armAnimation[state]} transition={{ ...transition, duration: 2.5 }} style={{ transformOrigin: '60px 140px' }}>
          <ellipse cx="45" cy="145" rx="12" ry="20" fill="url(#bodyGradient)" />
          <circle cx="45" cy="160" r="8" fill="#60A5FA" />
        </motion.g>
        {/* Right Arm */}
        <motion.g animate={armAnimation[state]} transition={{ ...transition, duration: 2.5, delay: 0.3 }} style={{ transformOrigin: '140px 140px' }}>
          <ellipse cx="155" cy="145" rx="12" ry="20" fill="url(#bodyGradient)" />
          <circle cx="155" cy="160" r="8" fill="#60A5FA" />
        </motion.g>
        {/* Neck */}
        <rect x="90" y="100" width="20" height="20" rx="5" fill="url(#bodyGradient)" />
        {/* Head */}
        <motion.g animate={headAnimation[state]} transition={transition}>
          <rect x="55" y="30" width="90" height="75" rx="20" fill="url(#headGradient)" />
          <rect x="65" y="40" width="70" height="50" rx="12" fill="#0F172A" />
          <g>
            <motion.g animate={eyeAnimation[state]} transition={eyeTransition}>
              <ellipse cx="85" cy="60" rx="12" ry="14" fill="#3B82F6" />
              <ellipse cx="85" cy="58" rx="6" ry="8" fill="#60A5FA" />
              <circle cx="88" cy="55" r="3" fill="white" opacity="0.8" />
            </motion.g>
            <motion.g animate={eyeAnimation[state]} transition={eyeTransition}>
              <ellipse cx="115" cy="60" rx="12" ry="14" fill="#3B82F6" />
              <ellipse cx="115" cy="58" rx="6" ry="8" fill="#60A5FA" />
              <circle cx="118" cy="55" r="3" fill="white" opacity="0.8" />
            </motion.g>
          </g>
          <motion.line x1="100" y1="30" x2="100" y2="15" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round" animate={{ y: [0, -2, 0] }} transition={{ duration: 1, repeat: Infinity }} />
          <motion.circle cx="100" cy="12" r="5" fill="#3B82F6" animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 1, repeat: Infinity }} />
          <rect x="45" y="50" width="12" height="25" rx="4" fill="url(#bodyGradient)" />
          <rect x="143" y="50" width="12" height="25" rx="4" fill="url(#bodyGradient)" />
          {state === 'thinking' && (
            <g>
              {[0, 1, 2].map((i) => (
                <motion.circle key={i} cx={130 + i * 15} cy={45} r="3" fill="#60A5FA" initial={{ opacity: 0, y: 0 }} animate={{ opacity: [0, 1, 0], y: [-10, -20, -10] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }} />
              ))}
            </g>
          )}
          {state === 'explaining' && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <motion.rect x="92" y="75" width="16" height="4" rx="2" fill="#3B82F6" animate={{ scaleX: [1, 1.5, 1] }} transition={{ duration: 0.3, repeat: Infinity }} />
            </motion.g>
          )}
          {state === 'encouraging' && (
            <motion.path d="M75 70 Q100 85 125 70" fill="none" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }} />
          )}
        </motion.g>
        <defs>
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
          <linearGradient id="headGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
          <radialGradient id="chestGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
          </radialGradient>
        </defs>
      </motion.svg>
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-blue-400"
            style={{ left: `${20 + i * 10}%`, top: `${20 + i * 8}%` }}
            animate={{ y: [0, -30, 0], opacity: [0, 0.8, 0], scale: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.5, ease: 'easeOut' }}
          />
        ))}
      </div>
    </div>
  )
}

// =====================================================
// COGNI AVATAR PANEL (RIGHT SIDE - 35%)
// =====================================================

function CogniAvatarPanel({
  avatarState,
  mastery,
  hintCount,
  onQuickAction,
}: {
  avatarState: CogniAvatarState
  mastery: number
  hintCount: number
  onQuickAction: (action: string) => void
}) {
  const stateConfig: Record<CogniAvatarState, { label: string; color: string; icon: React.ElementType }> = {
    idle: { label: 'Ready', color: 'bg-muted text-muted-foreground', icon: Brain },
    listening: { label: 'Listening...', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300', icon: MessageSquare },
    thinking: { label: 'Thinking...', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300', icon: Sparkles },
    explaining: { label: 'Explaining', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300', icon: BookOpen },
    encouraging: { label: 'Encouraging', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300', icon: TrendingUp },
  }

  const currentConfig = stateConfig[avatarState]
  const StateIcon = currentConfig.icon

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-muted/30 to-background overflow-hidden">
      {/* Avatar Container */}
      <div className="relative flex-1 min-h-[300px] flex items-center justify-center p-4">
        <CogniSplineAvatar
          state={avatarState}
          isSpeaking={avatarState === 'explaining'}
          audioLevel={avatarState === 'explaining' ? 0.6 : 0}
          className="w-full h-full"
        />
        <div className="absolute top-3 left-3 z-20">
          <motion.div
            key={avatarState}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium shadow-sm backdrop-blur-sm',
              currentConfig.color
            )}
          >
            <StateIcon className="w-4 h-4" />
            {currentConfig.label}
          </motion.div>
        </div>
      </div>

      {/* Status Panel */}
      <div className="border-t border-border bg-card/80 backdrop-blur-sm">
        {/* Mastery Bar */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Topic Mastery</span>
            <span className="text-sm font-bold text-primary">{Math.round(mastery * 100)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${mastery * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Hint Usage */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Hints used this session
          </div>
          <Badge variant="secondary" className="font-mono">
            {hintCount}
          </Badge>
        </div>

        {/* Quick Actions */}
        <div className="p-4 space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: ArrowRight, label: 'Simplify', action: 'simplify' },
              { icon: TrendingUp, label: 'Harder', action: 'harder' },
              { icon: HelpCircle, label: 'Similar Q', action: 'similar' },
              { icon: RotateCcw, label: 'Fix Mistake', action: 'fix' },
            ].map((item) => (
              <motion.button
                key={item.action}
                onClick={() => onQuickAction(item.action)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 hover:bg-accent border border-border hover:border-primary/30 text-foreground transition-colors text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <item.icon className="w-4 h-4" />
                <span className="font-medium">{item.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// =====================================================
// INLINE HINT LADDER
// =====================================================

function InlineHintLadder({
  onHintRequest,
  hintsUsed,
  isVisible,
}: {
  onHintRequest: (level: number) => void
  hintsUsed: number[]
  isVisible: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  if (!isVisible) return null

  const levels = [
    { level: 1, name: 'Direction', desc: 'Get pointed in the right direction' },
    { level: 2, name: 'Scaffold', desc: 'Receive a structured hint' },
    { level: 3, name: 'Guide', desc: 'Get a more detailed nudge' },
    { level: 4, name: 'Reveal', desc: 'See a key step explained' },
  ]

  return (
    <div className="mt-4">
      <motion.button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 font-medium"
      >
        <Lightbulb className="w-4 h-4" />
        Need a hint?
        <ChevronDown className={cn('w-4 h-4 transition-transform', expanded && 'rotate-180')} />
      </motion.button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 grid grid-cols-4 gap-2">
              {levels.map((l) => {
                const isUsed = hintsUsed.includes(l.level)
                return (
                  <motion.button
                    key={l.level}
                    onClick={() => !isUsed && onHintRequest(l.level)}
                    disabled={isUsed}
                    className={cn(
                      'relative p-3 rounded-lg border-2 text-center transition-all',
                      isUsed
                        ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700'
                        : 'bg-card border-border hover:border-amber-300 hover:bg-amber-50/50 dark:hover:bg-amber-900/10'
                    )}
                    whileHover={!isUsed ? { scale: 1.02 } : {}}
                    whileTap={!isUsed ? { scale: 0.98 } : {}}
                  >
                    <div
                      className={cn(
                        'w-6 h-6 rounded-full mx-auto mb-1.5 flex items-center justify-center text-xs font-bold',
                        isUsed ? 'bg-amber-400 text-white' : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {isUsed ? <CheckCircle className="w-3 h-3" /> : l.level}
                    </div>
                    <p className={cn('text-xs font-medium', isUsed ? 'text-amber-700 dark:text-amber-300' : 'text-muted-foreground')}>
                      {l.name}
                    </p>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// =====================================================
// STRUCTURED RESPONSE RENDERER
// =====================================================

function StructuredResponseRenderer({
  response,
}: {
  response: StructuredResponse
}) {
  return (
    <div className="space-y-4">
      {/* Concept */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-blue-500 flex items-center justify-center">
            <Target className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-semibold text-blue-900 dark:text-blue-200">Concept</span>
        </div>
        <p className="text-sm text-blue-800 dark:text-blue-300">{response.concept}</p>
      </motion.div>

      {/* Steps */}
      <div className="space-y-2">
        {response.steps.map((step, index) => (
          <motion.div
            key={`${step}-${index}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className="bg-card rounded-xl border border-border p-4"
          >
            <div className="flex items-start gap-3"
            >
              <div
                className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-sm font-bold bg-muted text-muted-foreground"
              >
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground">{step}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Final Answer */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl p-4 border-2 border-emerald-200 dark:border-emerald-800">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center">
            <CheckCircle className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">Final Answer</span>
        </div>
        <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">{response.finalAnswer}</p>
      </motion.div>
    </div>
  )
}

// =====================================================
// MAIN COGNI TUTOR PAGE
// =====================================================

export default function CogniTutorPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [avatarState, setAvatarState] = useState<CogniAvatarState>('idle')
  const [session, setSession] = useState<SessionState>({
    sessionId: `session_${Date.now()}`,
    topic: null,
    hintCount: 0,
    confidence: null,
    timeSpent: 0,
    stepsCompleted: 0,
    mastery: 0.62,
  })
  const [hintsUsed, setHintsUsed] = useState<number[]>([])

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setSession((prev) => ({ ...prev, timeSpent: prev.timeSpent + 1 }))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Send message - uses /api/ai/chat (the existing Cognify API route)
  const handleSend = useCallback(async () => {
    const trimmedInput = input.trim()
    if (!trimmedInput || isLoading) return

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: trimmedInput,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setError(null)
    setIsLoading(true)
    setAvatarState('thinking')

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
          userId: user?.id || 'anonymous',
        }),
      })

      const data = (await response.json()) as Partial<ChatApiResponse>

      if (!response.ok || data.status !== 'success' || !data.message || !data.structured) {
        throw new Error(data.message || 'I could not complete that request right now. Please try again.')
      }

      const assistantMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        structured: data.structured,
      }

      setMessages((prev) => [...prev, assistantMessage])
      setAvatarState('explaining')

      const primaryTopic = data.topicsDiscussed?.[0]
      if (primaryTopic) {
        setSession((prev) => ({
          ...prev,
          topic: primaryTopic,
          stepsCompleted: prev.stepsCompleted + 1,
        }))
      }
    } catch (err) {
      const userMessage = err instanceof Error && err.message
        ? err.message
        : 'I could not generate a tutor response. Please try again in a moment.'
      setError(userMessage)
      const errorMessage: Message = {
        id: `msg_error_${Date.now()}`,
        role: 'system',
        content: userMessage,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setAvatarState('idle')
    }
  }, [input, isLoading, messages, user?.id])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleQuickAction = useCallback((action: string) => {
    const prompts: Record<string, string> = {
      simplify: 'Can you explain this more simply? Use analogies.',
      harder: 'Give me a more challenging version of this problem.',
      similar: 'Give me a similar practice question to test my understanding.',
      fix: 'Help me understand where I might have gone wrong in my approach.',
    }
    setInput(prompts[action] || '')
  }, [])

  const handleHintRequest = useCallback((level: number) => {
    setHintsUsed((prev) => [...prev, level])
    setSession((prev) => ({ ...prev, hintCount: prev.hintCount + 1 }))
    setInput((prev) => prev + ` [Hint Level ${level} requested]`)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-background">
      {/* Session Stats Bar */}
      <div className="shrink-0 bg-card/90 backdrop-blur-md border-b border-border px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                <Brain className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-card" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Cogni AI Tutor</h1>
              <p className="text-xs text-muted-foreground">Adaptive learning powered by your performance</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="font-mono">{formatTime(session.timeSpent)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="w-4 h-4" />
              <span>{session.stepsCompleted} steps</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="w-4 h-4" />
              <span>{Math.round(session.mastery * 100)}% mastery</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="shrink-0 px-6 py-2 bg-destructive/10 border-b border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Main Content - Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT - Learning Workspace (65%) */}
        <div className="w-[65%] flex flex-col border-r border-border">
          {/* Messages */}
          <ScrollArea className="flex-1 p-6">
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Welcome */}
              {messages.length === 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20">
                    <Brain className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    What would you like to learn today{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}?
                  </h2>
                  <p className="text-muted-foreground max-w-md mx-auto mb-8">
                    Ask me anything about concepts, solve problems step-by-step, or practice with similar questions.
                  </p>
                  <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                    {[
                      { icon: BookOpen, label: 'Explain a concept', prompt: 'Explain the concept of electromagnetic induction' },
                      { icon: Target, label: 'Solve a problem', prompt: 'Help me solve: A particle moves in a circle of radius 2m with speed 4m/s. Find centripetal acceleration.' },
                      { icon: Sparkles, label: 'Practice more', prompt: 'Give me practice questions on integration by parts' },
                    ].map((item, i) => (
                      <motion.button
                        key={i}
                        onClick={() => setInput(item.prompt)}
                        className="p-4 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-md transition-all text-left group"
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                          <item.icon className="w-5 h-5 text-primary" />
                        </div>
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Messages List */}
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn('flex gap-3', message.role === 'user' && 'flex-row-reverse')}
                >
                  <Avatar className="w-9 h-9 shrink-0">
                    <AvatarFallback
                      className={cn(
                        'text-sm font-semibold',
                        message.role === 'user'
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground'
                      )}
                    >
                      {message.role === 'user' ? (user?.full_name?.[0] || 'U') : 'C'}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn('flex-1', message.role === 'user' ? 'items-end' : 'items-start')}>
                    {message.role === 'assistant' && message.structured ? (
                      <StructuredResponseRenderer response={message.structured} />
                    ) : (
                      <div
                        className={cn(
                          'rounded-2xl p-4 max-w-[85%]',
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-tr-md'
                            : message.role === 'system'
                              ? 'bg-destructive/10 border border-destructive/20 text-destructive'
                              : 'bg-card border border-border rounded-tl-md'
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    )}
                    <p className={cn('text-xs text-muted-foreground mt-1 px-1', message.role === 'user' ? 'text-right' : 'text-left')}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Loading */}
              {isLoading && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                  <Avatar className="w-9 h-9 shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-sm font-semibold">C</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-card border border-border rounded-2xl rounded-tl-md p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 rounded-full bg-primary"
                            animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.12 }}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground ml-2">Analyzing your question...</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="shrink-0 bg-card/95 backdrop-blur-sm border-t border-border p-4">
            <div className="max-w-3xl mx-auto">
              <InlineHintLadder onHintRequest={handleHintRequest} hintsUsed={hintsUsed} isVisible={messages.length > 0} />
              <div className="flex items-center gap-3 mt-3">
                <div className="flex-1 relative">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Cogni anything... (concepts, problems, practice)"
                    disabled={isLoading}
                    className="h-12 pr-24 text-sm"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled
                      title="Voice input coming soon"
                      className="h-8 w-8 text-muted-foreground"
                    >
                      <Mic className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled
                      title="Image input coming soon"
                      className="h-8 w-8 text-muted-foreground"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="h-12 px-6 shadow-lg shadow-primary/20"
                >
                  {isLoading ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                      <RotateCcw className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT - Cogni Presence Panel (35%) */}
        <div className="w-[35%] shrink-0 h-full overflow-hidden hidden lg:block">
          <CogniAvatarPanel avatarState={avatarState} mastery={session.mastery} hintCount={session.hintCount} onQuickAction={handleQuickAction} />
        </div>
      </div>
    </div>
  )
}
