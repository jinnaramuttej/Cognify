/**
 * Cogni Core - AdaptiveRunner Component
 * 
 * Main component for the adaptive tutoring interface featuring:
 * - Live ability meter (animated gauge)
 * - Theta trace chart
 * - Topic mastery heatmap
 * - Smooth question transitions
 */

"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Clock,
  CheckCircle,
  XCircle,
  Lightbulb,
  ChevronRight,
  BarChart3,
  Zap,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// ============================================================
// Types
// ============================================================

interface AdaptiveSession {
  id: string;
  subject: string;
  topic: string | null;
  theta: number;
  thetaSE: number;
  status: string;
  totalItems: number;
  correctItems: number;
}

interface AdaptiveItem {
  id: string;
  content: string;
  options?: string[];
  itemType: string;
  subject: string;
  topic: string;
  timeLimit?: number;
}

interface SessionProgress {
  totalItems: number;
  precisionProgress: number;
  reliability: number;
  shouldContinue: boolean;
  continueReason: string;
}

interface ThetaHistoryPoint {
  theta: number;
  se: number;
  timestamp: number;
  itemId: string;
  correct: boolean;
}

interface SkillState {
  skillId: string;
  mastery: number;
  level: string;
  attemptCount: number;
  correctCount: number;
}

interface AdaptiveRunnerProps {
  userId: string;
  subject: string;
  topic?: string;
  onComplete?: (session: AdaptiveSession) => void;
  className?: string;
}

// ============================================================
// Ability Gauge Component
// ============================================================

interface AbilityGaugeProps {
  theta: number;
  se: number;
  previousTheta?: number;
  size?: number;
}

function AbilityGauge({ theta, se, previousTheta, size = 200 }: AbilityGaugeProps) {
  // Map theta (-3 to +3) to angle (180° to 0°)
  const normalizedTheta = Math.max(-3, Math.min(3, theta));
  const angle = 180 - ((normalizedTheta + 3) / 6) * 180;
  const angleRad = (angle * Math.PI) / 180;
  
  // Calculate needle position
  const needleLength = size * 0.35;
  const needleX = size / 2 + needleLength * Math.cos(angleRad);
  const needleY = size * 0.85 - needleLength * Math.sin(angleRad);
  
  // Determine color based on theta
  const getThetaColor = (t: number): string => {
    if (t < -1.5) return '#ef4444'; // Red - struggling
    if (t < -0.5) return '#f97316'; // Orange - below average
    if (t < 0.5) return '#eab308'; // Yellow - average
    if (t < 1.5) return '#22c55e'; // Green - above average
    return '#3b82f6'; // Blue - excellent
  };
  
  const thetaColor = getThetaColor(theta);
  const thetaChange = previousTheta !== undefined ? theta - previousTheta : 0;
  
  return (
    <div className="relative flex flex-col items-center">
      <svg width={size} height={size * 0.6} viewBox={`0 0 ${size} ${size * 0.6}`}>
        {/* Background arc */}
        <path
          d={`M ${size * 0.1} ${size * 0.85} A ${size * 0.4} ${size * 0.4} 0 0 1 ${size * 0.9} ${size * 0.85}`}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={12}
          strokeLinecap="round"
        />
        
        {/* Colored sections */}
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="25%" stopColor="#f97316" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="75%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        
        {/* Progress arc */}
        <motion.path
          d={`M ${size * 0.1} ${size * 0.85} A ${size * 0.4} ${size * 0.4} 0 0 1 ${size * 0.9} ${size * 0.85}`}
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth={12}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: (normalizedTheta + 3) / 6 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        
        {/* Needle */}
        <motion.line
          x1={size / 2}
          y1={size * 0.85}
          x2={needleX}
          y2={needleY}
          stroke={thetaColor}
          strokeWidth={3}
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        />
        
        {/* Center dot */}
        <circle cx={size / 2} cy={size * 0.85} r={6} fill={thetaColor} />
      </svg>
      
      {/* Theta value display */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 text-center">
        <motion.div
          key={theta}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-3xl font-bold"
          style={{ color: thetaColor }}
        >
          {theta.toFixed(2)}
        </motion.div>
        <div className="text-xs text-gray-500 mt-1">
          θ ± {se.toFixed(2)}
        </div>
      </div>
      
      {/* Change indicator */}
      {previousTheta !== undefined && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1 mt-2"
        >
          {thetaChange > 0.05 ? (
            <TrendingUp className="w-4 h-4 text-green-500" />
          ) : thetaChange < -0.05 ? (
            <TrendingDown className="w-4 h-4 text-red-500" />
          ) : (
            <Minus className="w-4 h-4 text-gray-400" />
          )}
          <span className={cn(
            "text-sm font-medium",
            thetaChange > 0 && "text-green-500",
            thetaChange < 0 && "text-red-500"
          )}>
            {thetaChange > 0 ? '+' : ''}{thetaChange.toFixed(2)}
          </span>
        </motion.div>
      )}
      
      {/* Labels */}
      <div className="flex justify-between w-full mt-2 text-xs text-gray-400">
        <span>Struggling</span>
        <span>Average</span>
        <span>Excellent</span>
      </div>
    </div>
  );
}

