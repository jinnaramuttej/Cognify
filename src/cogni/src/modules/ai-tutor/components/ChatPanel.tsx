"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Mic,
  Paperclip,
  Loader2,
  Trash2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MessageBubble, TypingIndicator } from "./MessageBubble";
import { SuggestionChips } from "./SuggestionChips";
import { WeakTopicCard } from "./WeakTopicCard";
import { useChat } from "../hooks/useChat";
import type { Message, UserContext, WeakTopic, CogniState } from "../types";

interface ChatPanelProps {
  userContext?: UserContext;
  weakTopics?: WeakTopic[];
  className?: string;
}

const MAX_INPUT_LENGTH = 500;

export function ChatPanel({
  userContext,
  weakTopics = [],
  className,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [showWeaknessPanel, setShowWeaknessPanel] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    messages,
    isLoading,
    error,
    sessionId,
    sendMessage,
    clearHistory,
    retryLast,
    suggestions,
  } = useChat({ userContext });

  const cogniState: CogniState = {
    isListening: false,
    isSpeaking: false,
    isThinking: isLoading,
  };

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || input.length > MAX_INPUT_LENGTH) return;

    const message = input.trim();
    setInput("");
    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionSelect = async (suggestion: {
    label: string;
    context: string;
  }) => {
    const promptMap: Record<string, string> = {
      concept: `Please explain the concept of ${suggestion.context} in detail.`,
      pyq: `Can you provide a previous year question example for ${suggestion.context}?`,
      practice: `Generate some practice questions for ${suggestion.context}.`,
      summary: `Please summarize the chapter on ${suggestion.context}.`,
      weakness: `Why am I weak in ${suggestion.context}? Help me understand my mistakes.`,
    };

    await sendMessage(suggestion.label);
  };

  const charCountColor =
    input.length > MAX_INPUT_LENGTH * 0.9
      ? "text-[#C7511F]"
      : "text-muted-foreground";

  return (
    <div className={cn("flex flex-col h-full bg-white", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#D5D9D9]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-[#C7511F] flex items-center justify-center">
              <span className="text-white font-semibold text-sm">C</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Cogni - AI Academic Tutor</h2>
            <p className="text-xs text-muted-foreground">
              Ask anything about your syllabus
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="text-xs border-green-200 text-green-700 bg-green-50"
          >
            Online
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={clearHistory}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Clear history"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 rounded-full bg-[#C7511F]/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-semibold text-[#C7511F]">C</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Welcome to Cogni
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Your AI Academic Intelligence System. Ask questions about your
                    syllabus, get concept explanations, or practice with
                    personalized questions.
                  </p>
                </motion.div>
              )}

              <AnimatePresence>
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
              </AnimatePresence>

              {isLoading && <TypingIndicator />}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200"
                >
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-700">{error}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={retryLast}
                    className="ml-auto h-7 text-xs"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Retry
                  </Button>
                </motion.div>
              )}
            </div>
          </ScrollArea>

          {/* Suggestion Chips */}
          <div className="px-4 pb-2">
            <SuggestionChips
              suggestions={suggestions}
              onSelect={handleSuggestionSelect}
              disabled={isLoading}
            />
          </div>

          {/* Input Area */}
          <div className="border-t border-[#D5D9D9] p-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Cogni anything..."
                  disabled={isLoading}
                  maxLength={MAX_INPUT_LENGTH + 50}
                  className="pr-24 h-11 border-[#D5D9D9] focus:border-[#C7511F] focus:ring-[#C7511F]/20"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <span className={cn("text-xs", charCountColor)}>
                    {input.length}/{MAX_INPUT_LENGTH}
                  </span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 text-muted-foreground hover:text-foreground"
                title="Voice input (coming soon)"
                disabled
              >
                <Mic className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 text-muted-foreground hover:text-foreground"
                title="Attach file (coming soon)"
                disabled
              >
                <Paperclip className="w-5 h-5" />
              </Button>

              <Button
                onClick={handleSend}
                disabled={isLoading || !input.trim() || input.length > MAX_INPUT_LENGTH}
                className="h-11 px-4 bg-[#C7511F] hover:bg-[#C7511F]/90 text-white"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Weakness Analysis Panel */}
        {showWeaknessPanel && weakTopics.length > 0 && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-l border-[#D5D9D9] bg-[#F7F8F8] overflow-hidden"
          >
            <div className="p-4 w-[280px]">
              <WeakTopicCard topics={weakTopics} />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
