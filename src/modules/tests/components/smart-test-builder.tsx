'use client'

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion'
import { 
  BookOpen, 
  Clock, 
  Target, 
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Zap,
  Brain,
  TrendingDown,
  Calendar,
  RefreshCw,
  Settings2,
  Layers,
  Gauge,
  Award,
  Info,
  X,
  Plus,
  Minus,
  Shield,
  Timer,
  BarChart3,
  PieChart
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { cn } from '@/modules/tests/utils'
import { 
  DifficultyRing, 
  AnimatedCounter,
  Shimmer
} from './motion'
import type { 
  Subject, 
  Chapter,
  Difficulty,
  TestType
} from '@/modules/tests/types'

// ============================================
// TYPES
// ============================================

interface DifficultyMix {
  easy: number
  medium: number
  hard: number
}

interface SmartTestConfig {
  name: string
  selectedSubject: string | null
  selectedChapters: string[]
  difficultyMix: DifficultyMix
  questionCount: number
  timeLimit: number
  testMode: 'adaptive' | 'fixed'
  specialMode: 'none' | 'weak_topics' | 'pyq_only' | 'spaced_revision'
  includeConceptual: boolean
}

interface TestPreview {
  estimatedDifficulty: number
  predictedScoreMin: number
  predictedScoreMax: number
  availableQuestions: number
  questionBreakdown: {
    easy: number
    medium: number
    hard: number
  }
  chapterBreakdown: {
    chapterId: string
    chapterName: string
    availableCount: number
    selectedCount: number
    avgMastery: number
  }[]
  warnings: string[]
  canGenerate: boolean
}

interface SmartTestBuilderProps {
  subjects: Subject[]
  onGenerate: (config: SmartTestConfig) => Promise<void>
  isGenerating?: boolean
  userWeakChapters?: string[]
  userMasteryData?: Record<string, number>
  spacedRevisionChapters?: string[]
}

// ============================================
// MAIN COMPONENT
// ============================================

export function SmartTestBuilder({ 
  subjects, 
  onGenerate, 
  isGenerating = false,
  userWeakChapters = [],
  userMasteryData = {},
  spacedRevisionChapters = []
}: SmartTestBuilderProps) {
  // Configuration State
  const [config, setConfig] = useState<SmartTestConfig>({
    name: '',
    selectedSubject: null,
    selectedChapters: [],
    difficultyMix: { easy: 30, medium: 50, hard: 20 },
    questionCount: 30,
    timeLimit: 60,
    testMode: 'fixed',
    specialMode: 'none',
    includeConceptual: true
  })

  const [preview, setPreview] = useState<TestPreview | null>(null)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Get available chapters for selected subject
  const availableChapters = useMemo(() => {
    if (!config.selectedSubject) return []
    const subject = subjects.find(s => s.id === config.selectedSubject)
    return subject?.chapters || []
  }, [subjects, config.selectedSubject])

  // Calculate total available questions
  const totalAvailableQuestions = useMemo(() => {
    return availableChapters
      .filter(c => config.selectedChapters.includes(c.id))
      .reduce((sum, c) => sum + (c.questionCount || 0), 0)
  }, [availableChapters, config.selectedChapters])

  // Calculate available by difficulty (simulated - in real app would query DB)
  const availableByDifficulty = useMemo(() => {
    const selected = availableChapters.filter(c => config.selectedChapters.includes(c.id))
    const total = selected.reduce((sum, c) => sum + (c.questionCount || 0), 0)
    // Simulated distribution based on typical patterns
    return {
      easy: Math.floor(total * 0.35),
      medium: Math.floor(total * 0.45),
      hard: Math.floor(total * 0.20)
    }
  }, [availableChapters, config.selectedChapters])

  // Generate preview when config changes
  useEffect(() => {
    const generatePreview = async () => {
      if (config.selectedChapters.length === 0) {
        setPreview(null)
        return
      }

      setIsLoadingPreview(true)
      await new Promise(resolve => setTimeout(resolve, 200))

      const warnings: string[] = []
      let canGenerate = true

      // Check if enough questions available
      if (totalAvailableQuestions < config.questionCount) {
        warnings.push(`Only ${totalAvailableQuestions} questions available. Need ${config.questionCount}. Reduce question count or add more chapters.`)
        canGenerate = false
      }

      // Check difficulty availability
      const requestedByDifficulty = {
        easy: Math.round(config.questionCount * config.difficultyMix.easy / 100),
        medium: Math.round(config.questionCount * config.difficultyMix.medium / 100),
        hard: Math.round(config.questionCount * config.difficultyMix.hard / 100)
      }

      if (requestedByDifficulty.easy > availableByDifficulty.easy) {
        warnings.push(`Not enough easy questions. Requested: ${requestedByDifficulty.easy}, Available: ${availableByDifficulty.easy}`)
      }
      if (requestedByDifficulty.medium > availableByDifficulty.medium) {
        warnings.push(`Not enough medium questions. Requested: ${requestedByDifficulty.medium}, Available: ${availableByDifficulty.medium}`)
      }
      if (requestedByDifficulty.hard > availableByDifficulty.hard) {
        warnings.push(`Not enough hard questions. Requested: ${requestedByDifficulty.hard}, Available: ${availableByDifficulty.hard}`)
      }

      // Calculate estimated difficulty (0-100)
      const difficultyWeights = { easy: 20, medium: 50, hard: 80 }
      const estimatedDifficulty = 
        (config.difficultyMix.easy * difficultyWeights.easy +
         config.difficultyMix.medium * difficultyWeights.medium +
         config.difficultyMix.hard * difficultyWeights.hard) / 100

      // Calculate predicted score band based on difficulty and user mastery
      const avgMastery = config.selectedChapters.reduce((sum, chId) => {
        return sum + (userMasteryData[chId] || 50)
      }, 0) / Math.max(config.selectedChapters.length, 1)

      const baseScore = avgMastery * (1 - estimatedDifficulty / 200) // Harder tests = lower expected score
      const variance = 10 + (estimatedDifficulty / 10) // More variance for harder tests
      
      const chapterBreakdown = availableChapters
        .filter(c => config.selectedChapters.includes(c.id))
        .map(c => ({
          chapterId: c.id,
          chapterName: c.name,
          availableCount: c.questionCount || 0,
          selectedCount: Math.min(
            Math.round((c.questionCount || 0) / Math.max(totalAvailableQuestions, 1) * config.questionCount),
            c.questionCount || 0
          ),
          avgMastery: userMasteryData[c.id] || 50
        }))

      setPreview({
        estimatedDifficulty,
        predictedScoreMin: Math.max(0, Math.round(baseScore - variance)),
        predictedScoreMax: Math.min(100, Math.round(baseScore + variance)),
        availableQuestions: totalAvailableQuestions,
        questionBreakdown: requestedByDifficulty,
        chapterBreakdown,
        warnings,
        canGenerate: warnings.length === 0
      })

      setIsLoadingPreview(false)
    }

    const debounce = setTimeout(generatePreview, 150)
    return () => clearTimeout(debounce)
  }, [config, totalAvailableQuestions, availableByDifficulty, availableChapters, userMasteryData])

  // Handlers
  const handleSubjectSelect = useCallback((subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId)
    setConfig(prev => ({
      ...prev,
      selectedSubject: subjectId,
      selectedChapters: subject?.chapters?.map(c => c.id) || [],
      specialMode: 'none' // Reset special mode when subject changes
    }))
  }, [subjects])

  const handleChapterToggle = useCallback((chapterId: string) => {
    setConfig(prev => ({
      ...prev,
      selectedChapters: prev.selectedChapters.includes(chapterId)
        ? prev.selectedChapters.filter(id => id !== chapterId)
        : [...prev.selectedChapters, chapterId]
    }))
  }, [])

  const handleDifficultyMixChange = useCallback((difficulty: keyof DifficultyMix, value: number) => {
    setConfig(prev => {
      const remaining = 100 - value
      const others = ['easy', 'medium', 'hard'].filter(d => d !== difficulty) as (keyof DifficultyMix)[]
      const otherTotal = prev.difficultyMix[others[0]] + prev.difficultyMix[others[1]]
      
      const newMix = { ...prev.difficultyMix }
      newMix[difficulty] = value
      
      if (otherTotal > 0) {
        newMix[others[0]] = Math.round(prev.difficultyMix[others[0]] / otherTotal * remaining)
        newMix[others[1]] = remaining - newMix[others[0]]
      } else {
        newMix[others[0]] = Math.round(remaining / 2)
        newMix[others[1]] = remaining - newMix[others[0]]
      }
      
      return { ...prev, difficultyMix: newMix }
    })
  }, [])

  const handleSpecialMode = useCallback((mode: SmartTestConfig['specialMode']) => {
    setConfig(prev => {
      if (mode === 'weak_topics' && userWeakChapters.length > 0) {
        // Filter weak chapters that belong to selected subject
        const weakInSubject = userWeakChapters.filter(chId => 
          availableChapters.some(c => c.id === chId)
        )
        return {
          ...prev,
          specialMode: mode,
          selectedChapters: weakInSubject.length > 0 ? weakInSubject : prev.selectedChapters
        }
      }
      
      if (mode === 'spaced_revision' && spacedRevisionChapters.length > 0) {
        const spacedInSubject = spacedRevisionChapters.filter(chId =>
          availableChapters.some(c => c.id === chId)
        )
        return {
          ...prev,
          specialMode: mode,
          selectedChapters: spacedInSubject.length > 0 ? spacedInSubject : prev.selectedChapters
        }
      }
      
      return { ...prev, specialMode: mode }
    })
  }, [userWeakChapters, spacedRevisionChapters, availableChapters])

  const handleGenerate = useCallback(async () => {
    if (!preview?.canGenerate) return
    await onGenerate(config)
  }, [config, preview, onGenerate])

  return (
    <div className="space-y-6">
      {/* Hero Composer Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-blue-50/30 to-white border border-blue-100 shadow-xl"
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-100 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-50 to-transparent rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="relative p-6 lg:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <motion.h2 
                className="text-2xl font-bold text-gray-900 flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                Smart Test Builder
              </motion.h2>
              <motion.p 
                className="text-gray-500 mt-1 ml-14"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                Create personalized tests with intelligent difficulty balancing
              </motion.p>
            </div>

            {/* Test Mode Toggle */}
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-1.5">
              {[
                { mode: 'fixed' as const, label: 'Fixed', icon: <Layers className="h-4 w-4" /> },
                { mode: 'adaptive' as const, label: 'Adaptive', icon: <Brain className="h-4 w-4" /> },
              ].map(({ mode, label, icon }) => (
                <motion.button
                  key={mode}
                  onClick={() => setConfig(prev => ({ ...prev, testMode: mode }))}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    config.testMode === mode
                      ? "bg-white text-blue-600 shadow-sm border border-blue-100"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {icon}
                  {label}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Configuration */}
            <div className="lg:col-span-2 space-y-6">
              {/* Subject Selection */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 block">Select Subject</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {subjects.map((subject) => {
                    const isSelected = config.selectedSubject === subject.id
                    return (
                      <motion.button
                        key={subject.id}
                        onClick={() => handleSubjectSelect(subject.id)}
                        className={cn(
                          "relative p-4 rounded-xl border-2 text-left transition-all duration-200",
                          isSelected 
                            ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-500/10" 
                            : "border-gray-200 bg-white hover:border-blue-200 hover:shadow-sm"
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: subject.color + '20' }}
                          >
                            <BookOpen className="h-5 w-5" style={{ color: subject.color }} />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{subject.name}</div>
                            <div className="text-xs text-gray-500">{subject.chapters?.length || 0} chapters</div>
                          </div>
                        </div>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 right-2"
                          >
                            <CheckCircle2 className="h-5 w-5 text-blue-600" />
                          </motion.div>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* Special Mode Buttons */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 block">Quick Build Modes</label>
                <div className="flex flex-wrap gap-3">
                  <SpecialModeButton
                    icon={<TrendingDown className="h-4 w-4" />}
                    label="Build From Weak Topics"
                    description="Focus on your lowest mastery areas"
                    active={config.specialMode === 'weak_topics'}
                    onClick={() => handleSpecialMode(config.specialMode === 'weak_topics' ? 'none' : 'weak_topics')}
                    badge={userWeakChapters.length > 0 ? `${userWeakChapters.length} weak` : undefined}
                    disabled={!config.selectedSubject}
                  />
                  <SpecialModeButton
                    icon={<Award className="h-4 w-4" />}
                    label="PYQ Only Mode"
                    description="Previous year questions exclusively"
                    active={config.specialMode === 'pyq_only'}
                    onClick={() => handleSpecialMode(config.specialMode === 'pyq_only' ? 'none' : 'pyq_only')}
                    disabled={!config.selectedSubject}
                  />
                  <SpecialModeButton
                    icon={<Calendar className="h-4 w-4" />}
                    label="Spaced Revision"
                    description="Topics due for review"
                    active={config.specialMode === 'spaced_revision'}
                    onClick={() => handleSpecialMode(config.specialMode === 'spaced_revision' ? 'none' : 'spaced_revision')}
                    badge={spacedRevisionChapters.length > 0 ? `${spacedRevisionChapters.length} due` : undefined}
                    disabled={!config.selectedSubject}
                  />
                </div>
              </div>

              {/* Chapter Selection */}
              {config.selectedSubject && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-gray-700">Select Chapters</label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const subject = subjects.find(s => s.id === config.selectedSubject)
                          setConfig(prev => ({
                            ...prev,
                            selectedChapters: subject?.chapters?.map(c => c.id) || []
                          }))
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        Select All
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfig(prev => ({ ...prev, selectedChapters: [] }))}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-2">
                    {availableChapters.map((chapter) => {
                      const isSelected = config.selectedChapters.includes(chapter.id)
                      const mastery = userMasteryData[chapter.id]
                      const isWeak = userWeakChapters.includes(chapter.id)
                      
                      return (
                        <motion.button
                          key={chapter.id}
                          onClick={() => handleChapterToggle(chapter.id)}
                          className={cn(
                            "relative p-3 rounded-lg border text-left text-sm transition-all duration-200",
                            isSelected
                              ? "border-blue-500 bg-blue-50 text-blue-900"
                              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                          )}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-medium truncate flex-1">{chapter.name}</div>
                            {isWeak && (
                              <Badge variant="outline" className="ml-1 text-xs border-amber-300 text-amber-600">
                                Weak
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-1 text-xs text-gray-400">
                            <span>{chapter.questionCount || 0} Q</span>
                            {mastery !== undefined && (
                              <span className={cn(
                                "font-medium",
                                mastery < 40 ? "text-red-500" : mastery < 70 ? "text-amber-500" : "text-emerald-500"
                              )}>
                                {Math.round(mastery)}%
                              </span>
                            )}
                          </div>
                        </motion.button>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {/* Difficulty Mix */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 block flex items-center gap-2">
                  <PieChart className="h-4 w-4 text-blue-600" />
                  Difficulty Mix
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {(['easy', 'medium', 'hard'] as const).map((diff) => (
                    <DifficultySlider
                      key={diff}
                      difficulty={diff}
                      value={config.difficultyMix[diff]}
                      onChange={(v) => handleDifficultyMixChange(diff, v)}
                      available={availableByDifficulty[diff]}
                    />
                  ))}
                </div>
              </div>

              {/* Quick Stats - Questions & Time */}
              <div className="grid grid-cols-2 gap-4">
                <AnimatedStatCard
                  icon={<BookOpen className="h-4 w-4" />}
                  label="Questions"
                  value={config.questionCount}
                  onChange={(v) => setConfig(prev => ({ ...prev, questionCount: v }))}
                  min={5}
                  max={100}
                  step={5}
                  color="blue"
                />
                <AnimatedStatCard
                  icon={<Clock className="h-4 w-4" />}
                  label="Time (minutes)"
                  value={config.timeLimit}
                  onChange={(v) => setConfig(prev => ({ ...prev, timeLimit: v }))}
                  min={15}
                  max={180}
                  step={15}
                  color="purple"
                />
              </div>
            </div>

            {/* Right Column - Live Preview */}
            <div className="space-y-4">
              {isLoadingPreview ? (
                <div className="h-80 flex items-center justify-center">
                  <Shimmer className="w-full h-full rounded-xl" />
                </div>
              ) : preview ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4"
                >
                  {/* Difficulty Ring */}
                  <Card className="bg-white border border-gray-200 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center">
                        <DifficultyRing 
                          value={preview.estimatedDifficulty} 
                          size={160}
                          strokeWidth={14}
                        />
                        <div className="mt-4 text-center">
                          <div className="text-sm text-gray-500">Estimated Difficulty</div>
                          <div className="text-2xl font-bold text-gray-900 mt-1">
                            {getDifficultyLabel(preview.estimatedDifficulty)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Predicted Score Band */}
                  <Card className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 shadow-sm">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Target className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-semibold text-gray-700">Predicted Score Band</span>
                      </div>
                      <div className="flex items-end gap-1">
                        <span className="text-3xl font-bold text-blue-600">{preview.predictedScoreMin}%</span>
                        <span className="text-xl text-gray-400 mb-1">—</span>
                        <span className="text-3xl font-bold text-blue-600">{preview.predictedScoreMax}%</span>
                      </div>
                      <div className="mt-3 h-3 bg-gray-100 rounded-full overflow-hidden relative">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${preview.predictedMax}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                          className="absolute left-0 h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                          style={{ 
                            left: `${preview.predictedScoreMin}%`,
                            width: `${preview.predictedScoreMax - preview.predictedScoreMin}%` 
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>0%</span>
                        <span>100%</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Question Breakdown */}
                  <Card className="bg-white border border-gray-200 shadow-sm">
                    <CardContent className="p-4">
                      <div className="text-xs font-medium text-gray-500 mb-3">Question Breakdown</div>
                      <div className="space-y-2">
                        {(['easy', 'medium', 'hard'] as const).map((diff) => (
                          <div key={diff} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "w-3 h-3 rounded-full",
                                diff === 'easy' ? "bg-emerald-500" : diff === 'medium' ? "bg-amber-500" : "bg-red-500"
                              )} />
                              <span className="text-sm text-gray-600 capitalize">{diff}</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">
                              {preview.questionBreakdown[diff]} Q
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Coverage Status */}
                  <Card className="bg-white border border-gray-200 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">Available Questions</span>
                        <span className={cn(
                          "text-sm font-semibold",
                          preview.availableQuestions >= config.questionCount ? "text-emerald-600" : "text-amber-600"
                        )}>
                          {preview.availableQuestions} / {config.questionCount}
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(100, (preview.availableQuestions / config.questionCount) * 100)} 
                        className="mt-2 h-2"
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardContent className="p-8 flex flex-col items-center justify-center text-gray-400">
                    <BookOpen className="h-12 w-12 mb-3 opacity-50" />
                    <p className="text-sm text-center">Select a subject and chapters<br />to see live preview</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Warnings */}
          <AnimatePresence>
            {preview?.warnings && preview.warnings.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 space-y-2"
              >
                {preview.warnings.map((warning, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200"
                  >
                    <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Adjustment Needed</p>
                      <p className="text-sm text-amber-700 mt-1">{warning}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Generate Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Button
          onClick={handleGenerate}
          disabled={!preview?.canGenerate || isGenerating || config.selectedChapters.length === 0}
          className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-lg shadow-lg shadow-blue-500/25 transition-all duration-200"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              Building Your Test...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 mr-2" />
              Generate {config.testMode === 'adaptive' ? 'Adaptive ' : ''}Test
              <ChevronRight className="h-5 w-5 ml-2" />
            </>
          )}
        </Button>
      </motion.div>

      {/* Advanced Options (collapsible) */}
      <Card className="border border-gray-200 shadow-sm">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Advanced Options</span>
          </div>
          <motion.div
            animate={{ rotate: showAdvanced ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="h-4 w-4 text-gray-400 rotate-90" />
          </motion.div>
        </button>
        
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CardContent className="pt-0 pb-4">
                <div className="flex gap-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={config.includeConceptual}
                      onCheckedChange={(v) => setConfig(prev => ({ ...prev, includeConceptual: v }))}
                    />
                    <label className="text-sm text-gray-600">Include Conceptual Questions</label>
                  </div>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  )
}

// ============================================
// SUB-COMPONENTS
// ============================================

interface SpecialModeButtonProps {
  icon: React.ReactNode
  label: string
  description: string
  active: boolean
  onClick: () => void
  badge?: string
  disabled?: boolean
}

function SpecialModeButton({ icon, label, description, active, onClick, badge, disabled }: SpecialModeButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200",
        active
          ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-500/10"
          : "border-gray-200 bg-white hover:border-blue-200 hover:shadow-sm",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
    >
      <div className={cn(
        "p-2 rounded-lg",
        active ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
      )}>
        {icon}
      </div>
      <div>
        <div className="font-semibold text-gray-900 flex items-center gap-2">
          {label}
          {badge && (
            <Badge variant="outline" className="text-xs border-blue-200 text-blue-600">
              {badge}
            </Badge>
          )}
        </div>
        <div className="text-xs text-gray-500">{description}</div>
      </div>
      {active && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2"
        >
          <CheckCircle2 className="h-5 w-5 text-blue-600" />
        </motion.div>
      )}
    </motion.button>
  )
}

interface DifficultySliderProps {
  difficulty: 'easy' | 'medium' | 'hard'
  value: number
  onChange: (value: number) => void
  available: number
}

function DifficultySlider({ difficulty, value, onChange, available }: DifficultySliderProps) {
  const colors = {
    easy: { bg: 'bg-emerald-100', text: 'text-emerald-600', ring: 'bg-emerald-500' },
    medium: { bg: 'bg-amber-100', text: 'text-amber-600', ring: 'bg-amber-500' },
    hard: { bg: 'bg-red-100', text: 'text-red-600', ring: 'bg-red-500' }
  }

  return (
    <div className={cn("rounded-xl p-4", colors[difficulty].bg)}>
      <div className="flex items-center justify-between mb-2">
        <span className={cn("text-sm font-semibold capitalize", colors[difficulty].text)}>
          {difficulty}
        </span>
        <span className="text-lg font-bold text-gray-900">{value}%</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={0}
        max={100}
        step={5}
        className="w-full"
      />
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>{available} available</span>
      </div>
    </div>
  )
}

interface AnimatedStatCardProps {
  icon: React.ReactNode
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
  color: 'blue' | 'purple'
}

function AnimatedStatCard({ icon, label, value, onChange, min, max, step, color }: AnimatedStatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-100',
    purple: 'bg-purple-50 border-purple-100'
  }

  return (
    <div className={cn("rounded-xl p-4 border", colorClasses[color])}>
      <div className="flex items-center gap-2 text-gray-500 mb-2">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <AnimatedCounter 
          value={value} 
          className={cn("text-2xl font-bold", color === 'blue' ? 'text-blue-600' : 'text-purple-600')}
        />
        <div className="flex-1 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange(Math.max(min, value - step))}
            className="h-8 w-8 p-0"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Slider
            value={[value]}
            onValueChange={([v]) => onChange(v)}
            min={min}
            max={max}
            step={step}
            className="flex-1"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange(Math.min(max, value + step))}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function getDifficultyLabel(value: number): string {
  if (value < 30) return 'Easy'
  if (value < 50) return 'Moderate'
  if (value < 70) return 'Challenging'
  return 'Hard'
}

// ============================================
// EXPORTS
// ============================================

export type { SmartTestConfig, TestPreview, DifficultyMix }
