"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Send, 
  Mic, 
  Image as ImageIcon, 
  Sparkles,
  BookOpen,
  Target,
  Lightbulb,
  RotateCcw,
  X,
  ChevronDown,
  ChevronUp,
  Zap,
  CheckCircle,
  Clock,
  TrendingUp,
  MessageSquare,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { CogniSplineAvatar, type CogniState } from '@/components/cogni-avatar/CogniSplineAvatar';

// =====================================================
// TYPES
// =====================================================

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  structured?: StructuredResponse;
}

interface StructuredResponse {
  understanding: string;
  strategy: string;
  steps: SolutionStep[];
  finalAnswer: string;
  followUpQuestion: string;
  topicsCovered: string[];
}

interface SolutionStep {
  stepNumber: number;
  title: string;
  content: string;
  explanation: string;
  formulas?: string[];
  isKey?: boolean;
}

interface SessionState {
  sessionId: string;
  topic: string | null;
  hintCount: number;
  confidence: 'confident' | 'somewhat' | 'confused' | null;
  timeSpent: number;
  stepsCompleted: number;
  mastery: number;
}

type CogniAvatarState = 'idle' | 'listening' | 'thinking' | 'explaining' | 'encouraging';

// =====================================================
// CUSTOM ANIMATED ROBOT AVATAR
// =====================================================

interface CogniRobotAvatarProps {
  state: CogniAvatarState;
}

