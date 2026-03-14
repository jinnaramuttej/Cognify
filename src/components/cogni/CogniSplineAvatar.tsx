"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// =====================================================
// TYPES
// =====================================================

export type CogniState = 'idle' | 'listening' | 'thinking' | 'explaining' | 'encouraging' | 'celebrating';

interface CogniSplineAvatarProps {
  state: CogniState;
  isSpeaking?: boolean;
  audioLevel?: number;
  className?: string;
  splineUrl?: string;
}

// =====================================================
// STATE CONFIGURATIONS
// =====================================================

const STATE_CONFIGS: Record<CogniState, { label: string; glowColor: string; ringColor: string }> = {
  idle: {
    label: 'Ready',
    glowColor: 'from-blue-500/30 via-blue-400/20 to-transparent',
    ringColor: 'border-blue-300/30',
  },
  listening: {
    label: 'Listening...',
    glowColor: 'from-cyan-500/35 via-blue-400/25 to-transparent',
    ringColor: 'border-cyan-400/40',
  },
  thinking: {
    label: 'Thinking...',
    glowColor: 'from-purple-500/30 via-blue-400/15 to-transparent',
    ringColor: 'border-purple-400/40',
  },
  explaining: {
    label: 'Explaining',
    glowColor: 'from-blue-500/35 via-blue-400/25 to-transparent',
    ringColor: 'border-blue-400/40',
  },
  encouraging: {
    label: 'Encouraging',
    glowColor: 'from-emerald-500/30 via-blue-400/15 to-transparent',
    ringColor: 'border-emerald-400/40',
  },
  celebrating: {
    label: 'Celebrating!',
    glowColor: 'from-amber-500/30 via-blue-400/15 to-transparent',
    ringColor: 'border-amber-400/40',
  },
};

// =====================================================
// SPEAKING INDICATOR OVERLAY
// =====================================================

function SpeakingIndicator({ isSpeaking, audioLevel }: { isSpeaking: boolean; audioLevel: number }) {
  if (!isSpeaking) return null;

  return (
    <motion.div
      className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-4 py-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 bg-blue-400 rounded-full"
            animate={{
              height: [8, 16 + audioLevel * 12, 8],
            }}
            transition={{
              duration: 0.3,
              repeat: Infinity,
              delay: i * 0.08,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function CogniSplineAvatar({
  state,
  isSpeaking = false,
  audioLevel = 0,
  className,
  splineUrl = 'https://my.spline.design/nexbotrobotcharacterconcept-l4QXavLeCVfK9Z5fQaTToS9H/',
}: CogniSplineAvatarProps) {
  const [isLoading, setIsLoading] = useState(true);
  const config = STATE_CONFIGS[state];

  return (
    <div className={cn("relative w-full h-full overflow-hidden", className)}>
      {/* Ambient Glow */}
      <motion.div
        className={cn(
          "absolute inset-0 bg-gradient-radial blur-3xl opacity-50",
          config.glowColor
        )}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* 3D Model Container - Cropped to hide Spline watermark */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            clipPath: 'inset(0 0 40px 0)',
            WebkitClipPath: 'inset(0 0 40px 0)',
          }}
        >
          <iframe
            src={splineUrl}
            frameBorder="0"
            width="100%"
            height="calc(100% + 50px)"
            style={{
              pointerEvents: 'auto',
              transform: 'scale(1.05)',
              transformOrigin: 'center center',
            }}
            onLoad={() => setIsLoading(false)}
            allow="autoplay; fullscreen"
          />
        </div>

        {/* Bottom fade gradient */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none z-10"
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-20">
          <div className="flex flex-col items-center gap-3">
            <motion.div
              className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <span className="text-sm text-muted-foreground">Loading Cogni...</span>
          </div>
        </div>
      )}

      {/* Speaking Indicator */}
      <SpeakingIndicator isSpeaking={isSpeaking} audioLevel={audioLevel} />

      {/* State Ring */}
      <motion.div
        className={cn(
          "absolute inset-0 rounded-2xl border-2 pointer-events-none z-10",
          config.ringColor
        )}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* State Badge */}
      <div className="absolute top-3 left-3 z-20">
        <motion.div
          key={state}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium shadow-sm backdrop-blur-sm",
            state === 'thinking' && "bg-purple-100/80 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
            state === 'explaining' && "bg-blue-100/80 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
            state === 'encouraging' && "bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
            state === 'celebrating' && "bg-amber-100/80 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
            state === 'listening' && "bg-cyan-100/80 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
            state === 'idle' && "bg-muted/80 text-muted-foreground"
          )}
        >
          {config.label}
        </motion.div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[5]">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-blue-400/40"
            style={{
              left: `${15 + i * 12}%`,
              top: `${15 + i * 11}%`,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0, 0.6, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.7,
              ease: "easeOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default CogniSplineAvatar;
