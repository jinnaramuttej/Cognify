"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// =====================================================
// TYPES
// =====================================================

export type CogniState = 'idle' | 'listening' | 'thinking' | 'explaining' | 'encouraging' | 'celebrating';

interface VisemeFrame {
  mouthHeight: number;
  mouthWidth: number;
  lipRoundedness: number;
}

interface CogniAnimatedAvatarProps {
  state: CogniState;
  isSpeaking?: boolean;
  audioLevel?: number;
  className?: string;
}

// =====================================================
// VISEME DEFINITIONS
// =====================================================

const VISEMES: Record<string, VisemeFrame> = {
  rest: { mouthHeight: 0, mouthWidth: 1, lipRoundedness: 0.5 },
  A: { mouthHeight: 0.8, mouthWidth: 1.2, lipRoundedness: 0.3 },
  E: { mouthHeight: 0.4, mouthWidth: 1.1, lipRoundedness: 0.2 },
  I: { mouthHeight: 0.3, mouthWidth: 0.9, lipRoundedness: 0.2 },
  O: { mouthHeight: 0.6, mouthWidth: 0.7, lipRoundedness: 0.9 },
  U: { mouthHeight: 0.4, mouthWidth: 0.5, lipRoundedness: 1 },
  M: { mouthHeight: 0, mouthWidth: 1, lipRoundedness: 1 },
  F: { mouthHeight: 0.2, mouthWidth: 1.1, lipRoundedness: 0.3 },
  TH: { mouthHeight: 0.15, mouthWidth: 1.05, lipRoundedness: 0.4 },
  S: { mouthHeight: 0.2, mouthWidth: 1.1, lipRoundedness: 0.2 },
};

const VISEME_SEQUENCE = ['rest', 'A', 'E', 'O', 'M', 'S', 'TH', 'U', 'rest'];

// =====================================================
// MAIN COMPONENT
// =====================================================

export function CogniAnimatedAvatar({ 
  state, 
  isSpeaking = false, 
  audioLevel = 0,
  className 
}: CogniAnimatedAvatarProps) {
  const [currentViseme, setCurrentViseme] = useState<VisemeFrame>(VISEMES.rest);
  const [isBlinking, setIsBlinking] = useState(false);
  const [breathPhase, setBreathPhase] = useState(0);
  const visemeIndexRef = useRef(0);
  
  const imageMap: Record<CogniState, string> = {
    idle: '/cogni-avatar/cogni-portrait.png',
    listening: '/cogni-avatar/cogni-portrait.png',
    thinking: '/cogni-avatar/cogni-thinking.png',
    explaining: '/cogni-avatar/cogni-explaining.png',
    encouraging: '/cogni-avatar/cogni-encouraging.png',
    celebrating: '/cogni-avatar/cogni-encouraging.png',
  };
  
  // Blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      const blinkChance = state === 'thinking' ? 0.12 : 0.04;
      if (Math.random() < blinkChance) {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 120);
      }
    }, 400);
    return () => clearInterval(blinkInterval);
  }, [state]);
  
  // Breathing
  useEffect(() => {
    const breathInterval = setInterval(() => {
      setBreathPhase(prev => (prev + 1) % 4);
    }, 800);
    return () => clearInterval(breathInterval);
  }, []);
  
  // Lip sync
  useEffect(() => {
    if (!isSpeaking) {
      setCurrentViseme(VISEMES.rest);
      return;
    }
    
    const visemeInterval = setInterval(() => {
      const nextIndex = (visemeIndexRef.current + 1) % VISEME_SEQUENCE.length;
      visemeIndexRef.current = nextIndex;
      const visemeName = VISEME_SEQUENCE[nextIndex];
      const viseme = VISEMES[visemeName] || VISEMES.rest;
      
      setCurrentViseme({
        mouthHeight: viseme.mouthHeight * (0.4 + audioLevel * 0.6),
        mouthWidth: viseme.mouthWidth,
        lipRoundedness: viseme.lipRoundedness,
      });
    }, 70 + Math.random() * 50);
    
    return () => clearInterval(visemeInterval);
  }, [isSpeaking, audioLevel]);
  
  const stateConfig = {
    idle: { scale: 1, brightness: 1, glowColor: 'blue' },
    listening: { scale: 1.02, brightness: 1.05, glowColor: 'cyan' },
    thinking: { scale: 0.98, brightness: 0.95, glowColor: 'purple' },
    explaining: { scale: 1.03, brightness: 1.1, glowColor: 'blue' },
    encouraging: { scale: 1.04, brightness: 1.08, glowColor: 'emerald' },
    celebrating: { scale: 1.06, brightness: 1.12, glowColor: 'amber' },
  };
  
  const config = stateConfig[state];
  const glowColors: Record<string, string> = {
    blue: 'from-blue-500/30 via-blue-400/20 to-transparent',
    cyan: 'from-cyan-500/35 via-blue-400/25 to-transparent',
    purple: 'from-purple-500/30 via-blue-400/15 to-transparent',
    emerald: 'from-emerald-500/30 via-blue-400/15 to-transparent',
    amber: 'from-amber-500/30 via-blue-400/15 to-transparent',
  };
  
  return (
    <div className={cn("relative w-full h-full overflow-hidden rounded-2xl", className)}>
      {/* Ambient glow */}
      <motion.div
        className={cn(
          "absolute inset-0 bg-gradient-radial blur-3xl",
          glowColors[config.glowColor]
        )}
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Main avatar */}
      <motion.div
        className="relative w-full h-full"
        animate={{
          scale: config.scale,
          filter: `brightness(${config.brightness})`,
          y: breathPhase === 1 ? -3 : breathPhase === 3 ? 3 : 0,
        }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
      >
        {/* Base image */}
        <AnimatePresence mode="wait">
          <motion.div
            key={state}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.25 }}
            className="relative w-full h-full"
          >
            <Image
              src={imageMap[state]}
              alt="Cogni AI Tutor"
              fill
              className="object-cover object-top"
              priority
            />
          </motion.div>
        </AnimatePresence>
        
        {/* Blink overlay */}
        <AnimatePresence>
          {isBlinking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent"
              style={{ top: '35%', bottom: '55%' }}
            />
          )}
        </AnimatePresence>
        
        {/* Mouth overlay for lip-sync */}
        {isSpeaking && (
          <motion.div
            className="absolute left-1/2 -translate-x-1/2"
            style={{ bottom: '24%' }}
            animate={{
              width: 28 * currentViseme.mouthWidth,
              height: 8 + currentViseme.mouthHeight * 18,
              borderRadius: `${50 * currentViseme.lipRoundedness}%`,
            }}
            transition={{ duration: 0.06 }}
          >
            <div className="w-full h-full bg-gradient-to-b from-slate-800 to-slate-900 rounded-full" />
            {currentViseme.mouthHeight > 0.4 && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-1 bg-white/70 rounded-b" />
            )}
          </motion.div>
        )}
      </motion.div>
      
      {/* State ring */}
      <motion.div
        className={cn(
          "absolute inset-0 rounded-2xl border-2 pointer-events-none",
          state === 'thinking' && "border-purple-400/40",
          state === 'explaining' && "border-blue-400/40",
          state === 'encouraging' && "border-emerald-400/40",
          state === 'celebrating' && "border-amber-400/40",
          state === 'listening' && "border-cyan-400/40",
          state === 'idle' && "border-blue-300/20"
        )}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  );
}

export default CogniAnimatedAvatar;
