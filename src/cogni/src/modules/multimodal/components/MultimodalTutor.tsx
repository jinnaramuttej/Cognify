/**
 * Cogni Multimodal Tutor - Main Component
 * 
 * Integrates:
 * - Image upload and parsing
 * - Audio recording and transcription
 * - Solution generation with explainability
 */

"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Camera,
  Mic,
  Image as ImageIcon,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadModal } from './UploadModal';
import { ImageEditorOverlay } from './ImageEditorOverlay';
import { SolutionDisplay } from './SolutionDisplay';
import { FallbackUI } from './FallbackUI';
import { cn } from '@/lib/utils';

// ============================================================
// Types
// ============================================================

interface ImageParseResult {
  id: string;
  rawText: string;
  latexExpressions: string[];
  normalizedText: string;
  confidence: number;
  regions: Array<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    text: string;
    confidence: number;
  }>;
  context: {
    problemType: string;
    subject: string;
    variables: string[];
    concepts: string[];
    difficulty: string;
  };
  needsManualReview: boolean;
  imageBase64?: string;
}

interface AudioParseResult {
  id: string;
  transcript: string;
  cleanedTranscript: string;
  mathematicalText: string;
  confidence: number;
  detectedCommands: Array<{
    command: string;
    text: string;
  }>;
  detectedMath: Array<{
    text: string;
    latex: string;
  }>;
  needsManualReview: boolean;
}

interface Solution {
  id?: string;
  problemText: string;
  solutionType: 'step_by_step' | 'proof' | 'numerical' | 'derivation';
  steps: Array<{
    stepNumber: number;
    title: string;
    description: string;
    latexExpression?: string;
    explanation: string;
    difficulty: 'easy' | 'medium' | 'hard';
    estimatedTime: number;
    concepts: string[];
    hints: string[];
  }>;
  finalAnswer?: string;
  summary: string;
  totalEstimatedTime: number;
  overallDifficulty: 'easy' | 'medium' | 'hard';
  concepts: string[];
  alternatives?: string[];
}

type ViewState = 
  | 'idle'
  | 'uploading'
  | 'reviewing-image'
  | 'processing-audio'
  | 'generating-solution'
  | 'viewing-solution'
  | 'fallback';

// ============================================================
// Component
// ============================================================

interface MultimodalTutorProps {
  userId: string;
  className?: string;
}

