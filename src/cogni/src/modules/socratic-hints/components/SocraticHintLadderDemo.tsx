/**
 * Socratic Hint Ladder - Demo Page
 * 
 * A comprehensive demo showcasing the progressive hint system
 * with sample questions, hint budgets, and analytics.
 */

"use client";

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lightbulb,
  HelpCircle,
  ArrowRight,
  CheckCircle,
  ChevronUp,
  ChevronDown,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Sparkles,
  Baby,
  FileText,
  Video,
  Users,
  X,
  Loader2,
  Info,
  Zap,
  BookOpen,
  Brain,
  Target,
  BarChart3,
  Settings,
  Play,
  RefreshCw,
  GraduationCap,
  Clock,
  TrendingUp,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { 
  HintLevel, 
  GeneratedHint, 
  HintBudget, 
  EscalationState, 
  EscalationType,
  HintContext,
} from '@/lib/socratic/types';
import { HINT_LEVELS, DEFAULT_BUDGET_CONFIG } from '@/lib/socratic/types';
import { 
  createInitialBudget, 
  deductHintCost, 
  canAffordHint, 
  getBudgetStatusText,
  checkEscalation,
  getEscalationDescription,
  recommendNextHintLevel,
} from '@/lib/socratic/budget-logic';

// ============================================================
// Sample Questions
// ============================================================

const SAMPLE_QUESTIONS = [
  {
    id: 'q1',
    text: 'A car accelerates from rest to 20 m/s in 5 seconds. What is its acceleration?',
    subject: 'Physics',
    topic: 'Kinematics',
    difficulty: 'easy' as const,
    correctAnswer: '4 m/s²',
  },
  {
    id: 'q2',
    text: 'Find the derivative of f(x) = 3x² + 2x - 5',
    subject: 'Math',
    topic: 'Calculus',
    difficulty: 'medium' as const,
    correctAnswer: 'f\'(x) = 6x + 2',
  },
  {
    id: 'q3',
    text: 'Balance the equation: Fe + O₂ → Fe₂O₃',
    subject: 'Chemistry',
    topic: 'Chemical Reactions',
    difficulty: 'medium' as const,
    correctAnswer: '4Fe + 3O₂ → 2Fe₂O₃',
  },
  {
    id: 'q4',
    text: 'A ball is thrown upward with an initial velocity of 15 m/s. How high does it go? (g = 10 m/s²)',
    subject: 'Physics',
    topic: 'Projectile Motion',
    difficulty: 'hard' as const,
    correctAnswer: '11.25 m',
  },
];

// ============================================================
// Icon & Color Mappings
// ============================================================

const LEVEL_ICONS: Record<HintLevel, React.ElementType> = {
  1: Lightbulb,
  2: HelpCircle,
  3: ArrowRight,
  4: CheckCircle,
};

const LEVEL_COLORS: Record<HintLevel, { bg: string; text: string; border: string; gradient: string }> = {
  1: { 
    bg: 'bg-blue-50', 
    text: 'text-blue-600', 
    border: 'border-blue-200',
    gradient: 'from-blue-500 to-blue-600',
  },
  2: { 
    bg: 'bg-amber-50', 
    text: 'text-amber-600', 
    border: 'border-amber-200',
    gradient: 'from-amber-500 to-amber-600',
  },
  3: { 
    bg: 'bg-purple-50', 
    text: 'text-purple-600', 
    border: 'border-purple-200',
    gradient: 'from-purple-500 to-purple-600',
  },
  4: { 
    bg: 'bg-emerald-50', 
    text: 'text-emerald-600', 
    border: 'border-emerald-200',
    gradient: 'from-emerald-500 to-emerald-600',
  },
};

const ESCALATION_ICONS: Record<EscalationType, React.ElementType> = {
  eli5: Baby,
  worked_example: FileText,
  video: Video,
  teacher_help: Users,
};

