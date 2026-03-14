/**
 * Cogni Multimodal - Explainability Panel Component
 * 
 * Displays multi-step worked solution with:
 * - Step-by-step explanation
 * - Difficulty annotation per step
 * - Estimated time to solve
 * - Key concepts and hints
 */

"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  Clock,
  Lightbulb,
  BookOpen,
  Target,
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ============================================================
// Types
// ============================================================

interface SolutionStep {
  stepNumber: number;
  title: string;
  explanation: string;
  latex?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
  keyConcepts: string[];
  hints: string[];
}

interface Solution {
  problemText: string;
  steps: SolutionStep[];
  finalAnswer?: string;
  totalEstimatedTime: number;
  difficulty: string;
  approach: string;
  prerequisites: string[];
}

interface ExplainabilityPanelProps {
  solution: Solution | null;
  isLoading?: boolean;
  onStepClick?: (step: SolutionStep) => void;
}

// ============================================================
// Difficulty Badge Component
// ============================================================

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const config = {
    easy: { color: 'bg-green-100 text-green-700 border-green-200', icon: '🎯' },
    medium: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: '⚡' },
    hard: { color: 'bg-red-100 text-red-700 border-red-200', icon: '🔥' },
  };
  
  const { color, icon } = config[difficulty as keyof typeof config] || config.medium;
  
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
      color
    )}>
      <span>{icon}</span>
      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
    </span>
  );
}

// ============================================================
// Solution Step Card Component
// ============================================================

interface StepCardProps {
  step: SolutionStep;
  isExpanded: boolean;
  onToggle: () => void;
  onClick?: () => void;
}

function StepCard({ step, isExpanded, onToggle, onClick }: StepCardProps) {
  const [copied, setCopied] = useState(false);
  
  const copyLatex = () => {
    if (step.latex) {
      navigator.clipboard.writeText(step.latex);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: step.stepNumber * 0.1 }}
      className="bg-white rounded-xl border shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-start gap-3">
          {/* Step Number */}
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0",
            step.difficulty === 'easy' && "bg-green-100 text-green-600",
            step.difficulty === 'medium' && "bg-yellow-100 text-yellow-600",
            step.difficulty === 'hard' && "bg-red-100 text-red-600",
          )}>
            {step.stepNumber}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-gray-900 truncate">{step.title}</h4>
              <DifficultyBadge difficulty={step.difficulty} />
            </div>
            
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {step.estimatedTime}s
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                {step.keyConcepts.length} concepts
              </span>
            </div>
          </div>
          
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </motion.div>
        </div>
      </div>
      
      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-4 border-t">
              {/* Explanation */}
              <div className="mt-4">
                <p className="text-gray-700 leading-relaxed">{step.explanation}</p>
              </div>
              
              {/* LaTeX */}
              {step.latex && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                      Mathematical Expression
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2"
                      onClick={copyLatex}
                    >
                      {copied ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                  <code className="text-sm font-mono text-blue-700 break-all">
                    {step.latex}
                  </code>
                </div>
              )}
              
              {/* Key Concepts */}
              {step.keyConcepts.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    Key Concepts
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {step.keyConcepts.map((concept, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs"
                      >
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Hints */}
              {step.hints.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-medium text-amber-600 mb-2 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3" />
                    Hints
                  </p>
                  <ul className="space-y-1">
                    {step.hints.map((hint, i) => (
                      <li
                        key={i}
                        className="text-sm text-amber-700 pl-4 relative before:content-['→'] before:absolute before:left-0"
                      >
                        {hint}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================================
// Main Explainability Panel Component
// ============================================================

export function ExplainabilityPanel({ 
  solution, 
  isLoading = false,
  onStepClick 
}: ExplainabilityPanelProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([1]));
  const [showAllSteps, setShowAllSteps] = useState(false);
  
  const toggleStep = (stepNumber: number) => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      if (next.has(stepNumber)) {
        next.delete(stepNumber);
      } else {
        next.add(stepNumber);
      }
      return next;
    });
  };
  
  const expandAll = () => {
    setExpandedSteps(new Set(solution?.steps.map(s => s.stepNumber) || []));
  };
  
  const collapseAll = () => {
    setExpandedSteps(new Set());
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full mb-4"
          />
          <p className="text-gray-500 font-medium">Generating solution...</p>
          <p className="text-sm text-gray-400 mt-1">This may take a few seconds</p>
        </div>
      </div>
    );
  }
  
  // Empty state
  if (!solution) {
    return (
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No solution yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Upload a problem to get a step-by-step solution
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Solution Breakdown
            </h3>
            <p className="text-blue-100 text-sm mt-1">
              {solution.steps.length} steps • ~{Math.ceil(solution.totalEstimatedTime / 60)} min
            </p>
          </div>
          <DifficultyBadge difficulty={solution.difficulty} />
        </div>
        
        {/* Approach */}
        <div className="bg-white/10 rounded-lg p-3">
          <p className="text-xs font-medium text-blue-100 mb-1">Approach</p>
          <p className="text-sm">{solution.approach}</p>
        </div>
        
        {/* Prerequisites */}
        {solution.prerequisites.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-medium text-blue-100 mb-2">Prerequisites</p>
            <div className="flex flex-wrap gap-2">
              {solution.prerequisites.map((prereq, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-white/20 rounded-md text-xs"
                >
                  {prereq}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Controls */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Click steps to expand details
        </p>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={expandAll}>
            Expand all
          </Button>
          <Button variant="ghost" size="sm" onClick={collapseAll}>
            Collapse all
          </Button>
        </div>
      </div>
      
      {/* Steps */}
      <div className="space-y-3">
        {solution.steps.map((step) => (
          <StepCard
            key={step.stepNumber}
            step={step}
            isExpanded={expandedSteps.has(step.stepNumber)}
            onToggle={() => toggleStep(step.stepNumber)}
            onClick={() => onStepClick?.(step)}
          />
        ))}
      </div>
      
      {/* Final Answer */}
      {solution.finalAnswer && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <h4 className="font-semibold text-green-700">Final Answer</h4>
          </div>
          <div className="bg-white rounded-lg p-4 border border-green-100">
            <p className="text-lg font-medium text-gray-900">
              {solution.finalAnswer}
            </p>
          </div>
        </motion.div>
      )}
      
      {/* Problem Text (reference) */}
      <div className="bg-gray-50 rounded-xl p-4 border">
        <p className="text-xs font-medium text-gray-500 mb-2">Original Problem</p>
        <p className="text-sm text-gray-700">{solution.problemText}</p>
      </div>
    </div>
  );
}

export default ExplainabilityPanel;
