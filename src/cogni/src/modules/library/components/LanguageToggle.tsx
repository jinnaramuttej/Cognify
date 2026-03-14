/**
 * Cognify Library - Language Toggle Component
 * 
 * Features:
 * - Flip animation on language switch
 * - Tri-lingual support (English, Hindi, Regional)
 * - Compact and expanded modes
 * - Visual preview of language labels
 * - Animated transitions
 */

"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { Globe, ChevronDown, Check, Languages, ArrowRightLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LANGUAGE_LABELS } from '@/lib/library/types';

// ============================================================
// Types
// ============================================================

interface LanguageToggleProps {
  currentLanguage: 'en' | 'hi' | 'both';
  onLanguageChange: (language: 'en' | 'hi' | 'both') => void;
  availableLanguages?: string[];
  mode?: 'compact' | 'expanded';
  showBothOption?: boolean;
}

// ============================================================
// Flip Card Component - 3D Flip Animation
// ============================================================

interface FlipCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  isFlipped: boolean;
  className?: string;
}

function FlipCard({ front, back, isFlipped, className }: FlipCardProps) {
  const rotateY = useMotionValue(0);
  
  useEffect(() => {
    animate(rotateY, isFlipped ? 180 : 0, {
      duration: 0.5,
      ease: [0.04, 0.62, 0.23, 0.98]
    });
  }, [isFlipped, rotateY]);
  
  const frontOpacity = useTransform(rotateY, [0, 90, 180], [1, 0, 0]);
  const backOpacity = useTransform(rotateY, [0, 90, 180], [0, 0, 1]);
  
  return (
    <div className={cn("relative w-full h-full", className)} style={{ perspective: '1000px' }}>
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{ 
          rotateY,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Front Face */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center backface-hidden"
          style={{ 
            backfaceVisibility: 'hidden',
            opacity: frontOpacity,
          }}
        >
          {front}
        </motion.div>
        
        {/* Back Face */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            opacity: backOpacity,
          }}
        >
          {back}
        </motion.div>
      </motion.div>
    </div>
  );
}

// ============================================================
// Language Button Component
// ============================================================

interface LanguageButtonProps {
  code: string;
  label: string;
  nativeLabel: string;
  isSelected: boolean;
  onClick: () => void;
  index?: number;
}

