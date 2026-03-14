'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  FileText,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Eye,
  Bookmark,
  Plus,
  AlertCircle,
  RefreshCw,
  Calendar,
  Target,
  BookOpen,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AnimatedCounter, AnimatedStatCard } from '@/components/ui/animated-counter'
import type { PYQ, PYQFilters } from '@/modules/library/types'
import { toast } from 'sonner'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.03 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
}

// Difficulty colors
const difficultyColors = {
  Beginner: 'bg-green-100 text-green-700 border-green-200',
  Intermediate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Advanced: 'bg-red-100 text-red-700 border-red-200',
}

// Difficulty indicator dot
const difficultyDotColors = {
  Beginner: 'bg-green-500',
  Intermediate: 'bg-yellow-500',
  Advanced: 'bg-red-500',
}

export default function PYQsPage() {
  const [pyqs, setPYQs] = useState<PYQ[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filters, setFilters] = useState<PYQFilters>({
    year: null,
    exam: null,
    subject: null,
    chapter: null,
    difficulty: null,
    marks: null,
  })
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch PYQs
  const fetchPYQs = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.year) params.set('year', filters.year.toString())
      if (filters.exam) params.set('exam', filters.exam)
      if (filters.subject) params.set('subject', filters.subject)
      if (filters.difficulty) params.set('difficulty', filters.difficulty)

      const response = await fetch(`/api/library/pyqs?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setPYQs(data.pyqs || [])
      }
    } catch (error) {
      console.error('Failed to fetch PYQs:', error)
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchPYQs()
  }, [fetchPYQs])

  // Filter PYQs by search
  const filteredPYQs = useMemo(() => {
    if (!searchQuery.trim()) return pyqs
    const query = searchQuery.toLowerCase()
    return pyqs.filter(p =>
      p.question.toLowerCase().includes(query) ||
      p.subject.toLowerCase().includes(query) ||
      p.topic.toLowerCase().includes(query)
    )
  }, [pyqs, searchQuery])

  // Get unique values for filters
  const years = useMemo(() => [...new Set(pyqs.map(p => p.year))].sort((a, b) => b - a), [pyqs])
  const subjects = useMemo(() => [...new Set(pyqs.map(p => p.subject))], [pyqs])

  // Stats
  const stats = useMemo(() => ({
    total: pyqs.length,
    jee: pyqs.filter(p => p.exam === 'JEE').length,
    neet: pyqs.filter(p => p.exam === 'NEET').length,
    bookmarked: pyqs.filter(p => p.isBookmarked).length,
  }), [pyqs])

  // Toggle solution
  const toggleSolution = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  // Toggle bookmark
  const toggleBookmark = async (pyqId: string) => {
    try {
      await fetch('/api/library/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-user',
          pyqId,
          action: 'toggle'
        })
      })
      setPYQs(prev => prev.map(p =>
        p.id === pyqId ? { ...p, isBookmarked: !p.isBookmarked } : p
      ))
      toast.success('Bookmark updated')
    } catch {
      toast.error('Failed to update bookmark')
    }
  }

  // Add to test
  const addToTest = (pyq: PYQ) => {
    toast.success(`Added "${pyq.topic}" to test`)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen cognify-bg flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen cognify-bg">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-40"
      >
        <div className="px-4 md:px-6 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">PYQ Vault</h1>
              <p className="text-sm text-gray-500">Previous Year Questions Archive</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions, topics..."
                className="pl-10 bg-white border-gray-200 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select
                value={filters.year?.toString() || 'all'}
                onValueChange={(v) => setFilters(prev => ({ ...prev, year: v === 'all' ? null : parseInt(v) }))}
              >
                <SelectTrigger className="w-[120px] bg-white">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.exam || 'all'}
                onValueChange={(v) => setFilters(prev => ({ ...prev, exam: v === 'all' ? null : v as 'JEE' | 'NEET' }))}
              >
                <SelectTrigger className="w-[100px] bg-white">
                  <SelectValue placeholder="Exam" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="JEE">JEE</SelectItem>
                  <SelectItem value="NEET">NEET</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.difficulty || 'all'}
                onValueChange={(v) => setFilters(prev => ({ ...prev, difficulty: v === 'all' ? null : v as 'Beginner' | 'Intermediate' | 'Advanced' }))}
              >
                <SelectTrigger className="w-[130px] bg-white">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="p-4 md:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <AnimatedStatCard label="Total PYQs" value={stats.total} icon={FileText} color="purple" />
            <AnimatedStatCard label="JEE Questions" value={stats.jee} icon={Target} color="blue" />
            <AnimatedStatCard label="NEET Questions" value={stats.neet} icon={BookOpen} color="green" />
            <AnimatedStatCard label="Bookmarked" value={stats.bookmarked} icon={Bookmark} color="orange" />
          </motion.div>

          {/* PYQ List */}
          {filteredPYQs.length === 0 ? (
            <Card className="p-8 border-gray-200">
              <div className="text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-2">No PYQs found</p>
                <p className="text-sm text-gray-400">
                  {searchQuery || filters.year || filters.exam || filters.difficulty
                    ? 'Try adjusting your filters'
                    : 'PYQs will appear here when available'}
                </p>
              </div>
            </Card>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              {filteredPYQs.map((pyq) => (
                <motion.div
                  key={pyq.id}
                  variants={itemVariants}
                  layout
                  className="group"
                >
                  <Card className={cn(
                    'border-gray-200 hover:border-blue-300 transition-all duration-200 overflow-hidden',
                    expandedId === pyq.id && 'ring-2 ring-blue-500/20'
                  )}>
                    <CardContent className="p-4">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <div className={cn(
                              'w-2 h-2 rounded-full',
                              difficultyDotColors[pyq.difficulty]
                            )} />
                            <Badge variant="outline" className="bg-white text-xs">
                              {pyq.year}
                            </Badge>
                            <Badge variant="outline" className={cn('text-xs', pyq.exam === 'JEE' ? 'border-blue-200 text-blue-700' : 'border-green-200 text-green-700')}>
                              {pyq.exam}
                            </Badge>
                            <Badge variant="outline" className={cn('text-xs', difficultyColors[pyq.difficulty])}>
                              {pyq.difficulty}
                            </Badge>
                            <Badge variant="outline" className="bg-white text-xs">
                              {pyq.marks} marks
                            </Badge>
                          </div>
                          <p className="text-gray-900 font-medium leading-relaxed">
                            {pyq.question}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {pyq.subject} • {pyq.chapter} • {pyq.topic}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleBookmark(pyq.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Bookmark className={cn(
                              'w-4 h-4',
                              pyq.isBookmarked ? 'fill-blue-500 text-blue-500' : 'text-gray-400'
                            )} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addToTest(pyq)}
                            className="gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            Add to Test
                          </Button>
                        </div>
                      </div>

                      {/* Solution Toggle */}
                      <motion.div
                        initial={false}
                        animate={{ height: expandedId === pyq.id ? 'auto' : 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-sm font-medium text-green-600 mb-2">
                            <AlertCircle className="w-4 h-4" />
                            Solution
                          </div>
                          <div className="bg-green-50 rounded-lg p-4 text-gray-700 leading-relaxed">
                            {pyq.solution || 'Solution not available for this question.'}
                          </div>
                        </div>
                      </motion.div>

                      {/* Show Solution Button */}
                      <button
                        onClick={() => toggleSolution(pyq.id)}
                        className="mt-3 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                      >
                        {expandedId === pyq.id ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            Hide Solution
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            Show Solution
                          </>
                        )}
                      </button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}
