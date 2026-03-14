'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell
} from 'recharts'
import {
  Trophy,
  Target,
  Clock,
  BookOpen,
  Sparkles,
  ArrowLeft,
  Brain,
  Lightbulb,
  BookMarked,
  Play,
  Loader2,
  Award,
  Zap,
  AlertTriangle,
  RefreshCw,
  Download,
  Flame,
  Activity
} from 'lucide-react'
import { cn, getFocusLevelBg, formatTimeShort, COLORS } from '@/modules/tests/utils'
import type { TestAttempt, SubjectBreakdownItem, ChapterBreakdownItem, TestRecommendation } from '@/modules/tests/types'
import { PageHeader, StatCard } from '@/modules/tests/components/ui-elevated'
import { FadeIn, RingProgress, Confetti } from '@/modules/tests/components/motion'

export default function TestAnalysisPage() {
  const params = useParams()
  const router = useRouter()
  const testId = params.testId as string

  const [isLoading, setIsLoading] = useState(true)
  const [attempt, setAttempt] = useState<TestAttempt | null>(null)
  const [subjectBreakdown, setSubjectBreakdown] = useState<SubjectBreakdownItem[]>([])
  const [chapterBreakdown, setChapterBreakdown] = useState<ChapterBreakdownItem[]>([])
  const [recommendations, setRecommendations] = useState<TestRecommendation | null>(null)
  const [isAILoading, setIsAILoading] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  // Mock time scatter data mapped from dummy data
  const timeScatterData = [
    { x: 1, y: 120, z: 100, status: 'correct', subject: 'Physics' },
    { x: 2, y: 300, z: 100, status: 'incorrect', subject: 'Physics' },
    { x: 3, y: 45, z: 100, status: 'correct', subject: 'Chemistry' },
    { x: 4, y: 180, z: 100, status: 'correct', subject: 'Math' },
    { x: 5, y: 400, z: 100, status: 'incorrect', subject: 'Math' },
  ]

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await fetch(`/api/tests/${testId}/analysis`)
        if (!response.ok) throw new Error('Failed to fetch analysis')
        const data = await response.json()
        setAttempt(data.attempt)
        setSubjectBreakdown(data.subjectBreakdown || [])
        setChapterBreakdown(data.chapterBreakdown || [])
        setRecommendations(data.recommendations)
        if (data.attempt?.percentage >= 80) setShowConfetti(true)
      } catch (error) {
        // Sample data on fail
        setAttempt({
          id: 'attempt-1', userId: 'user-1', testId: testId, status: 'submitted', currentQuestion: 0,
          score: 72, totalMarks: 100, percentage: 72, timeSpent: 3240, pausedDuration: 0, accuracy: 80,
          correctCount: 8, incorrectCount: 2, unattemptedCount: 0, subjectBreakdown: [], chapterBreakdown: [],
          timeAnalysis: { totalTime: 3240, avgTimePerQuestion: 324, timeDistribution: { easy: 60, medium: 180, hard: 120 }, timeWasters: [] },
          mistakeAnalysis: { conceptual: 1, calculation: 1, timePressure: 0, silly: 0, total: 2 },
          startedAt: new Date(), submittedAt: new Date()
        })
        
        setSubjectBreakdown([
          { subjectId: '1', subjectName: 'Physics', correct: 3, incorrect: 1, total: 4, accuracy: 75, timeSpent: 720, color: '#3B82F6' },
          { subjectId: '2', subjectName: 'Chemistry', correct: 2, incorrect: 0, total: 2, accuracy: 100, timeSpent: 540, color: '#10B981' },
          { subjectId: '3', subjectName: 'Mathematics', correct: 3, incorrect: 1, total: 4, accuracy: 75, timeSpent: 1080, color: '#8B5CF6' }
        ])
        
        setChapterBreakdown([
          { chapterId: '1', chapterName: 'Mechanics', subjectId: '1', subjectName: 'Physics', correct: 2, incorrect: 0, total: 2, accuracy: 100, focusLevel: 'strong', timeSpent: 360 },
          { chapterId: '2', chapterName: 'Electromagnetism', subjectId: '1', subjectName: 'Physics', correct: 1, incorrect: 1, total: 2, accuracy: 50, focusLevel: 'needs_attention', timeSpent: 360 },
          { chapterId: '3', chapterName: 'Organic Chemistry', subjectId: '2', subjectName: 'Chemistry', correct: 2, incorrect: 0, total: 2, accuracy: 100, focusLevel: 'strong', timeSpent: 540 },
          { chapterId: '4', chapterName: 'Calculus', subjectId: '3', subjectName: 'Mathematics', correct: 2, incorrect: 1, total: 3, accuracy: 67, focusLevel: 'moderate', timeSpent: 720 }
        ])
        
        setRecommendations({
          chaptersToRevise: ['Electromagnetism', 'Calculus'], suggestedDifficulty: 'medium', suggestedTestLength: 20,
          suggestedNextTest: 'Electromagnetism Chapter Test', recommendedStudyHours: 4, weakAreas: [], strongAreas: [],
          improvementPlan: []
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchAnalysis()
  }, [testId])

  const handleSolveWithAI = async () => {
    setIsAILoading(true)
    setTimeout(() => setIsAILoading(false), 2000)
  }

  if (isLoading || !attempt) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">Analyzing results...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-background text-foreground pb-20">
      <Confetti show={showConfetti} onComplete={() => setShowConfetti(false)} />
      
      {/* Header */}
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }} className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.push('/tests')} className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
              </Button>
              <PageHeader
                title="Cognify Analysis"
                subtitle="Deep performance metrics"
                badge={attempt.percentage >= 80 ? 'Excellent' : attempt.percentage >= 60 ? 'Good' : 'Needs Practice'}
                badgeVariant={attempt.percentage >= 80 ? 'success' : 'default'}
              />
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="border-border hidden md:flex"><Download className="h-4 w-4 mr-2" /> PDF</Button>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md" onClick={() => router.push('/tests/create')}>
                <Play className="h-4 w-4 mr-2" /> Next Test
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Metric Overview */}
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* Primary Score */}
            <motion.div className="col-span-2 lg:col-span-1">
              <Card className="bg-card border-border shadow-sm h-full overflow-hidden relative">
                <CardContent className="p-6">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Total Score</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-black text-foreground">{attempt.score}</span>
                        <span className="text-lg text-muted-foreground font-medium">/{attempt.totalMarks}</span>
                      </div>
                    </div>
                    <Trophy className="h-8 w-8 text-primary opacity-80" />
                  </div>
                  
                  <Progress value={attempt.percentage} className="h-2 bg-muted [&>div]:bg-primary" />
                  <p className="text-xs text-muted-foreground mt-3 font-medium bg-muted/50 inline-block px-2 py-1 rounded-md">{attempt.percentage}% Acquired</p>
                </CardContent>
              </Card>
            </motion.div>

            <StatCard label="Accuracy" value={`${attempt.accuracy}%`} icon={<Target />} color="emerald" delay={0.15} />
            <StatCard label="Pacing" value={formatTimeShort(attempt.timeSpent)} icon={<Clock />} color="blue" delay={0.2} />
            <StatCard label="Rank Proj." value={`${attempt.percentile || 85}th`} icon={<Award />} color="purple" delay={0.25} />
            <StatCard label="Sys Efficiency" value="92%" icon={<Zap />} color="amber" delay={0.3} />
          </div>
        </FadeIn>

        {/* Deep Analysis Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Scatter Time Efficiency */}
          <FadeIn delay={0.2}>
            <Card className="bg-card border-border shadow-sm h-full">
              <CardHeader className="border-b border-border bg-muted/30">
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" /> Time Efficiency Matrix
                </CardTitle>
                <CardDescription>Time spent vs Correctness per question</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                 <ResponsiveContainer width="100%" height={250}>
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                       <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                       <XAxis type="number" dataKey="x" name="Question" tick={{fill: 'hsl(var(--muted-foreground))'}} />
                       <YAxis type="number" dataKey="y" name="Seconds" tick={{fill: 'hsl(var(--muted-foreground))'}} />
                       <ZAxis type="number" range={[100, 300]} />
                       <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))', borderRadius: '8px'}} />
                       <Scatter name="Time Spent" data={timeScatterData}>
                         {timeScatterData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.status === 'correct' ? '#10B981' : '#EF4444'} className="drop-shadow-sm" />
                         ))}
                       </Scatter>
                    </ScatterChart>
                 </ResponsiveContainer>
                 <div className="flex justify-center gap-6 text-xs text-muted-foreground font-medium mt-2">
                    <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></div> Correct</span>
                    <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]"></div> Incorrect</span>
                 </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Subject Breakdown */}
          <FadeIn delay={0.3}>
            <Card className="bg-card border-border shadow-sm h-full">
               <CardHeader className="border-b border-border bg-muted/30">
                 <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                    <BarChart className="h-4 w-4 text-primary" /> Subject Metrics
                 </CardTitle>
               </CardHeader>
               <CardContent className="p-6">
                 <ResponsiveContainer width="100%" height={180}>
                   <BarChart data={subjectBreakdown} barSize={32}>
                     <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                     <XAxis dataKey="subjectName" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                     <YAxis hide />
                     <Tooltip 
                       contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}
                     />
                     <Bar dataKey="accuracy" radius={[6, 6, 0, 0]}>
                       {subjectBreakdown.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.color} />
                       ))}
                     </Bar>
                   </BarChart>
                 </ResponsiveContainer>

                 <div className="mt-6 space-y-3">
                   {subjectBreakdown.map((subject, i) => (
                     <div key={subject.subjectId} className="flex items-center justify-between text-sm bg-muted/50 p-2.5 rounded-lg border border-border">
                       <div className="flex items-center gap-3">
                         <div className="w-3 h-3 rounded-md" style={{ backgroundColor: subject.color }} />
                         <span className="font-bold text-foreground">{subject.subjectName}</span>
                       </div>
                       <span className="text-muted-foreground font-semibold text-xs tracking-wider">
                         {subject.correct} / {subject.total} <span className="text-[10px] uppercase ml-1">Hits</span>
                       </span>
                     </div>
                   ))}
                 </div>
               </CardContent>
            </Card>
          </FadeIn>
        </div>

        {/* Heatmap Chapters */}
        <FadeIn delay={0.4}>
          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="border-b border-border bg-muted/30">
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" /> Syllabus Heatmap
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">Topic</TableHead>
                    <TableHead className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider text-center">Correct</TableHead>
                    <TableHead className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider text-center">Incorrect</TableHead>
                    <TableHead className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider text-center">Accuracy Heat</TableHead>
                    <TableHead className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider text-right pr-6">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chapterBreakdown.map((c) => (
                    <TableRow key={c.chapterId} className="border-border hover:bg-muted/30 transition-colors">
                      <TableCell>
                         <span className="font-bold text-foreground block">{c.chapterName}</span>
                         <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{c.subjectName}</span>
                      </TableCell>
                      <TableCell className="text-center"><span className="font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">{c.correct}</span></TableCell>
                      <TableCell className="text-center"><span className="font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded">{c.incorrect}</span></TableCell>
                      <TableCell className="text-center">
                         <div className="flex items-center justify-center gap-3">
                           <div className="w-16 h-2 rounded-full overflow-hidden bg-muted">
                              <div className="h-full bg-primary" style={{ width: `${c.accuracy}%` }}></div>
                           </div>
                           <span className="text-xs font-bold text-muted-foreground">{c.accuracy}%</span>
                         </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Badge variant="outline" className={cn("border-2 uppercase text-[9px] font-black tracking-widest", getFocusLevelBg(c.focusLevel))}>
                          {c.focusLevel.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </FadeIn>

        {/* AI Action */}
        <FadeIn delay={0.5}>
           <Card className="bg-gradient-to-br from-card to-primary/5 border border-primary/20 shadow-md">
             <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                   <h3 className="text-2xl font-black text-foreground flex items-center gap-2 mb-2">
                     <Brain className="text-primary"/> Cogni Mistake Engine
                   </h3>
                   <p className="text-sm text-muted-foreground max-w-lg font-medium leading-relaxed">
                     You have <span className="text-destructive font-bold">{attempt.incorrectCount} mistakes</span>. Deep dive with the AI tutor to understand conceptual gaps and generate parallel variations.
                   </p>
                </div>
                <Button 
                   onClick={handleSolveWithAI} disabled={isAILoading}
                   className="shrink-0 h-12 px-8 min-w-[200px] bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-xl shadow-primary/20 rounded-xl"
                >
                   {isAILoading ? 'Processing Matrix...' : 'Activate AI Review'}
                </Button>
             </CardContent>
           </Card>
        </FadeIn>

      </div>
    </motion.div>
  )
}
