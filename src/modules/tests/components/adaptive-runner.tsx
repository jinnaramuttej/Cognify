'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Target, 
  Clock, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  BarChart3,
  AlertCircle,
  Lightbulb,
  RotateCcw,
  Flag,
  Pause
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/modules/tests/utils'
import { 
  FadeIn,
  AnimatedCounter,
  DifficultyRing,
  RingProgress
} from './motion'
import { 
  calculateProbability, 
  calculateInformation, 
  getAbilityLevel,
  type IRTParameters 
} from '@/modules/tests/utils/irt'

// ============================================
// ADAPTIVE RUNNER - Main Component
// ============================================

interface AdaptiveQuestion {
  id: string
  text: string
  options: { id: string; text: string }[]
  irt: IRTParameters
  skillTags: string[]
  cognitiveLevel: string
  timeBudget: number
}

interface AdaptiveResponse {
  questionId: string
  selectedOption: string | null
  isCorrect: boolean
  responseTime: number
  thetaAfter: number
  infoValue: number
}

interface ThetaPoint {
  questionNumber: number
  theta: number
  timestamp: number
}

interface AdaptiveRunnerProps {
  testId: string
  onComplete?: (results: AdaptiveResult) => void
  onExit?: () => void
}

export interface AdaptiveResult {
  finalTheta: number
  abilityLevel: string
  accuracy: number
  totalQuestions: number
  totalTime: number
  responses: AdaptiveResponse[]
  thetaHistory: ThetaPoint[]
  skillMastery: Record<string, number>
}

