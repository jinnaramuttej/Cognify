'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  Target,
  Clock,
  Flame,
  BarChart3,
  AlertTriangle,
  Download,
  ChevronRight,
  Users,
  Zap,
  BookOpen,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AccuracyDataPoint {
  date: string;
  accuracy: number;
  questionsAttempted: number;
}

interface SubjectChapter {
  name: string;
  accuracy: number;
}

interface SubjectPerformance {
  subject: string;
  accuracy: number;
  chapters: SubjectChapter[];
}

interface WeakTopic {
  topic: string;
  accuracy: number;
  questionsAttempted: number;
}

interface TimeDistribution {
  bucket: string;
  count: number;
  avgScore: number;
}

interface HeatmapDay {
  day: number;
  hours: number;
}

interface AnalyticsData {
  overallAccuracy: number;
  weeklyTrend: string;
  avgTimePerQuestion: string;
  cohortPercentile: number;
  currentStreak: number;
  totalStudyTime: number;
  questionsAttempted: number;
  accuracyTrend: AccuracyDataPoint[];
  subjectPerformance: SubjectPerformance[];
  weakTopics: WeakTopic[];
  timeDistribution: TimeDistribution[];
  studyHeatmap: HeatmapDay[];
  recommendations: Array<{ title: string; priority: number; impact: string; type: string }>;
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-2xl bg-muted/30 ${className}`} />
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-xl text-sm">
      <p className="text-muted-foreground mb-1 text-xs">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-bold text-foreground">
          {p.name}: <span className="text-primary">{p.value}%</span>
        </p>
      ))}
    </div>
  );
}

// ─── Stat Cards ───────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  trend,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  color: string;
  trend?: string;
}) {
  return (
    <Card className="rounded-2xl border-border bg-card hover:border-primary/30 transition-all duration-300">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{label}</span>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>
            <Icon size={16} />
          </div>
        </div>
        <p className="text-3xl font-black tracking-tighter text-foreground">{value}</p>
        {trend && (
          <p className="text-xs text-emerald-500 font-bold mt-1 flex items-center gap-1">
            <TrendingUp size={11} /> {trend}
          </p>
        )}
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

// ─── Heatmap ─────────────────────────────────────────────────────────────────

function StudyHeatmap({ data }: { data: HeatmapDay[] }) {
  function intensity(hours: number) {
    if (hours > 6) return 'bg-primary';
    if (hours > 4) return 'bg-primary/70';
    if (hours > 2) return 'bg-primary/40';
    if (hours > 0) return 'bg-primary/20';
    return 'bg-muted/30';
  }

  return (
    <div className="grid grid-cols-7 gap-1.5">
      {data.map(({ day, hours }) => (
        <div
          key={day}
          title={`Day ${day}: ${hours}h`}
          className={`aspect-square rounded-md ${intensity(hours)} transition-colors cursor-pointer hover:opacity-80`}
        />
      ))}
    </div>
  );
}

// ─── Subject Bar ─────────────────────────────────────────────────────────────

function SubjectAccuracyBar({ subject, accuracy }: { subject: string; accuracy: number }) {
  const colorMap: Record<string, string> = {
    Physics: 'bg-blue-500',
    Chemistry: 'bg-emerald-500',
    Mathematics: 'bg-purple-500',
    Biology: 'bg-rose-500',
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="font-semibold text-foreground">{subject}</span>
        <span className="font-bold text-foreground">{accuracy}%</span>
      </div>
      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${accuracy}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${colorMap[subject] || 'bg-primary'}`}
        />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [activeSubject, setActiveSubject] = useState<string | null>(null);

  const { data: analyticsRes, isLoading, error } = useQuery<{ success: boolean; data: AnalyticsData }>({
    queryKey: ['analytics', user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/analytics?userId=${user?.id || 'anonymous'}`);
      if (!res.ok) throw new Error('Failed to load analytics');
      return res.json();
    },
    enabled: true,
    staleTime: 2 * 60 * 1000,
  });

  const data = analyticsRes?.data;

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12 animate-pulse">
        <div className="h-8 bg-muted/30 rounded-xl w-64" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <SkeletonCard key={i} className="h-28" />)}
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <SkeletonCard className="md:col-span-2 h-72" />
          <SkeletonCard className="h-72" />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <SkeletonCard className="h-64" />
          <SkeletonCard className="h-64" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-xl font-bold mb-2">Failed to load analytics</h2>
        <p className="text-muted-foreground text-sm">Please refresh and try again.</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4 rounded-xl">
          Retry
        </Button>
      </div>
    );
  }

  const radarData = data.subjectPerformance.map((s) => ({
    subject: s.subject,
    accuracy: s.accuracy,
  }));

  const activeSubjectData = activeSubject
    ? data.subjectPerformance.find((s) => s.subject === activeSubject)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 pb-12"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Analytics &amp; Progress</h1>
          <p className="text-sm text-muted-foreground mt-1">Detailed insights into your learning journey and performance metrics</p>
        </div>
        <Button variant="outline" className="rounded-xl gap-2 self-start sm:self-auto">
          <Download size={16} /> Export PDF
        </Button>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          label="Overall Mastery"
          value={`${data.overallAccuracy}%`}
          trend={data.weeklyTrend}
          icon={Target}
          color="bg-blue-500/15 text-blue-500"
        />
        <StatCard
          label="Weekly Trend"
          value={data.weeklyTrend}
          sub="vs last week"
          icon={TrendingUp}
          color="bg-emerald-500/15 text-emerald-500"
        />
        <StatCard
          label="Avg Time / Question"
          value={data.avgTimePerQuestion}
          icon={Clock}
          color="bg-amber-500/15 text-amber-500"
        />
        <StatCard
          label="Cohort Percentile"
          value={`${data.cohortPercentile}rd`}
          sub={`vs ${(1240).toLocaleString()} peers`}
          icon={Users}
          color="bg-purple-500/15 text-purple-500"
        />
        <StatCard
          label="Current Streak"
          value={`${data.currentStreak} days`}
          sub="Keep it up!"
          icon={Flame}
          color="bg-orange-500/15 text-orange-500"
        />
      </div>

      {/* Accuracy Trend + Radar */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Accuracy Over Time */}
        <Card className="md:col-span-2 rounded-2xl border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold">Assessment Scores Over Time</CardTitle>
              <Badge variant="outline" className="text-xs">Past 30 days</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data.accuracyTrend}>
                <defs>
                  <linearGradient id="accuracyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => new Date(v).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  interval={6}
                />
                <YAxis domain={[40, 100]} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="accuracy"
                  name="Accuracy"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fill="url(#accuracyGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Percentile Card */}
        <Card className="rounded-2xl border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Cohort Comparison</CardTitle>
            <p className="text-xs text-muted-foreground">Peer group: Grade 12 • National</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-4">
              <p className="text-6xl font-black text-primary">{data.cohortPercentile}<span className="text-2xl">rd</span></p>
              <p className="text-sm text-muted-foreground mt-2">Better than {data.cohortPercentile}% of peers</p>
            </div>
            <ResponsiveContainer width="100%" height={100}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius={40}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                <Radar dataKey="accuracy" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Subject Performance + Weak Topics */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Subject Performance */}
        <Card className="rounded-2xl border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Subject Performance</CardTitle>
            <p className="text-xs text-muted-foreground">Click a subject to drill into chapters</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.subjectPerformance.map((s) => (
              <div
                key={s.subject}
                className="cursor-pointer"
                onClick={() => setActiveSubject(activeSubject === s.subject ? null : s.subject)}
              >
                <SubjectAccuracyBar subject={s.subject} accuracy={s.accuracy} />
                {activeSubject === s.subject && activeSubjectData && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 pl-2 space-y-1 border-l-2 border-primary/30"
                  >
                    {activeSubjectData.chapters.map((ch) => (
                      <div key={ch.name} className="flex items-center justify-between text-xs gap-4">
                        <span className="text-muted-foreground">{ch.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 bg-muted rounded-full w-16 overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${ch.accuracy}%` }}
                            />
                          </div>
                          <span className="font-bold text-foreground w-8 text-right">{ch.accuracy}%</span>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Weak Topics */}
        <Card className="rounded-2xl border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold">Weak Topics to Focus</CardTitle>
              <Badge variant="destructive" className="text-xs">{data.weakTopics.length} flagged</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.weakTopics.map((topic, i) => (
              <div
                key={topic.topic}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/60 transition-colors border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                    i === 0 ? 'bg-destructive/20 text-destructive' :
                    i === 1 ? 'bg-amber-500/20 text-amber-600' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{topic.topic}</p>
                    <p className="text-xs text-muted-foreground">{topic.questionsAttempted} questions attempted</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${topic.accuracy < 50 ? 'text-destructive' : 'text-amber-600'}`}>
                    {topic.accuracy}%
                  </p>
                  <button className="text-xs text-primary hover:underline flex items-center gap-0.5 ml-auto mt-0.5">
                    Fix <ChevronRight size={11} />
                  </button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Time Distribution + Heatmap */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Time on Task Distribution */}
        <Card className="rounded-2xl border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Time-on-Task Distribution</CardTitle>
            <p className="text-xs text-muted-foreground">Hover bars to see attempts and avg score</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.timeDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                <Tooltip
                  content={({ active, payload, label }) =>
                    active && payload?.length ? (
                      <div className="bg-card border border-border rounded-xl p-3 text-sm shadow-xl">
                        <p className="text-muted-foreground text-xs mb-1">{label}</p>
                        <p className="font-bold">{payload[0]?.value} questions</p>
                        <p className="text-primary text-xs">Avg score: {(payload[0]?.payload as TimeDistribution)?.avgScore}%</p>
                      </div>
                    ) : null
                  }
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {data.timeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(221.2, 83.2%, ${40 + index * 8}%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 30-Day Heatmap */}
        <Card className="rounded-2xl border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">30-Day Study History</CardTitle>
            <p className="text-xs text-muted-foreground">Hover cells to see daily hours</p>
          </CardHeader>
          <CardContent>
            <StudyHeatmap data={data.studyHeatmap} />
            <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
              <span>Less</span>
              <div className="flex gap-1">
                {['bg-muted/30', 'bg-primary/20', 'bg-primary/40', 'bg-primary/70', 'bg-primary'].map((cls, i) => (
                  <div key={i} className={`w-4 h-4 rounded-sm ${cls}`} />
                ))}
              </div>
              <span>More</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendation Engine */}
      <Card className="rounded-2xl border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <CardTitle className="text-base font-bold">High-Impact Recommendations</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {data.recommendations.map((rec, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline" className="text-xs">Priority {rec.priority}</Badge>
                  <span className="text-xs font-bold text-emerald-500">{rec.impact}</span>
                </div>
                <p className="font-semibold text-sm text-foreground">{rec.title}</p>
                <Button size="sm" className="mt-3 w-full rounded-lg h-8 text-xs">
                  <BookOpen size={13} className="mr-1" /> Start Now
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