function LanguageButton({ code, label, nativeLabel, isSelected, onClick, index = 0 }: LanguageButtonProps) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative overflow-hidden group",
        isSelected 
          ? "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200" 
          : "hover:bg-gray-50 border border-transparent"
      )}
    >
      {/* Selection indicator */}
      {isSelected && (
        <motion.div
          layoutId="language-selection"
          className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-500"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
      
      {/* Language Code Badge */}
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all",
        isSelected 
          ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25" 
          : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
      )}>
        {code.toUpperCase()}
      </div>
      
      {/* Labels */}
      <div className="flex-1 text-left">
        <p className={cn(
          "text-sm font-medium transition-colors",
          isSelected ? "text-blue-700" : "text-gray-700"
        )}>
          {label}
        </p>
        <p className="text-xs text-gray-400">{nativeLabel}</p>
      </div>
      
      {/* Checkmark */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          >
            <Check className="w-5 h-5 text-blue-500" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// ============================================================
// Language Preview Component
// ============================================================

interface LanguagePreviewProps {
  language: 'en' | 'hi' | 'both';
}

function LanguagePreview({ language }: LanguagePreviewProps) {
  const previews = {
    en: { primary: 'Electric Charges and Fields', secondary: null },
    hi: { primary: 'वैद्युत आवेश एवं क्षेत्र', secondary: null },
    both: { primary: 'Electric Charges and Fields', secondary: 'वैद्युत आवेश एवं क्षेत्र' },
  };
  
  const preview = previews[language];
  
  return (
    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-blue-500" />
        <span className="text-xs font-medium text-gray-500">Preview</span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={language}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-1"
        >
          <p className="text-gray-900 font-medium">{preview.primary}</p>
          {preview.secondary && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-gray-500 text-sm flex items-center gap-2"
            >
              <ArrowRightLeft className="w-3 h-3" />
              {preview.secondary}
            </motion.p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// Main Language Toggle Component
// ============================================================

export function LanguageToggle({
  currentLanguage,
  onLanguageChange,
  availableLanguages = ['en', 'hi'],
  mode = 'compact',
  showBothOption = true,
}: LanguageToggleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleLanguageSelect = useCallback((lang: 'en' | 'hi' | 'both') => {
    if (lang !== currentLanguage) {
      setIsFlipped(!isFlipped);
    }
    onLanguageChange(lang);
    setIsOpen(false);
  }, [currentLanguage, isFlipped, onLanguageChange]);
  
  const currentLabel = currentLanguage === 'both' 
    ? 'Bilingual' 
    : LANGUAGE_LABELS[currentLanguage]?.native || currentLanguage.toUpperCase();
  
  const currentFlag = currentLanguage === 'both' 
    ? '🌐' 
    : currentLanguage === 'en' 
      ? '🇬🇧' 
      : '🇮🇳';
  
  // Compact mode - simple dropdown with flip animation
  if (mode === 'compact') {
    return (
      <div className="relative" ref={dropdownRef}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "gap-2 min-w-[120px] transition-all",
            isOpen && "ring-2 ring-blue-200 border-blue-300"
          )}
        >
          <Globe className="w-4 h-4 text-blue-500" />
          <AnimatePresence mode="wait">
            <motion.span
              key={currentLanguage}
              initial={{ opacity: 0, y: -10, rotateX: -90 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, y: 10, rotateX: 90 }}
              transition={{ duration: 0.2 }}
              className="text-sm"
            >
              {currentLabel}
            </motion.span>
          </AnimatePresence>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-3 h-3" />
          </motion.div>
        </Button>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border p-2 z-50"
            >
              <div className="space-y-1">
                {availableLanguages.filter(l => l !== 'both').map((lang, index) => (
                  <LanguageButton
                    key={lang}
                    code={lang}
                    label={LANGUAGE_LABELS[lang]?.en || lang}
                    nativeLabel={LANGUAGE_LABELS[lang]?.native || lang}
                    isSelected={currentLanguage === lang}
                    onClick={() => handleLanguageSelect(lang as 'en' | 'hi')}
                    index={index}
                  />
                ))}
                
                {showBothOption && (
                  <>
                    <div className="h-px bg-gray-100 my-2" />
                    <LanguageButton
                      code="both"
                      label="Bilingual View"
                      nativeLabel="Show both languages"
                      isSelected={currentLanguage === 'both'}
                      onClick={() => handleLanguageSelect('both')}
                      index={2}
                    />
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
  
  // Expanded mode - flip card style with preview
  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Languages className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Language Settings</h3>
            <p className="text-xs text-gray-500">Choose your preferred language</p>
          </div>
        </div>
      </div>
      
      {/* Language Options */}
      <div className="p-4 space-y-2">
        {availableLanguages.filter(l => l !== 'both').map((lang, index) => (
          <LanguageButton
            key={lang}
            code={lang}
            label={LANGUAGE_LABELS[lang]?.en || lang}
            nativeLabel={LANGUAGE_LABELS[lang]?.native || lang}
            isSelected={currentLanguage === lang}
            onClick={() => handleLanguageSelect(lang as 'en' | 'hi')}
            index={index}
          />
        ))}
        
        {showBothOption && (
          <>
            <div className="h-px bg-gray-100 my-3" />
            <LanguageButton
              code="both"
              label="Bilingual View"
              nativeLabel="Show both English and Hindi"
              isSelected={currentLanguage === 'both'}
              onClick={() => handleLanguageSelect('both')}
              index={2}
            />
          </>
        )}
      </div>
      
      {/* Preview */}
      <div className="px-4 pb-4">
        <LanguagePreview language={currentLanguage} />
      </div>
      
      {/* Available Languages Info */}
      <div className="px-4 pb-4">
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(LANGUAGE_LABELS).slice(0, 6).map(([code, labels]) => (
            <motion.div
              key={code}
              whileHover={{ scale: 1.05 }}
              className={cn(
                "px-2 py-1 rounded-full text-xs font-medium cursor-default transition-colors",
                code === currentLanguage 
                  ? "bg-blue-100 text-blue-700" 
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              )}
            >
              {labels.native}
            </motion.div>
          ))}
          <div className="px-2 py-1 rounded-full text-xs text-gray-400">
            +more
          </div>
        </div>
      </div>
    </div>
  );
}

export default LanguageToggle;
