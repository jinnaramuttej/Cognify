"use client";

import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { 
  CheckCircle2, 
  ChevronRight, 
  Lightbulb, 
  Target, 
  BookOpen,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Eye,
  EyeOff
} from "lucide-react";
import { cn } from "@/lib/utils";
import { COGNI_THEME, type StructuredResponse, type SolutionStep } from "../types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";

// =====================================================
// STRUCTURED SOLUTION DISPLAY
// =====================================================

interface StructuredSolutionProps {
  structured: StructuredResponse;
  className?: string;
  onStepReveal?: (stepNumber: number) => void;
  onFollowUpClick?: (question: string) => void;
}

export function StructuredSolution({ 
  structured, 
  className,
  onStepReveal,
  onFollowUpClick 
}: StructuredSolutionProps) {
  const [visibleSteps, setVisibleSteps] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Progressive reveal - start with understanding and strategy
  useEffect(() => {
    setVisibleSteps([]);
    setCurrentStep(0);
    
    // Animate in steps progressively
    const timer = setTimeout(() => {
      setVisibleSteps([0]); // Show understanding
    }, 300);

    return () => clearTimeout(timer);
  }, [structured]);

  const revealNextStep = () => {
    if (currentStep < structured.steps.length + 2) { // +2 for strategy and final answer
      setCurrentStep(prev => prev + 1);
      setVisibleSteps(prev => [...prev, prev.length]);
      onStepReveal?.(currentStep + 1);
    }
  };

  const showAllSteps = () => {
    setVisibleSteps(structured.steps.map((_, i) => i));
    setCurrentStep(structured.steps.length + 2);
  };

  return (
    <div ref={containerRef} className={cn("space-y-4", className)}>
      {/* Understanding Section */}
      <AnimatePresence>
        {visibleSteps.includes(0) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                <Target className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-blue-900 text-sm mb-1">
                  Understanding the Problem
                </h4>
                <p className="text-sm text-blue-800">{structured.understanding}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Strategy Section */}
      <AnimatePresence>
        {visibleSteps.length >= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-amber-900 text-sm mb-1">
                  Our Approach
                </h4>
                <p className="text-sm text-amber-800">{structured.strategy}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step-by-Step Solution */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-gray-500" />
            Step-by-Step Solution
          </h4>
          {currentStep < structured.steps.length && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={showAllSteps}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                <Eye className="w-3 h-3 mr-1" />
                Show All
              </Button>
            </div>
          )}
        </div>

        {structured.steps.map((step, index) => (
          <StepCard
            key={index}
            step={step}
            index={index}
            isVisible={visibleSteps.length > index + 1}
            onReveal={revealNextStep}
            isLast={index === structured.steps.length - 1}
          />
        ))}

        {/* Show next step button */}
        {currentStep <= structured.steps.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center py-2"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={revealNextStep}
              className="gap-2 text-sm border-dashed border-2"
            >
              {currentStep === 0 ? "Start Solution" : 
               currentStep <= structured.steps.length ? "Next Step" : 
               "View Answer"}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </div>

      {/* Final Answer */}
      <AnimatePresence>
        {visibleSteps.length > structured.steps.length + 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, type: "spring" }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200"
          >
            <div className="flex items-start gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0"
              >
                <CheckCircle2 className="w-5 h-5 text-white" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-green-900 text-sm mb-1 flex items-center gap-2">
                  Final Answer
                  <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                    {Math.round(structured.confidence * 100)}% confidence
                  </Badge>
                </h4>
                <div className="text-green-900 font-medium">
                  {structured.finalAnswer}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Follow-up Question */}
      <AnimatePresence>
        {visibleSteps.length > structured.steps.length + 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-100"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-purple-900 text-sm mb-2">
                  Check Your Understanding
                </h4>
                <button
                  onClick={() => onFollowUpClick?.(structured.followUpQuestion)}
                  className="text-left text-sm text-purple-800 hover:text-purple-900 hover:underline cursor-pointer"
                >
                  {structured.followUpQuestion}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Topics Covered */}
      {structured.topicsCovered.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {structured.topicsCovered.map((topic, i) => (
            <Badge key={i} variant="secondary" className="text-xs">
              {topic}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// =====================================================
// STEP CARD COMPONENT
// =====================================================

interface StepCardProps {
  step: SolutionStep;
  index: number;
  isVisible: boolean;
  onReveal: () => void;
  isLast: boolean;
}

function StepCard({ step, index, isVisible, onReveal, isLast }: StepCardProps) {
  const [expanded, setExpanded] = useState(true);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn(
        "bg-white rounded-xl border-2 transition-all",
        step.isKey 
          ? "border-blue-200 shadow-md shadow-blue-50" 
          : "border-gray-100 hover:border-gray-200"
      )}
    >
      {/* Step Header */}
      <div 
        className={cn(
          "flex items-center gap-3 p-4 cursor-pointer",
          step.isKey && "bg-gradient-to-r from-blue-50 to-transparent rounded-t-xl"
        )}
        onClick={() => setExpanded(!expanded)}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 + index * 0.05, type: "spring", stiffness: 300 }}
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0",
            step.isKey 
              ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white" 
              : "bg-gray-100 text-gray-600"
          )}
        >
          {step.stepNumber}
        </motion.div>
        
        <div className="flex-1 min-w-0">
          <h5 className={cn(
            "font-medium text-sm",
            step.isKey ? "text-blue-900" : "text-gray-900"
          )}>
            {step.title}
            {step.isKey && (
              <Badge variant="outline" className="ml-2 text-xs border-blue-300 text-blue-600">
                Key Step
              </Badge>
            )}
          </h5>
        </div>

        <motion.div
          animate={{ rotate: expanded ? 0 : -90 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </motion.div>
      </div>

      {/* Step Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 space-y-3">
              {/* Main Content */}
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p className="text-sm text-gray-700 leading-relaxed">{children}</p>
                    ),
                    code: ({ children, className }) => {
                      const isInline = !className;
                      if (isInline) {
                        return (
                          <code className="px-1.5 py-0.5 bg-gray-100 rounded text-sm font-mono text-blue-600">
                            {children}
                          </code>
                        );
                      }
                      return (
                        <code className={className}>{children}</code>
                      );
                    },
                  }}
                >
                  {step.content}
                </ReactMarkdown>
              </div>

              {/* Explanation */}
              {step.explanation && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1 font-medium">Why this step matters:</p>
                  <p className="text-sm text-gray-600 italic">{step.explanation}</p>
                </div>
              )}

              {/* Formulas */}
              {step.formulas && step.formulas.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {step.formulas.map((formula, i) => (
                    <div
                      key={i}
                      className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100"
                    >
                      <code className="text-sm font-mono text-blue-800">{formula}</code>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// =====================================================
// PROGRESSIVE HINT DISPLAY
// =====================================================

interface HintDisplayProps {
  level: number;
  content: string;
  className?: string;
}

export function HintDisplay({ level, content, className }: HintDisplayProps) {
  const levelConfig = {
    1: { color: "blue", icon: Lightbulb, label: "Conceptual Nudge" },
    2: { color: "amber", icon: HelpCircle, label: "Guided Question" },
    3: { color: "purple", icon: ArrowRight, label: "Next Step" },
    4: { color: "green", icon: CheckCircle2, label: "Full Solution" },
  };

  const config = levelConfig[level as keyof typeof levelConfig] || levelConfig[1];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl p-4 border-2",
        `bg-${config.color}-50 border-${config.color}-200`,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center",
          `bg-${config.color}-500`
        )}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className={cn(
              "text-xs",
              `border-${config.color}-300 text-${config.color}-700`
            )}>
              Hint Level {level}
            </Badge>
            <span className={cn(
              "text-xs font-medium",
              `text-${config.color}-700`
            )}>
              {config.label}
            </span>
          </div>
          <p className="text-sm text-gray-700">{content}</p>
        </div>
      </div>
    </motion.div>
  );
}

// =====================================================
// QUICK ACTION BUTTONS
// =====================================================

interface QuickActionsProps {
  onSimpler?: () => void;
  onHarder?: () => void;
  onSimilar?: () => void;
  onExplainMore?: () => void;
  className?: string;
}

export function QuickActions({ 
  onSimpler, 
  onHarder, 
  onSimilar, 
  onExplainMore,
  className 
}: QuickActionsProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {onSimpler && (
        <Button
          variant="outline"
          size="sm"
          onClick={onSimpler}
          className="gap-1.5 text-xs"
        >
          <Sparkles className="w-3 h-3" />
          Explain Simpler
        </Button>
      )}
      {onHarder && (
        <Button
          variant="outline"
          size="sm"
          onClick={onHarder}
          className="gap-1.5 text-xs"
        >
          <ArrowRight className="w-3 h-3" />
          Make it Harder
        </Button>
      )}
      {onSimilar && (
        <Button
          variant="outline"
          size="sm"
          onClick={onSimilar}
          className="gap-1.5 text-xs"
        >
          <HelpCircle className="w-3 h-3" />
          Similar Question
        </Button>
      )}
      {onExplainMore && (
        <Button
          variant="outline"
          size="sm"
          onClick={onExplainMore}
          className="gap-1.5 text-xs"
        >
          <BookOpen className="w-3 h-3" />
          Explain More
        </Button>
      )}
    </div>
  );
}

export default StructuredSolution;
