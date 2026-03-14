'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Flame,
  Trophy,
  BookOpen,
  ArrowRight,
  Sparkles,
  Zap,
  Pause,
  Clock,
  AlertTriangle,
  ChevronRight,
  Target,
  TrendingUp,
  FileText,
  CalendarDays,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeStore } from '@/lib/theme-store';
import { StudyService, DashboardStats } from '@/lib/study-service';
import { getAssignedTests, type AssignedTest } from '@/lib/teacher-service';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
};

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { mode } = useThemeStore();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignedTests, setAssignedTests] = useState<AssignedTest[]>([]);

  const [isStudying, setIsStudying] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Redirect teachers to teacher dashboard
  useEffect(() => {
    if (user?.role === 'teacher' && !user?.isAdmin) {
      router.push('/teacher');
    }
  }, [user, router]);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      const [{ data, error }, assignedRes] = await Promise.all([
        StudyService.getDashboardStats(user.id),
        getAssignedTests(user.id),
      ]);

      if (error) {
        setError('Failed to load dashboard data. Please refresh.');
      } else {
        setStats(data);
      }
      setAssignedTests(assignedRes.data);
      setLoading(false);
    };

    loadData();
  }, [user]);

  useEffect(() => {
    if (isStudying) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isStudying]);

  const handleStartSession = async () => {
    if (!user) return;
    setIsStudying(true);
    setElapsedSeconds(0);

    const { sessionId, error } = await StudyService.startSession(user.id);
    if (error) {
      console.error('Start session error', error);
      setIsStudying(false);
      return;
    }
    setSessionId(sessionId);
  };

  const handleEndSession = async () => {
    if (!sessionId || !user) return;
    setIsStudying(false);

    const { success, error } = await StudyService.endSession(sessionId, user.id);
    if (!success) {
      console.error('End session error', error);
    } else {
      const { data } = await StudyService.getDashboardStats(user.id);
      if (data) setStats(data);
    }

    setSessionId(null);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m ${s}s`;
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse p-4 md:p-0">
        <div className="h-64 bg-[var(--muted)]/10 rounded-3xl w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-40 bg-[var(--muted)]/10 rounded-2xl"></div>
          <div className="h-40 bg-[var(--muted)]/10 rounded-2xl"></div>
          <div className="h-40 bg-[var(--muted)]/10 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
        <div className="p-6 bg-red-500/10 rounded-full mb-6">
          <AlertTriangle className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Technical Difficulty</h2>
        <p className="text-[var(--muted-foreground)] mb-6 max-w-md">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="rounded-xl px-8">Retry Connection</Button>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-10 pb-24 md:pb-12"
    >
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-purple-500/10 blur-[100px] rounded-full" />
      </div>

      {/* Active Session Floater */}
      <AnimatePresence>
        {isStudying && (
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.9 }}
            className="fixed bottom-20 md:bottom-10 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] md:w-auto min-w-[320px]"
          >
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-blue-500/30 p-4 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-between gap-6 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent pointer-events-none" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="relative">
                  <div className="w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40">
                    <Clock className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900" />
                </div>
                <div>
                  <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Focus Mode</p>
                  <p className="text-2xl font-black font-mono tracking-tighter tabular-nums">{formatTime(elapsedSeconds)}</p>
                </div>
              </div>
              <Button
                variant="destructive"
                size="lg"
                onClick={handleEndSession}
                className="rounded-2xl px-6 h-12 shadow-lg shadow-red-500/25 relative z-10 font-bold active:scale-95 transition-transform"
              >
                <Pause className="w-5 h-5 mr-2" /> Stop
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Hero Section */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="group relative h-full rounded-[2.5rem] overflow-hidden border border-white/20 dark:border-white/10 shadow-2xl transition-all duration-500 hover:shadow-blue-500/20">
            {/* Rich Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 dark:from-blue-900 dark:via-indigo-950 dark:to-slate-950" />
            <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 blur-3xl rounded-full transition-transform group-hover:scale-150 duration-700" />

            <div className="relative z-10 p-8 md:p-12 flex flex-col justify-between h-full">
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-white uppercase tracking-widest border border-white/10">
                    Student Dashboard
                  </span>
                </motion.div>
                <h1 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
                  Welcome back,<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-100">
                    {user?.full_name?.split(' ')[0] || 'Scholar'}
                  </span>
                </h1>
                <p className="text-blue-100/80 text-lg md:text-xl max-w-md font-medium">
                  {isStudying
                    ? "Time to lock in. Every second counts toward your mastery."
                    : "Ready to conquer your goals today? Your consistent effort pays off."}
                </p>
              </div>

              <div className="mt-12">
                <AnimatePresence mode="wait">
                  {!isStudying ? (
                    <motion.div
                      key="start-ui"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex flex-col sm:flex-row items-center gap-6"
                    >
                      <Button
                        onClick={handleStartSession}
                        className="group w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 text-xl py-8 px-10 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.2)] transition-all hover:scale-105 active:scale-95 font-black uppercase tracking-tight"
                      >
                        <Play size={24} className="mr-3 fill-current" /> Focus Now
                      </Button>
                      <div className="flex -space-x-3">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-10 h-10 rounded-full border-2 border-indigo-500 bg-indigo-400 flex items-center justify-center text-[10px] font-bold text-white shadow-xl">
                            {['AI', 'GT', 'RE'][i - 1]}
                          </div>
                        ))}
                        <div className="pl-6 text-sm text-blue-100/60 font-semibold italic">
                          Join 2,8k+ students<br />studying right now
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="active-ui"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-start gap-4"
                    >
                      <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-[2.5rem] w-full max-w-sm">
                        <div className="w-16 h-16 rounded-full border-4 border-blue-400/30 border-t-blue-400 animate-spin" />
                        <div>
                          <p className="text-3xl font-black font-mono text-white tabular-nums tracking-tighter">
                            {formatTime(elapsedSeconds)}
                          </p>
                          <p className="text-[10px] font-bold text-blue-200 uppercase tracking-[0.2em]">Live Session</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Column */}
        <div className="grid gap-6">
          <motion.div variants={itemVariants}>
            <Card className="group relative overflow-hidden h-full rounded-[2.5rem] border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent hover:border-orange-500/40 transition-all duration-300">
              <CardContent className="p-8 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-orange-500 uppercase tracking-widest mb-1">Weekly Streak</p>
                  <div className="flex items-center gap-3">
                    <h3 className="text-5xl font-black tracking-tighter">{stats?.streak.current_streak || 0}</h3>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold opacity-60">DAYS</span>
                      <span className="text-[10px] font-bold text-orange-500/80">HOT 🔥</span>
                    </div>
                  </div>
                </div>
                <div className={`p-5 rounded-[1.5rem] transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 ${stats?.streak.current_streak! > 0 ? 'bg-orange-500/20 text-orange-500 shadow-[0_10px_30px_rgba(249,115,22,0.3)]' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                  <Flame size={48} className={stats?.streak.current_streak! > 0 ? 'fill-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,1)]' : ''} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="group relative overflow-hidden h-full rounded-[2.5rem] border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent hover:border-blue-500/40 transition-all duration-300">
              <CardContent className="p-8 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-blue-500 uppercase tracking-widest mb-1">Today's Focus</p>
                  <div className="flex items-center gap-3">
                    <h3 className="text-5xl font-black tracking-tighter">{Math.floor((stats?.todayStudyTime || 0) / 60)}</h3>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold opacity-60">MINS</span>
                      <span className="text-[10px] font-bold text-blue-500/80">ACTIVE 🚀</span>
                    </div>
                  </div>
                </div>
                <div className="p-5 bg-blue-500/20 text-blue-500 rounded-[1.5rem] shadow-[0_10px_30px_rgba(59,130,246,0.3)] group-hover:-rotate-12 group-hover:scale-110 transition-all duration-500">
                  <Target size={48} className="drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <motion.div variants={itemVariants} className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
            <div className="w-1.5 h-8 bg-blue-500 rounded-full" />
            Launchpad
          </h2>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">2 Ready to launch</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Leaderboard',
              desc: 'Global Rankings',
              icon: Trophy,
              href: '/leaderboard',
              color: 'text-yellow-500',
              bg: 'bg-yellow-500/10',
              border: 'border-yellow-500/20',
              hover: 'hover:border-yellow-500/40 hover:bg-yellow-500/5'
            },
            {
              title: 'My Profile',
              desc: 'Progress & XP',
              icon: Sparkles,
              href: '/settings',
              color: 'text-pink-500',
              bg: 'bg-pink-500/10',
              border: 'border-pink-500/20',
              hover: 'hover:border-pink-500/40 hover:bg-pink-500/5'
            },
            {
              title: 'Curriculum',
              desc: 'Lessons & Material',
              icon: BookOpen,
              href: '/lectures',
              color: 'text-emerald-500',
              bg: 'bg-emerald-500/10',
              border: 'border-emerald-500/20',
              hover: 'hover:border-emerald-500/40 hover:bg-emerald-500/5'
            },
            {
              title: 'Practice',
              desc: 'Active Recall',
              icon: Zap,
              href: '/practice-quizzes',
              color: 'text-indigo-500',
              bg: 'bg-indigo-500/10',
              border: 'border-indigo-500/20',
              hover: 'hover:border-indigo-500/40 hover:bg-indigo-500/5'
            },
          ].map((action, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`group cursor-pointer p-6 rounded-[2.5rem] border ${action.border} ${action.hover} bg-card shadow-sm transition-all duration-300 relative overflow-hidden`}
              onClick={() => router.push(action.href)}
            >
              <div className="flex flex-col gap-4 relative z-10">
                <div className={`w-14 h-14 rounded-2xl ${action.bg} ${action.color} flex items-center justify-center transition-transform group-hover:shadow-lg`}>
                  <action.icon size={28} strokeWidth={2.5} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-black text-lg tracking-tight">{action.title}</h3>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{action.desc}</p>
                </div>
              </div>
              <ChevronRight className="absolute bottom-6 right-6 w-5 h-5 opacity-0 group-hover:opacity-40 transition-opacity" />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Assigned Tests from Teacher */}
      {assignedTests.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
              <div className="w-1.5 h-8 bg-emerald-500 rounded-full" />
              Assigned Tests
            </h2>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{assignedTests.length} pending</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {assignedTests.map((test) => (
              <Card
                key={test.id}
                className="group cursor-pointer border-emerald-500/20 rounded-[2rem] bg-card hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all duration-300 relative overflow-hidden"
                onClick={() => router.push(`/tests/${test.id}`)}
              >
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center">
                      <FileText size={24} strokeWidth={2.5} />
                    </div>
                    {test.due_date && (
                      <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1">
                        <CalendarDays size={12} />
                        Due {new Date(test.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-base tracking-tight">{test.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {test.total_questions} questions · {test.duration_minutes} mins · by {test.teacher_name}
                    </p>
                  </div>
                  <ChevronRight className="absolute bottom-6 right-6 w-5 h-5 opacity-0 group-hover:opacity-40 transition-opacity" />
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent History Overhaul */}
      <motion.div variants={itemVariants} className="space-y-6">
        <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
          <div className="w-1.5 h-8 bg-purple-500 rounded-full" />
          Timeline
        </h2>

        {stats?.recentSessions && stats.recentSessions.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats.recentSessions.map((session) => (
              <Card key={session.id} className="border-border rounded-[2rem] bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors border-l-4 border-l-blue-500 shadow-sm">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center">
                      <TrendingUp size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{new Date(session.start_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">
                        {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black font-mono tracking-tighter">{formatTime(session.duration_seconds)}</p>
                    <p className="text-[10px] font-bold text-blue-500/60 uppercase">Duration</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-2 border-dashed border-border rounded-[3rem] bg-transparent">
            <CardContent className="p-16 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-6">
                <BookOpen className="w-10 h-10 opacity-30" />
              </div>
              <h3 className="text-xl font-black mb-2 tracking-tight">Your story starts here</h3>
              <p className="text-muted-foreground text-sm max-w-[280px]">Begin a study session to see your timeline come to life.</p>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </motion.div>
  );
}