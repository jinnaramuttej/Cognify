/**
 * Socratic Hint Ladder - Main Component
 * 
 * Floating hint menu with progressive reveal animation,
 * budget tracking, and escalation support
 */

"use client";

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { 
  HintLevel, 
  GeneratedHint, 
  HintBudget, 
  EscalationState, 
  EscalationType,
  SocraticHintLadderProps,
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
// Icon Mapping
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
    bg: 'bg-green-50', 
    text: 'text-green-600', 
    border: 'border-green-200',
    gradient: 'from-green-500 to-green-600',
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
      {/* Level indicator */}
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
      
      {/* Cost indicator */}
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
      {/* Header */}
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
      </div>
      
      {/* Hint Content */}
      <div className="prose prose-sm max-w-none">
        <p className="text-gray-700 leading-relaxed">{hint.content}</p>
      </div>
      
      {/* Feedback Section */}
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
              className="gap-1.5 text-green-600 hover:text-green-700 hover:bg-green-50"
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
            You've used several hints. Here are additional resources:
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
    ? 'bg-blue-500' 
    : percentRemaining > 20 
      ? 'bg-amber-500' 
      : 'bg-red-500';
  
  if (compact) {
    return (
      <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-gray-50">
        <Zap className="w-3.5 h-3.3 text-gray-400" />
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
// Main Socratic Hint Ladder Component
// ============================================================

export function SocraticHintLadder({
  questionText,
  questionId,
  subject,
  topic,
  difficulty,
  userId,
  sessionId,
  currentAnswer,
  attemptsCount = 0,
  timeSpent = 0,
  skillLevel = 0.5,
  onHintUsed,
  onEscalation,
  className,
}: SocraticHintLadderProps) {
  // State
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
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Calculate used levels
  const usedLevels = useMemo(() => 
    hints.map(h => h.level), 
    [hints]
  );
  
  // Recommended next level
  const recommendedLevel = useMemo(() => 
    recommendNextHintLevel(usedLevels, attemptsCount, skillLevel),
    [usedLevels, attemptsCount, skillLevel]
  );
  
  // Handle hint request
  const handleRequestHint = useCallback(async (level: HintLevel) => {
    // Check if can afford
    const affordability = canAffordHint(level, budget);
    if (!affordability.canAfford) {
      console.log('Cannot afford hint:', affordability.reason);
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Build context
      const context: HintContext = {
        questionText,
        questionId,
        subject,
        topic,
        difficulty,
        studentAnswer: currentAnswer,
        previousAttempts: attemptsCount,
        timeSpent,
        skillLevel,
        previousHints: usedLevels,
      };
      
      // Call API to generate hint
      const response = await fetch('/api/socratic/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          sessionId,
          context,
          requestedLevel: level,
        }),
      });
      
      const data = await response.json();
      
      if (data.success && data.hint) {
        const newHint = data.hint;
        
        // Update state
        setHints(prev => [...prev, newHint]);
        setCurrentHint(newHint);
        setBudget(prev => deductHintCost(level, prev));
        
        // Check escalation
        if (level === 4) {
          const level4Count = hints.filter(h => h.level === 4).length + 1;
          const newEscalation = checkEscalation(budget, level4Count);
          setEscalation(newEscalation);
        }
        
        // Callback
        onHintUsed?.(newHint);
      }
    } catch (error) {
      console.error('Error generating hint:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [budget, questionText, questionId, subject, topic, difficulty, currentAnswer, attemptsCount, timeSpent, skillLevel, usedLevels, userId, sessionId, onHintUsed, hints]);
  
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
  }, [userId]);
  
  // Handle escalation
  const handleEscalate = useCallback((type: EscalationType) => {
    onEscalation?.(type);
    setEscalation(prev => ({ ...prev, isTriggered: false }));
  }, [onEscalation]);
  
  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <div ref={menuRef} className={cn("relative", className)}>
      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all",
          isOpen 
            ? "bg-blue-50 border-blue-300 text-blue-600" 
            : "bg-white border-gray-200 hover:border-blue-300 text-gray-600"
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Lightbulb className={cn("w-4 h-4", isOpen && "text-blue-500")} />
        <span className="text-sm font-medium">Hints</span>
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
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  Socratic Hints
                </h3>
                <BudgetIndicator budget={budget} compact />
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
            
            {/* Current Hint Display */}
            <AnimatePresence>
              {currentHint && (
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
  );
}

export default SocraticHintLadder;