// ============================================================
// Hint Level Button Component
// ============================================================

interface HintLevelButtonProps {
  level: HintLevel;
  isUsed: boolean;
  isAvailable: boolean;
  canAfford: boolean;
  onRequest: () => void;
  compact?: boolean;
}

function HintLevelButton({ level, isUsed, isAvailable, canAfford, onRequest, compact }: HintLevelButtonProps) {
  const config = HINT_LEVELS[level];
  const Icon = LEVEL_ICONS[level];
  const colors = LEVEL_COLORS[level];
  
  return (
    <motion.button
      onClick={onRequest}
      disabled={!isAvailable || !canAfford}
      className={cn(
        "relative flex items-center gap-3 w-full p-3 rounded-xl border-2 transition-all text-left",
        isUsed ? cn(colors.bg, colors.border) : "bg-white border-gray-100 hover:border-gray-200",
        !canAfford && "opacity-50 cursor-not-allowed",
        canAfford && isAvailable && !isUsed && "hover:shadow-md",
        compact && "p-2"
      )}
      whileHover={canAfford && isAvailable ? { scale: 1.01 } : {}}
      whileTap={canAfford && isAvailable ? { scale: 0.99 } : {}}
    >
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
        isUsed ? `bg-gradient-to-br ${colors.gradient}` : "bg-gray-100",
        isUsed && "text-white"
      )}>
        {isUsed ? (
          <CheckCircle className="w-4 h-4" />
        ) : (
          <span className={cn("text-sm font-bold", colors.text)}>{level}</span>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className={cn(
          "font-medium text-sm",
          isUsed ? colors.text : "text-gray-700"
        )}>
          {config.name}
        </p>
        {!compact && (
          <p className="text-xs text-gray-400 truncate">{config.description}</p>
        )}
      </div>
      
      <Badge variant="outline" className={cn(
        "text-xs",
        canAfford ? "text-gray-500" : "text-red-400"
      )}>
        {config.weight} credit{config.weight !== 1 ? 's' : ''}
      </Badge>
    </motion.button>
  );
}

// ============================================================
// Hint Display Component
// ============================================================

interface HintDisplayProps {
  hint: GeneratedHint;
  onFeedback: (wasHelpful: boolean) => void;
  feedbackSubmitted?: boolean;
}

function HintDisplay({ hint, onFeedback, feedbackSubmitted }: HintDisplayProps) {
  const config = HINT_LEVELS[hint.level];
  const colors = LEVEL_COLORS[hint.level];
  const [showFeedback, setShowFeedback] = useState(true);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className={cn(
        "rounded-xl border-2 p-4",
        colors.bg,
        colors.border
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className={cn(
          "w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br",
          colors.gradient
        )}>
          <span className="text-xs font-bold text-white">H{hint.level}</span>
        </div>
        <span className={cn("font-medium text-sm", colors.text)}>
          {config.name}
        </span>
        {hint.latency && (
          <Badge variant="outline" className="text-xs ml-auto">
            <Clock className="w-3 h-3 mr-1" />
            {hint.latency}ms
          </Badge>
        )}
      </div>
      
      <div className="prose prose-sm max-w-none">
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{hint.content}</p>
      </div>
      
      {showFeedback && !feedbackSubmitted && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 pt-3 border-t border-gray-200"
        >
          <p className="text-xs text-gray-500 mb-2">Was this hint helpful?</p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => { onFeedback(true); setShowFeedback(false); }}
              className="gap-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              Yes
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => { onFeedback(false); setShowFeedback(false); }}
              className="gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              No
            </Button>
          </div>
        </motion.div>
      )}
      
      {feedbackSubmitted && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-xs text-gray-400"
        >
          Thanks for your feedback!
        </motion.p>
      )}
    </motion.div>
  );
}

// ============================================================
// Escalation Panel Component
// ============================================================

