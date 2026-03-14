/**
 * Cogni Multimodal - Solution Display Component
 * 
 * Features:
 * - Step-by-step solution visualization
 * - Step difficulty annotation
 * - Estimated time per step
 * - Concept explanations
 * - Hint system
 */

"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Lightbulb,
  BookOpen,
  CheckCircle,
  Circle,
  HelpCircle,
  Copy,
  Check,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ============================================================
// Types
// ============================================================

interface SolutionStep {
  stepNumber: number;
  title: string;
  description: string;
  latexExpression?: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
  concepts: string[];
  hints: string[];
}

interface Solution {
  id?: string;
  problemText: string;
  solutionType: 'step_by_step' | 'proof' | 'numerical' | 'derivation';
  steps: SolutionStep[];
  finalAnswer?: string;
  summary: string;
  totalEstimatedTime: number;
  overallDifficulty: 'easy' | 'medium' | 'hard';
  concepts: string[];
  alternatives?: string[];
}

interface SolutionDisplayProps {
  solution: Solution;
  onGetHint?: (step: SolutionStep) => Promise<string>;
  onExplainConcept?: (concept: string) => Promise<string>;
}

// ============================================================
// Component
// ============================================================

export function SolutionDisplay({
  solution,
  onGetHint,
  onExplainConcept,
}: SolutionDisplayProps) {
  // Initialize expanded steps with first step already expanded
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(() => 
    new Set([solution.steps[0]?.stepNumber || 1])
  );
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [activeHint, setActiveHint] = useState<{ step: number; hint: string } | null>(null);
  const [conceptExplanation, setConceptExplanation] = useState<string | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [copiedStep, setCopiedStep] = useState<number | null>(null);
  
  const toggleStep = (stepNumber: number) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepNumber)) {
        next.delete(stepNumber);
      } else {
        next.add(stepNumber);
      }
      return next;
    });
  };
  
  const markStepComplete = (stepNumber: number) => {
    setCompletedSteps((prev) => new Set(prev).add(stepNumber));
  };
  
  const handleGetHint = async (step: SolutionStep) => {
    if (onGetHint) {
      const hint = await onGetHint(step);
      setActiveHint({ step: step.stepNumber, hint });
    } else if (step.hints.length > 0) {
      setActiveHint({ step: step.stepNumber, hint: step.hints[0] });
    }
  };
  
  const handleExplainConcept = async (concept: string) => {
    setSelectedConcept(concept);
    if (onExplainConcept) {
      const explanation = await onExplainConcept(concept);
      setConceptExplanation(explanation);
    } else {
      setConceptExplanation(`${concept} is a key mathematical concept used in this solution.`);
    }
  };
  
  const copyStep = async (step: SolutionStep) => {
    const text = `Step ${step.stepNumber}: ${step.title}\n${step.description}\n${step.explanation}`;
    await navigator.clipboard.writeText(text);
    setCopiedStep(step.stepNumber);
    setTimeout(() => setCopiedStep(null), 2000);
  };
  
  // Render LaTeX
  const renderLatex = (latex: string | undefined) => {
    if (!latex) return null;
    
    return (
      <div className="my-3 p-3 bg-blue-50 rounded-lg overflow-x-auto border border-blue-100">
        <code className="text-sm font-mono text-blue-700 whitespace-pre-wrap break-all">
          {latex}
        </code>
      </div>
    );
  };
  
  // Difficulty colors
  const difficultyColors = {
    easy: 'bg-green-100 text-green-700 border-green-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    hard: 'bg-red-100 text-red-700 border-red-200',
  };
  
  const difficultyIcons = {
    easy: '●',
    medium: '●●',
    hard: '●●●',
  };
  
  // Format time
  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  };
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                Solution
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                {solution.solutionType.replace('_', ' ')} • {solution.steps.length} steps • ~{formatTime(solution.totalEstimatedTime)}
              </p>
            </div>
            <Badge className={difficultyColors[solution.overallDifficulty]}>
              {difficultyIcons[solution.overallDifficulty]} {solution.overallDifficulty}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Problem */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">Problem:</p>
            <p className="text-gray-900">{solution.problemText}</p>
          </div>
          
          {/* Concepts used */}
          {solution.concepts.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {solution.concepts.map((concept, i) => (
                <button
                  key={i}
                  onClick={() => handleExplainConcept(concept)}
                  className={cn(
                    "text-xs px-2 py-1 rounded-full transition-colors",
                    selectedConcept === concept
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  <BookOpen className="w-3 h-3 inline mr-1" />
                  {concept}
                </button>
              ))}
            </div>
          )}
          
          {/* Concept explanation popup */}
          <AnimatePresence>
            {conceptExplanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-800 mb-1">
                      {selectedConcept}
                    </p>
                    <p className="text-sm text-blue-700">{conceptExplanation}</p>
                  </div>
                  <button
                    onClick={() => {
                      setConceptExplanation(null);
                      setSelectedConcept(null);
                    }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    ×
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
      
      {/* Steps */}
      <div className="space-y-2">
        {solution.steps.map((step, index) => {
          const isExpanded = expandedSteps.has(step.stepNumber);
          const isCompleted = completedSteps.has(step.stepNumber);
          
          return (
            <motion.div
              key={step.stepNumber}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={cn(
                "transition-all",
                isExpanded && "ring-2 ring-blue-200",
                isCompleted && "border-green-300"
              )}>
                {/* Step Header */}
                <button
                  onClick={() => toggleStep(step.stepNumber)}
                  className="w-full p-4 flex items-center gap-4 text-left"
                >
                  {/* Step number */}
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    isCompleted
                      ? "bg-green-500 text-white"
                      : isExpanded
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-600"
                  )}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      step.stepNumber
                    )}
                  </div>
                  
                  {/* Step info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900">{step.title}</h3>
                    <p className="text-sm text-gray-500 truncate">{step.description}</p>
                  </div>
                  
                  {/* Metadata */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="flex items-center gap-1 text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">{formatTime(step.estimatedTime)}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn("text-xs", difficultyColors[step.difficulty])}
                    >
                      {step.difficulty}
                    </Badge>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>
                
                {/* Step Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-0 border-t">
                        {/* LaTeX expression */}
                        {renderLatex(step.latexExpression)}
                        
                        {/* Explanation */}
                        <div className="text-gray-700 text-sm leading-relaxed mb-4">
                          {step.explanation}
                        </div>
                        
                        {/* Concepts */}
                        {step.concepts.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs text-gray-500 mb-1">Concepts:</p>
                            <div className="flex flex-wrap gap-1">
                              {step.concepts.map((concept, i) => (
                                <span
                                  key={i}
                                  className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                                >
                                  {concept}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleGetHint(step)}
                          >
                            <Lightbulb className="w-3 h-3 mr-1" />
                            Hint
                          </Button>
                          
                          {!isCompleted && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markStepComplete(step.stepNumber)}
                            >
                              <Circle className="w-3 h-3 mr-1" />
                              Mark Done
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyStep(step)}
                          >
                            {copiedStep === step.stepNumber ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                        
                        {/* Hint display */}
                        <AnimatePresence>
                          {activeHint?.step === step.stepNumber && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                            >
                              <div className="flex items-start gap-2">
                                <Lightbulb className="w-4 h-4 text-yellow-600 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-yellow-800">Hint</p>
                                  <p className="text-sm text-yellow-700">{activeHint.hint}</p>
                                </div>
                                <button
                                  onClick={() => setActiveHint(null)}
                                  className="text-yellow-500 hover:text-yellow-700 ml-auto"
                                >
                                  ×
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
      </div>
      
      {/* Final Answer */}
      {solution.finalAnswer && (
        <Card className="border-green-300 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-medium text-green-800">Final Answer</h3>
            </div>
            <div className="text-lg font-semibold text-green-900">
              {solution.finalAnswer}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Summary */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium text-gray-900 mb-2">Summary</h3>
          <p className="text-sm text-gray-600">{solution.summary}</p>
          
          {solution.alternatives && solution.alternatives.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-1">Alternative Approaches:</h4>
              <ul className="text-sm text-gray-600 list-disc list-inside">
                {solution.alternatives.map((alt, i) => (
                  <li key={i}>{alt}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default SolutionDisplay;
