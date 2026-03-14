'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  GraduationCap, 
  BookOpen, 
  Clock, 
  Target, 
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Sliders,
  Shield,
  Zap,
  Info,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  TimeBar, 
  CoverageMeter,
  AnimatedCounter,
  Shimmer
} from './motion'
import type { 
  Grade, 
  TargetExam, 
  Difficulty, 
  TestType,
  ProctorMode,
  TestComposerConfig,
  TestComposerPreview,
  Subject,
  Chapter
} from '@/modules/tests/types'

// ============================================
// TEST COMPOSER - Hero Component
// ============================================

interface TestComposerProps {
  subjects: Subject[]
  onGenerate: (config: TestComposerConfig) => Promise<void>
  isGenerating?: boolean
}

export function TestComposer({ subjects, onGenerate, isGenerating = false }: TestComposerProps) {
  // Configuration State
  const [config, setConfig] = useState<TestComposerConfig>({
    name: '',
    grade: '12th',
    targetExam: 'JEE',
    selectedSubjects: [],
    selectedChapters: [],
    chapterWeights: {},
    difficulty: 'medium',
    questionCount: 30,
    timeLimit: 60,
    includePYQ: true,
    includeConceptual: true,
    testType: 'practice',
    isAutoBalanced: true,
    proctorMode: 'none'
  })

  const [preview, setPreview] = useState<TestComposerPreview | null>(null)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)
  const [activeTab, setActiveTab] = useState('subjects')

  // Derived values
  const availableChapters = useMemo(() => {
    return subjects
      .filter(s => config.selectedSubjects.includes(s.id))
      .flatMap(s => s.chapters || [])
  }, [subjects, config.selectedSubjects])

  const availableQuestionCount = useMemo(() => {
    return availableChapters
      .filter(c => config.selectedChapters.includes(c.id))
      .reduce((sum, c) => sum + (c.questionCount || 0), 0)
  }, [availableChapters, config.selectedChapters])

  // Generate preview when config changes
  useEffect(() => {
    const generatePreview = async () => {
      if (config.selectedChapters.length === 0) {
        setPreview(null)
        return
      }

      setIsLoadingPreview(true)
      // Simulate preview generation
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const selectedSubjectData = subjects.filter(s => config.selectedSubjects.includes(s.id))
      const difficultyMap = { easy: 30, medium: 50, hard: 70, mixed: 50 }
      const baseDifficulty = difficultyMap[config.difficulty]
      
      // Calculate subject distribution
      const subjectDistribution = selectedSubjectData.map(subject => {
        const subjectChapters = (subject.chapters || []).filter(c => config.selectedChapters.includes(c.id))
        const totalQuestions = subjectChapters.reduce((sum, c) => sum + (c.questionCount || 0), 0)
        const percentage = availableQuestionCount > 0 ? (totalQuestions / availableQuestionCount) * 100 : 0
        return {
          subjectId: subject.id,
          subjectName: subject.name,
          questionCount: Math.round((percentage / 100) * config.questionCount),
          percentage: Math.round(percentage),
          color: subject.color
        }
      })

      // Calculate coverage score
      const coverageScore = Math.min(100, Math.round((availableQuestionCount / config.questionCount) * 100))

      setPreview({
        estimatedDifficulty: baseDifficulty + Math.random() * 10 - 5,
        estimatedTime: config.timeLimit,
        coverageScore,
        availableQuestions: availableQuestionCount,
        subjectDistribution,
        chapterDistribution: availableChapters
          .filter(c => config.selectedChapters.includes(c.id))
          .map(c => ({
            chapterId: c.id,
            chapterName: c.name,
            subjectName: subjects.find(s => s.id === c.subjectId)?.name || '',
            questionCount: Math.round((c.questionCount || 0) / availableQuestionCount * config.questionCount),
            availableCount: c.questionCount || 0
          })),
        warnings: availableQuestionCount < config.questionCount 
          ? [`Only ${availableQuestionCount} questions available. Consider reducing question count or adding more chapters.`]
          : [],
        recommendations: []
      })
      
      setIsLoadingPreview(false)
    }

    const debounce = setTimeout(generatePreview, 200)
    return () => clearTimeout(debounce)
  }, [config, subjects, availableChapters, availableQuestionCount])

  // Handlers
  const handleSubjectToggle = useCallback((subjectId: string) => {
    setConfig(prev => {
      const newSelected = prev.selectedSubjects.includes(subjectId)
        ? prev.selectedSubjects.filter(id => id !== subjectId)
        : [...prev.selectedSubjects, subjectId]
      
      // Auto-select all chapters for newly selected subject
      const subject = subjects.find(s => s.id === subjectId)
      const newChapters = prev.selectedSubjects.includes(subjectId)
        ? prev.selectedChapters.filter(cid => !(subject?.chapters || []).find(c => c.id === cid))
        : [...prev.selectedChapters, ...(subject?.chapters || []).map(c => c.id)]
      
      return {
        ...prev,
        selectedSubjects: newSelected,
        selectedChapters: newChapters
      }
    })
  }, [subjects])

  const handleChapterToggle = useCallback((chapterId: string) => {
    setConfig(prev => ({
      ...prev,
      selectedChapters: prev.selectedChapters.includes(chapterId)
        ? prev.selectedChapters.filter(id => id !== chapterId)
        : [...prev.selectedChapters, chapterId]
    }))
  }, [])

  const handleGenerate = useCallback(async () => {
    if (!preview || preview.warnings.length > 0) return
    await onGenerate(config)
  }, [config, preview, onGenerate])

  return (
    <div className="space-y-6">
      {/* Hero Preview Canvas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-blue-50/30 to-white border border-gray-200 shadow-lg"
      >
        {/* Animated Background */}
        <div className="absolute inset-0 bg-mesh-elevated opacity-50" />
        
        <div className="relative p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left - Configuration Summary */}
            <div className="flex-1 space-y-6">
              <div>
                <motion.h2 
                  className="text-2xl font-bold text-gray-900"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  Test Composer
                </motion.h2>
                <motion.p 
                  className="text-gray-500 mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  Configure your personalized test with real-time preview
                </motion.p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard
                  icon={<BookOpen className="h-4 w-4" />}
                  label="Questions"
                  value={config.questionCount}
                  onChange={(v) => setConfig(prev => ({ ...prev, questionCount: v }))}
                  min={5}
                  max={100}
                  step={5}
                />
                <StatCard
                  icon={<Clock className="h-4 w-4" />}
                  label="Minutes"
                  value={config.timeLimit}
                  onChange={(v) => setConfig(prev => ({ ...prev, timeLimit: v }))}
                  min={15}
                  max={180}
                  step={15}
                />
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-500 mb-2 block">Difficulty</label>
                  <div className="flex gap-2">
                    {(['easy', 'medium', 'hard', 'mixed'] as Difficulty[]).map((d) => (
                      <motion.button
                        key={d}
                        onClick={() => setConfig(prev => ({ ...prev, difficulty: d }))}
                        className={cn(
                          "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200",
                          config.difficulty === d
                            ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {d.charAt(0).toUpperCase() + d.slice(1)}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Test Type Selection */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-2 block">Test Type</label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { type: 'practice' as TestType, label: 'Practice', icon: <BookOpen className="h-4 w-4" /> },
                    { type: 'exam' as TestType, label: 'Exam Mode', icon: <Target className="h-4 w-4" /> },
                    { type: 'adaptive' as TestType, label: 'Adaptive', icon: <Zap className="h-4 w-4" /> },
                    { type: 'pyq' as TestType, label: 'PYQ Only', icon: <Sparkles className="h-4 w-4" /> },
                  ].map(({ type, label, icon }) => (
                    <motion.button
                      key={type}
                      onClick={() => setConfig(prev => ({ ...prev, testType: type }))}
                      className={cn(
                        "flex items-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 border",
                        config.testType === type
                          ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                          : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
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
            </div>

            {/* Right - Live Preview */}
            <div className="lg:w-80 space-y-4">
              {isLoadingPreview ? (
                <div className="h-64 flex items-center justify-center">
                  <Shimmer className="w-full h-full rounded-xl" />
                </div>
              ) : preview ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4"
                >
                  {/* Difficulty Ring */}
                  <div className="flex justify-center">
                    <DifficultyRing 
                      value={preview.estimatedDifficulty} 
                      size={140}
                      strokeWidth={12}
                    />
                  </div>

                  {/* Time Bar */}
                  <TimeBar 
                    minutes={preview.estimatedTime} 
                    questionCount={config.questionCount}
                  />

                  {/* Coverage Meter */}
                  <CoverageMeter 
                    value={preview.coverageScore}
                    available={preview.availableQuestions}
                    required={config.questionCount}
                  />

                  {/* Subject Distribution */}
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-500">Subject Distribution</div>
                    <div className="space-y-2">
                      {preview.subjectDistribution.map((subject, idx) => (
                        <motion.div
                          key={subject.subjectId}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex items-center gap-2"
                        >
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: subject.color }}
                          />
                          <span className="text-sm text-gray-600 flex-1">{subject.subjectName}</span>
                          <span className="text-sm font-medium text-gray-900">{subject.questionCount} Q</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                  <BookOpen className="h-12 w-12 mb-3 opacity-50" />
                  <p className="text-sm text-center">Select subjects and chapters<br />to see preview</p>
                </div>
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
                className="mt-6"
              >
                {preview.warnings.map((warning, idx) => (
                  <div 
                    key={idx}
                    className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200"
                  >
                    <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Insufficient Questions</p>
                      <p className="text-sm text-amber-700 mt-1">{warning}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Subject & Chapter Selection */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white pb-4">
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-600" />
            Select Content
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-gray-100 p-1 h-auto mb-4">
              <TabsTrigger 
                value="subjects"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm px-4 py-2"
              >
                By Subject
              </TabsTrigger>
              <TabsTrigger 
                value="chapters"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm px-4 py-2"
              >
                By Chapter
              </TabsTrigger>
            </TabsList>

            <TabsContent value="subjects" className="mt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {subjects.map((subject) => {
                  const isSelected = config.selectedSubjects.includes(subject.id)
                  const chapterCount = (subject.chapters || []).length
                  
                  return (
                    <motion.button
                      key={subject.id}
                      onClick={() => handleSubjectToggle(subject.id)}
                      className={cn(
                        "relative p-4 rounded-xl border-2 text-left transition-all duration-200",
                        isSelected 
                          ? "border-blue-500 bg-blue-50" 
                          : "border-gray-200 bg-white hover:border-gray-300"
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
                          <div className="text-xs text-gray-500">{chapterCount} chapters</div>
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
            </TabsContent>

            <TabsContent value="chapters" className="mt-0">
              {config.selectedSubjects.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Select subjects first to view chapters</p>
                </div>
              ) : (
                <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
                  {subjects
                    .filter(s => config.selectedSubjects.includes(s.id))
                    .map((subject) => (
                      <div key={subject.id}>
                        <div className="flex items-center gap-2 mb-3">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: subject.color }}
                          />
                          <span className="font-semibold text-gray-900">{subject.name}</span>
                          <span className="text-sm text-gray-500">
                            ({(subject.chapters || []).filter(c => config.selectedChapters.includes(c.id)).length}/{(subject.chapters || []).length} selected)
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {(subject.chapters || []).map((chapter) => {
                            const isSelected = config.selectedChapters.includes(chapter.id)
                            return (
                              <motion.button
                                key={chapter.id}
                                onClick={() => handleChapterToggle(chapter.id)}
                                className={cn(
                                  "p-3 rounded-lg border text-left text-sm transition-all duration-200",
                                  isSelected
                                    ? "border-blue-500 bg-blue-50 text-blue-900"
                                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                                )}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                              >
                                <div className="font-medium">{chapter.name}</div>
                                <div className="text-xs text-gray-400 mt-1">
                                  {chapter.questionCount || 0} questions
                                </div>
                              </motion.button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Advanced Options */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white pb-4">
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Sliders className="h-4 w-4 text-blue-600" />
            Advanced Options
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Grade Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Grade</label>
              <Select
                value={config.grade}
                onValueChange={(v: Grade) => setConfig(prev => ({ ...prev, grade: v }))}
              >
                <SelectTrigger className="border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="11th">11th Grade</SelectItem>
                  <SelectItem value="12th">12th Grade</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Target Exam */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Target Exam</label>
              <Select
                value={config.targetExam}
                onValueChange={(v: TargetExam) => setConfig(prev => ({ ...prev, targetExam: v }))}
              >
                <SelectTrigger className="border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JEE">JEE Main/Advanced</SelectItem>
                  <SelectItem value="NEET">NEET</SelectItem>
                  <SelectItem value="Boards">Board Exams</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Proctoring Mode */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Proctoring
              </label>
              <Select
                value={config.proctorMode}
                onValueChange={(v: ProctorMode) => setConfig(prev => ({ ...prev, proctorMode: v }))}
              >
                <SelectTrigger className="border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="lightweight">Lightweight</SelectItem>
                  <SelectItem value="full">Full Proctoring</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Auto Balance */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Auto Balance</label>
              <div className="flex items-center gap-3 h-10">
                <Switch
                  checked={config.isAutoBalanced}
                  onCheckedChange={(v) => setConfig(prev => ({ ...prev, isAutoBalanced: v }))}
                />
                <span className="text-sm text-gray-600">
                  {config.isAutoBalanced ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-6 mt-6 pt-6 border-t border-gray-100">
            {/* Include PYQ */}
            <div className="flex items-center gap-3">
              <Switch
                checked={config.includePYQ}
                onCheckedChange={(v) => setConfig(prev => ({ ...prev, includePYQ: v }))}
              />
              <label className="text-sm text-gray-600">Include PYQs</label>
            </div>

            {/* Include Conceptual */}
            <div className="flex items-center gap-3">
              <Switch
                checked={config.includeConceptual}
                onCheckedChange={(v) => setConfig(prev => ({ ...prev, includeConceptual: v }))}
              />
              <label className="text-sm text-gray-600">Include Conceptual</label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generate Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Button
          onClick={handleGenerate}
          disabled={!preview || preview.warnings.length > 0 || isGenerating || config.selectedChapters.length === 0}
          className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-lg shadow-lg shadow-blue-500/25 transition-all duration-200"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              Generating Test...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 mr-2" />
              Generate Test
              <ChevronRight className="h-5 w-5 ml-2" />
            </>
          )}
        </Button>
      </motion.div>
    </div>
  )
}

// ============================================
// STAT CARD WITH SLIDER
// ============================================

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
}

function StatCard({ icon, label, value, onChange, min, max, step }: StatCardProps) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="flex items-center gap-2 text-gray-500 mb-2">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <AnimatedCounter 
          value={value} 
          className="text-2xl font-bold text-gray-900"
        />
        <div className="flex-1">
          <Slider
            value={[value]}
            onValueChange={([v]) => onChange(v)}
            min={min}
            max={max}
            step={step}
            className="w-full"
          />
        </div>
      </div>
    </div>
  )
}
