'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  GraduationCap, ChevronLeft, CheckCircle, XCircle,
  Clock, TrendingUp, TrendingDown, Sparkles, BookOpen,
  Filter, Search, ChevronRight, Target, AlertCircle,
  History, Calendar, Trophy
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { cn } from '@/modules/tests/utils'

// ============================================
// RESULT CARD COMPONENT
// ============================================

interface ResultCardProps {
  result: {
    id: string
    type: 'mock' | 'chapter' | 'custom'
    testName: string
    subject: string
    score: number
    totalMarks: number
    accuracy: number
    timeSpent: number
    rank?: number
    completedAt: string
    weakTopics: string[]
  }
}

function ResultCard({ result }: ResultCardProps) {
  const router = useRouter()

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
    if (accuracy >= 60) return 'text-amber-500 bg-amber-500/10 border-amber-500/20'
    return 'text-red-500 bg-red-500/10 border-red-500/20'
  }

  const getAccuracyBar = (accuracy: number) => {
    if (accuracy >= 80) return 'bg-emerald-500'
    if (accuracy >= 60) return 'bg-amber-500'
    return 'bg-red-500'
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    return `\${mins}m`
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all group"
    >
      <div className="p-5 flex flex-col h-full relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors" />

        <div className="flex items-start justify-between mb-4 relative z-10">
          <div className="pr-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="bg-muted text-[10px] uppercase font-bold tracking-wider">
                {result.type}
              </Badge>
              <h3 className="font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                 {result.testName}
              </h3>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground">
              <span className="flex items-center gap-1">
                <Target className="h-3.5 w-3.5" /> {result.subject}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> {formatTime(result.timeSpent)}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> {result.completedAt ? new Date(result.completedAt).toLocaleDateString() : '—'}
              </span>
            </div>
          </div>

          <div className={cn("px-3 py-2 rounded-xl text-center border min-w-[70px]", getAccuracyColor(result.accuracy))}>
            <div className="text-xl font-black">{result.accuracy}%</div>
            <div className="text-[10px] font-bold uppercase tracking-wider opacity-80 mt-0.5">Acc</div>
          </div>
        </div>

        <div className="mb-4 relative z-10">
          <div className="flex justify-between text-xs font-bold text-foreground mb-2">
             <span>Score: {result.score}/{result.totalMarks}</span>
             <span className="text-muted-foreground">{result.rank ? `Rank: \${result.rank}` : ''}</span>
          </div>
          <Progress value={result.accuracy} className={cn("h-2 bg-muted [&>div]:bg-primary", `[&>div]:\${getAccuracyBar(result.accuracy)}`)} />
        </div>

        {result.weakTopics.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 bg-muted/50 p-2.5 rounded-lg border border-border relative z-10">
            <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
            <span className="truncate">Weak in: <span className="font-bold text-foreground">{result.weakTopics.join(', ')}</span></span>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 mt-auto border-t border-border relative z-10">
          {result.accuracy < 80 ? (
            <Button size="sm" variant="outline" className="gap-2 text-xs font-bold border-border bg-muted/30 hover:bg-muted hover:text-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Fix Mistakes
            </Button>
          ) : <div></div>}
          <Button size="sm" className="gap-1 text-xs font-bold bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors group/btn" onClick={() => router.push(`/tests/\${result.id}/analysis`)}>
            Analysis <ChevronRight className="h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================
// MAIN RESULTS PAGE
// ============================================

export default function ResultsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [subjectFilter, setSubjectFilter] = useState<string>('all')
  const [results, setResults] = useState<any[]>([])
  const [stats, setStats] = useState({ totalTests: 0, avgAccuracy: 0, totalTime: 0, improving: false })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/tests/history')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setResults(data.history ?? [])
          const s = data.stats ?? {}
          setStats({
            totalTests: s.totalTests ?? 0,
            avgAccuracy: s.avgAccuracy ?? 0,
            totalTime: s.totalTime ?? 0,
            improving: (s.improvement ?? 0) > 0,
          })
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filteredResults = results.filter((result: any) => {
    const matchesSearch = result.testName.toLowerCase().includes(searchQuery.toLowerCase()) || result.subject.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSubject = subjectFilter === 'all' || result.subject === subjectFilter
    const matchesTab = activeTab === 'all' || result.type === activeTab
    return matchesSearch && matchesSubject && matchesTab
  })

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 pt-4 md:pt-8 animate-in fade-in duration-500">
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
           <div>
              <Button variant="ghost" size="sm" onClick={() => router.push('/tests')} className="mb-4 text-muted-foreground hover:text-foreground -ml-2">
                <ChevronLeft className="h-4 w-4 mr-1"/> Dashboard
              </Button>
              <h1 className="text-3xl lg:text-4xl font-black tracking-tight flex items-center gap-3">
                <History className="text-primary"/> History Hub
              </h1>
              <p className="text-muted-foreground mt-2 max-w-xl text-lg">
                Track your progress, review past mistakes, and monitor your cognitive growth over time.
              </p>
           </div>
           
           <div className="flex items-center gap-3">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search records..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-muted/50 border-transparent focus:border-primary focus:bg-background rounded-xl h-12" />
              </div>
           </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <Card className="bg-card border-border shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <CardContent className="p-6 relative z-10 flex items-center justify-between">
              <div>
                 <div className="text-3xl font-black text-foreground mb-1">{stats.totalTests}</div>
                 <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Missions Done</div>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                 <Trophy size={24} />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border shadow-sm relative overflow-hidden group">
            <CardContent className="p-6 relative z-10 flex items-center justify-between">
              <div>
                 <div className="text-3xl font-black text-emerald-500 mb-1">{stats.avgAccuracy}%</div>
                 <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Avg Accuracy</div>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                 <Target size={24} />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border shadow-sm relative overflow-hidden group">
            <CardContent className="p-6 relative z-10 flex items-center justify-between">
              <div>
                 <div className="flex items-center gap-2 mb-1">
                   <div className="text-3xl font-black text-blue-500">{Math.floor(stats.totalTime / 3600)}h {Math.floor((stats.totalTime % 3600) / 60)}m</div>
                   {stats.improving ? <TrendingUp className="h-5 w-5 text-emerald-500" /> : <TrendingDown className="h-5 w-5 text-red-500" />}
                 </div>
                 <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Time Invested</div>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                 <Clock size={24} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
           <div className="flex bg-muted/50 p-1.5 rounded-xl border border-border w-full md:w-auto">
              {[
                { id: 'all', label: 'All Records' },
                { id: 'mock', label: 'Full Mocks' },
                { id: 'chapter', label: 'Chapter Tests' }
              ].map(tab => (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id)}
                   className={cn(
                     "flex-1 md:flex-none px-6 py-2 text-sm font-bold rounded-lg transition-all",
                     activeTab === tab.id ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                   )}
                 >
                   {tab.label}
                 </button>
              ))}
           </div>

           <Select value={subjectFilter} onValueChange={setSubjectFilter}>
             <SelectTrigger className="w-full md:w-[180px] bg-card border-border h-11 rounded-xl font-bold">
               <SelectValue placeholder="Subject Focus" />
             </SelectTrigger>
             <SelectContent className="bg-card border-border">
               <SelectItem value="all" className="font-bold">All Subjects</SelectItem>
               <SelectItem value="Physics" className="font-bold">Physics</SelectItem>
               <SelectItem value="Chemistry" className="font-bold">Chemistry</SelectItem>
               <SelectItem value="Mathematics" className="font-bold">Mathematics</SelectItem>
               <SelectItem value="Biology" className="font-bold">Biology</SelectItem>
               <SelectItem value="Full Syllabus" className="font-bold border-t border-border mt-1 pt-1 text-primary">Full Syllabus</SelectItem>
             </SelectContent>
           </Select>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">Loading history...</div>
        ) : (
        <AnimatePresence mode="popLayout">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {filteredResults.map((result: any) => (
               <ResultCard key={result.id} result={result} />
             ))}
           </div>
           
           {filteredResults.length === 0 && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full py-20 text-center bg-card border border-border border-dashed rounded-3xl mt-4">
               <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                 <Search className="h-8 w-8 text-muted-foreground opacity-50" />
               </div>
               <h3 className="font-bold text-xl text-foreground mb-2">No history logs found</h3>
               <p className="text-sm text-muted-foreground max-w-sm mx-auto">Try adjusting your filters or complete a new test to populate your history hub.</p>
               <Button className="mt-6 bg-primary font-bold" onClick={() => router.push('/tests/create')}>Start New Test</Button>
             </motion.div>
           )}
        </AnimatePresence>
        )}

      </main>
    </div>
  )
}
