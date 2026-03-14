'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Target, TrendingUp, AlertCircle, BookOpen,
  Play, Zap, Sparkles, Brain, Clock, ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

// ============================================
// PERFORMANCE SNAPSHOT
// ============================================

function PerformanceOverview() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
        <div className="flex items-center gap-2 text-muted-foreground mb-3">
          <Target size={16} className="text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider">Net Accuracy</span>
        </div>
        <div className="flex items-end gap-3">
          <span className="text-3xl font-bold text-foreground">72%</span>
          <span className="text-sm font-medium text-emerald-500 flex items-center mb-1">
            <TrendingUp size={14} className="mr-1" /> +4%
          </span>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
        <div className="flex items-center gap-2 text-muted-foreground mb-3">
          <Sparkles size={16} className="text-amber-500" />
          <span className="text-xs font-semibold uppercase tracking-wider">Strongest</span>
        </div>
        <span className="text-xl font-bold text-foreground block mb-1">Physics</span>
        <span className="text-xs text-muted-foreground">81% average</span>
      </div>

      <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
        <div className="flex items-center gap-2 text-muted-foreground mb-3">
          <AlertCircle size={16} className="text-destructive" />
          <span className="text-xs font-semibold uppercase tracking-wider">Weakest</span>
        </div>
        <span className="text-xl font-bold text-foreground block mb-1">Chemistry</span>
        <span className="text-xs text-muted-foreground">42% average</span>
      </div>

      <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
        <div className="flex items-center gap-2 text-muted-foreground mb-3">
          <Clock size={16} className="text-blue-500" />
          <span className="text-xs font-semibold uppercase tracking-wider">Time/Quest</span>
        </div>
        <div className="flex items-end gap-3">
          <span className="text-3xl font-bold text-foreground">1m 12s</span>
          <span className="text-xs text-destructive flex items-center mb-1">
            <TrendingUp size={12} className="mr-0.5" /> Slow
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SMART RECOMMENDATIONS
// ============================================

function SmartRecommendations() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-2 p-6 rounded-3xl bg-primary/5 border border-primary/20 flex flex-col md:flex-row gap-6 items-center">
        <div className="w-16 h-16 shrink-0 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
          <Brain size={32} />
        </div>
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
            <Badge className="bg-primary/20 text-primary hover:bg-primary/20 font-semibold text-[10px] uppercase">Priority 1</Badge>
            <span className="text-xs text-muted-foreground font-medium">Concept Leak Detected</span>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Revise Kinematics (1D)</h3>
          <p className="text-sm text-muted-foreground">Your accuracy across 4 recent tests dropped to <span className="text-destructive font-bold">38%</span>. Take a targeted Mistake Revision test.</p>
        </div>
        <Button className="shrink-0 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-md">
          Fix Weakness
        </Button>
      </div>

      <div className="p-6 rounded-3xl bg-card border border-border hover:border-primary/50 transition-colors flex flex-col justify-between group cursor-pointer">
        <div>
          <div className="flex items-center gap-2 mb-3 text-muted-foreground">
            <BookOpen size={16} />
            <span className="text-xs font-semibold uppercase">Daily Challenge</span>
          </div>
          <h3 className="font-bold text-foreground text-lg leading-tight mb-2 group-hover:text-primary transition-colors">11th Full PCM Revision Mock</h3>
        </div>
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-muted-foreground font-medium">90 mins • 75 Qs</span>
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play size={14} className="ml-0.5" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// TEST CATEGORIES GRID
// ============================================

const mockCategories = [
  { title: 'Full Length Mocks', subtitle: 'JEE Main, Advanced, NEET', icon: Target, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { title: 'Chapter Tests', subtitle: 'Target specific syllabus units', icon: BookOpen, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  { title: 'Time Attack', subtitle: 'Speed run easy questions', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { title: 'Previous Year', subtitle: 'Authentic past papers', icon: Clock, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { title: 'Mistake Vault', subtitle: 'Re-test failed questions', icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-500/10' },
  { title: 'AI Adaptive', subtitle: 'Engine tests your limits', icon: Brain, color: 'text-purple-500', bg: 'bg-purple-500/10' }
];

// ============================================
// MAIN PAGE
// ============================================

export default function TestsOSDashboard() {
  return (
    <>
      <div className="space-y-8 animate-in fade-in duration-500">

        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">Test OS Studio</h1>
            <p className="text-sm text-muted-foreground mt-1">Intelligent mock engine and performance analytics.</p>
          </div>

          <Link href="/tests/create">
            <Button className="rounded-xl bg-foreground text-background hover:bg-foreground/90 font-semibold px-6 shadow-lg shadow-foreground/10 h-11">
              <Play size={16} className="mr-2" /> Quick Create
            </Button>
          </Link>
        </div>

        {/* Section 1: Snapshot */}
        <section>
          <PerformanceOverview />
        </section>

        {/* Section 2: Recommendations */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="text-primary" size={20} /> Smart Queue
          </h2>
          <SmartRecommendations />
        </section>

        {/* Section 3: Categories Matrix */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Test Library</h2>
            <Link href="/tests/results" className="text-sm text-primary hover:underline font-medium flex items-center">
              View History <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {mockCategories.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <Link href="/tests/create" key={i}>
                  <Card className="hover:border-primary/50 transition-all hover:shadow-md hover:-translate-y-1 cursor-pointer bg-card overflow-hidden group">
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 rounded-xl ${cat.bg} ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon size={24} />
                      </div>
                      <h3 className="font-bold text-foreground">{cat.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{cat.subtitle}</p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </section>

      </div>
    </>
  );
}
