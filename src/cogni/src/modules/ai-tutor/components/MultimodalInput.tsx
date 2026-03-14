"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, 
  MicOff, 
  Image as ImageIcon, 
  X, 
  Loader2, 
  Upload,
  Camera,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// =====================================================
// TYPES
// =====================================================

interface MultimodalInputProps {
  onVoiceTranscript: (transcript: string) => void;
  onImageAnalysis: (analysis: string, problemType: string) => void;
  disabled?: boolean;
  className?: string;
}

interface VoiceRecorderState {
  isRecording: boolean;
  isProcessing: boolean;
  error: string | null;
}

interface ImageUploadState {
  isUploading: boolean;
  error: string | null;
  preview: string | null;
}

// =====================================================
// VOICE INPUT COMPONENT
// =====================================================

export function VoiceInput({ 
  onTranscript, 
  disabled 
}: { 
  onTranscript: (text: string) => void;
  disabled?: boolean;
}) {
  const [state, setState] = useState<VoiceRecorderState>({
    isRecording: false,
    isProcessing: false,
    error: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        
        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = reader.result as string;
          const audioBase64 = base64.split(',')[1];

          setState(prev => ({ ...prev, isProcessing: true, error: null }));

          try {
            const response = await fetch('/api/ai-tutor/voice', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audioBase64 }),
            });

            const data = await response.json();

            if (data.success && data.transcription) {
              onTranscript(data.transcription);
              setState(prev => ({ ...prev, isProcessing: false }));
            } else {
              setState(prev => ({ 
                ...prev, 
                isProcessing: false, 
                error: data.error || 'Failed to transcribe' 
              }));
            }
          } catch (error) {
            setState(prev => ({ 
              ...prev, 
              isProcessing: false, 
              error: 'Failed to process audio' 
            }));
          }
        };

        reader.readAsDataURL(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setState(prev => ({ ...prev, isRecording: true, error: null }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Could not access microphone. Please check permissions.' 
      }));
    }
  }, [onTranscript]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();
      setState(prev => ({ ...prev, isRecording: false }));
    }
  }, [state.isRecording]);

  const toggleRecording = useCallback(() => {
    if (state.isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [state.isRecording, startRecording, stopRecording]);

  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled || state.isProcessing}
        onClick={toggleRecording}
        className={cn(
          "h-10 w-10 transition-all",
          state.isRecording && "bg-red-100 text-red-600 hover:bg-red-200"
        )}
      >
        {state.isProcessing ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : state.isRecording ? (
          <MicOff className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </Button>

      {/* Recording indicator */}
      <AnimatePresence>
        {state.isRecording && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-1 -right-1 w-3 h-3"
          >
            <span className="absolute inset-0 rounded-full bg-red-500 animate-ping" />
            <span className="relative block w-3 h-3 rounded-full bg-red-500" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error tooltip */}
      <AnimatePresence>
        {state.error && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 text-center"
          >
            <AlertCircle className="w-3 h-3 inline mr-1" />
            {state.error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =====================================================
// IMAGE INPUT COMPONENT
// =====================================================

export function ImageInput({ 
  onAnalysis, 
  disabled 
}: { 
  onAnalysis: (analysis: string, problemType: string) => void;
  disabled?: boolean;
}) {
  const [state, setState] = useState<ImageUploadState>({
    isUploading: false,
    error: null,
    preview: null,
  });
  
  const [showDialog, setShowDialog] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setState(prev => ({ ...prev, error: 'Please select an image file' }));
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      
      setState(prev => ({ 
        ...prev, 
        preview: base64, 
        isUploading: true, 
        error: null 
      }));

      try {
        // Extract base64 data (remove data:image/xxx;base64, prefix)
        const imageBase64 = base64.split(',')[1];

        const response = await fetch('/api/ai-tutor/vision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            imageBase64, 
            mimeType: file.type 
          }),
        });

        const data = await response.json();

        if (data.success && data.analysis) {
          setAnalysis(data.analysis);
          setShowDialog(true);
          onAnalysis(data.analysis, data.problemType);
        } else {
          setState(prev => ({ 
            ...prev, 
            error: data.error || 'Failed to analyze image' 
          }));
        }
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          error: 'Failed to process image' 
        }));
      } finally {
        setState(prev => ({ ...prev, isUploading: false }));
      }
    };

    reader.readAsDataURL(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onAnalysis]);

  const handleUseAnalysis = useCallback(() => {
    if (analysis) {
      setShowDialog(false);
      setState(prev => ({ ...prev, preview: null }));
    }
  }, [analysis]);

  return (
    <>
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || state.isUploading}
        />
        
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled || state.isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="h-10 w-10"
        >
          {state.isUploading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <ImageIcon className="w-5 h-5" />
          )}
        </Button>

        {/* Error tooltip */}
        <AnimatePresence>
          {state.error && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 text-center"
            >
              <AlertCircle className="w-3 h-3 inline mr-1" />
              {state.error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Analysis Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-500" />
              Image Analysis
            </DialogTitle>
          </DialogHeader>

          {state.preview && (
            <div className="mb-4">
              <img 
                src={state.preview} 
                alt="Uploaded problem for analysis" 
                className="max-h-48 mx-auto rounded-lg border"
              />
            </div>
          )}

          {analysis && (
            <div className="prose prose-sm max-w-none">
              <h4 className="text-sm font-semibold mb-2">Extracted Content:</h4>
              <div className="bg-gray-50 p-4 rounded-lg text-sm whitespace-pre-wrap">
                {analysis}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowDialog(false);
                setState(prev => ({ ...prev, preview: null }));
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUseAnalysis}>
              <Upload className="w-4 h-4 mr-2" />
              Use This Problem
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// =====================================================
// COMBINED MULTIMODAL INPUT
// =====================================================

export function MultimodalInput({
  onVoiceTranscript,
  onImageAnalysis,
  disabled,
  className,
}: MultimodalInputProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <VoiceInput onTranscript={onVoiceTranscript} disabled={disabled} />
      <ImageInput onAnalysis={onImageAnalysis} disabled={disabled} />
    </div>
  );
}

export default MultimodalInput;