export function AdaptiveRunner({ testId, onComplete, onExit }: AdaptiveRunnerProps) {
  // State
  const [currentQuestion, setCurrentQuestion] = useState<AdaptiveQuestion | null>(null)
  const [questionNumber, setQuestionNumber] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isLocked, setIsLocked] = useState(false)
  const [theta, setTheta] = useState(0)
  const [thetaHistory, setThetaHistory] = useState<ThetaPoint[]>([{ questionNumber: 0, theta: 0, timestamp: Date.now() }])
  const [responses, setResponses] = useState<AdaptiveResponse[]>([])
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [isPaused, setIsPaused] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [confidence, setConfidence] = useState(0.5)
  const [infoValue, setInfoValue] = useState(0)

  // Simulated question pool for demo
  const questionPool = useMemo<AdaptiveQuestion[]>(() => [
    {
      id: 'q1',
      text: 'A particle moves in a straight line with acceleration a = 2t. If initial velocity is 4 m/s, find velocity at t = 3s.',
      options: [
        { id: 'a', text: '10 m/s' },
        { id: 'b', text: '13 m/s' },
        { id: 'c', text: '9 m/s' },
        { id: 'd', text: '7 m/s' }
      ],
      irt: { difficulty: 0.2, discrimination: 1.2, guessing: 0.25 },
      skillTags: ['kinematics', 'calculus'],
      cognitiveLevel: 'application',
      timeBudget: 90
    },
    {
      id: 'q2',
      text: 'The derivative of sin²x with respect to x is:',
      options: [
        { id: 'a', text: '2 sin x cos x' },
        { id: 'b', text: 'sin 2x' },
        { id: 'c', text: '2 cos x' },
        { id: 'd', text: 'cos²x' }
      ],
      irt: { difficulty: -0.5, discrimination: 1.5, guessing: 0.25 },
      skillTags: ['differentiation', 'trigonometry'],
      cognitiveLevel: 'recall',
      timeBudget: 45
    },
    {
      id: 'q3',
      text: 'For a projectile launched at angle θ with velocity u, the horizontal range is maximum when θ = ?',
      options: [
        { id: 'a', text: '30°' },
        { id: 'b', text: '45°' },
        { id: 'c', text: '60°' },
        { id: 'd', text: '90°' }
      ],
      irt: { difficulty: 0, discrimination: 1.3, guessing: 0.25 },
      skillTags: ['projectile', 'kinematics'],
      cognitiveLevel: 'understanding',
      timeBudget: 60
    },
    {
      id: 'q4',
      text: 'The integral of e^x.sin x dx equals:',
      options: [
        { id: 'a', text: 'e^x(sin x + cos x)/2 + C' },
        { id: 'b', text: 'e^x(sin x - cos x)/2 + C' },
        { id: 'c', text: 'e^x(cos x - sin x)/2 + C' },
        { id: 'd', text: 'e^x(cos x + sin x)/2 + C' }
      ],
      irt: { difficulty: 0.8, discrimination: 1.1, guessing: 0.25 },
      skillTags: ['integration', 'by_parts'],
      cognitiveLevel: 'application',
      timeBudget: 120
    },
    {
      id: 'q5',
      text: 'A ball is dropped from height h. The ratio of distances covered in 1st, 2nd, and 3rd second is:',
      options: [
        { id: 'a', text: '1:3:5' },
        { id: 'b', text: '1:2:3' },
        { id: 'c', text: '1:4:9' },
        { id: 'd', text: '1:1:1' }
      ],
      irt: { difficulty: 0.4, discrimination: 1.4, guessing: 0.25 },
      skillTags: ['kinematics', 'free_fall'],
      cognitiveLevel: 'understanding',
      timeBudget: 75
    }
  ], [])

  // Fetch next question
  const fetchNextQuestion = useCallback(async (currentTheta: number) => {
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Select question based on theta (simplified - in production, use server-side selection)
    const targetDifficulty = currentTheta
    const sortedQuestions = [...questionPool]
      .filter(q => !responses.find(r => r.questionId === q.id))
      .sort((a, b) => {
        const diffA = Math.abs(a.irt.difficulty - targetDifficulty)
        const diffB = Math.abs(b.irt.difficulty - targetDifficulty)
        return diffA - diffB
      })
    
    const nextQuestion = sortedQuestions[0] || questionPool[questionNumber % questionPool.length]
    
    // Calculate information value
    const info = calculateInformation(currentTheta, nextQuestion.irt)
    setInfoValue(info)
    
    setCurrentQuestion(nextQuestion)
    setQuestionStartTime(Date.now())
    setSelectedOption(null)
    setIsLocked(false)
    setIsLoading(false)
  }, [questionPool, responses, questionNumber])

  // Initialize first question
  useEffect(() => {
    if (!currentQuestion && !isComplete) {
      fetchNextQuestion(theta)
    }
  }, [currentQuestion, isComplete, fetchNextQuestion, theta])

  // Timer effect
  useEffect(() => {
    if (isPaused || isComplete) return
    
    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1)
    }, 1000)
    
    return () => clearInterval(interval)
  }, [isPaused, isComplete])

  // Handle option selection
  const handleSelectOption = (optionId: string) => {
    if (isLocked) return
    setSelectedOption(optionId)
  }

  // Handle submit answer
  const handleSubmitAnswer = async () => {
    if (!currentQuestion || !selectedOption || isLocked) return
    
    setIsLocked(true)
    const responseTime = (Date.now() - questionStartTime) / 1000
    
    // Simulate correct/incorrect (in production, get from API)
    const isCorrect = Math.random() > 0.4 // Simplified
    
    // Update theta using IRT
    const currentProb = calculateProbability(theta, currentQuestion.irt)
    const newTheta = theta + (isCorrect ? 0.15 : -0.12) * (1 - currentProb)
    
    // Calculate information
    const info = calculateInformation(theta, currentQuestion.irt)
    
    // Record response
    const response: AdaptiveResponse = {
      questionId: currentQuestion.id,
      selectedOption,
      isCorrect,
      responseTime,
      thetaAfter: newTheta,
      infoValue: info
    }
    
    setResponses(prev => [...prev, response])
    setTheta(newTheta)
    setThetaHistory(prev => [...prev, {
      questionNumber: questionNumber + 1,
      theta: newTheta,
      timestamp: Date.now()
    }])
    
    // Check stopping rule (simplified)
    if (questionNumber + 1 >= 10 || Math.abs(newTheta - theta) < 0.05) {
      // Test complete
      setTimeout(() => {
        setIsComplete(true)
        if (onComplete) {
          onComplete({
            finalTheta: newTheta,
            abilityLevel: getAbilityLevel(newTheta),
            accuracy: [...responses, response].filter(r => r.isCorrect).length / (questionNumber + 2) * 100,
            totalQuestions: questionNumber + 2,
            totalTime: timeElapsed,
            responses: [...responses, response],
            thetaHistory: [...thetaHistory, { questionNumber: questionNumber + 1, theta: newTheta, timestamp: Date.now() }],
            skillMastery: {}
          })
        }
      }, 1500)
    } else {
      // Next question
      setTimeout(() => {
        setQuestionNumber(prev => prev + 1)
        fetchNextQuestion(newTheta)
      }, 1500)
    }
  }

  // Calculate derived values
  const accuracy = useMemo(() => {
    if (responses.length === 0) return 0
    return responses.filter(r => r.isCorrect).length / responses.length * 100
  }, [responses])

  const avgResponseTime = useMemo(() => {
    if (responses.length === 0) return 0
    return responses.reduce((sum, r) => sum + r.responseTime, 0) / responses.length
  }, [responses])

  const thetaPercent = useMemo(() => {
    // Map theta (-3 to 3) to percentage (0 to 100)
    return Math.max(0, Math.min(100, (theta + 3) / 6 * 100))
  }, [theta])

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Completion Screen
  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[600px] flex items-center justify-center"
      >
        <Card className="w-full max-w-lg border-0 shadow-xl bg-gradient-to-br from-white to-blue-50">
          <CardContent className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="mb-6"
            >
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Target className="h-12 w-12 text-white" />
              </div>
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-gray-900 mb-2"
            >
              Assessment Complete
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-500 mb-6"
            >
              Your ability has been precisely measured
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-2 gap-4 mb-6"
            >
              <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
                <div className="text-3xl font-bold text-blue-600">
                  <AnimatedCounter value={thetaPercent} decimals={0} />%
                </div>
                <div className="text-sm text-gray-500 mt-1">Ability Score</div>
              </div>
              <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
                <div className="text-xl font-bold text-gray-900">
                  {getAbilityLevel(theta)}
                </div>
                <div className="text-sm text-gray-500 mt-1">Level</div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="space-y-3 mb-6"
            >
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Questions Attempted</span>
                <span className="font-semibold">{responses.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Accuracy</span>
                <span className="font-semibold">{accuracy.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Time</span>
                <span className="font-semibold">{formatTime(timeElapsed)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Avg. Time/Question</span>
                <span className="font-semibold">{avgResponseTime.toFixed(1)}s</span>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={onExit}>
                Return to Dashboard
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Left Sidebar - Ability & Stats */}
      <div className="lg:col-span-1 space-y-4">
        {/* Ability Meter */}
        <FadeIn>
          <Card className="border border-gray-200 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white pb-3">
              <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Brain className="h-4 w-4 text-blue-600" />
                Ability Estimate
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex justify-center mb-3">
                <RingProgress
                  progress={thetaPercent}
                  size={120}
                  strokeWidth={10}
                  color={thetaPercent > 70 ? '#10B981' : thetaPercent > 40 ? '#2563EB' : '#EF4444'}
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      <AnimatedCounter value={thetaPercent} decimals={0} />
                    </div>
                    <div className="text-xs text-gray-500">θ = {theta.toFixed(2)}</div>
                  </div>
                </RingProgress>
              </div>
              <div className="text-center">
                <Badge className={cn(
                  'text-sm',
                  thetaPercent > 70 ? 'bg-emerald-100 text-emerald-700' :
                  thetaPercent > 40 ? 'bg-blue-100 text-blue-700' :
                  'bg-amber-100 text-amber-700'
                )}>
                  {getAbilityLevel(theta)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Session Stats */}
        <FadeIn delay={0.1}>
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Question</span>
                <span className="font-semibold text-gray-900">{questionNumber + 1} / 10</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Accuracy</span>
                <span className={cn(
                  'font-semibold',
                  accuracy > 70 ? 'text-emerald-600' : accuracy > 50 ? 'text-blue-600' : 'text-amber-600'
                )}>
                  {accuracy.toFixed(0)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Time</span>
                <span className="font-semibold text-gray-900">{formatTime(timeElapsed)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Info Value</span>
                <span className="font-semibold text-blue-600">{infoValue.toFixed(3)}</span>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Theta History Chart */}
        <FadeIn delay={0.2}>
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                Ability Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-32 relative">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 text-xs text-gray-400">+3</div>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 text-xs text-gray-400">0</div>
                <div className="absolute left-0 bottom-0 text-xs text-gray-400">-3</div>
                
                {/* Grid lines */}
                <div className="absolute inset-0 ml-6">
                  <div className="absolute top-0 left-0 right-0 border-t border-gray-100" />
                  <div className="absolute top-1/2 left-0 right-0 border-t border-gray-200" />
                  <div className="absolute bottom-0 left-0 right-0 border-t border-gray-100" />
                </div>
                
                {/* Theta line */}
                <svg className="absolute inset-0 ml-6" preserveAspectRatio="none">
                  <motion.path
                    d={`M ${thetaHistory.map((point, i) => {
                      const x = (i / (thetaHistory.length - 1 || 1)) * 100
                      const y = ((3 - point.theta) / 6) * 100
                      return `${x}% ${y}%`
                    }).join(' L ')} L 100% ${((3 - theta) / 6) * 100}%`}
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                  {thetaHistory.map((point, i) => {
                    const x = (i / (thetaHistory.length - 1 || 1)) * 100
                    const y = ((3 - point.theta) / 6) * 100
                    return (
                      <motion.circle
                        key={i}
                        cx={`${x}%`}
                        cy={`${y}%`}
                        r="4"
                        fill="#2563EB"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                      />
                    )
                  })}
                </svg>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* Main Content - Question */}
      <div className="lg:col-span-3">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center min-h-[400px]"
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-12 h-12 mx-auto mb-4"
                >
                  <Target className="h-12 w-12 text-blue-600" />
                </motion.div>
                <p className="text-gray-500">Selecting optimal question...</p>
              </div>
            </motion.div>
          ) : currentQuestion ? (
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border border-gray-200 shadow-sm overflow-hidden">
                {/* Question Header */}
                <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-blue-100 text-blue-700">
                        Q{questionNumber + 1}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <DifficultyRing 
                          difficulty={Math.round((currentQuestion.irt.difficulty + 3) / 6 * 100)} 
                          size={28}
                        />
                        <span className="text-sm text-gray-500 capitalize">
                          {currentQuestion.cognitiveLevel}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      {currentQuestion.timeBudget}s
                    </div>
                  </div>
                  
                  {/* Skill Tags */}
                  <div className="flex gap-2 mt-3">
                    {currentQuestion.skillTags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                
                {/* Question Content */}
                <CardContent className="p-6">
                  <p className="text-lg text-gray-900 mb-6 leading-relaxed">
                    {currentQuestion.text}
                  </p>
                  
                  {/* Options */}
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, idx) => {
                      const isSelected = selectedOption === option.id
                      const showResult = isLocked
                      const isCorrect = isSelected && responses[responses.length - 1]?.isCorrect
                      const isWrong = isSelected && !responses[responses.length - 1]?.isCorrect
                      
                      return (
                        <motion.button
                          key={option.id}
                          onClick={() => handleSelectOption(option.id)}
                          disabled={isLocked}
                          className={cn(
                            "w-full p-4 rounded-xl border-2 text-left transition-all duration-200",
                            "flex items-center gap-4",
                            isSelected && !isLocked && "border-blue-500 bg-blue-50",
                            !isSelected && !isLocked && "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
                            isCorrect && "border-emerald-500 bg-emerald-50",
                            isWrong && "border-red-500 bg-red-50",
                            isLocked && !isSelected && "opacity-60 cursor-not-allowed"
                          )}
                          whileHover={!isLocked ? { scale: 1.01 } : {}}
                          whileTap={!isLocked ? { scale: 0.99 } : {}}
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm",
                            isSelected && !isLocked && "bg-blue-500 text-white",
                            !isSelected && !isLocked && "bg-gray-100 text-gray-600",
                            isCorrect && "bg-emerald-500 text-white",
                            isWrong && "bg-red-500 text-white"
                          )}>
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <span className="flex-1 text-gray-900">{option.text}</span>
                          {isCorrect && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                          {isWrong && <XCircle className="h-5 w-5 text-red-500" />}
                        </motion.button>
                      )
                    })}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setIsPaused(!isPaused)}>
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </Button>
                      <Button variant="outline" size="sm">
                        <Flag className="h-4 w-4 mr-2" />
                        Flag
                      </Button>
                    </div>
                    
                    <Button
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={!selectedOption || isLocked}
                      onClick={handleSubmitAnswer}
                    >
                      {isLocked ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          >
                            <Zap className="h-4 w-4 mr-2" />
                          </motion.div>
                          Processing...
                        </>
                      ) : (
                        <>
                          Submit & Continue
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Info Banner */}
              {isLocked && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4"
                >
                  <Card className={cn(
                    "border",
                    responses[responses.length - 1]?.isCorrect 
                      ? "border-emerald-200 bg-emerald-50" 
                      : "border-amber-200 bg-amber-50"
                  )}>
                    <CardContent className="p-4 flex items-center gap-3">
                      {responses[responses.length - 1]?.isCorrect ? (
                        <>
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                          <div>
                            <span className="font-medium text-emerald-800">Correct!</span>
                            <span className="text-emerald-600 ml-2">
                              Ability increased by +{Math.abs(theta - thetaHistory[thetaHistory.length - 2]?.theta || 0).toFixed(2)}
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <Lightbulb className="h-5 w-5 text-amber-600" />
                          <div>
                            <span className="font-medium text-amber-800">Not quite right.</span>
                            <span className="text-amber-600 ml-2">
                              Don't worry, the next question will be adjusted.
                            </span>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  )
}