function CogniRobotAvatar({ state }: CogniRobotAvatarProps) {
  // Animation variants based on state
  const headAnimation = {
    idle: { y: [0, -5, 0], rotate: [0, 2, -2, 0] },
    listening: { y: [0, -3, 0], rotate: [0, -5, 5, 0], scale: [1, 1.02, 1] },
    thinking: { y: [0, -8, 0], rotate: [0, -8, 8, 0] },
    explaining: { y: [0, -3, 0], scale: [1, 1.05, 1] },
    encouraging: { y: [0, -10, 0], scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] },
  };

  const eyeAnimation = {
    idle: { scaleY: [1, 0.3, 1] },
    listening: { scaleX: [1, 1.2, 1] },
    thinking: { y: [-2, 2, -2] },
    explaining: { scaleY: [1, 0.5, 1] },
    encouraging: { scale: [1, 1.3, 1] },
  };

  const glowAnimation = {
    idle: { opacity: [0.3, 0.6, 0.3], scale: [0.95, 1, 0.95] },
    listening: { opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] },
    thinking: { opacity: [0.3, 0.8, 0.3], scale: [0.9, 1.05, 0.9] },
    explaining: { opacity: [0.4, 0.9, 0.4], scale: [0.95, 1.1, 0.95] },
    encouraging: { opacity: [0.5, 1, 0.5], scale: [0.9, 1.15, 0.9] },
  };

  const armAnimation = {
    idle: { rotate: [0, 5, 0] },
    listening: { rotate: [0, -15, 0] },
    thinking: { rotate: [0, 20, 0] },
    explaining: { rotate: [-20, 20, -20] },
    encouraging: { rotate: [-30, 30, -30] },
  };

  const transition = {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut",
  };

  const eyeTransition = {
    duration: state === 'idle' ? 4 : state === 'thinking' ? 1.5 : 2,
    repeat: Infinity,
    ease: "easeInOut",
  };

  return (
    <div className="relative w-64 h-64">
      {/* Glow Effect */}
      <motion.div
        animate={glowAnimation[state]}
        transition={{ ...transition, duration: 3 }}
        className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/30 via-blue-500/20 to-purple-500/30 blur-xl"
      />

      {/* Robot SVG */}
      <motion.svg
        viewBox="0 0 200 200"
        className="w-full h-full relative z-10"
        style={{ filter: 'drop-shadow(0 10px 30px rgba(59, 130, 246, 0.3))' }}
      >
        {/* Body */}
        <motion.g
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Body Base */}
          <ellipse cx="100" cy="150" rx="45" ry="35" fill="url(#bodyGradient)" />
          
          {/* Chest Light */}
          <motion.circle
            cx="100"
            cy="145"
            r="12"
            fill="url(#chestGlow)"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <circle cx="100" cy="145" r="8" fill="#3B82F6" />
          
          {/* Body Stripes */}
          <path d="M70 135 L130 135" stroke="#1E40AF" strokeWidth="2" opacity="0.5" />
          <path d="M65 145 L135 145" stroke="#1E40AF" strokeWidth="2" opacity="0.3" />
          <path d="M70 155 L130 155" stroke="#1E40AF" strokeWidth="2" opacity="0.5" />
        </motion.g>

        {/* Left Arm */}
        <motion.g
          animate={armAnimation[state]}
          transition={{ ...transition, duration: 2.5 }}
          style={{ transformOrigin: '60px 140px' }}
        >
          <ellipse cx="45" cy="145" rx="12" ry="20" fill="url(#bodyGradient)" />
          <circle cx="45" cy="160" r="8" fill="#60A5FA" />
        </motion.g>

        {/* Right Arm */}
        <motion.g
          animate={armAnimation[state]}
          transition={{ ...transition, duration: 2.5, delay: 0.3 }}
          style={{ transformOrigin: '140px 140px' }}
        >
          <ellipse cx="155" cy="145" rx="12" ry="20" fill="url(#bodyGradient)" />
          <circle cx="155" cy="160" r="8" fill="#60A5FA" />
        </motion.g>

        {/* Neck */}
        <rect x="90" y="100" width="20" height="20" rx="5" fill="url(#bodyGradient)" />

        {/* Head */}
        <motion.g
          animate={headAnimation[state]}
          transition={transition}
        >
          {/* Head Shape */}
          <rect x="55" y="30" width="90" height="75" rx="20" fill="url(#headGradient)" />
          
          {/* Face Screen */}
          <rect x="65" y="40" width="70" height="50" rx="12" fill="#0F172A" />
          
          {/* Eyes Container */}
          <g>
            {/* Left Eye */}
            <motion.g
              animate={eyeAnimation[state]}
              transition={eyeTransition}
            >
              <ellipse cx="85" cy="60" rx="12" ry="14" fill="#3B82F6" />
              <ellipse cx="85" cy="58" rx="6" ry="8" fill="#60A5FA" />
              <circle cx="88" cy="55" r="3" fill="white" opacity="0.8" />
            </motion.g>
            
            {/* Right Eye */}
            <motion.g
              animate={eyeAnimation[state]}
              transition={eyeTransition}
            >
              <ellipse cx="115" cy="60" rx="12" ry="14" fill="#3B82F6" />
              <ellipse cx="115" cy="58" rx="6" ry="8" fill="#60A5FA" />
              <circle cx="118" cy="55" r="3" fill="white" opacity="0.8" />
            </motion.g>
          </g>

          {/* Antenna */}
          <motion.line
            x1="100"
            y1="30"
            x2="100"
            y2="15"
            stroke="#60A5FA"
            strokeWidth="3"
            strokeLinecap="round"
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <motion.circle
            cx="100"
            cy="12"
            r="5"
            fill="#3B82F6"
            animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1, repeat: Infinity }}
          />

          {/* Ear Pieces */}
          <rect x="45" y="50" width="12" height="25" rx="4" fill="url(#bodyGradient)" />
          <rect x="143" y="50" width="12" height="25" rx="4" fill="url(#bodyGradient)" />
          
          {/* Thinking Particles */}
          {state === 'thinking' && (
            <g>
              {[0, 1, 2].map((i) => (
                <motion.circle
                  key={i}
                  cx={130 + i * 15}
                  cy={45}
                  r="3"
                  fill="#60A5FA"
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ opacity: [0, 1, 0], y: [-10, -20, -10] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                />
              ))}
            </g>
          )}

          {/* Speaking Indicator */}
          {state === 'explaining' && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.rect
                x="92"
                y="75"
                width="16"
                height="4"
                rx="2"
                fill="#3B82F6"
                animate={{ scaleX: [1, 1.5, 1] }}
                transition={{ duration: 0.3, repeat: Infinity }}
              />
            </motion.g>
          )}

          {/* Happy Expression for Encouraging */}
          {state === 'encouraging' && (
            <motion.path
              d="M75 70 Q100 85 125 70"
              fill="none"
              stroke="#60A5FA"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5 }}
            />
          )}
        </motion.g>

        {/* Gradients */}
        <defs>
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
          <linearGradient id="headGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
          <radialGradient id="chestGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
          </radialGradient>
        </defs>
      </motion.svg>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-blue-400"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 0.8, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// =====================================================
