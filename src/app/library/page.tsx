'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  BookOpen,
  Compass,
  Search,
  ChevronRight,
  GraduationCap,
  Atom,
  FlaskConical,
  Calculator,
  Dna,
  Loader2,
  Bookmark,
  TrendingUp,
  Clock,
  Sparkles,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { getExams, getSubjects, searchSyllabus, type SyllabusExam, type SyllabusSubject } from '@/lib/library-service'
import { useAuth } from '@/contexts/AuthContext'

const SUBJECT_ICONS: Record<string, React.ElementType> = {
  Physics: Atom,
  Chemistry: FlaskConical,
  Mathematics: Calculator,
  Biology: Dna,
}

const SUBJECT_COLORS: Record<string, string> = {
  Physics: 'from-blue-500 to-indigo-600',
  Chemistry: 'from-emerald-500 to-teal-600',
  Mathematics: 'from-orange-500 to-red-500',
  Biology: 'from-green-500 to-lime-600',
}

export default function LibraryPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [exams, setExams] = useState<SyllabusExam[]>([])
  const [selectedExam, setSelectedExam] = useState<SyllabusExam | null>(null)
  const [subjects, setSubjects] = useState<SyllabusSubject[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{ type: string; id: string; name: string; path: string }[]>([])
  const [searching, setSearching] = useState(false)

  // Load exams on mount
  useEffect(() => {
    async function load() {
      try {
        const data = await getExams()
        setExams(data)
        // Auto-select exam from user profile or first available
        const targetExam = user?.target_exam
        const matched = data.find((e) => e.name.toLowerCase().includes(targetExam?.toLowerCase() || ''))
        setSelectedExam(matched || data[0] || null)
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.target_exam])

  // Load subjects when exam changes
  useEffect(() => {
    if (!selectedExam) return
    async function load() {
      try {
        const data = await getSubjects(selectedExam!.id)
        setSubjects(data)
      } catch {
        // silent
      }
    }
    load()
  }, [selectedExam])

  // Search handler
  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query)
      if (!query.trim()) {
        setSearchResults([])
        return
      }
      setSearching(true)
      try {
        const results = await searchSyllabus(query, selectedExam?.id)
        setSearchResults(results)
      } catch {
        // silent
      } finally {
        setSearching(false)
      }
    },
    [selectedExam?.id]
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              Library
            </h1>
            <p className="text-muted-foreground mt-1">Explore your syllabus, subjects, and chapters</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search subjects, chapters, concepts..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 h-11"
          />
          {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />}
        </div>

        {/* Search Results */}
        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="bg-card border border-border rounded-xl p-3 shadow-lg max-h-60 overflow-auto space-y-1"
            >
              {searchResults.map((r) => (
                <button
                  key={`${r.type}-${r.id}`}
                  onClick={() => {
                    setSearchQuery('')
                    setSearchResults([])
                  }}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors text-left"
                >
                  <Badge variant="secondary" className="text-xs capitalize">{r.type}</Badge>
                  <span className="text-sm font-medium text-foreground">{r.name}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Exam Tabs */}
      {exams.length > 1 && (
        <Tabs
          value={selectedExam?.id}
          onValueChange={(id) => {
            const exam = exams.find((e) => e.id === id)
            if (exam) setSelectedExam(exam)
          }}
        >
          <TabsList>
            {exams.map((exam) => (
              <TabsTrigger key={exam.id} value={exam.id} className="gap-2">
                <GraduationCap className="w-4 h-4" />
                {exam.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {/* Quick Stats */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: BookOpen, label: 'Subjects', value: subjects.length, color: 'text-primary' },
          { icon: Bookmark, label: 'Bookmarked', value: 0, color: 'text-amber-500' },
          { icon: TrendingUp, label: 'Progress', value: '0%', color: 'text-emerald-500' },
          { icon: Clock, label: 'Study Time', value: '0h', color: 'text-purple-500' },
        ].map((stat, i) => (
          <Card key={i} className="p-4 flex items-center gap-3">
            <div className={cn('w-9 h-9 rounded-lg bg-muted flex items-center justify-center', stat.color)}>
              <stat.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </Card>
        ))}
      </motion.div>

      {/* Subjects Grid */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Compass className="w-5 h-5 text-primary" />
          Subjects
          {selectedExam && <Badge variant="outline">{selectedExam.name}</Badge>}
        </h2>

        {subjects.length === 0 ? (
          <Card className="p-12 text-center">
            <Sparkles className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No subjects found for this exam.</p>
            <p className="text-sm text-muted-foreground mt-1">Syllabus data will appear once populated.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subject, i) => {
              const Icon = SUBJECT_ICONS[subject.name] || BookOpen
              const gradient = SUBJECT_COLORS[subject.name] || 'from-primary to-primary/80'

              return (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card
                    className="group cursor-pointer hover:shadow-lg transition-all duration-200 border-border hover:border-primary/30 overflow-hidden"
                    onClick={() => router.push(`/library/${selectedExam?.id}/${subject.id}`)}
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className={cn('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg', gradient)}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                      <h3 className="font-semibold text-foreground text-lg mb-1">{subject.name}</h3>
                      <p className="text-sm text-muted-foreground">Explore units, chapters & concepts</p>
                    </div>
                    {/* Bottom accent */}
                    <div className={cn('h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity', gradient)} />
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
