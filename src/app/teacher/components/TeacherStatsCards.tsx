'use client';

import { motion } from 'framer-motion';
import { HelpCircle, FileText, Users, GraduationCap, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { TeacherStats } from '@/lib/teacher-service';

interface TeacherStatsCardsProps {
  stats: TeacherStats | null;
  loading: boolean;
}

const cards = [
  { key: 'totalQuestions' as const, label: 'Total Questions', icon: HelpCircle, color: 'text-blue-500' },
  { key: 'totalTests' as const, label: 'Tests Created', icon: FileText, color: 'text-emerald-500' },
  { key: 'activeBatches' as const, label: 'Active Batches', icon: Users, color: 'text-amber-500' },
  { key: 'totalStudents' as const, label: 'Total Students', icon: GraduationCap, color: 'text-violet-500' },
];

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

export default function TeacherStatsCards({ stats, loading }: TeacherStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const value = stats ? stats[card.key] : 0;

        return (
          <motion.div key={card.key} variants={itemVariants}>
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="flex items-center gap-4 py-5 px-5">
                <div className={`rounded-xl bg-muted p-3 ${card.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium">{card.label}</p>
                  {loading ? (
                    <div className="h-7 w-16 bg-muted animate-pulse rounded mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground">{value.toLocaleString()}</p>
                  )}
                </div>
                <TrendingUp className="h-4 w-4 text-emerald-500 opacity-60" />
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
