'use client';

import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SubjectDistribution } from '@/lib/teacher-service';

const LazyChart = lazy(() => import('./QuestionBankChart'));

interface QuestionBankOverviewProps {
  distribution: SubjectDistribution[];
  loading: boolean;
}

export default function QuestionBankOverview({ distribution, loading }: QuestionBankOverviewProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Question Bank Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-64 bg-muted animate-pulse rounded-lg" />
          ) : distribution.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-40" />
              No questions in the bank yet.
            </div>
          ) : (
            <Suspense fallback={<div className="h-64 bg-muted animate-pulse rounded-lg" />}>
              <LazyChart distribution={distribution} />
            </Suspense>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
