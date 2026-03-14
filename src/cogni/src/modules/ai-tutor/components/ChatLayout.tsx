"use client";

import { useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, RefreshCw, AlertCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { MessageBubble, TypingIndicator } from "./MessageBubble";
import { SuggestionPanel } from "./SuggestionPanel";
import { InputBar } from "./InputBar";
import { StaggerContainer, StaggerItem } from "@/components/shared";
import { COGNI_THEME, type Message, type UserContext, type SuggestionChip, type CogniCapability } from "../types";

interface ChatLayoutProps {
  messages: Message[];
  suggestions: SuggestionChip[];
  isLoading: boolean;
  isStreaming?: boolean;
  error: string | null;
  userContext?: UserContext;
  onSendMessage: (message: string) => Promise<void>;
  onCapabilityClick: (capability: CogniCapability) => void;
  onSuggestionSelect: (suggestion: SuggestionChip) => void;
  onClearHistory: () => void;
  onRetry: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export function ChatLayout({
  messages,
  suggestions,
  isLoading,
  isStreaming = false,
  error,
  userContext,
  onSendMessage,
  onCapabilityClick,
  onSuggestionSelect,
  onClearHistory,
  onRetry,
  className,
  style,
}: ChatLayoutProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  return (
    <div className={cn("flex flex-col h-full", className)} style={style}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between px-4 py-3 border-b shrink-0"
        style={{ borderColor: COGNI_THEME.border }}
      >
        <div className="flex items-center gap-3">
          {/* Animated avatar */}
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
              style={{
                background: `linear-gradient(135deg, ${COGNI_THEME.primary} 0%, ${COGNI_THEME.primaryHover} 100%)`,
              }}
            >
              C
            </motion.div>
            {/* Online pulse */}
            <motion.div
              className="absolute -bottom-0.5 -right-0.5"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div
                className="w-3 h-3 rounded-full border-2 border-white"
                style={{ backgroundColor: COGNI_THEME.success }}
              />
            </motion.div>
          </motion.div>

          <div>
            <h2 className="font-semibold text-gray-900">Cogni</h2>
            <p className="text-xs text-gray-500">
              AI Academic Intelligence System
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Badge
              variant="outline"
              className="text-xs font-medium"
              style={{
                borderColor: `${COGNI_THEME.success}40`,
                color: COGNI_THEME.success,
                backgroundColor: `${COGNI_THEME.success}10`,
              }}
            >
              <motion.span
                className="w-1.5 h-1.5 rounded-full mr-1.5"
                style={{ backgroundColor: COGNI_THEME.success }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              Online
            </Badge>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClearHistory}
              className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              title="Clear history"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center py-8"
            >
              {/* Animated welcome icon */}
              <motion.div
                className="relative w-20 h-20 mx-auto mb-5"
                animate={{
                  boxShadow: [
                    `0 0 0 0 ${COGNI_THEME.primary}00`,
                    `0 0 30px 5px ${COGNI_THEME.primary}15`,
                    `0 0 0 0 ${COGNI_THEME.primary}00`,
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <motion.div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${COGNI_THEME.primary}10 0%, ${COGNI_THEME.primary}05 100%)`,
                    border: `1px solid ${COGNI_THEME.primary}20`,
                  }}
                  whileHover={{ scale: 1.05, rotate: 5 }}
                >
                  <Sparkles className="w-8 h-8" style={{ color: COGNI_THEME.primary }} />
                </motion.div>
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl font-semibold text-gray-900 mb-2"
              >
                Welcome to Cogni
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-sm text-gray-500 max-w-md mx-auto"
              >
                Your AI Academic Intelligence System. Ask questions about your
                syllabus, get concept explanations, or practice with
                personalized questions.
              </motion.p>

              {/* User context badges */}
              {userContext && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-5 flex justify-center gap-3"
                >
                  {[
                    `Grade ${userContext.grade}`,
                    `${userContext.target} Prep`,
                    `${userContext.studyStreak} day streak`,
                  ].map((text, i) => (
                    <motion.span
                      key={text}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="px-3 py-1.5 text-xs font-medium rounded-full bg-white border shadow-sm cursor-default"
                      style={{ borderColor: COGNI_THEME.border }}
                    >
                      {text}
                    </motion.span>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}

          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  duration: 0.3,
                  delay: index === messages.length - 1 ? 0 : 0,
                }}
              >
                <MessageBubble message={message} />
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <TypingIndicator />
            </motion.div>
          )}

          {/* Error state */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center gap-3 p-4 rounded-xl"
              style={{
                backgroundColor: `${COGNI_THEME.warning}08`,
                border: `1px solid ${COGNI_THEME.warning}25`,
              }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                <AlertCircle className="w-5 h-5" style={{ color: COGNI_THEME.warning }} />
              </motion.div>
              <span className="text-sm flex-1" style={{ color: COGNI_THEME.warning }}>
                {error}
              </span>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                  className="h-7 text-xs gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Retry
                </Button>
              </motion.div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Suggestion Panel */}
      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <SuggestionPanel
              suggestions={suggestions}
              onSelect={onSuggestionSelect}
              disabled={isLoading}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Bar */}
      <InputBar
        onSend={onSendMessage}
        onCapabilityClick={onCapabilityClick}
        isLoading={isLoading}
      />
    </div>
  );
}
