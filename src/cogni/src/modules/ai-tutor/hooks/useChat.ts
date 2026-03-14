"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import type { Message, UserContext, SuggestionChip } from "../types";

interface UseChatOptions {
  sessionId?: string;
  userContext?: UserContext;
  maxMessages?: number;
}

interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sessionId: string;
  sendMessage: (content: string) => Promise<void>;
  clearHistory: () => void;
  retryLast: () => Promise<void>;
  suggestions: SuggestionChip[];
}

const COGNI_SYSTEM_PROMPT = `You are Cogni, the Cognify Academic Intelligence System. You are an intelligent, calm, and mentor-like academic tutor.

Guidelines:
1. Be concise and structured in your responses
2. Use academic tone without being overly formal
3. Provide step-by-step explanations when solving problems
4. Ask follow-up questions to ensure understanding
5. Focus on conceptual clarity over rote memorization
6. Reference relevant formulas and concepts clearly
7. Use headings and bullet points for better readability
8. Do not use emojis or excessive punctuation
9. Never say "I'm just an AI" - you are the Cognify Academic Intelligence System

Remember: You are a mentor, guide students toward understanding, not just answers.`;

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const {
    sessionId = uuidv4(),
    userContext,
    maxMessages = 50,
  } = options;

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestionChip[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  const generateSuggestions = useCallback((weakTopics: string[]) => {
    const baseSuggestions: SuggestionChip[] = [
      {
        id: "1",
        label: "Explain this concept",
        type: "concept",
        context: "conceptual explanation",
      },
      {
        id: "2",
        label: "Give PYQ example",
        type: "pyq",
        context: "previous year question",
      },
      {
        id: "3",
        label: "Generate practice questions",
        type: "practice",
        context: "practice problems",
      },
      {
        id: "4",
        label: "Summarize chapter",
        type: "summary",
        context: "chapter summary",
      },
    ];

    if (weakTopics.length > 0) {
      baseSuggestions.push({
        id: "5",
        label: `Why am I weak in ${weakTopics[0]}?`,
        type: "weakness",
        context: weakTopics[0],
      });
    }

    setSuggestions(baseSuggestions);
  }, []);

  useEffect(() => {
    generateSuggestions(userContext?.weakTopics || []);
  }, [userContext?.weakTopics, generateSuggestions]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMessage: Message = {
        id: uuidv4(),
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => {
        const newMessages = [...prev, userMessage];
        if (newMessages.length > maxMessages) {
          return newMessages.slice(-maxMessages);
        }
        return newMessages;
      });

      setIsLoading(true);
      setError(null);

      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch("/api/ai-tutor/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: content.trim(),
            sessionId,
            userContext: userContext || {
              userId: "guest",
              grade: "12",
              target: "JEE",
              weakTopics: [],
              recentAccuracy: 0,
              recentTestAttempts: [],
            },
            history: messages.slice(-10),
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to get response from Cogni");
        }

        const data = await response.json();

        const assistantMessage: Message = {
          id: uuidv4(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [isLoading, sessionId, userContext, messages, maxMessages]
  );

  const clearHistory = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const retryLast = useCallback(async () => {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMessage) {
      setMessages((prev) => prev.filter((m) => m.id !== lastUserMessage.id));
      await sendMessage(lastUserMessage.content);
    }
  }, [messages, sendMessage]);

  return {
    messages,
    isLoading,
    error,
    sessionId,
    sendMessage,
    clearHistory,
    retryLast,
    suggestions,
  };
}

export { COGNI_SYSTEM_PROMPT };
