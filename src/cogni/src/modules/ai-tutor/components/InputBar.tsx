"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Send,
  Loader2,
  BookOpen,
  FileQuestion,
  AlertCircle,
  FileText,
  Target,
  Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { COGNI_THEME, type CogniCapability } from "../types";

interface InputBarProps {
  onSend: (message: string) => void;
  onCapabilityClick: (capability: CogniCapability) => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

const MAX_INPUT_LENGTH = 500;

const capabilityButtons: Array<{
  id: CogniCapability;
  label: string;
  icon: React.ElementType;
  color: string;
}> = [
  { id: "explain_concept", label: "Explain", icon: BookOpen, color: "#2563EB" },
  { id: "generate_practice", label: "Practice", icon: FileQuestion, color: "#10B981" },
  { id: "solve_mistakes", label: "Mistakes", icon: AlertCircle, color: "#F59E0B" },
  { id: "summarize_chapter", label: "Summary", icon: FileText, color: "#8B5CF6" },
  { id: "create_mini_test", label: "Mini Test", icon: Target, color: "#EF4444" },
  { id: "revise_weak_topic", label: "Revise", icon: Brain, color: "#06B6D4" },
];

export function InputBar({
  onSend,
  onCapabilityClick,
  isLoading = false,
  disabled = false,
  className,
}: InputBarProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!input.trim() || isLoading || input.length > MAX_INPUT_LENGTH) return;
    onSend(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const charCountColor = input.length > MAX_INPUT_LENGTH * 0.9
    ? COGNI_THEME.warning
    : "text-gray-400";

  return (
    <div
      className={cn("bg-white border-t shrink-0", className)}
      style={{ borderColor: COGNI_THEME.border }}
    >
      {/* Capability Buttons - Compact single row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-3 py-2 border-b flex gap-1.5 overflow-x-auto"
        style={{ borderColor: COGNI_THEME.border }}
      >
        {capabilityButtons.map((cap, index) => (
          <motion.div
            key={cap.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03 }}
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCapabilityClick(cap.id)}
              disabled={isLoading || disabled}
              className="h-7 px-2.5 text-xs gap-1 border-gray-200 transition-all duration-200"
              style={{
                borderColor: `${cap.color}30`,
                color: cap.color,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${cap.color}60`;
                e.currentTarget.style.backgroundColor = `${cap.color}08`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${cap.color}30`;
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <cap.icon className="w-3 h-3" />
              {cap.label}
            </Button>
          </motion.div>
        ))}
      </motion.div>

      {/* Input Area - Compact */}
      <div className="p-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <motion.div
              whileFocus={{ scale: 1.005 }}
              className="relative"
            >
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Cogni anything..."
                disabled={isLoading || disabled}
                maxLength={MAX_INPUT_LENGTH + 50}
                className="h-10 pr-16 text-sm transition-all duration-200"
                style={{
                  borderColor: COGNI_THEME.border,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = COGNI_THEME.primary;
                  e.target.style.boxShadow = `0 0 0 3px ${COGNI_THEME.primary}15`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = COGNI_THEME.border;
                  e.target.style.boxShadow = "none";
                }}
              />
            </motion.div>
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <motion.span
                key={input.length}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                className={cn("text-xs font-medium", charCountColor)}
              >
                {input.length}/{MAX_INPUT_LENGTH}
              </motion.span>
            </div>
          </div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={handleSend}
              disabled={isLoading || !input.trim() || input.length > MAX_INPUT_LENGTH}
              className="h-10 px-5 text-white font-medium shadow-lg shrink-0 transition-all duration-200"
              style={{
                background: `linear-gradient(135deg, ${COGNI_THEME.primary} 0%, ${COGNI_THEME.primaryHover} 100%)`,
                boxShadow: `0 4px 14px ${COGNI_THEME.primary}40`,
              }}
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="w-4 h-4" />
                </motion.div>
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
