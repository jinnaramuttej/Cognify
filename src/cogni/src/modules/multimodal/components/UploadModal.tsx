/**
 * Cogni Multimodal - Upload Modal Component
 * 
 * Handles:
 * - Image upload (file, camera, screenshot)
 * - Audio recording
 * - Drag and drop
 */

"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Upload,
  Image as ImageIcon,
  Mic,
  X,
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle,
  RefreshCw,
  Edit3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ============================================================
// Types
// ============================================================

export type UploadType = 'image' | 'camera' | 'audio';
export type UploadStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageParsed: (result: ImageParseResult) => void;
  onAudioParsed: (result: AudioParseResult) => void;
  userId: string;
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

// ============================================================
// Component
// ============================================================

export function UploadModal({
  isOpen,
  onClose,
  onImageParsed,
  onAudioParsed,
  userId,
}: UploadModalProps) {
  const [activeTab, setActiveTab] = useState<'image' | 'audio'>('image');
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // ============================================================
  // Core Functions (declared first to avoid hoisting issues)
  // ============================================================
  
  const resetState = useCallback(() => {
    setStatus('idle');
    setError(null);
    setPreviewImage(null);
    setIsRecording(false);
    setRecordingTime(0);
    audioChunksRef.current = [];
  }, []);
  
  const processAudioBlob = useCallback(async (blob: Blob) => {
    setStatus('processing');
    
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        const pureBase64 = base64.split(',')[1];
        
        try {
          const response = await fetch('/api/parse/audio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioBase64: pureBase64,
              userId,
            }),
          });
          
          const data = await response.json();
          
          if (data.success) {
            setStatus('success');
            onAudioParsed(data.result);
          } else {
            setStatus('error');
            setError(data.error || 'Failed to transcribe audio');
          }
        } catch (err) {
          setStatus('error');
          setError(err instanceof Error ? err.message : 'Network error');
        }
      };
      
      reader.readAsDataURL(blob);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to process audio');
    }
  }, [userId, onAudioParsed]);
  
  const processAudioFile = useCallback(async (file: File) => {
    setStatus('uploading');
    await processAudioBlob(file);
  }, [processAudioBlob]);
  
  const processImageFile = useCallback(async (file: File, sourceType: 'image' | 'camera' | 'screenshot') => {
    setStatus('uploading');
    setError(null);
    
    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        const pureBase64 = base64.split(',')[1];
        const mimeType = file.type;
        
        setPreviewImage(base64);
        setStatus('processing');
        
        try {
          // Call API
          const response = await fetch('/api/parse/image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: pureBase64,
              mimeType,
              userId,
              fileName: file.name,
              sourceType,
            }),
          });
          
          const data = await response.json();
          
          if (data.success) {
            setStatus('success');
            onImageParsed({
              ...data.result,
              imageBase64: pureBase64,
            });
          } else {
            setStatus('error');
            setError(data.error || 'Failed to parse image');
          }
        } catch (err) {
          setStatus('error');
          setError(err instanceof Error ? err.message : 'Network error');
        }
      };
      
      reader.readAsDataURL(file);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to read file');
    }
  }, [userId, onImageParsed]);
  
  // ============================================================
  // Effects (after function declarations)
  // ============================================================
  
  // Cleanup on close - reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStatus('idle');
      setError(null);
      setPreviewImage(null);
      setIsRecording(false);
      setRecordingTime(0);
      audioChunksRef.current = [];
    }
  }, [isOpen]);
  
  // Recording timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);
  
  // ============================================================
  // Event Handlers
  // ============================================================
  
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    await processImageFile(file, 'image');
  }, [processImageFile]);
  
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    
    if (file.type.startsWith('image/')) {
      await processImageFile(file, 'image');
    } else if (file.type.startsWith('audio/')) {
      await processAudioFile(file);
    }
  }, [processImageFile, processAudioFile]);
  
  // ============================================================
  // Audio Handling
  // ============================================================
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processAudioBlob(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      audioChunksRef.current = [];
    } catch (err) {
      setError('Microphone access denied');
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  // ============================================================
  // Render
  // ============================================================
  
  if (!isOpen) return null;
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Upload Problem
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('image')}
              className={cn(
                "flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2",
                activeTab === 'image'
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <ImageIcon className="w-4 h-4" />
              Image
            </button>
            <button
              onClick={() => setActiveTab('audio')}
              data-value="audio"
              className={cn(
                "flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2",
                activeTab === 'audio'
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Mic className="w-4 h-4" />
              Voice
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {/* Image Tab */}
            {activeTab === 'image' && (
              <div className="space-y-4">
                {!previewImage ? (
                  <>
                    {/* Drop Zone */}
                    <div
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                      className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors"
                    >
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">
                        Drag and drop an image, or use the buttons below
                      </p>
                    
                      <div className="flex justify-center gap-3">
                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={status !== 'idle'}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Choose File
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => cameraInputRef.current?.click()}
                          disabled={status !== 'idle'}
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Camera
                        </Button>
                      </div>
                    </div>
                    
                    {/* Hidden inputs */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </>
                ) : (
                  /* Preview */
                  <div className="space-y-4">
                    <div className="relative rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-full max-h-64 object-contain"
                      />
                    
                      {/* Status overlay */}
                      {status === 'processing' && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="text-center text-white">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                            <p>Processing image...</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {status === 'success' && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span>Image processed successfully!</span>
                      </div>
                    )}
                    
                    {status === 'error' && (
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="w-5 h-5" />
                        <span>{error}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={resetState}
                        disabled={status === 'processing'}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Reset
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Audio Tab */}
            {activeTab === 'audio' && (
              <div className="space-y-6 text-center">
                <div className="py-8">
                  {/* Recording button */}
                  <motion.button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={cn(
                      "w-24 h-24 rounded-full flex items-center justify-center transition-all",
                      isRecording
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-blue-500 hover:bg-blue-600"
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={status === 'processing'}
                  >
                    {status === 'processing' ? (
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    ) : isRecording ? (
                      <div className="text-white">
                        <div className="w-8 h-8 bg-white rounded" />
                      </div>
                    ) : (
                      <Mic className="w-10 h-10 text-white" />
                    )}
                  </motion.button>
                  
                  {isRecording && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-4"
                    >
                      <p className="text-2xl font-mono text-red-500">
                        {formatTime(recordingTime)}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Tap to stop recording
                      </p>
                    </motion.div>
                  )}
                  
                  {!isRecording && status === 'idle' && (
                    <p className="text-gray-500 mt-4">
                      Tap to start recording
                    </p>
                  )}
                  
                  {status === 'success' && (
                    <div className="flex items-center justify-center gap-2 text-green-600 mt-4">
                      <CheckCircle className="w-5 h-5" />
                      <span>Audio transcribed successfully!</span>
                    </div>
                  )}
                  
                  {status === 'error' && (
                    <div className="flex items-center justify-center gap-2 text-red-600 mt-4">
                      <AlertCircle className="w-5 h-5" />
                      <span>{error}</span>
                    </div>
                  )}
                </div>
                
                {/* Or upload audio file */}
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 mb-3">
                    Or upload an audio file
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'audio/*';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) processAudioFile(file);
                      };
                      input.click();
                    }}
                    disabled={status === 'processing'}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Audio
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}


export default UploadModal;
