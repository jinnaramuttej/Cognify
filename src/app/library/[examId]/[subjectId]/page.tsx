'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Layers,
  FileText,
  Loader2,
  GraduationCap,
  Sparkles,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  getSubjectWithFullTree,
  type SubjectWithUnits,
} from '@/lib/library-service'

export default function SubjectPage() {
  const params = useParams()
  const router = useRouter()
  const examId = params.examId as string
  const subjectId = params.subjectId as string

  const [subject, setSubject] = useState<SubjectWithUnits | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getSubjectWithFullTree(examId, subjectId)
        setSubject(data)
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [examId, subjectId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!subject) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <BookOpen className="w-12 h-12 text-muted-foreground" />
        <p className="text-muted-foreground">Subject not found</p>
        <Button variant="outline" onClick={() => router.push('/library')}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Library
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <button onClick={() => router.push('/library')} className="hover:text-primary transition-colors">
          Library
        </button>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">{subject.name}</span>
      </div>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
          <GraduationCap className="w-8 h-8 text-primary" />
          {subject.name}
        </h1>
        <p className="text-muted-foreground">
          {subject.units.length} unit{subject.units.length !== 1 ? 's' : ''} &bull;{' '}
          {subject.units.reduce((sum, u) => sum + u.chapters.length, 0)} chapters
        </p>
      </motion.div>

      {/* Units & Chapters */}
      <div className="space-y-6">
        {subject.units.length === 0 ? (
          <Card className="p-12 text-center">
            <Sparkles className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No units found for this subject.</p>
          </Card>
        ) : (
          subject.units.map((unit, uIdx) => (
            <motion.div
              key={unit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: uIdx * 0.05 }}
            >
              <Card className="overflow-hidden">
                {/* Unit Header */}
                <div className="p-4 md:p-5 bg-muted/30 border-b border-border flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Layers className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">
                      Unit {uIdx + 1}: {unit.name}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {unit.chapters.length} chapter{unit.chapters.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {/* Chapters */}
                <div className="divide-y divide-border">
                  {unit.chapters.map((chapter, cIdx) => (
                    <button
                      key={chapter.id}
                      onClick={() => router.push(`/library/${examId}/${subjectId}/${chapter.id}`)}
                      className="w-full flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors text-left group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        {cIdx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{chapter.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {chapter.class_level && (
                            <Badge variant="outline" className="text-xs">
                              Class {chapter.class_level}
                            </Badge>
                          )}
                          {chapter.weightage > 1 && (
                            <Badge variant="secondary" className="text-xs">
                              Weightage: {chapter.weightage}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                    </button>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Back Button */}
      <Button variant="outline" onClick={() => router.push('/library')}>
        <ChevronLeft className="w-4 h-4 mr-2" />
        Back to Library
      </Button>
    </div>
  )
}
