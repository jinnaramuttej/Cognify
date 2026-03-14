"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, BookOpen, Target, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { COGNI_THEME, type WeakTopic } from "../types";

interface WeaknessInsightCardProps {
  topics: WeakTopic[];
  className?: string;
}

const subjectColors: Record<string, string> = {
  Physics: "bg-blue-500/10 text-blue-700 border-blue-200",
  Chemistry: "bg-green-500/10 text-green-700 border-green-200",
  Mathematics: "bg-purple-500/10 text-purple-700 border-purple-200",
  Biology: "bg-orange-500/10 text-orange-700 border-orange-200",
};

const mistakeTypeLabels: Record<string, { label: string; color: string }> = {
  conceptual: { label: "Conceptual Error", color: "text-red-600" },
  calculation: { label: "Calculation Error", color: "text-amber-600" },
  time_pressure: { label: "Time Pressure", color: "text-orange-600" },
  silly: { label: "Silly Mistake", color: "text-gray-600" },
};

export function WeaknessInsightCard({ topics, className }: WeaknessInsightCardProps) {
  if (topics.length === 0) {
    return (
      <Card className={cn("border shadow-sm", className)} style={{ borderColor: COGNI_THEME.border }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Target className="w-4 h-4" style={{ color: COGNI_THEME.primary }} />
            Weakness Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
              style={{ backgroundColor: COGNI_THEME.lightPanel }}
            >
              <BookOpen className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              No weakness data available yet.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Complete tests to identify your weak topics.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border shadow-sm", className)} style={{ borderColor: COGNI_THEME.border }}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" style={{ color: COGNI_THEME.warning }} />
          Weakness Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {topics.map((topic, index) => (
          <motion.div
            key={topic.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: index * 0.1 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {topic.topic}
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    subjectColors[topic.subject] || "bg-gray-100 text-gray-700 border-gray-200"
                  )}
                >
                  {topic.subject}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingDown className="w-3 h-3" />
                {topic.accuracy.toFixed(0)}%
              </div>
            </div>
            <Progress
              value={topic.accuracy}
              className="h-1.5"
              style={{ backgroundColor: COGNI_THEME.lightPanel }}
            />
            {topic.mistakeType && mistakeTypeLabels[topic.mistakeType] && (
              <p className={cn("text-xs", mistakeTypeLabels[topic.mistakeType].color)}>
                {mistakeTypeLabels[topic.mistakeType].label}
              </p>
            )}
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