// COGNI AVATAR PANEL (RIGHT SIDE - 35%)
// =====================================================

interface CogniAvatarPanelProps {
  avatarState: CogniAvatarState;
  mastery: number;
  hintCount: number;
  onQuickAction: (action: string) => void;
}

function CogniAvatarPanel({ avatarState, mastery, hintCount, onQuickAction }: CogniAvatarPanelProps) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  
  const stateConfig: Record<CogniAvatarState, { label: string; color: string; icon: React.ElementType }> = {
    idle: { label: 'Ready', color: 'bg-gray-100 text-gray-600', icon: Brain },
    listening: { label: 'Listening...', color: 'bg-blue-100 text-blue-600', icon: MessageSquare },
    thinking: { label: 'Thinking...', color: 'bg-purple-100 text-purple-600', icon: Sparkles },
    explaining: { label: 'Explaining', color: 'bg-emerald-100 text-emerald-600', icon: BookOpen },
    encouraging: { label: 'Encouraging', color: 'bg-amber-100 text-amber-600', icon: TrendingUp },
  };
  
  const currentConfig = stateConfig[avatarState];
  const StateIcon = currentConfig.icon;
  
  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-50 to-white overflow-hidden">
      {/* Avatar Container */}
      <div className="relative flex-1 min-h-[300px] flex items-center justify-center p-4">
        {/* Premium 3D Spline Avatar */}
        <CogniSplineAvatar 
          state={avatarState}
          isSpeaking={avatarState === 'explaining'}
          audioLevel={avatarState === 'explaining' ? 0.6 : 0}
          className="w-full h-full"
        />
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3 z-20">
          <motion.div
            key={avatarState}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium shadow-sm backdrop-blur-sm",
              currentConfig.color
            )}
          >
            <StateIcon className="w-4 h-4" />
            {currentConfig.label}
          </motion.div>
        </div>
      </div>
      
      {/* Status Panel */}
      <div className="border-t bg-white/80 backdrop-blur-sm">
        {/* Mastery Bar */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Topic Mastery</span>
            <span className="text-sm font-bold text-blue-600">{Math.round(mastery * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${mastery * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
        
        {/* Hint Usage */}
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Hints used this session
          </div>
          <Badge variant="secondary" className="font-mono">
            {hintCount}
          </Badge>
        </div>
        
        {/* Quick Actions */}
        <div className="p-4 space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            Quick Actions
          </p>
          <div className="grid grid-cols-2 gap-2">
            <QuickActionButton
              icon={ArrowRight}
              label="Simplify"
              onClick={() => onQuickAction('simplify')}
            />
            <QuickActionButton
              icon={TrendingUp}
              label="Harder"
              onClick={() => onQuickAction('harder')}
            />
            <QuickActionButton
              icon={HelpCircle}
              label="Similar Q"
              onClick={() => onQuickAction('similar')}
            />
            <QuickActionButton
              icon={RotateCcw}
              label="Fix Mistake"
              onClick={() => onQuickAction('fix')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickActionButton({ 
  icon: Icon, 
  label, 
  onClick 
}: { 
  icon: React.ElementType; 
  label: string; 
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 text-gray-700 hover:text-blue-700 transition-colors text-sm"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Icon className="w-4 h-4" />
      <span className="font-medium">{label}</span>
    </motion.button>
  );
}

// =====================================================
// INLINE HINT LADDER
// =====================================================

interface InlineHintLadderProps {
  onHintRequest: (level: number) => void;
  hintsUsed: number[];
  isVisible: boolean;
}

function InlineHintLadder({ onHintRequest, hintsUsed, isVisible }: InlineHintLadderProps) {
  const [expanded, setExpanded] = useState(false);
  
  if (!isVisible) return null;
  
  const levels = [
    { level: 1, name: 'Direction', desc: 'Get pointed in the right direction' },
    { level: 2, name: 'Scaffold', desc: 'Receive a structured hint' },
    { level: 3, name: 'Guide', desc: 'Get a more detailed nudge' },
    { level: 4, name: 'Reveal', desc: 'See a key step explained' },
  ];
  
  return (
    <div className="mt-4">
      <motion.button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 font-medium"
      >
        <Lightbulb className="w-4 h-4" />
        Need a hint?
        <ChevronDown className={cn(
          "w-4 h-4 transition-transform",
          expanded && "rotate-180"
        )} />
      </motion.button>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 grid grid-cols-4 gap-2">
              {levels.map((l) => {
                const isUsed = hintsUsed.includes(l.level);
                return (
                  <motion.button
                    key={l.level}
                    onClick={() => !isUsed && onHintRequest(l.level)}
                    disabled={isUsed}
                    className={cn(
                      "relative p-3 rounded-lg border-2 text-center transition-all",
                      isUsed 
                        ? "bg-amber-50 border-amber-200" 
                        : "bg-white border-gray-200 hover:border-amber-300 hover:bg-amber-50/50"
                    )}
                    whileHover={!isUsed ? { scale: 1.02 } : {}}
                    whileTap={!isUsed ? { scale: 0.98 } : {}}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full mx-auto mb-1.5 flex items-center justify-center text-xs font-bold",
                      isUsed 
                        ? "bg-amber-400 text-white" 
                        : "bg-gray-100 text-gray-600"
                    )}>
                      {isUsed ? <CheckCircle className="w-3 h-3" /> : l.level}
                    </div>
                    <p className={cn(
                      "text-xs font-medium",
                      isUsed ? "text-amber-700" : "text-gray-600"
                    )}>
                      {l.name}
                    </p>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =====================================================
// STRUCTURED RESPONSE RENDERER
// =====================================================

interface StructuredResponseRendererProps {
  response: StructuredResponse;
  onFollowUpClick: (question: string) => void;
}

function StructuredResponseRenderer({ response, onFollowUpClick }: StructuredResponseRendererProps) {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  
  return (
    <div className="space-y-4">
      {/* Understanding */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 rounded-xl p-4 border border-blue-100"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-blue-500 flex items-center justify-center">
            <Target className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-semibold text-blue-900">Understanding</span>
        </div>
        <p className="text-sm text-blue-800">{response.understanding}</p>
      </motion.div>
      
      {/* Strategy */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-4 border border-slate-200"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-slate-600 flex items-center justify-center">
            <Zap className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-semibold text-slate-800">Strategy</span>
        </div>
        <p className="text-sm text-slate-700">{response.strategy}</p>
      </motion.div>
      
      {/* Steps */}
      <div className="space-y-2">
        {response.steps.map((step, index) => (
          <motion.div
            key={step.stepNumber}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + index * 0.05 }}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
          >
            <button
              onClick={() => setExpandedStep(expandedStep === step.stepNumber ? null : step.stepNumber)}
              className={cn(
                "w-full flex items-center gap-3 p-4 text-left transition-colors",
                expandedStep === step.stepNumber ? "bg-blue-50" : "hover:bg-gray-50"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold",
                step.isKey 
                  ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white" 
                  : "bg-gray-100 text-gray-600"
              )}>
                {step.stepNumber}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{step.title}</p>
                <p className="text-xs text-gray-500 line-clamp-1">{step.content}</p>
              </div>
              <ChevronDown className={cn(
                "w-5 h-5 text-gray-400 transition-transform",
                expandedStep === step.stepNumber && "rotate-180"
              )} />
            </button>
            
            <AnimatePresence>
              {expandedStep === step.stepNumber && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                    <p className="text-sm text-gray-700 mb-2">{step.explanation}</p>
                    {step.formulas && step.formulas.length > 0 && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Key Formulas:</p>
                        {step.formulas.map((formula, i) => (
                          <code key={i} className="block text-sm text-blue-600 font-mono">{formula}</code>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
      
      {/* Final Answer */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border-2 border-emerald-200"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center">
            <CheckCircle className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-semibold text-emerald-800">Final Answer</span>
        </div>
        <p className="text-lg font-bold text-emerald-900">{response.finalAnswer}</p>
      </motion.div>
      
      {/* Follow-up */}
      {response.followUpQuestion && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-xl border border-blue-200 p-4"
        >
          <p className="text-sm text-gray-600 mb-2">Quick Check:</p>
          <button
            onClick={() => onFollowUpClick(response.followUpQuestion)}
            className="text-left w-full p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <p className="text-sm font-medium text-blue-800">{response.followUpQuestion}</p>
          </button>
        </motion.div>
      )}
    </div>
  );
}

// =====================================================
// MAIN COGNI TUTOR PAGE
// =====================================================

export default function CogniTutorPage() {
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [avatarState, setAvatarState] = useState<CogniAvatarState>('idle');
  const [session, setSession] = useState<SessionState>({
    sessionId: `session_${Date.now()}`,
    topic: null,
    hintCount: 0,
    confidence: null,
    timeSpent: 0,
    stepsCompleted: 0,
    mastery: 0.62,
  });
  const [hintsUsed, setHintsUsed] = useState<number[]>([]);
  
  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setSession(prev => ({ ...prev, timeSpent: prev.timeSpent + 1 }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  // Send message
  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setAvatarState('thinking');
    
    try {
      // Call API
      const response = await fetch('/api/ai-tutor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          sessionId: session.sessionId,
          history: messages.slice(-10),
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        const assistantMessage: Message = {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          structured: data.structured,
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        setAvatarState('explaining');
        
        // Update session
        if (data.topicsDiscussed?.length) {
          setSession(prev => ({
            ...prev,
            topic: data.topicsDiscussed[0],
            stepsCompleted: prev.stepsCompleted + 1,
          }));
        }
        
        setTimeout(() => setAvatarState('idle'), 2000);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      setAvatarState('idle');
      // Add error message
      const errorMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'system',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, session.sessionId]);
  
  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  // Quick actions
  const handleQuickAction = useCallback((action: string) => {
    const prompts: Record<string, string> = {
      simplify: 'Can you explain this more simply? Use analogies.',
      harder: 'Give me a more challenging version of this problem.',
      similar: 'Give me a similar practice question to test my understanding.',
      fix: 'Help me understand where I might have gone wrong in my approach.',
    };
    setInput(prompts[action] || '');
    setTimeout(() => {
      const inputEl = document.querySelector('input[type="text"]') as HTMLInputElement;
      inputEl?.focus();
    }, 100);
  }, []);
  
  // Handle hint request
  const handleHintRequest = useCallback((level: number) => {
    setHintsUsed(prev => [...prev, level]);
    setSession(prev => ({ ...prev, hintCount: prev.hintCount + 1 }));
    setInput(prev => prev + ` [Hint Level ${level} requested]`);
  }, []);
  
  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-slate-50">
      {/* Header */}
      <header className="shrink-0 bg-white/90 backdrop-blur-md border-b border-blue-100 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Branding */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-200/50">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Cognify AI Tutor
              </h1>
              <p className="text-sm text-gray-500">
                Adaptive AI learning powered by your performance
              </p>
            </div>
          </div>
          
          {/* Session Stats */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span className="font-mono">{formatTime(session.timeSpent)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <BookOpen className="w-4 h-4" />
              <span>{session.stepsCompleted} steps</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Target className="w-4 h-4" />
              <span>{Math.round(session.mastery * 100)}% mastery</span>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content - Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT - Learning Workspace (65%) */}
        <div className="w-[65%] flex flex-col border-r border-gray-200">
          {/* Messages */}
          <ScrollArea className="flex-1 p-6">
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Welcome */}
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16"
                >
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200/50">
                    <Brain className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    What would you like to learn today?
                  </h2>
                  <p className="text-gray-500 max-w-md mx-auto mb-8">
                    Ask me anything about concepts, solve problems step-by-step, or practice with similar questions.
                  </p>
                  
                  {/* Quick Start Cards */}
                  <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                    {[
                      { icon: BookOpen, label: 'Explain a concept', prompt: 'Explain the concept of electromagnetic induction' },
                      { icon: Target, label: 'Solve a problem', prompt: 'Help me solve: A particle moves in a circle of radius 2m with speed 4m/s. Find centripetal acceleration.' },
                      { icon: Sparkles, label: 'Practice more', prompt: 'Give me practice questions on integration by parts' },
                    ].map((item, i) => (
                      <motion.button
                        key={i}
                        onClick={() => setInput(item.prompt)}
                        className="p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-left group"
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                          <item.icon className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">{item.label}</p>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
              
              {/* Messages List */}
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-3",
                    message.role === 'user' && "flex-row-reverse"
                  )}
                >
                  {/* Avatar */}
                  <Avatar className="w-9 h-9 shrink-0">
                    <AvatarFallback className={cn(
                      "text-sm font-semibold",
                      message.role === 'user' 
                        ? "bg-gray-100 text-gray-600" 
                        : "bg-gradient-to-br from-blue-500 to-blue-700 text-white"
                    )}>
                      {message.role === 'user' ? 'U' : 'C'}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Content */}
                  <div className={cn(
                    "flex-1",
                    message.role === 'user' ? "items-end" : "items-start"
                  )}>
                    {message.role === 'assistant' && message.structured ? (
                      <StructuredResponseRenderer
                        response={message.structured}
                        onFollowUpClick={(q) => setInput(q)}
                      />
                    ) : (
                      <div className={cn(
                        "rounded-2xl p-4 max-w-[85%]",
                        message.role === 'user' 
                          ? "bg-blue-600 text-white rounded-tr-md" 
                          : message.role === 'system'
                            ? "bg-red-50 border border-red-200 text-red-700"
                            : "bg-white border border-gray-200 rounded-tl-md"
                      )}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    )}
                    
                    {/* Timestamp */}
                    <p className={cn(
                      "text-xs text-gray-400 mt-1 px-1",
                      message.role === 'user' ? "text-right" : "text-left"
                    )}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
              
              {/* Loading */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <Avatar className="w-9 h-9 shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-700 text-white text-sm font-semibold">
                      C
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-white border border-gray-200 rounded-2xl rounded-tl-md p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 rounded-full bg-blue-500"
                            animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.12 }}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400 ml-2">Analyzing your question...</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>
          
          {/* Input Area */}
          <div className="shrink-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 p-4">
            <div className="max-w-3xl mx-auto">
              {/* Inline Hint Ladder */}
              <InlineHintLadder
                onHintRequest={handleHintRequest}
                hintsUsed={hintsUsed}
                isVisible={messages.length > 0}
              />
              
              {/* Input */}
              <div className="flex items-center gap-3 mt-3">
                <div className="flex-1 relative">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Cogni anything... (concepts, problems, practice)"
                    disabled={isLoading}
                    className="h-12 pr-24 text-sm border-gray-200 focus:border-blue-400 focus:ring-blue-100"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                      <Mic className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                      <ImageIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <Button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="h-12 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-200/50"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <RotateCcw className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* RIGHT - Cogni Presence Panel (35%) */}
        <div className="w-[35%] shrink-0 h-full overflow-hidden">
          <CogniAvatarPanel
            avatarState={avatarState}
            mastery={session.mastery}
            hintCount={session.hintCount}
            onQuickAction={handleQuickAction}
          />
        </div>
      </div>
    </div>
  );
}
