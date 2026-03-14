/**
 * Cogni Multimodal - Fallback UI Component
 * 
 * Displayed when recognition confidence is too low
 * Allows manual text entry
 */

"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Type,
  Camera,
  RefreshCw,
  Send,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ============================================================
// Types
// ============================================================

interface FallbackUIProps {
  error?: string;
  partialText?: string;
  onRetry: () => void;
  onSubmitManual: (text: string) => void;
  suggestedActions?: string[];
}

// ============================================================
// Component
// ============================================================

export function FallbackUI({
  error = 'Recognition failed',
  partialText = '',
  onRetry,
  onSubmitManual,
  suggestedActions = [],
}: FallbackUIProps) {
  const [manualText, setManualText] = useState(partialText);
  const [showTips, setShowTips] = useState(false);
  
  const handleSubmit = () => {
    if (manualText.trim()) {
      onSubmitManual(manualText.trim());
    }
  };
  
  const tips = [
    'Ensure good lighting when taking a photo',
    'Hold the camera steady and avoid blur',
    'Write clearly and avoid overlapping characters',
    'For equations, write each term distinctly',
    'Speak clearly and at a moderate pace for voice input',
  ];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Error Card */}
      <Card className="border-yellow-300 bg-yellow-50">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <CardTitle className="text-lg text-yellow-800">
              Recognition Issue
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-yellow-700 text-sm mb-3">
            {error}. You can either try again or enter the problem manually.
          </p>
          
          {/* Suggested actions */}
          {suggestedActions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {suggestedActions.map((action, i) => (
                <button
                  key={i}
                  className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-200 transition-colors"
                >
                  {action}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Manual Input */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-gray-500" />
              <CardTitle className="text-base text-gray-700">
                Manual Entry
              </CardTitle>
            </div>
            <button
              onClick={() => setShowTips(!showTips)}
              className="text-gray-400 hover:text-gray-600"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Tips */}
          {showTips && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 p-3 bg-blue-50 rounded-lg"
            >
              <p className="text-sm font-medium text-blue-700 mb-2">Tips for better input:</p>
              <ul className="text-sm text-blue-600 space-y-1">
                {tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
          
          {/* Text input */}
          <Textarea
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            placeholder="Type or paste your problem here...

Examples:
• Solve for x: 2x + 5 = 15
• Find the derivative of x² + 3x - 5
• Evaluate: ∫(2x + 1)dx"
            className="min-h-[150px] mb-4"
            autoFocus
          />
          
          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={onRetry}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
            
            <Button
              onClick={handleSubmit}
              disabled={!manualText.trim()}
              className="flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Get Solution
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Quick Templates */}
      <Card>
        <CardContent className="pt-4">
          <p className="text-sm text-gray-500 mb-3">Quick templates:</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Solve equation', template: 'Solve for x: ' },
              { label: 'Find derivative', template: 'Find the derivative of ' },
              { label: 'Evaluate integral', template: 'Evaluate: ∫()dx' },
              { label: 'Simplify expression', template: 'Simplify: ' },
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => setManualText(item.template)}
                className={cn(
                  "text-left p-2 rounded-lg border transition-colors",
                  manualText === item.template
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default FallbackUI;
