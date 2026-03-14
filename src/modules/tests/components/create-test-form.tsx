'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Sparkles, 
  Loader2, 
  BookOpen, 
  Clock, 
  Target,
  CheckCircle2,
  AlertCircle,
  Zap,
  Info,
  ArrowRight
} from 'lucide-react'
import { cn } from '../utils'
import { useRouter } from 'next/navigation'
import type { Grade, TargetExam, Difficulty, TestType, Subject, Chapter } from '../types'

interface CreateTestFormProps {
  standalone?: boolean
}

export function CreateTestForm({ standalone = false }: CreateTestFormProps) {
  const router = useRouter()
  
  // Loading states
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  
  // Data from API
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [chapters, setChapters] = useState<Chapter[]>([])
  
  // Form state
  const [grade, setGrade] = useState<Grade>('12th')
  const [targetExam, setTargetExam] = useState<TargetExam>('JEE')
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [selectedChapters, setSelectedChapters] = useState<string[]>([])
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [questionCount, setQuestionCount] = useState(30)
  const [timeLimit, setTimeLimit] = useState(60)
  const [includePYQ, setIncludePYQ] = useState(true)
  const [includeConceptual, setIncludeConceptual] = useState(true)
  const [testType, setTestType] = useState<TestType>('practice')
  const [subjectDistribution, setSubjectDistribution] = useState<Record<string, number>>({})
  
  // UI state
  const [preview, setPreview] = useState<{
    availableQuestions: number
    estimatedDifficulty: number
    coverageBreakdown: { subject: string; chapters: number; questions: number }[]
    warnings: string[]
  } | null>(null)

  // Fetch subjects and chapters
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subjectsRes, chaptersRes] = await Promise.all([
          fetch('/api/tests/subjects'),
          fetch('/api/tests/chapters')
        ])
        
        if (subjectsRes.ok) {
          const data = await subjectsRes.json()
          setSubjects(data.subjects || [])
        }
        
        if (chaptersRes.ok) {
          const data = await chaptersRes.json()
          setChapters(data.chapters || [])
        }
      } catch (error) {
        // Error handling
      } finally {
        setIsLoadingData(false)
      }
    }
    
    fetchData()
  }, [])

  // Filter chapters based on grade and selected subjects
  const filteredChapters = chapters.filter((chapter) => {
    const matchesGrade = chapter.grade === grade
    const matchesSubject = selectedSubjects.length === 0 || selectedSubjects.includes(chapter.subjectId)
    return matchesGrade && matchesSubject
  })

  // Calculate preview
  useEffect(() => {
    if (selectedChapters.length === 0) {
      setPreview(null)
      return
    }

    const chaptersBySubject = new Map<string, string[]>()
    selectedChapters.forEach((chapterId) => {
      const chapter = chapters.find((c) => c.id === chapterId)
      if (chapter) {
        if (!chaptersBySubject.has(chapter.subjectId)) {
          chaptersBySubject.set(chapter.subjectId, [])
        }
        chaptersBySubject.get(chapter.subjectId)!.push(chapterId)
      }
    })

    const coverageBreakdown: { subject: string; chapters: number; questions: number }[] = []
    chaptersBySubject.forEach((chapterIds, subjectId) => {
      const subject = subjects.find((s) => s.id === subjectId)
      if (subject) {
        coverageBreakdown.push({
          subject: subject.name,
          chapters: chapterIds.length,
          questions: Math.ceil(questionCount / selectedChapters.length * chapterIds.length)
        })
      }
    })

    const difficultyValues = { easy: 1, medium: 2, hard: 3, mixed: 2 }
    const estimatedDifficulty = difficultyValues[difficulty]

    const warnings: string[] = []
    if (questionCount > selectedChapters.length * 10) {
      warnings.push('High question count may result in repeated questions')
    }
    if (selectedSubjects.length === 0) {
      warnings.push('Select at least one subject')
    }

    setPreview({
      availableQuestions: questionCount,
      estimatedDifficulty,
      coverageBreakdown,
      warnings
    })
  }, [selectedChapters, selectedSubjects, questionCount, difficulty, chapters, subjects])

  // Handlers
  const handleSubjectToggle = (subjectId: string) => {
    setSelectedSubjects((prev) => {
      const newSelection = prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
      
      if (newSelection.length < prev.length) {
        const removedSubject = prev.find((id) => !newSelection.includes(id))
        if (removedSubject) {
          setSelectedChapters((chapters) =>
            chapters.filter((cId) => {
              const chapter = chapters.find((c) => c.id === cId)
              return chapter?.subjectId !== removedSubject
            })
          )
        }
      }
      
      return newSelection
    })
  }

  const handleChapterToggle = (chapterId: string) => {
    setSelectedChapters((prev) =>
      prev.includes(chapterId)
        ? prev.filter((id) => id !== chapterId)
        : [...prev, chapterId]
    )
  }

  const handleSelectAllChapters = () => {
    if (selectedChapters.length === filteredChapters.length) {
      setSelectedChapters([])
    } else {
      setSelectedChapters(filteredChapters.map((c) => c.id))
    }
  }

  const handleGenerate = async () => {
    if (selectedChapters.length === 0) return
    
    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/tests/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade,
          targetExam,
          subjectIds: selectedSubjects,
          chapterIds: selectedChapters,
          difficulty,
          questionCount,
          timeLimit,
          includePYQ,
          includeConceptual,
          testType,
          subjectDistribution
        })
      })

      if (!response.ok) throw new Error('Failed to generate test')
      
      const data = await response.json()
      router.push(`/tests/${data.testId}`)
    } catch (error) {
      // Error handling
    } finally {
      setIsGenerating(false)
    }
  }

  if (isLoadingData) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          "bg-white border border-gray-200 rounded-xl shadow-sm",
          standalone ? "min-h-screen rounded-none" : ""
        )}
      >
        <CardContent className="flex items-center justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 className="h-8 w-8 text-blue-600" />
          </motion.div>
        </CardContent>
      </motion.div>
    )
  }

  const FormContent = () => (
    <div className="space-y-6">
      {/* Step 1: Exam Configuration */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
          <motion.div 
            className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm"
            whileHover={{ scale: 1.1 }}
          >
            1
          </motion.div>
          Exam Configuration
        </div>
        
        <div className="grid grid-cols-2 gap-4 pl-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-2"
          >
            <Label className="text-xs text-gray-500 uppercase tracking-wide">Grade</Label>
            <Select value={grade} onValueChange={(v) => setGrade(v as Grade)}>
              <SelectTrigger className="border-gray-200 bg-white hover:border-blue-300 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="11th">11th Grade</SelectItem>
                <SelectItem value="12th">12th Grade</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <Label className="text-xs text-gray-500 uppercase tracking-wide">Target Exam</Label>
            <Select value={targetExam} onValueChange={(v) => setTargetExam(v as TargetExam)}>
              <SelectTrigger className="border-gray-200 bg-white hover:border-blue-300 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="JEE">JEE Main/Advanced</SelectItem>
                <SelectItem value="NEET">NEET</SelectItem>
                <SelectItem value="Boards">Board Exams</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>
        </div>
      </motion.div>

      <Separator className="bg-gray-100" />

      {/* Step 2: Subject Selection */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
          <motion.div 
            className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm"
            whileHover={{ scale: 1.1 }}
          >
            2
          </motion.div>
          Select Subjects
        </div>
        
        <div className="flex flex-wrap gap-2 pl-8">
          <AnimatePresence mode="popLayout">
            {subjects.map((subject, index) => {
              const isSelected = selectedSubjects.includes(subject.id)
              return (
                <motion.button
                  key={subject.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSubjectToggle(subject.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all duration-200",
                    isSelected
                      ? "border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100/50 text-blue-700 shadow-sm"
                      : "border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-gray-50"
                  )}
                >
                  <motion.div
                    animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.2 }}
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: subject.color }}
                  />
                  <span className="font-medium text-sm">{subject.name}</span>
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              )
            })}
          </AnimatePresence>
        </div>
      </motion.div>

      <Separator className="bg-gray-100" />

      {/* Step 3: Chapter Selection */}
      <AnimatePresence>
        {selectedSubjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                <motion.div 
                  className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm"
                  whileHover={{ scale: 1.1 }}
                >
                  3
                </motion.div>
                Select Chapters
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAllChapters}
                className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                {selectedChapters.length === filteredChapters.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            
            <ScrollArea className="h-48 w-full rounded-xl border border-gray-100 p-3 bg-gray-50/50">
              {selectedSubjects.map((subjectId, sIndex) => {
                const subject = subjects.find((s) => s.id === subjectId)
                const subjectChapters = filteredChapters.filter((c) => c.subjectId === subjectId)
                
                if (!subject || subjectChapters.length === 0) return null
                
                return (
                  <motion.div
                    key={subjectId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: sIndex * 0.1 }}
                    className="mb-4 last:mb-0"
                  >
                    <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: subject.color }}
                      />
                      {subject.name}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {subjectChapters.map((chapter, cIndex) => {
                        const isSelected = selectedChapters.includes(chapter.id)
                        return (
                          <motion.label
                            key={chapter.id}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: cIndex * 0.02 }}
                            className={cn(
                              "flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all text-sm",
                              isSelected
                                ? "bg-blue-50 border border-blue-200"
                                : "hover:bg-white border border-transparent hover:border-gray-200"
                            )}
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleChapterToggle(chapter.id)}
                              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            />
                            <span className="text-gray-700">{chapter.name}</span>
                          </motion.label>
                        )
                      })}
                    </div>
                  </motion.div>
                )
              })}
            </ScrollArea>
            
            <AnimatePresence>
              {selectedChapters.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-wrap gap-1.5"
                >
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-medium">
                    {selectedChapters.length} chapters selected
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedSubjects.length > 0 && <Separator className="bg-gray-100" />}

      {/* Step 4: Test Configuration */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
          <motion.div 
            className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm"
            whileHover={{ scale: 1.1 }}
          >
            {selectedSubjects.length > 0 ? '4' : '3'}
          </motion.div>
          Test Configuration
        </div>
        
        <div className="pl-8 space-y-4">
          {/* Question Count Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-gray-500 uppercase tracking-wide">Questions</Label>
              <motion.span 
                key={questionCount}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-sm font-semibold text-blue-600"
              >
                {questionCount}
              </motion.span>
            </div>
            <Slider
              value={[questionCount]}
              onValueChange={(v) => setQuestionCount(v[0])}
              min={10}
              max={90}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>10</span>
              <span>90</span>
            </div>
          </div>
          
          {/* Time Limit & Difficulty */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Time (mins)
              </Label>
              <Input
                type="number"
                min={10}
                max={180}
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                className="border-gray-200 bg-white hover:border-blue-300 transition-colors"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5" />
                Difficulty
              </Label>
              <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
                <SelectTrigger className="border-gray-200 bg-white hover:border-blue-300 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Toggles */}
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer group">
              <Switch
                checked={includePYQ}
                onCheckedChange={setIncludePYQ}
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">Include PYQs</span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer group">
              <Switch
                checked={includeConceptual}
                onCheckedChange={setIncludeConceptual}
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">Conceptual</span>
            </label>
          </div>
          
          {/* Test Type */}
          <div className="space-y-2">
            <Label className="text-xs text-gray-500 uppercase tracking-wide">Test Mode</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'practice', label: 'Practice', icon: BookOpen },
                { value: 'exam', label: 'Timed', icon: Clock },
                { value: 'adaptive', label: 'Adaptive', icon: Zap }
              ].map((type) => (
                <motion.button
                  key={type.value}
                  onClick={() => setTestType(type.value as TestType)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200",
                    testType === type.value
                      ? "border-blue-500 bg-gradient-to-b from-blue-50 to-white text-blue-700 shadow-sm"
                      : "border-gray-200 bg-white text-gray-600 hover:border-blue-300"
                  )}
                >
                  <type.icon className="h-4 w-4" />
                  <span className="text-xs font-medium">{type.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Preview Section */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <Separator className="bg-gray-100" />
            
            <div className="rounded-xl p-4 space-y-3 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border border-blue-100">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Info className="h-4 w-4 text-blue-600" />
                </motion.div>
                Preview
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-sm">
                  <span className="text-gray-500">Questions:</span>
                  <span className="ml-2 font-medium text-gray-900">{preview.availableQuestions}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Duration:</span>
                  <span className="ml-2 font-medium text-gray-900">{timeLimit} mins</span>
                </div>
              </div>
              
              {preview.coverageBreakdown.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Coverage</div>
                  <div className="flex flex-wrap gap-2">
                    {preview.coverageBreakdown.map((item, i) => (
                      <motion.div
                        key={item.subject}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Badge
                          variant="outline"
                          className="border-blue-200 bg-white text-gray-700 font-medium"
                        >
                          {item.subject}: {item.questions}Q
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
              
              {preview.warnings.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-amber-600 flex items-start gap-1.5 bg-amber-50 p-2 rounded-lg"
                >
                  <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>{preview.warnings[0]}</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generate Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="pt-4"
      >
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || selectedChapters.length === 0}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-base shadow-lg shadow-blue-500/25 disabled:shadow-none"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Generating Test...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Generate Test
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </motion.div>
        
        <AnimatePresence>
          {selectedChapters.length === 0 && selectedSubjects.length > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs text-red-500 text-center mt-2"
            >
              Please select at least one chapter
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )

  if (standalone) {
    return (
      <div className="min-h-screen bg-gradient-page py-8">
        <div className="max-w-2xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-2xl font-bold text-gray-900">Create Custom Test</h1>
            <p className="text-gray-500">Generate a personalized test based on your preferences</p>
          </motion.div>
          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-200">
            <CardContent className="p-6">
              <FormContent />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-200 overflow-hidden">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white pb-4">
          <div className="flex items-center gap-3">
            <motion.div 
              className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20"
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="h-5 w-5 text-white" />
            </motion.div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Create Your Own Test
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Generate a personalized test based on your preferences
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <FormContent />
        </CardContent>
      </Card>
    </motion.div>
  )
}
