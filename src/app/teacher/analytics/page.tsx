'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import {
  getStudentAnalytics,
  getTeacherStats,
  type StudentPerformance,
  type ChapterWeakness,
  type TeacherStats,
} from '@/lib/teacher-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart3,
  Users,
  TrendingDown,
  Clock,
  Award,
  Loader2,
  GraduationCap,
  Target,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function AnalyticsPage() {
  const { user } = useAuth();

  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [students, setStudents] = useState<StudentPerformance[]>([]);
  const [weakChapters, setWeakChapters] = useState<ChapterWeakness[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      setLoading(true);
      const [statsRes, analyticsRes] = await Promise.all([
        getTeacherStats(user.id),
        getStudentAnalytics(user.id),
      ]);
      if (statsRes.data) setStats(statsRes.data);
      setStudents(analyticsRes.students);
      setWeakChapters(analyticsRes.weakChapters);
      setLoading(false);
    };
    load();
  }, [user?.id]);

  const avgScore = students.length > 0
    ? Math.round(students.reduce((sum, s) => sum + s.avg_score, 0) / students.length)
    : 0;

  const totalTests = students.reduce((sum, s) => sum + s.tests_taken, 0);

  // Data for difficulty distribution chart
  const weakChapterData = weakChapters.map((c) => ({
    name: c.chapter.length > 15 ? c.chapter.slice(0, 15) + '…' : c.chapter,
    accuracy: c.accuracy,
    attempts: c.total_attempts,
  }));

  // Score distribution for pie chart
  const scoreRanges = [
    { name: '0-30%', count: students.filter((s) => s.avg_score <= 30).length },
    { name: '31-60%', count: students.filter((s) => s.avg_score > 30 && s.avg_score <= 60).length },
    { name: '61-80%', count: students.filter((s) => s.avg_score > 60 && s.avg_score <= 80).length },
    { name: '81-100%', count: students.filter((s) => s.avg_score > 80).length },
  ].filter((r) => r.count > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Student Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Performance insights across your batches</p>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Students', value: stats?.totalStudents ?? 0, icon: Users, color: 'text-blue-500' },
            { label: 'Avg Score', value: `${avgScore}%`, icon: Target, color: 'text-emerald-500' },
            { label: 'Tests Taken', value: totalTests, icon: Award, color: 'text-amber-500' },
            { label: 'Weak Chapters', value: weakChapters.length, icon: TrendingDown, color: 'text-red-500' },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                  <CardContent className="flex items-center gap-4 py-5 px-5">
                    <div className={`rounded-xl bg-muted p-3 ${card.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">{card.label}</p>
                      <p className="text-2xl font-bold text-foreground">{typeof card.value === 'number' ? card.value.toLocaleString() : card.value}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weak Chapters Bar Chart */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-500" />
                Weakest Chapters (by accuracy)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {weakChapterData.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  No chapter data available yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weakChapterData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: number) => [`${value}%`, 'Accuracy']}
                      contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }}
                    />
                    <Bar dataKey="accuracy" fill="#ef4444" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Score Distribution Pie Chart */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Score Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {scoreRanges.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  <GraduationCap className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  No test data available yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={scoreRanges}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, count }) => `${name} (${count})`}
                    >
                      {scoreRanges.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Student Performance Table */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Student Performance ({students.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {students.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p>No student data yet</p>
                <p className="text-xs mt-1">Students will appear here once they join your batches and take tests</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8">#</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Tests Taken</TableHead>
                      <TableHead>Avg Score</TableHead>
                      <TableHead>Time Spent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students
                      .sort((a, b) => b.avg_score - a.avg_score)
                      .map((s, i) => (
                        <TableRow key={s.user_id}>
                          <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                          <TableCell className="font-medium">{s.full_name}</TableCell>
                          <TableCell className="text-muted-foreground">{s.email}</TableCell>
                          <TableCell>{s.tests_taken}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                s.avg_score >= 70
                                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                                  : s.avg_score >= 40
                                  ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                                  : 'bg-red-500/10 text-red-600 border-red-500/30'
                              }
                            >
                              {s.avg_score}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {Math.round(s.total_time_seconds / 60)}m
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
