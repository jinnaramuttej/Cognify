"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Target,
  TrendingUp,
  Flame,
  Award,
  BookOpen,
  ChevronRight,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProgressRing } from "@/components/shared";
import { COGNI_THEME, type UserContext, type AIInsights } from "../types";

interface ContextSidebarProps {
  userContext: UserContext;
  insights?: AIInsights;
  className?: string;
}

const subjectColors: Record<string, { bg: string; text: string; dot: string }> = {
  Physics: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  Chemistry: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  Mathematics: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500" },
  Biology: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500" },
};

const mistakeTypeLabels: Record<string, string> = {
  conceptual: "Conceptual",
  calculation: "Calculation",
  time_pressure: "Time",
  silly: "Silly",
};

export function ContextSidebar({ userContext, insights, className }: ContextSidebarProps) {
  const { weakTopics, studyStreak, recentAccuracy, target, grade } = userContext;

  // Calculate performance metrics
  const strongestTopic = weakTopics.length > 0
    ? weakTopics.reduce((prev, curr) =>
        prev.accuracy > curr.accuracy ? prev : curr
      )
    : null;

  const weakestTopic = weakTopics.length > 0
    ? weakTopics.reduce((prev, curr) =>
        prev.accuracy < curr.accuracy ? prev : curr
      )
    : null;

  return (
    <div
      className={cn("flex flex-col h-full border-l", className)}
      style={{ borderColor: COGNI_THEME.border }}
    >
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* User Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-white to-gray-50 border"
              style={{ borderColor: COGNI_THEME.border }}
            >
              <motion.div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md"
                style={{
                  background: `linear-gradient(135deg, ${COGNI_THEME.primary} 0%, ${COGNI_THEME.primaryHover} 100%)`,
                  boxShadow: `0 4px 12px ${COGNI_THEME.primary}30`,
                }}
                whileHover={{ scale: 1.05 }}
              >
                {grade}
              </motion.div>
              <div>
                <p className="font-semibold text-gray-900">Grade {grade}</p>
                <p className="text-xs text-gray-500">{target} Preparation</p>
              </div>
            </div>
          </motion.div>

          {/* Study Streak */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            whileHover={{ y: -2 }}
            className="p-4 rounded-xl border bg-gradient-to-r from-amber-50 to-orange-50"
            style={{ borderColor: "#FCD34D" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Flame className="w-6 h-6 text-orange-500" />
                </motion.div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Study Streak</p>
                  <p className="text-xs text-gray-500">Keep it going!</p>
                </div>
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="text-2xl font-bold text-orange-600"
              >
                {studyStreak}
                <span className="text-xs font-normal text-gray-500 ml-1">days</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Performance Ring */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 rounded-xl border bg-white"
            style={{ borderColor: COGNI_THEME.border }}
          >
            <div className="flex items-center gap-4">
              <ProgressRing value={recentAccuracy} size={70} strokeWidth={5} />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">Overall Accuracy</p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-1.5 rounded-lg bg-green-50 text-green-700">
                    <span className="block font-medium">{strongestTopic?.subject || "N/A"}</span>
                    <span className="opacity-60">Strongest</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-red-50 text-red-600">
                    <span className="block font-medium">{weakestTopic?.subject || "N/A"}</span>
                    <span className="opacity-60">Weakest</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* AI Insights */}
          {insights && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="p-4 rounded-xl border bg-gradient-to-br from-blue-50 to-indigo-50"
              style={{ borderColor: `${COGNI_THEME.primary}30` }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4" style={{ color: COGNI_THEME.primary }} />
                <span className="text-sm font-semibold text-gray-900">AI Insights</span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="text-center p-2 rounded-lg bg-white/60">
                  <p className="text-lg font-bold" style={{ color: COGNI_THEME.primary }}>
                    {insights.conceptMastery}%
                  </p>
                  <p className="text-xs text-gray-500">Mastery</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-white/60">
                  <p className="text-lg font-bold" style={{ color: COGNI_THEME.primary }}>
                    {insights.timeEfficiencyIndex}%
                  </p>
                  <p className="text-xs text-gray-500">Efficiency</p>
                </div>
              </div>

              <motion.div
                className="p-3 rounded-lg bg-white border"
                style={{ borderColor: COGNI_THEME.border }}
                whileHover={{ scale: 1.01 }}
              >
                <p className="text-xs text-gray-500">Predicted Score</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <motion.p
                    className="text-2xl font-bold"
                    style={{ color: COGNI_THEME.primary }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {insights.predictedNextScore}%
                  </motion.p>
                  <span className="text-xs text-gray-400">next test</span>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Weak Topics */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 rounded-xl border bg-white"
            style={{ borderColor: COGNI_THEME.border }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-red-500" />
              <span className="text-sm font-semibold text-gray-900">Weak Topics</span>
            </div>

            <div className="space-y-3">
              {weakTopics.slice(0, 4).map((topic, index) => {
                const colors = subjectColors[topic.subject] || subjectColors.Physics;
                return (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + index * 0.05 }}
                    className="group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <motion.div
                          className={cn("w-2 h-2 rounded-full", colors.dot)}
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                        />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                          {topic.topic}
                        </span>
                      </div>
                      <span
                        className="text-xs font-medium"
                        style={{
                          color: topic.accuracy < 50
                            ? "#DC2626"
                            : topic.accuracy < 70
                              ? "#F59E0B"
                              : "#10B981",
                        }}
                      >
                        {topic.accuracy.toFixed(0)}%
                      </span>
                    </div>
                    <div className="relative h-1.5 rounded-full overflow-hidden bg-gray-100">
                      <motion.div
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{
                          backgroundColor: topic.accuracy < 50
                            ? "#DC2626"
                            : topic.accuracy < 70
                              ? "#F59E0B"
                              : "#10B981",
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${topic.accuracy}%` }}
                        transition={{ duration: 0.5, delay: 0.4 + index * 0.05 }}
                      />
                    </div>
                    {topic.mistakeType && (
                      <span className="text-xs text-gray-400 mt-0.5 block">
                        {mistakeTypeLabels[topic.mistakeType]}
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Recommended Next */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-4 rounded-xl border bg-white"
            style={{ borderColor: COGNI_THEME.border }}
          >
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4" style={{ color: COGNI_THEME.primary }} />
              <span className="text-sm font-semibold text-gray-900">Recommended Next</span>
            </div>

            <div className="space-y-1">
              {weakTopics.slice(0, 2).map((topic, index) => (
                <motion.button
                  key={topic.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + index * 0.05 }}
                  whileHover={{ x: 4, backgroundColor: "#F8FAFF" }}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-colors group"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                      {topic.topic}
                    </p>
                    <p className="text-xs text-gray-400">{topic.subject}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </ScrollArea>
    </div>
  );
}
