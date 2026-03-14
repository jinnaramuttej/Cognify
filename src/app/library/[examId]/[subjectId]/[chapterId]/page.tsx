'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Brain,
  Loader2,
  Sparkles,
  Star,
  Target,
  FileText,
  ArrowRight,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { getChapterWithConcepts, type SyllabusConcept } from '@/lib/library-service'

const DIFFICULTY_CONFIG: Record<number, { label: string; color: string }> = {
  1: { label: 'Easy', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  2: { label: 'Medium', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  3: { label: 'Moderate', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  4: { label: 'Hard', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  5: { label: 'Expert', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
}

export default function ChapterPage() {
  const params = useParams()
  const router = useRouter()
  const examId = params.examId as string
  const subjectId = params.subjectId as string
  const chapterId = params.chapterId as string

  const [chapter, setChapter] = useState<{
    id: string
    unit_id: string
    name: string
    class_level: string | null
    weightage: number
    concepts: SyllabusConcept[]
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getChapterWithConcepts(chapterId)
        setChapter(data)
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [chapterId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!chapter) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <BookOpen className="w-12 h-12 text-muted-foreground" />
        <p className="text-muted-foreground">Chapter not found</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
        <button onClick={() => router.push('/library')} className="hover:text-primary transition-colors">
          Library
        </button>
        <ChevronRight className="w-3 h-3 shrink-0" />
        <button onClick={() => router.push(`/library/${examId}/${subjectId}`)} className="hover:text-primary transition-colors">
          Subject
        </button>
        <ChevronRight className="w-3 h-3 shrink-0" />
        <span className="text-foreground font-medium">{chapter.name}</span>
      </div>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">{chapter.name}</h1>
        <div className="flex items-center gap-3 flex-wrap">
          {chapter.class_level && (
            <Badge variant="outline">Class {chapter.class_level}</Badge>
          )}
          {chapter.weightage > 1 && (
            <Badge variant="secondary">
              <Star className="w-3 h-3 mr-1" />
              Weightage: {chapter.weightage}
            </Badge>
          )}
          <Badge variant="secondary">
            <Brain className="w-3 h-3 mr-1" />
            {chapter.concepts.length} concept{chapter.concepts.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card
          className="p-4 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all group"
          onClick={() => router.push('/cogni')}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Ask Cogni</p>
              <p className="text-xs text-muted-foreground">AI Tutor help</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Target className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Practice</p>
              <p className="text-xs text-muted-foreground">Test yourself</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Notes</p>
              <p className="text-xs text-muted-foreground">Study material</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Concepts */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Concepts
        </h2>

        {chapter.concepts.length === 0 ? (
          <Card className="p-12 text-center">
            <Sparkles className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No concepts mapped yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Concepts will appear as the syllabus is populated.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {chapter.concepts.map((concept, i) => {
              const diff = DIFFICULTY_CONFIG[concept.difficulty_level || 2]
              return (
                <motion.div
                  key={concept.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card className="p-4 hover:shadow-md hover:border-primary/20 transition-all group">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">{concept.name}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          {diff && (
                            <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', diff.color)}>
                              {diff.label}
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Back Button */}
      <Button variant="outline" onClick={() => router.push(`/library/${examId}/${subjectId}`)}>
        <ChevronLeft className="w-4 h-4 mr-2" />
        Back to Subject
      </Button>
    </div>
  )
}