export function MultimodalTutor({ userId, className }: MultimodalTutorProps) {
  const [viewState, setViewState] = useState<ViewState>('idle');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [imageResult, setImageResult] = useState<ImageParseResult | null>(null);
  const [audioResult, setAudioResult] = useState<AudioParseResult | null>(null);
  const [solution, setSolution] = useState<Solution | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Refs to avoid dependency issues
  const imageResultRef = useRef<ImageParseResult | null>(null);
  const audioResultRef = useRef<AudioParseResult | null>(null);
  
  // Keep refs in sync
  useEffect(() => {
    imageResultRef.current = imageResult;
  }, [imageResult]);
  
  useEffect(() => {
    audioResultRef.current = audioResult;
  }, [audioResult]);
  
  // ============================================================
  // Core Functions
  // ============================================================
  
  const generateSolutionFromText = useCallback(async (text: string, latexExpressions?: string[]) => {
    setViewState('generating-solution');
    setError(null);
    
    try {
      const response = await fetch('/api/parse/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemText: text,
          userId,
          context: imageResultRef.current?.context || audioResultRef.current?.detectedMath ? {
            problemType: imageResultRef.current?.context.problemType,
            subject: imageResultRef.current?.context.subject,
            variables: imageResultRef.current?.context.variables,
            concepts: imageResultRef.current?.context.concepts,
          } : undefined,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSolution(data.solution);
        setViewState('viewing-solution');
      } else {
        setError(data.error || 'Failed to generate solution');
        setViewState('fallback');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
      setViewState('fallback');
    }
  }, [userId]);
  
  // ============================================================
  // Handlers
  // ============================================================
  
  const handleImageParsed = useCallback((result: ImageParseResult) => {
    setImageResult(result);
    setShowUploadModal(false);
    
    if (result.needsManualReview && result.confidence < 0.5) {
      setViewState('fallback');
    } else {
      setViewState('reviewing-image');
    }
  }, []);
  
  const handleAudioParsed = useCallback((result: AudioParseResult) => {
    setAudioResult(result);
    setShowUploadModal(false);
    
    if (result.needsManualReview && result.confidence < 0.5) {
      setViewState('fallback');
    } else {
      // Auto-generate solution from audio
      generateSolutionFromText(result.cleanedTranscript);
    }
  }, [generateSolutionFromText]);
  
  const handleSubmitForExplanation = useCallback((correctedText: string, latex: string[]) => {
    generateSolutionFromText(correctedText, latex);
  }, [generateSolutionFromText]);
  
  const handleSaveCorrection = useCallback(async (regionId: string, correctedText: string) => {
    if (!imageResult) return;
    
    try {
      await fetch('/api/parse/image', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parsedProblemId: imageResult.id,
          originalText: imageResult.rawText,
          correctedText,
        }),
      });
    } catch (err) {
      console.error('Failed to save correction:', err);
    }
  }, [imageResult]);
  
  const handleGetHint = useCallback(async (step: Solution['steps'][0]) => {
    try {
      const response = await fetch('/api/parse/explain', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step }),
      });
      
      const data = await response.json();
      return data.hint || step.hints[0] || 'Try breaking down the problem into smaller parts.';
    } catch {
      return step.hints[0] || 'Try breaking down the problem into smaller parts.';
    }
  }, []);
  
  const handleReset = () => {
    setViewState('idle');
    setImageResult(null);
    setAudioResult(null);
    setSolution(null);
    setError(null);
  };
  
  // ============================================================
  // Render
  // ============================================================
  
  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-slate-50 to-blue-50", className)}>
      <div className="max-w-4xl mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-blue-500" />
              Cogni Multimodal
            </h1>
            <p className="text-sm text-gray-500">
              Upload a problem image or record your voice
            </p>
          </div>
          
          {viewState !== 'idle' && (
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              New Problem
            </Button>
          )}
        </div>
        
        {/* Main Content */}
        <AnimatePresence mode="wait">
          {/* Idle State */}
          {viewState === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Upload Options */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="p-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition-all text-center group"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <ImageIcon className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    Upload Image
                  </h3>
                  <p className="text-sm text-gray-500">
                    Photo of handwritten problem, screenshot, or textbook
                  </p>
                </button>
                
                <button
                  onClick={() => {
                    setShowUploadModal(true);
                    // Auto-switch to audio tab
                    setTimeout(() => {
                      const audioTab = document.querySelector('[data-value="audio"]') as HTMLButtonElement;
                      audioTab?.click();
                    }, 100);
                  }}
                  className="p-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 hover:bg-purple-50/50 transition-all text-center group"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <Mic className="w-8 h-8 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    Voice Input
                  </h3>
                  <p className="text-sm text-gray-500">
                    Speak your problem naturally
                  </p>
                </button>
              </div>
              
              {/* Quick Input */}
              <div className="bg-white rounded-xl shadow-sm border p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Or type your problem:
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g., Solve for x: 2x + 5 = 15"
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement;
                        if (input.value.trim()) {
                          generateSolutionFromText(input.value);
                        }
                      }
                    }}
                  />
                  <Button onClick={() => {
                    const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                    if (input?.value.trim()) {
                      generateSolutionFromText(input.value);
                    }
                  }}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Solve
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Loading States */}
          {(viewState === 'generating-solution' || viewState === 'processing-audio') && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-16"
            >
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {viewState === 'processing-audio' ? 'Transcribing audio...' : 'Generating solution...'}
              </h3>
              <p className="text-sm text-gray-500">
                This may take a few seconds
              </p>
            </motion.div>
          )}
          
          {/* Fallback State */}
          {viewState === 'fallback' && (
            <motion.div
              key="fallback"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <FallbackUI
                error={error || 'Recognition failed'}
                partialText={imageResult?.rawText || audioResult?.transcript || ''}
                onRetry={() => {
                  setViewState('idle');
                  setShowUploadModal(true);
                }}
                onSubmitManual={(text) => generateSolutionFromText(text)}
              />
            </motion.div>
          )}
          
          {/* Solution State */}
          {viewState === 'viewing-solution' && solution && (
            <motion.div
              key="solution"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <SolutionDisplay
                solution={solution}
                onGetHint={handleGetHint}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Upload Modal */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onImageParsed={handleImageParsed}
        onAudioParsed={handleAudioParsed}
        userId={userId}
      />
      
      {/* Image Editor Overlay */}
      <AnimatePresence>
        {viewState === 'reviewing-image' && imageResult && (
          <ImageEditorOverlay
            result={imageResult}
            onClose={() => setViewState('idle')}
            onSubmitForExplanation={handleSubmitForExplanation}
            onSaveCorrection={handleSaveCorrection}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default MultimodalTutor;
