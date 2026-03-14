'use client';

import { motion } from 'framer-motion';
import { Upload, FilePlus, Users, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

interface QuickAction {
  label: string;
  description: string;
  icon: React.ElementType;
  href?: string;
  onClick?: () => void;
}

interface TeacherQuickActionsProps {
  onAddBatch: () => void;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

export default function TeacherQuickActions({ onAddBatch }: TeacherQuickActionsProps) {
  const actions: QuickAction[] = [
    {
      label: 'Upload Question PDF',
      description: 'Import questions from PDF',
      icon: Upload,
      href: '/teacher/upload',
    },
    {
      label: 'Create New Test',
      description: 'Build a test for students',
      icon: FilePlus,
      href: '/teacher/tests',
    },
    {
      label: 'Add Batch',
      description: 'Create a new student batch',
      icon: Users,
      onClick: onAddBatch,
    },
    {
      label: 'View Question Bank',
      description: 'Browse all questions',
      icon: BookOpen,
      href: '/teacher/questions',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, i) => {
        const Icon = action.icon;
        const content = (
          <motion.div key={action.label} variants={itemVariants}>
            <Card className="group cursor-pointer border-border/50 hover:border-primary/50 bg-card/80 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
              <CardContent className="flex flex-col items-center text-center gap-3 py-6 px-4">
                <div className="rounded-xl bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{action.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );

        if (action.href) {
          return (
            <Link key={action.label} href={action.href}>
              {content}
            </Link>
          );
        }

        return (
          <div key={action.label} onClick={action.onClick}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
