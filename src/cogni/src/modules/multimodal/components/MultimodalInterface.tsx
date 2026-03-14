/**
 * Cogni Multimodal - Main Interface
 * 
 * Combined interface for multimodal problem input:
 * - Upload modal for image/camera/voice
 * - Image editor overlay for corrections
 * - Explainability panel for solutions
 */

"use client";

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  MessageSquare,
  Sparkles,
  HelpCircle,
  ArrowLeft,
  Loader2,
  Camera,
  Mic,
  FileImage,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadModal } from './UploadModal';
import { ImageEditorOverlay } from './ImageEditorOverlay';
import { ExplainabilityPanel } from './ExplainabilityPanel';
import { cn } from '@/lib/utils';

// ============================================================
// Types
// ============================================================

export interface UploadResult {
  problemId: string;
  rawText: string;
  latexExpression?: string;
  imageData?: string;
  confidence?: number;
  needsReview?: boolean;
  context?: {
    problemType: string;
    subject: string;
    variables: string[];
    concepts: string[];
    difficulty: string;
  };
  regions?: Array<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    text: string;
    confidence: number;
  }>;
}

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
    position: number;
  }>;
  detectedMath: Array<{
    text: string;
    latex: string;
  }>;
  needsManualReview: boolean;
}

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

interface MultimodalInterfaceProps {
  userId: string;
  className?: string;
  onSolutionGenerated?: (solution: Solution) => void;
}

// ============================================================
// Main Multimodal Interface Component
// ============================================================