// ============================================================
// Theta Trace Chart Component
// ============================================================

interface ThetaTraceChartProps {
  history: ThetaHistoryPoint[];
  width?: number;
  height?: number;
}

function ThetaTraceChart({ history, width = 400, height = 200 }: ThetaTraceChartProps) {
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  if (history.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-50 rounded-lg"
        style={{ width, height }}
      >
        <span className="text-gray-400 text-sm">No data yet</span>
      </div>
    );
  }
  
  // Scale functions
  const xScale = (index: number) => padding.left + (index / Math.max(1, history.length - 1)) * chartWidth;
  const yScale = (theta: number) => padding.top + chartHeight - ((theta + 3) / 6) * chartHeight;
  
  // Generate path
  const pathD = history.map((point, i) => {
    const x = xScale(i);
    const y = yScale(point.theta);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
  
  // Confidence band
  const upperBand = history.map((point, i) => {
    const x = xScale(i);
    const y = yScale(point.theta + point.se);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
  
  const lowerBand = history.map((point, i) => {
    const x = xScale(history.length - 1 - i);
    const y = yScale(point.theta - point.se);
    return `L ${x} ${y}`;
  }).join(' ');
  
  return (
    <svg width={width} height={height}>
      {/* Grid lines */}
      {[-2, -1, 0, 1, 2].map(theta => (
        <g key={theta}>
          <line
            x1={padding.left}
            y1={yScale(theta)}
            x2={width - padding.right}
            y2={yScale(theta)}
            stroke="#e5e7eb"
            strokeDasharray="4 4"
          />
          <text
            x={padding.left - 10}
            y={yScale(theta) + 4}
            textAnchor="end"
            className="text-xs fill-gray-400"
          >
            {theta}
          </text>
        </g>
      ))}
      
      {/* Zero line */}
      <line
        x1={padding.left}
        y1={yScale(0)}
        x2={width - padding.right}
        y2={yScale(0)}
        stroke="#9ca3af"
        strokeWidth={1}
      />
      
      {/* Confidence band */}
      {history.length > 1 && (
        <motion.path
          d={`${upperBand} ${lowerBand} Z`}
          fill="#3b82f6"
          fillOpacity={0.1}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}
      
      {/* Main line */}
      <motion.path
        d={pathD}
        fill="none"
        stroke="#3b82f6"
        strokeWidth={2}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5 }}
      />
      
      {/* Data points */}
      {history.map((point, i) => (
        <motion.circle
          key={i}
          cx={xScale(i)}
          cy={yScale(point.theta)}
          r={point.correct ? 5 : 4}
          fill={point.correct ? '#22c55e' : '#ef4444'}
          stroke="white"
          strokeWidth={2}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.05 }}
        />
      ))}
      
      {/* X-axis label */}
      <text
        x={width / 2}
        y={height - 5}
        textAnchor="middle"
        className="text-xs fill-gray-500"
      >
        Questions
      </text>
    </svg>
  );
}

