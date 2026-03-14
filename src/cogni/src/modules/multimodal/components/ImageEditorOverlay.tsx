/**
 * Cogni Multimodal - Image Editor Overlay
 * 
 * Features:
 * - Display uploaded image with annotation regions
 * - Edit recognized text inline
 * - Highlight and correct regions
 * - Submit for explanation
 */

"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Check,
  Edit3,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Move,
  Highlighter,
  Type,
  Send,
  Loader2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

// ============================================================
// Types
// ============================================================

interface AnnotationRegion {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  text: string;
  confidence: number;
  edited?: boolean;
}

interface ParseResult {
  id: string;
  rawText: string;
  latexExpressions: string[];
  normalizedText: string;
  confidence: number;
  regions: AnnotationRegion[];
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

interface ImageEditorOverlayProps {
  result: ParseResult;
  onClose: () => void;
  onSubmitForExplanation: (correctedText: string, latex: string[]) => void;
  onSaveCorrection?: (regionId: string, correctedText: string) => void;
}

// ============================================================
// Component
// ============================================================

export function ImageEditorOverlay({
  result,
  onClose,
  onSubmitForExplanation,
  onSaveCorrection,
}: ImageEditorOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [editingRegion, setEditingRegion] = useState<string | null>(null);
  const [editedText, setEditedText] = useState<string>('');
  const [correctedText, setCorrectedText] = useState(result.normalizedText || result.rawText);
  const [showLatex, setShowLatex] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize corrected text when result changes
  useEffect(() => {
    setCorrectedText(result.normalizedText || result.rawText);
  }, [result]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (editingRegion) {
          setEditingRegion(null);
        } else {
          onClose();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingRegion, onClose]);
  
  // Mouse handlers for pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && !selectedRegion) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Zoom handlers
  const handleZoomIn = () => setScale((s) => Math.min(s + 0.25, 3));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));
  const handleResetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };
  
  // Region selection
  const handleRegionClick = (regionId: string) => {
    setSelectedRegion(regionId === selectedRegion ? null : regionId);
    setEditingRegion(null);
  };
  
  // Edit region text
  const startEditingRegion = (region: AnnotationRegion) => {
    setEditingRegion(region.id);
    setEditedText(region.text);
    setSelectedRegion(null);
  };
  
  const saveRegionEdit = (regionId: string) => {
    const updatedRegions = result.regions.map((r) =>
      r.id === regionId ? { ...r, text: editedText, edited: true } : r
    );
    
    // Update corrected text based on edited regions
    const newText = updatedRegions.map((r) => r.text).join(' ');
    setCorrectedText(newText);
    
    onSaveCorrection?.(regionId, editedText);
    setEditingRegion(null);
  };
  
  // Submit for explanation
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      onSubmitForExplanation(correctedText, result.latexExpressions);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Confidence color
  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.9) return 'bg-green-500';
    if (confidence >= 0.7) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-gray-900/95 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-800 text-white">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Review & Correct</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Confidence:</span>
            <div className={cn(
              "px-2 py-0.5 rounded text-xs font-medium",
              result.confidence >= 0.9 ? "bg-green-600" :
              result.confidence >= 0.7 ? "bg-yellow-600" : "bg-red-600"
            )}>
              {(result.confidence * 100).toFixed(0)}%
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-gray-700 rounded-lg p-1">
            <button
              onClick={handleZoomOut}
              className="p-1.5 hover:bg-gray-600 rounded"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-sm px-2">{Math.round(scale * 100)}%</span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 hover:bg-gray-600 rounded"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetView}
              className="p-1.5 hover:bg-gray-600 rounded ml-1"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
          
          <Button variant="outline" onClick={onClose} className="border-gray-600 text-white hover:bg-gray-700">
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Image View */}
        <div
          ref={containerRef}
          className="flex-1 overflow-hidden cursor-move relative"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {result.imageBase64 && (
            <div
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transformOrigin: 'center',
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative">
                <img
                  ref={imageRef}
                  src={`data:image/png;base64,${result.imageBase64}`}
                  alt="Uploaded problem"
                  className="max-w-full max-h-full object-contain"
                  draggable={false}
                />
                
                {/* Annotation regions */}
                {result.regions.map((region) => (
                  <motion.div
                    key={region.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn(
                      "absolute cursor-pointer transition-all",
                      selectedRegion === region.id && "ring-2 ring-blue-400"
                    )}
                    style={{
                      left: `${region.x * 100}%`,
                      top: `${region.y * 100}%`,
                      width: `${region.width * 100}%`,
                      height: `${region.height * 100}%`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRegionClick(region.id);
                    }}
                  >
                    {/* Highlight */}
                    <div
                      className={cn(
                        "absolute inset-0 rounded",
                        region.edited
                          ? "bg-green-400/30"
                          : "bg-blue-400/20",
                        selectedRegion === region.id && "bg-blue-400/40"
                      )}
                    />
                    
                    {/* Confidence indicator */}
                    <div
                      className={cn(
                        "absolute -top-1 -right-1 w-3 h-3 rounded-full",
                        getConfidenceColor(region.confidence)
                      )}
                    />
                    
                    {/* Label */}
                    {selectedRegion === region.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute -bottom-8 left-0 right-0 bg-gray-800 text-white text-xs p-1 rounded text-center truncate"
                      >
                        {region.label}: {region.text}
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          
          {/* Low confidence warning */}
          {result.needsManualReview && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 left-4 right-4 bg-yellow-500/90 text-yellow-900 px-4 py-3 rounded-lg flex items-center gap-2"
            >
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm">
                Low confidence detection. Please review and correct the text below.
              </span>
            </motion.div>
          )}
        </div>
        
        {/* Side Panel */}
        <div className="w-96 bg-white border-l flex flex-col">
          {/* Detected Context */}
          <div className="p-4 border-b">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Detected Context</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Type:</span>
                <span className="ml-1 font-medium capitalize">{result.context.problemType}</span>
              </div>
              <div>
                <span className="text-gray-500">Subject:</span>
                <span className="ml-1 font-medium capitalize">{result.context.subject}</span>
              </div>
              <div>
                <span className="text-gray-500">Difficulty:</span>
                <span className="ml-1 font-medium capitalize">{result.context.difficulty}</span>
              </div>
              <div>
                <span className="text-gray-500">Variables:</span>
                <span className="ml-1 font-medium">{result.context.variables.join(', ') || 'None'}</span>
              </div>
            </div>
          </div>
          
          {/* LaTeX Expressions */}
          {result.latexExpressions.length > 0 && (
            <div className="p-4 border-b">
              <button
                onClick={() => setShowLatex(!showLatex)}
                className="flex items-center justify-between w-full text-sm font-medium text-gray-700"
              >
                <span>LaTeX Expressions ({result.latexExpressions.length})</span>
                {showLatex ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {showLatex && (
                <div className="mt-2 space-y-1">
                  {result.latexExpressions.map((latex, i) => (
                    <div
                      key={i}
                      className="bg-gray-100 rounded px-2 py-1 text-sm font-mono text-gray-700 overflow-x-auto"
                    >
                      {latex}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Regions List */}
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Detected Regions</h3>
            <div className="space-y-2">
              {result.regions.map((region) => (
                <motion.div
                  key={region.id}
                  className={cn(
                    "border rounded-lg p-3 transition-all cursor-pointer",
                    selectedRegion === region.id
                      ? "border-blue-500 bg-blue-50"
                      : "hover:border-gray-300"
                  )}
                  onClick={() => handleRegionClick(region.id)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-500 uppercase">
                      {region.label}
                    </span>
                    <div className="flex items-center gap-1">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          getConfidenceColor(region.confidence)
                        )}
                      />
                      <span className="text-xs text-gray-400">
                        {(region.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  
                  {editingRegion === region.id ? (
                    <div className="mt-2">
                      <Textarea
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        className="text-sm"
                        autoFocus
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingRegion(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => saveRegionEdit(region.id)}
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn(
                        "text-sm flex-1",
                        region.edited ? "text-green-600" : "text-gray-700"
                      )}>
                        {region.text}
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditingRegion(region);
                        }}
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Corrected Text */}
          <div className="p-4 border-t">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Corrected Text</h3>
            <Textarea
              value={correctedText}
              onChange={(e) => setCorrectedText(e.target.value)}
              placeholder="Edit the problem text..."
              className="min-h-[100px]"
            />
          </div>
          
          {/* Submit Button */}
          <div className="p-4 border-t bg-gray-50">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !correctedText.trim()}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Get Step-by-Step Solution
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default ImageEditorOverlay;
