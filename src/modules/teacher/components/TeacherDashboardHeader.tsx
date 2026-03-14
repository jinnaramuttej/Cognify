'use client';

import { motion } from 'framer-motion';
import { Bell, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface TeacherDashboardHeaderProps {
  teacherName: string;
  examFocus?: string;
}

export default function TeacherDashboardHeader({ teacherName, examFocus }: TeacherDashboardHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
    >
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Welcome back, <span className="text-primary">{teacherName}</span>
        </h1>
        {examFocus && (
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            Managing:{' '}
            <Badge variant="secondary" className="text-xs font-medium">
              {examFocus} Content
            </Badge>
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative" asChild>
          <Link href="/settings">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
          </Link>
        </Button>
        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings">
            <Settings className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