// ============================================================
// Topic Mastery Heatmap Component
// ============================================================

interface TopicMasteryHeatmapProps {
  skills: SkillState[];
  compact?: boolean;
}

function TopicMasteryHeatmap({ skills, compact = false }: TopicMasteryHeatmapProps) {
  if (skills.length === 0) {
    return (
      <div className="text-sm text-gray-400 text-center py-4">
        No skill data available yet
      </div>
    );
  }
  
  const getMasteryColor = (mastery: number): string => {
    if (mastery < 0.3) return 'bg-red-500';
    if (mastery < 0.5) return 'bg-orange-500';
    if (mastery < 0.7) return 'bg-yellow-500';
    if (mastery < 0.85) return 'bg-green-500';
    return 'bg-blue-500';
  };
  
  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'expert': return '🏆';
      case 'proficient': return '✓';
      case 'developing': return '→';
      default: return '?';
    }
  };
  
  return (
    <div className={cn("space-y-2", compact && "space-y-1")}>
      {skills.slice(0, compact ? 5 : 10).map((skill) => (
        <motion.div
          key={skill.skillId}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <span className={cn("w-6 text-center", compact && "text-xs")}>
            {getLevelIcon(skill.level)}
          </span>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className={cn("text-sm truncate", compact && "text-xs")}>
                {skill.skillId.replace(/_/g, ' ')}
              </span>
              <span className="text-xs text-gray-500">
                {Math.round(skill.mastery * 100)}%
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className={cn("h-full rounded-full", getMasteryColor(skill.mastery))}
                initial={{ width: 0 }}
                animate={{ width: `${skill.mastery * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
          <span className="text-xs text-gray-400">
            {skill.attemptCount}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

// ============================================================
// Question Card Component
// ============================================================

interface QuestionCardProps {
  item: AdaptiveItem;
  onAnswer: (answer: string) => void;
  showResult?: {
    isCorrect: boolean;
    correctAnswer: string;
    explanation?: string;
  };
  disabled?: boolean;
}

function QuestionCard({ item, onAnswer, showResult, disabled }: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(item.timeLimit || null);
  
  // Timer
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || showResult || disabled) return;
    
    const timer = setInterval(() => {
      setTimeLeft((t) => (t || 0) - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft, showResult, disabled]);
  
  // Auto-submit on timeout
  useEffect(() => {
    if (timeLeft === 0 && !showResult && selectedAnswer === null) {
      onAnswer(''); // Timeout
    }
  }, [timeLeft, showResult, selectedAnswer, onAnswer]);
  
  const handleSelect = (answer: string) => {
    if (disabled || showResult) return;
    setSelectedAnswer(answer);
  };
  
  const handleSubmit = () => {
    if (selectedAnswer && !showResult) {
      onAnswer(selectedAnswer);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl shadow-lg p-6 border"
    >
      {/* Timer */}
      {timeLeft !== null && !showResult && (
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-gray-500 uppercase tracking-wide">
            {item.topic}
          </span>
          <div className={cn(
            "flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium",
            timeLeft < 10 ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"
          )}>
            <Clock className="w-3 h-3" />
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
        </div>
      )}
      
      {/* Question */}
      <h3 className="text-lg font-medium text-gray-900 mb-6">
        {item.content}
      </h3>
      
      {/* Options */}
      {item.options && (
        <div className="space-y-3">
          {item.options.map((option, index) => {
            const letter = String.fromCharCode(65 + index);
            const isSelected = selectedAnswer === letter;
            const isCorrect = showResult?.correctAnswer === letter;
            const isWrong = showResult && isSelected && !isCorrect;
            
            return (
              <motion.button
                key={index}
                onClick={() => handleSelect(letter)}
                disabled={disabled || !!showResult}
                className={cn(
                  "w-full p-4 rounded-lg border-2 text-left transition-all",
                  "hover:border-blue-300 hover:bg-blue-50",
                  isSelected && !showResult && "border-blue-500 bg-blue-50",
                  isCorrect && "border-green-500 bg-green-50",
                  isWrong && "border-red-500 bg-red-50",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
                whileHover={!showResult ? { scale: 1.01 } : {}}
                whileTap={!showResult ? { scale: 0.99 } : {}}
              >
                <span className="font-medium mr-3">{letter}.</span>
                {option}
                {isCorrect && showResult && (
                  <CheckCircle className="inline-block w-5 h-5 text-green-500 ml-2" />
                )}
                {isWrong && (
                  <XCircle className="inline-block w-5 h-5 text-red-500 ml-2" />
                )}
              </motion.button>
            );
          })}
        </div>
      )}
      
      {/* Submit Button */}
      {!showResult && (
        <Button
          onClick={handleSubmit}
          disabled={!selectedAnswer || disabled}
          className="w-full mt-6"
        >
          Submit Answer
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      )}
      
      {/* Result */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6"
          >
            <div className={cn(
              "p-4 rounded-lg",
              showResult.isCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
            )}>
              <div className="flex items-center gap-2 mb-2">
                {showResult.isCorrect ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className={cn(
                  "font-medium",
                  showResult.isCorrect ? "text-green-700" : "text-red-700"
                )}>
                  {showResult.isCorrect ? "Correct!" : "Incorrect"}
                </span>
              </div>
              
              {!showResult.isCorrect && (
                <p className="text-sm text-gray-600 mb-2">
                  Correct answer: <strong>{showResult.correctAnswer}</strong>
                </p>
              )}
              
              {showResult.explanation && (
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5" />
                  <p>{showResult.explanation}</p>
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
// Main AdaptiveRunner Component
// ============================================================

export function AdaptiveRunner({
  userId,
  subject,
  topic,
  onComplete,
  className,
}: AdaptiveRunnerProps) {
  // State
  const [session, setSession] = useState<AdaptiveSession | null>(null);
  const [currentItem, setCurrentItem] = useState<AdaptiveItem | null>(null);
  const [progress, setProgress] = useState<SessionProgress | null>(null);
  const [thetaHistory, setThetaHistory] = useState<ThetaHistoryPoint[]>([]);
  const [skillStates, setSkillStates] = useState<SkillState[]>([]);
  const [lastResult, setLastResult] = useState<{
    isCorrect: boolean;
    correctAnswer: string;
    explanation?: string;
    thetaChange: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const previousThetaRef = useRef<number>(0);
  
  // Initialize session
  const initializeSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/adaptive/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, subject, topic }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create session');
      }
      
      setSession(data.session);
      previousThetaRef.current = data.session.theta;
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize');
    } finally {
      setIsLoading(false);
    }
  }, [userId, subject, topic]);
  
  // Fetch next item
  const fetchNextItem = useCallback(async () => {
    if (!session || isPaused) return;
    
    setIsLoading(true);
    setError(null);
    setLastResult(null);
    
    try {
      const response = await fetch('/api/adaptive/next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.id, userId }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        if (data.progress && !data.progress.shouldContinue) {
          // Session complete
          onComplete?.(session);
          return;
        }
        throw new Error(data.error || 'Failed to get next item');
      }
      
      setCurrentItem(data.item);
      setProgress(data.progress);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch item');
    } finally {
      setIsLoading(false);
    }
  }, [session, userId, isPaused, onComplete]);
  
  // Submit answer
  const submitAnswer = useCallback(async (answer: string) => {
    if (!session || !currentItem) return;
    
    setIsLoading(true);
    
    try {
      const startTime = Date.now();
      
      const response = await fetch('/api/adaptive/response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          userId,
          itemId: currentItem.id,
          userResponse: answer,
          responseTime: Math.floor((Date.now() - startTime) / 1000),
        }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to submit answer');
      }
      
      // Update state with result
      setLastResult({
        isCorrect: data.result.isCorrect,
        correctAnswer: data.result.correctAnswer,
        explanation: data.result.explanation,
        thetaChange: data.result.thetaUpdate.change,
      });
      
      // Update session
      setSession(prev => prev ? {
        ...prev,
        theta: data.result.thetaUpdate.after,
        thetaSE: data.result.thetaUpdate.se,
        totalItems: data.result.progress.totalItems,
        correctItems: data.result.progress.correctItems,
      } : null);
      
      // Add to history
      setThetaHistory(prev => [...prev, {
        theta: data.result.thetaUpdate.after,
        se: data.result.thetaUpdate.se,
        timestamp: Date.now(),
        itemId: currentItem.id,
        correct: data.result.isCorrect,
      }]);
      
      // Update skill states
      if (data.result.skillUpdates) {
        setSkillStates(prev => {
          const newSkills = [...prev];
          for (const update of data.result.skillUpdates) {
            const existing = newSkills.findIndex(s => s.skillId === update.skillId);
            if (existing >= 0) {
              newSkills[existing] = {
                ...newSkills[existing],
                mastery: update.masteryAfter,
                level: update.level,
              };
            } else {
              newSkills.push({
                skillId: update.skillId,
                mastery: update.masteryAfter,
                level: update.level,
                attemptCount: 1,
                correctCount: data.result.isCorrect ? 1 : 0,
              });
            }
          }
          return newSkills;
        });
      }
      
      previousThetaRef.current = data.result.thetaUpdate.after;
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit answer');
    } finally {
      setIsLoading(false);
    }
  }, [session, userId, currentItem]);
  
  // Continue to next item after delay
  useEffect(() => {
    if (lastResult && !isPaused) {
      const timer = setTimeout(() => {
        fetchNextItem();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [lastResult, isPaused, fetchNextItem]);
  
  // Initialize on mount
  useEffect(() => {
    initializeSession();
  }, [initializeSession]);
  
  // Fetch first item after session is created
  useEffect(() => {
    if (session && !currentItem && !lastResult) {
      fetchNextItem();
    }
  }, [session, currentItem, lastResult, fetchNextItem]);
  
  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-slate-50 to-blue-50", className)}>
      <div className="max-w-6xl mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Brain className="w-8 h-8 text-blue-500" />
              Cogni Core
            </h1>
            <p className="text-sm text-gray-500">Adaptive Learning Engine</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSession(null);
                setCurrentItem(null);
                setThetaHistory([]);
                setSkillStates([]);
                setLastResult(null);
                initializeSession();
              }}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Question Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Progress Bar */}
            {progress && (
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Session Progress</span>
                  <span className="text-sm text-gray-500">
                    {session?.correctItems || 0}/{session?.totalItems || 0} correct
                  </span>
                </div>
                <Progress value={progress.precisionProgress * 100} className="h-2" />
                <p className="text-xs text-gray-400 mt-1">{progress.continueReason}</p>
              </div>
            )}
            
            {/* Question Card */}
            <AnimatePresence mode="wait">
              {isLoading && !currentItem ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-center min-h-[300px]"
                >
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
                    />
                    <p className="text-gray-500">Selecting optimal question...</p>
                  </div>
                </motion.div>
              ) : currentItem ? (
                <QuestionCard
                  key={currentItem.id}
                  item={currentItem}
                  onAnswer={submitAnswer}
                  showResult={lastResult ? {
                    isCorrect: lastResult.isCorrect,
                    correctAnswer: lastResult.correctAnswer,
                    explanation: lastResult.explanation,
                  } : undefined}
                  disabled={isLoading || isPaused}
                />
              ) : error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-red-50 rounded-xl p-6 text-center"
                >
                  <p className="text-red-600">{error}</p>
                  <Button onClick={fetchNextItem} className="mt-4">
                    Try Again
                  </Button>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
          
          {/* Right: Metrics Panel */}
          <div className="space-y-4">
            {/* Ability Gauge */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Ability Estimate (θ)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AbilityGauge
                  theta={session?.theta || 0}
                  se={session?.thetaSE || 1}
                  previousTheta={previousThetaRef.current}
                  size={200}
                />
              </CardContent>
            </Card>
            
            {/* Theta Trace */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  θ History
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ThetaTraceChart history={thetaHistory} width={280} height={150} />
              </CardContent>
            </Card>
            
            {/* Skill Mastery */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Skill Mastery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TopicMasteryHeatmap skills={skillStates} compact />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdaptiveRunner;