interface EscalationPanelProps {
  escalation: EscalationState;
  onEscalate: (type: EscalationType) => void;
  onDismiss: () => void;
}

function EscalationPanel({ escalation, onEscalate, onDismiss }: EscalationPanelProps) {
  if (!escalation.isTriggered) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200 p-4"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
        </div>
        
        <div className="flex-1">
          <h4 className="font-medium text-amber-800">
            Need more help?
          </h4>
          <p className="text-sm text-amber-600 mt-1">
            You've used several full solutions. Here are additional resources:
          </p>
          
          <div className="grid grid-cols-2 gap-2 mt-3">
            {escalation.availableOptions.map((type) => {
              const desc = getEscalationDescription(type);
              const Icon = ESCALATION_ICONS[type];
              
              return (
                <motion.button
                  key={type}
                  onClick={() => onEscalate(type)}
                  className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-amber-200 hover:border-amber-300 hover:shadow-sm transition-all text-left"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 truncate">{desc.title}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
        
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDismiss}>
          <X className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}

// ============================================================
// Budget Indicator Component
// ============================================================

interface BudgetIndicatorProps {
  budget: HintBudget;
  compact?: boolean;
}

function BudgetIndicator({ budget, compact }: BudgetIndicatorProps) {
  const status = getBudgetStatusText(budget);
  const percentRemaining = (budget.remaining / budget.total) * 100;
  
  const progressColor = percentRemaining > 50 
    ? 'bg-emerald-500' 
    : percentRemaining > 20 
      ? 'bg-amber-500' 
      : 'bg-red-500';
  
  if (compact) {
    return (
      <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-gray-50">
        <Zap className="w-3.5 h-3.5 text-gray-400" />
        <span className={cn(
          "text-xs font-medium",
          status.status === 'good' ? 'text-gray-600' :
          status.status === 'warning' ? 'text-amber-600' : 'text-red-500'
        )}>
          {Math.round(budget.remaining)} credits
        </span>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">Hint Budget</span>
        <span className={cn(
          "font-medium",
          status.status === 'good' ? 'text-gray-700' :
          status.status === 'warning' ? 'text-amber-600' : 'text-red-500'
        )}>
          {Math.round(budget.remaining)} / {Math.round(budget.total)}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className={cn("h-full rounded-full", progressColor)}
          initial={{ width: '100%' }}
          animate={{ width: `${percentRemaining}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}

// ============================================================
// Escalation Content Modal
// ============================================================

interface EscalationModalProps {
  isOpen: boolean;
  type: EscalationType;
  content: string;
  onClose: () => void;
}

function EscalationModal({ isOpen, type, content, onClose }: EscalationModalProps) {
  const Icon = ESCALATION_ICONS[type];
  const desc = getEscalationDescription(type);
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{desc.title}</h3>
                  <p className="text-sm text-gray-500">{desc.description}</p>
                </div>
                <Button variant="ghost" size="icon" className="ml-auto" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{content}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================
// Teacher Config Panel
// ============================================================

interface TeacherConfigPanelProps {
  config: {
    maxHintsPerSession: number;
    maxLevel4PerSession: number;
    escalationThreshold: number;
  };
  onChange: (config: TeacherConfigPanelProps['config']) => void;
}

function TeacherConfigPanel({ config, onChange }: TeacherConfigPanelProps) {
  return (
    <Card className="bg-gradient-to-br from-slate-50 to-slate-100">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Teacher Configuration
        </CardTitle>
        <CardDescription>
          Adjust hint budget settings for your students
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Max Hints per Session: {config.maxHintsPerSession}
          </label>
          <input
            type="range"
            min="5"
            max="50"
            value={config.maxHintsPerSession}
            onChange={(e) => onChange({ ...config, maxHintsPerSession: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Max Full Solutions: {config.maxLevel4PerSession}
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={config.maxLevel4PerSession}
            onChange={(e) => onChange({ ...config, maxLevel4PerSession: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Escalation Threshold: {config.escalationThreshold}
          </label>
          <input
            type="range"
            min="1"
            max="5"
            value={config.escalationThreshold}
            onChange={(e) => onChange({ ...config, escalationThreshold: parseInt(e.target.value) })}
            className="w-full"
          />
          <p className="text-xs text-gray-500">
            Number of Level 4 hints before escalation options appear
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// Analytics Dashboard
// ============================================================

interface AnalyticsDashboardProps {
  stats: {
    totalHints: number;
    helpfulCount: number;
    unhelpfulCount: number;
    avgHelpfulness: number;
    levelDistribution: Record<number, number>;
  };
}

function AnalyticsDashboard({ stats }: AnalyticsDashboardProps) {
  const helpfulPercent = stats.totalHints > 0 
    ? Math.round((stats.helpfulCount / (stats.helpfulCount + stats.unhelpfulCount || 1)) * 100)
    : 0;
  
  return (
    <div className="space-y-4">
      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalHints}</p>
                <p className="text-xs text-gray-500">Total Hints</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <ThumbsUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{helpfulPercent}%</p>
                <p className="text-xs text-gray-500">Helpful Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.avgHelpfulness.toFixed(1)}</p>
                <p className="text-xs text-gray-500">Avg Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <Award className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.helpfulCount}</p>
                <p className="text-xs text-gray-500">Helpful Hints</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Level Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Hint Level Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {([1, 2, 3, 4] as HintLevel[]).map((level) => {
              const count = stats.levelDistribution[level] || 0;
              const percent = stats.totalHints > 0 ? (count / stats.totalHints) * 100 : 0;
              const colors = LEVEL_COLORS[level];
              
              return (
                <div key={level} className="flex items-center gap-3">
                  <div className={cn(
                    "w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br",
                    colors.gradient
                  )}>
                    {level}
                  </div>
                  <div className="flex-1">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className={cn("h-full rounded-full bg-gradient-to-r", colors.gradient)}
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 0.5, delay: level * 0.1 }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Acceptance Criteria */}
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span className="font-medium text-emerald-800">Acceptance Criteria</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center",
                stats.avgHelpfulness >= 4 ? "bg-emerald-100" : "bg-gray-100"
              )}>
                {stats.avgHelpfulness >= 4 ? (
                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                ) : (
                  <span className="text-xs text-gray-400">✗</span>
                )}
              </div>
              <span className={cn(
                "text-sm",
                stats.avgHelpfulness >= 4 ? "text-emerald-700" : "text-gray-500"
              )}>
                Average hint helpfulness &gt; 4/5
              </span>
              <Badge variant="outline" className="ml-auto">
                {stats.avgHelpfulness.toFixed(1)}/5
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// Main Socratic Hint Ladder Demo
// ============================================================

export function SocraticHintLadderDemo() {
  const userId = 'demo_user_001';
  
  // State
  const [currentQuestion, setCurrentQuestion] = useState(SAMPLE_QUESTIONS[0]);
  const [isOpen, setIsOpen] = useState(false);
  const [budget, setBudget] = useState<HintBudget>(() => createInitialBudget());
  const [hints, setHints] = useState<GeneratedHint[]>([]);
  const [currentHint, setCurrentHint] = useState<GeneratedHint | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [escalation, setEscalation] = useState<EscalationState>({
    isTriggered: false,
    triggerCount: 0,
    recommendedAction: 'worked_example',
    availableOptions: [],
  });
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, boolean>>({});
  const [escalationModal, setEscalationModal] = useState<{ isOpen: boolean; type: EscalationType; content: string }>({
    isOpen: false,
    type: 'eli5',
    content: '',
  });
  const [teacherConfig, setTeacherConfig] = useState({
    maxHintsPerSession: 20,
    maxLevel4PerSession: 3,
    escalationThreshold: 3,
  });
  
  // Analytics stats
  const stats = useMemo(() => {
    const totalHints = hints.length;
    const helpfulCount = Object.values(feedbackGiven).filter(Boolean).length;
    const unhelpfulCount = Object.values(feedbackGiven).filter(v => v === false).length;
    const avgHelpfulness = totalHints > 0 
      ? (helpfulCount / (helpfulCount + unhelpfulCount || 1)) * 5 
      : 0;
    
    const levelDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
    hints.forEach(h => {
      levelDistribution[h.level] = (levelDistribution[h.level] || 0) + 1;
    });
    
    return {
      totalHints,
      helpfulCount,
      unhelpfulCount,
      avgHelpfulness,
      levelDistribution,
    };
  }, [hints, feedbackGiven]);
  
  // Used levels
  const usedLevels = useMemo(() => hints.map(h => h.level), [hints]);
  
  // Handle hint request
  const handleRequestHint = useCallback(async (level: HintLevel) => {
    const affordability = canAffordHint(level, budget);
    if (!affordability.canAfford) {
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const context: HintContext = {
        questionText: currentQuestion.text,
        questionId: currentQuestion.id,
        subject: currentQuestion.subject,
        topic: currentQuestion.topic,
        difficulty: currentQuestion.difficulty,
        previousHints: usedLevels,
      };
      
      const response = await fetch('/api/socratic/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          context,
          requestedLevel: level,
        }),
      });
      
      const data = await response.json();
      
      if (data.success && data.hint) {
        const newHint = data.hint;
        
        setHints(prev => [...prev, newHint]);
        setCurrentHint(newHint);
        setBudget(data.budget || deductHintCost(level, budget));
        
        if (level === 4 && data.escalation) {
          setEscalation({
            isTriggered: data.escalation.isTriggered,
            triggerCount: usedLevels.filter(l => l === 4).length + 1,
            recommendedAction: 'worked_example',
            availableOptions: data.escalation.availableOptions as EscalationType[],
          });
        }
      }
    } catch (error) {
      console.error('Error generating hint:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [budget, currentQuestion, usedLevels]);
  
  // Handle feedback
  const handleFeedback = useCallback(async (hintId: string, wasHelpful: boolean) => {
    try {
      await fetch('/api/socratic/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hintUsageId: hintId,
          userId,
          wasHelpful,
        }),
      });
      
      setFeedbackGiven(prev => ({ ...prev, [hintId]: true }));
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  }, []);
  
  // Handle escalation
  const handleEscalate = useCallback(async (type: EscalationType) => {
    try {
      const context: HintContext = {
        questionText: currentQuestion.text,
        questionId: currentQuestion.id,
        subject: currentQuestion.subject,
        topic: currentQuestion.topic,
        difficulty: currentQuestion.difficulty,
      };
      
      const response = await fetch('/api/socratic/escalate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          type,
          context,
        }),
      });
      
      const data = await response.json();
      
      if (data.success && data.content) {
        setEscalationModal({
          isOpen: true,
          type,
          content: data.content.content,
        });
        setEscalation(prev => ({ ...prev, isTriggered: false }));
      }
    } catch (error) {
      console.error('Error escalating:', error);
    }
  }, [currentQuestion]);
  
  // Reset session
  const resetSession = useCallback(() => {
    setBudget(createInitialBudget());
    setHints([]);
    setCurrentHint(null);
    setEscalation({
      isTriggered: false,
      triggerCount: 0,
      recommendedAction: 'worked_example',
      availableOptions: [],
    });
    setFeedbackGiven({});
    setIsOpen(false);
  }, []);
  
  // Select new question
  const selectQuestion = useCallback((q: typeof SAMPLE_QUESTIONS[0]) => {
    setCurrentQuestion(q);
    setHints([]);
    setCurrentHint(null);
    setIsOpen(false);
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Socratic Hint Ladder</h1>
                <p className="text-xs text-gray-500">Progressive hints that guide discovery</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <BudgetIndicator budget={budget} />
              <Button variant="outline" size="sm" onClick={resetSession} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4">
        <Tabs defaultValue="demo" className="w-full">
          <TabsList className="grid w-full max-w-lg grid-cols-3 mb-4">
            <TabsTrigger value="demo" className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Demo
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configure
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="demo" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Question Selector */}
              <div className="lg:col-span-1 space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Sample Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {SAMPLE_QUESTIONS.map((q) => (
                      <motion.button
                        key={q.id}
                        onClick={() => selectQuestion(q)}
                        className={cn(
                          "w-full text-left p-3 rounded-xl border-2 transition-all",
                          currentQuestion.id === q.id
                            ? "border-emerald-300 bg-emerald-50"
                            : "border-gray-100 hover:border-gray-200"
                        )}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="flex items-start gap-2">
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "mt-0.5",
                              q.difficulty === 'easy' && "text-green-600 border-green-200",
                              q.difficulty === 'medium' && "text-amber-600 border-amber-200",
                              q.difficulty === 'hard' && "text-red-600 border-red-200"
                            )}
                          >
                            {q.difficulty}
                          </Badge>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700 line-clamp-2">{q.text}</p>
                            <p className="text-xs text-gray-400 mt-1">{q.subject} • {q.topic}</p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </CardContent>
                </Card>
              </div>
              
              {/* Main Question Area */}
              <div className="lg:col-span-2 space-y-4">
                {/* Question Card */}
                <Card className="overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{currentQuestion.subject}</Badge>
                        <Badge variant="outline">{currentQuestion.topic}</Badge>
                        <Badge 
                          variant="outline"
                          className={cn(
                            currentQuestion.difficulty === 'easy' && "text-green-600 border-green-200",
                            currentQuestion.difficulty === 'medium' && "text-amber-600 border-amber-200",
                            currentQuestion.difficulty === 'hard' && "text-red-600 border-red-200"
                          )}
                        >
                          {currentQuestion.difficulty}
                        </Badge>
                      </div>
                      
                      {/* Hint Button */}
                      <div className="relative">
                        <motion.button
                          onClick={() => setIsOpen(!isOpen)}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all",
                            isOpen 
                              ? "bg-emerald-50 border-emerald-300 text-emerald-600" 
                              : "bg-white border-gray-200 hover:border-emerald-300 text-gray-600"
                          )}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Lightbulb className={cn("w-5 h-5", isOpen && "text-emerald-500")} />
                          <span className="font-medium">Get Hints</span>
                          <ChevronDown className={cn(
                            "w-4 h-4 transition-transform",
                            isOpen && "rotate-180"
                          )} />
                        </motion.button>
                        
                        {/* Dropdown Menu */}
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              transition={{ duration: 0.15 }}
                              className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border z-50 overflow-hidden"
                            >
                              {/* Header */}
                              <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
                                <div className="flex items-center justify-between mb-2">
                                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-emerald-500" />
                                    Socratic Hints
                                  </h3>
                                </div>
                                <p className="text-xs text-gray-500">
                                  Progressive hints to guide your thinking
                                </p>
                              </div>
                              
                              {/* Hint Levels */}
                              <div className="p-3 space-y-2">
                                {([1, 2, 3, 4] as HintLevel[]).map((level) => (
                                  <HintLevelButton
                                    key={level}
                                    level={level}
                                    isUsed={usedLevels.includes(level)}
                                    isAvailable={!isGenerating}
                                    canAfford={canAffordHint(level, budget).canAfford}
                                    onRequest={() => handleRequestHint(level)}
                                  />
                                ))}
                              </div>
                              
                              {/* Loading Indicator */}
                              {isGenerating && (
                                <div className="px-3 pb-3">
                                  <div className="flex items-center justify-center gap-2 py-3 bg-gray-50 rounded-xl">
                                    <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                                    <span className="text-sm text-gray-500">Generating hint...</span>
                                  </div>
                                </div>
                              )}
                              
                              {/* Current Hint Display */}
                              <AnimatePresence>
                                {currentHint && !isGenerating && (
                                  <div className="px-3 pb-3">
                                    <HintDisplay
                                      hint={currentHint}
                                      onFeedback={(wasHelpful) => handleFeedback(currentHint.id, wasHelpful)}
                                      feedbackSubmitted={feedbackGiven[currentHint.id]}
                                    />
                                  </div>
                                )}
                              </AnimatePresence>
                              
                              {/* Escalation Panel */}
                              <AnimatePresence>
                                {escalation.isTriggered && (
                                  <div className="px-3 pb-3">
                                    <EscalationPanel
                                      escalation={escalation}
                                      onEscalate={handleEscalate}
                                      onDismiss={() => setEscalation(prev => ({ ...prev, isTriggered: false }))}
                                    />
                                  </div>
                                )}
                              </AnimatePresence>
                              
                              {/* Footer */}
                              <div className="p-3 bg-gray-50 border-t">
                                <BudgetIndicator budget={budget} />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                      {currentQuestion.text}
                    </h2>
                    
                    {/* Hint History */}
                    {hints.length > 0 && (
                      <div className="mt-6 space-y-3">
                        <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <History className="w-4 h-4" />
                          Hint History ({hints.length})
                        </h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {hints.map((hint) => (
                            <div
                              key={hint.id}
                              className={cn(
                                "p-3 rounded-lg border",
                                LEVEL_COLORS[hint.level].bg,
                                LEVEL_COLORS[hint.level].border
                              )}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs">
                                  Level {hint.level}
                                </Badge>
                                {feedbackGiven[hint.id] !== undefined && (
                                  <span className="text-xs">
                                    {feedbackGiven[hint.id] ? '👍' : '👎'}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-700 line-clamp-2">{hint.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* How It Works */}
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                  <CardContent className="p-4">
                    <h3 className="font-medium text-blue-800 flex items-center gap-2 mb-3">
                      <Info className="w-4 h-4" />
                      How the Socratic Hint Ladder Works
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {([1, 2, 3, 4] as HintLevel[]).map((level) => {
                        const config = HINT_LEVELS[level];
                        const Icon = LEVEL_ICONS[level];
                        const colors = LEVEL_COLORS[level];
                        
                        return (
                          <div key={level} className="text-center">
                            <div className={cn(
                              "w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center bg-gradient-to-br",
                              colors.gradient
                            )}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-xs font-medium text-gray-700">{config.name}</p>
                            <p className="text-xs text-gray-500 mt-1">{config.socraticPurpose}</p>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="config" className="mt-0">
            <div className="max-w-2xl mx-auto">
              <TeacherConfigPanel config={teacherConfig} onChange={setTeacherConfig} />
              
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-base">Hint Budget Weights</CardTitle>
                  <CardDescription>
                    Each hint level costs a different amount of budget credits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {([1, 2, 3, 4] as HintLevel[]).map((level) => {
                      const config = HINT_LEVELS[level];
                      const colors = LEVEL_COLORS[level];
                      
                      return (
                        <div key={level} className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br text-white font-bold",
                            colors.gradient
                          )}>
                            {level}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{config.name}</p>
                            <p className="text-xs text-gray-500">{config.description}</p>
                          </div>
                          <Badge variant="outline" className="text-sm">
                            {config.weight} credits
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-0">
            <div className="max-w-4xl mx-auto">
              <AnalyticsDashboard stats={stats} />
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Escalation Modal */}
      <EscalationModal
        isOpen={escalationModal.isOpen}
        type={escalationModal.type}
        content={escalationModal.content}
        onClose={() => setEscalationModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

// History icon component
function History({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}

export default SocraticHintLadderDemo;