export function MultimodalInterface({
  userId,
  className,
  onSolutionGenerated,
}: MultimodalInterfaceProps) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [isGeneratingSolution, setIsGeneratingSolution] = useState(false);
  
  // Upload result state
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  
  // Solution state
  const [solution, setSolution] = useState<Solution | null>(null);
  
  // Handle image parse result
  const handleImageParsed = useCallback(async (result: ImageParseResult) => {
    const uploadResult: UploadResult = {
      problemId: result.id,
      rawText: result.normalizedText || result.rawText,
      latexExpression: result.latexExpressions?.join('\n'),
      imageData: result.imageBase64 ? `data:image/png;base64,${result.imageBase64}` : undefined,
      confidence: result.confidence,
      needsReview: result.needsManualReview,
      context: result.context,
      regions: result.regions,
    };
    
    setUploadResult(uploadResult);
    setShowUploadModal(false);
    
    // If confidence is high and no review needed, skip editor
    if (!result.needsManualReview && result.confidence > 0.8) {
      // Generate solution directly
      await generateSolution(uploadResult);
    } else {
      // Show editor for review/correction
      setShowEditor(true);
    }
  }, []);
  
  // Handle audio parse result
  const handleAudioParsed = useCallback(async (result: AudioParseResult) => {
    const uploadResult: UploadResult = {
      problemId: result.id,
      rawText: result.cleanedTranscript || result.transcript,
      latexExpression: result.detectedMath?.map(m => m.latex).join('\n'),
      confidence: result.confidence,
      needsReview: result.needsManualReview,
      context: {
        problemType: result.detectedCommands?.[0]?.command || 'solve',
        subject: 'unknown',
        variables: [],
        concepts: [],
        difficulty: 'medium',
      },
    };
    
    setUploadResult(uploadResult);
    setShowUploadModal(false);
    
    // Generate solution
    await generateSolution(uploadResult);
  }, []);
  
  // Handle editor confirmation
  const handleEditorConfirm = useCallback(async (corrections: { text: string; latex: string }) => {
    setShowEditor(false);
    
    if (uploadResult) {
      await generateSolution({
        ...uploadResult,
        rawText: corrections.text,
        latexExpression: corrections.latex,
      });
    }
  }, [uploadResult]);
  
  // Generate solution
  const generateSolution = async (result: UploadResult) => {
    setIsGeneratingSolution(true);
    setSolution(null);
    
    try {
      const response = await fetch('/api/parse/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: result.problemId,
          problemText: result.rawText,
          latexExpression: result.latexExpression,
          userId,
          context: result.context || {
            problemType: 'solve',
            subject: 'math',
            variables: [],
            concepts: [],
          },
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        const sol: Solution = {
          problemText: data.solution.problemText,
          steps: data.solution.steps.map((s: any) => ({
            stepNumber: s.stepNumber,
            title: s.title,
            explanation: s.description || s.explanation,
            latex: s.latexExpression,
            difficulty: s.difficulty,
            estimatedTime: s.estimatedTime,
            keyConcepts: s.concepts || [],
            hints: s.hints || [],
          })),
          finalAnswer: data.solution.finalAnswer,
          totalEstimatedTime: data.solution.totalEstimatedTime,
          difficulty: data.solution.overallDifficulty,
          approach: data.solution.summary,
          prerequisites: data.solution.concepts || [],
        };
        
        setSolution(sol);
        onSolutionGenerated?.(sol);
      } else {
        console.error('Solution generation failed:', data.error);
      }
    } catch (error) {
      console.error('Solution generation error:', error);
    } finally {
      setIsGeneratingSolution(false);
    }
  };
  
  // Reset to start
  const handleReset = useCallback(() => {
    setUploadResult(null);
    setSolution(null);
    setShowEditor(false);
    setShowUploadModal(false);
  }, []);
  
  return (
    <div className={cn("relative", className)}>
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Upload/Input Area */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Problem Input</h3>
              {(uploadResult || solution) && (
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Start Over
                </Button>
              )}
            </div>
            
            {/* Upload Button */}
            {!uploadResult && !solution && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Upload a Problem
                </h4>
                <p className="text-sm text-gray-500 mb-4">
                  Take a photo, upload an image, or record your voice
                </p>
                <Button onClick={() => setShowUploadModal(true)} className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Problem
                </Button>
                
                {/* Feature highlights */}
                <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                    <Camera className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-blue-700">Photo</p>
                    <p className="text-xs text-blue-600 mt-1">Camera or upload</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                    <Mic className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-purple-700">Voice</p>
                    <p className="text-xs text-purple-600 mt-1">Speak your problem</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                    <Sparkles className="w-6 h-6 text-green-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-green-700">Solve</p>
                    <p className="text-xs text-green-600 mt-1">Step-by-step</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Parsed Result Preview */}
            {uploadResult && !showEditor && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Image Preview */}
                {uploadResult.imageData && (
                  <div className="relative rounded-lg overflow-hidden bg-gray-100 border">
                    <img
                      src={uploadResult.imageData}
                      alt="Uploaded problem"
                      className="w-full max-h-48 object-contain"
                    />
                  </div>
                )}
                
                {/* Recognized Text */}
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
                    Recognized Problem
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 border">
                    {uploadResult.rawText}
                  </div>
                </div>
                
                {/* LaTeX */}
                {uploadResult.latexExpression && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
                      LaTeX Expression
                    </label>
                    <div className="p-3 bg-blue-50 rounded-lg font-mono text-sm text-blue-700 border border-blue-200">
                      {uploadResult.latexExpression}
                    </div>
                  </div>
                )}
                
                {/* Confidence */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <span className="text-sm text-gray-500">Recognition Confidence</span>
                  <span className={cn(
                    "text-sm font-medium px-2 py-0.5 rounded",
                    (uploadResult.confidence || 0) >= 0.8 ? "text-green-600 bg-green-100" :
                    (uploadResult.confidence || 0) >= 0.6 ? "text-yellow-600 bg-yellow-100" : "text-red-600 bg-red-100"
                  )}>
                    {Math.round((uploadResult.confidence || 0) * 100)}%
                  </span>
                </div>
                
                {/* Generating indicator */}
                {isGeneratingSolution && (
                  <div className="flex items-center justify-center gap-2 text-blue-600 p-4">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Generating solution...</span>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
        
        {/* Right: Solution Panel */}
        <div>
          <ExplainabilityPanel
            solution={solution}
            isLoading={isGeneratingSolution}
          />
        </div>
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
      {showEditor && uploadResult?.imageData && (
        <ImageEditorOverlay
          result={{
            id: uploadResult.problemId,
            rawText: uploadResult.rawText,
            latexExpressions: uploadResult.latexExpression?.split('\n') || [],
            normalizedText: uploadResult.rawText,
            confidence: uploadResult.confidence || 0,
            regions: uploadResult.regions || [],
            context: uploadResult.context || {
              problemType: 'unknown',
              subject: 'unknown',
              variables: [],
              concepts: [],
              difficulty: 'medium',
            },
            needsManualReview: uploadResult.needsReview || false,
            imageBase64: uploadResult.imageData.replace('data:image/png;base64,', ''),
          }}
          onClose={() => setShowEditor(false)}
          onSubmitForExplanation={(text, latex) => handleEditorConfirm({ text, latex: latex.join('\n') })}
        />
      )}
    </div>
  );
}

export default MultimodalInterface;
