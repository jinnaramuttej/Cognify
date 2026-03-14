"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import type {
  Message,
  UserContext,
  SuggestionChip,
  CogniCapability,
  CogniState,
  StructuredResponse,
  QueryMode,
  ChatResponse,
} from "../types";

// =====================================================
// TYPES
// =====================================================

interface UseCogniChatOptions {
  sessionId?: string;
  userContext?: UserContext;
  maxMessages?: number;
  enableStreaming?: boolean;
}

interface UseCogniChatReturn {
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  sessionId: string;
  sendMessage: (content: string, mode?: QueryMode) => Promise<void>;
  sendCapabilityRequest: (capability: CogniCapability) => Promise<void>;
  sendHintRequest: (level: number, questionText: string) => Promise<void>;
  startRemediation: (context: {
    questionId: string;
    question: string;
    userAnswer: string;
    correctAnswer: string;
    topic: string;
  }) => Promise<void>;
  clearHistory: () => void;
  retryLast: () => Promise<void>;
  suggestions: SuggestionChip[];
  cogniState: CogniState;
  // New: Memory stats
  memoryStats: {
    topicsDiscussed: string[];
    sessionLength: number;
    hintsUsed: number;
    correctResponses: number;
  };
}

// =====================================================
// HOOK IMPLEMENTATION
// =====================================================

export function useCogniChat(options: UseCogniChatOptions = {}): UseCogniChatReturn {
  const {
    sessionId = uuidv4(),
    userContext,
    maxMessages = 100,
    enableStreaming = false,
  } = options;

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestionChip[]>([]);
  
  // Memory tracking
  const topicsDiscussedRef = useRef<Set<string>>(new Set());
  const hintsUsedRef = useRef(0);
  const correctResponsesRef = useRef(0);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  // =====================================================
  // COGNI STATE (for animations)
  // =====================================================

  const cogniState: CogniState = useMemo(() => {
    const lastMessage = messages[messages.length - 1];
    const isUserTurn = lastMessage?.role === "user";
    
    return {
      isIdle: !isLoading && messages.length === 0,
      isListening: false,
      isExplaining: isLoading && isUserTurn,
      isEncouraging: !isLoading && lastMessage?.role === "assistant" && 
        lastMessage.content.toLowerCase().includes('great') ||
        lastMessage?.content.toLowerCase().includes('excellent') ||
        lastMessage?.content.toLowerCase().includes('correct'),
      isThinking: isLoading,
      isCelebrating: false,
      currentEmotion: isLoading ? 'thinking' : 
        (lastMessage?.studentConfidence === 'confused') ? 'concerned' : 'neutral',
    };
  }, [isLoading, messages]);

  // =====================================================
  // MEMORY STATS
  // =====================================================

  const memoryStats = useMemo(() => ({
    topicsDiscussed: Array.from(topicsDiscussedRef.current),
    sessionLength: messages.length,
    hintsUsed: hintsUsedRef.current,
    correctResponses: correctResponsesRef.current,
  }), [messages.length]);

  // =====================================================
  // SUGGESTION GENERATION
  // =====================================================

  const generateSuggestions = useCallback((topics: string[] = []) => {
    const baseSuggestions: SuggestionChip[] = [
      {
        id: "explain",
        label: "Explain a concept",
        type: "concept",
        context: "conceptual explanation",
        capability: "explain_concept",
      },
      {
        id: "practice",
        label: "Practice questions",
        type: "practice",
        context: "practice problems",
        capability: "generate_practice",
      },
      {
        id: "mistakes",
        label: "Review my mistakes",
        type: "mistake",
        context: "mistake analysis",
        capability: "solve_mistakes",
      },
    ];

    // Add topic-based suggestions
    if (topics.length > 0) {
      const topic = topics[0];
      baseSuggestions.push({
        id: "challenge",
        label: `Challenge me on ${topic}`,
        type: "challenge",
        context: topic,
        capability: "challenge_mode",
      });
    }

    // Add weakness-based suggestions
    if (userContext?.weakTopics && userContext.weakTopics.length > 0) {
      const weakestTopic = userContext.weakTopics.reduce((prev, curr) =>
        prev.accuracy < curr.accuracy ? prev : curr
      );

      baseSuggestions.push({
        id: "weakness",
        label: `Improve ${weakestTopic.topic}`,
        type: "weakness",
        context: weakestTopic.topic,
        capability: "revise_weak_topic",
      });
    }

    setSuggestions(baseSuggestions.slice(0, 5));
  }, [userContext?.weakTopics]);

  useEffect(() => {
    generateSuggestions();
  }, [generateSuggestions]);

  // =====================================================
  // SEND MESSAGE
  // =====================================================

  const sendMessage = useCallback(
    async (content: string, mode?: QueryMode) => {
      if (!content.trim() || isLoading) return;

      const userMessage: Message = {
        id: uuidv4(),
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
        mode,
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
              studyStreak: 0,
              lastActiveDate: null,
            },
            history: messages.slice(-10).map(m => ({
              id: m.id,
              role: m.role,
              content: m.content,
              timestamp: m.timestamp.toISOString(),
            })),
            mode,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          if (response.status === 429) {
            throw new Error("You're sending messages too quickly. Please wait a moment.");
          }
          throw new Error(errorData.error || "Failed to get response from Cogni");
        }

        const data: ChatResponse = await response.json();

        // Track topics discussed
        if (data.topicsDiscussed) {
          data.topicsDiscussed.forEach(t => topicsDiscussedRef.current.add(t));
        }

        const assistantMessage: Message = {
          id: uuidv4(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
          tokens: data.tokensUsed,
          structured: data.structured,
          mode: data.mode,
          topicsDiscussed: data.topicsDiscussed,
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Update suggestions based on response
        if (data.followUpSuggestions) {
          setSuggestions(data.followUpSuggestions.map((s, i) => ({
            id: String(i),
            label: s.label,
            type: s.type as any,
            context: s.context,
          })));
        } else {
          generateSuggestions(data.topicsDiscussed);
        }
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
    [isLoading, sessionId, userContext, messages, maxMessages, generateSuggestions]
  );

  // =====================================================
  // CAPABILITY REQUEST
  // =====================================================

  const CAPABILITY_PROMPTS: Record<CogniCapability, { prompt: string; mode: QueryMode }> = {
    explain_concept: { prompt: "Please explain the concept of", mode: "explain" },
    generate_practice: { prompt: "Generate practice questions for", mode: "practice" },
    solve_mistakes: { prompt: "Help me understand my mistakes in", mode: "review_mistake" },
    summarize_chapter: { prompt: "Provide a comprehensive summary of", mode: "summarize" },
    create_mini_test: { prompt: "Create a mini test on", mode: "practice" },
    revise_weak_topic: { prompt: "Help me revise and improve my understanding of", mode: "explain" },
    fix_with_cogni: { prompt: "Help me fix my understanding of", mode: "remediate" },
    challenge_mode: { prompt: "Give me a challenging question on", mode: "solve" },
    simpler_explanation: { prompt: "Explain this more simply:", mode: "explain" },
  };

  const sendCapabilityRequest = useCallback(
    async (capability: CogniCapability) => {
      const config = CAPABILITY_PROMPTS[capability];
      const topic = userContext?.weakTopics?.[0]?.topic || "the selected topic";
      const message = `${config.prompt} ${topic}.`;
      await sendMessage(message, config.mode);
    },
    [sendMessage, userContext?.weakTopics]
  );

  // =====================================================
  // HINT REQUEST
  // =====================================================

  const sendHintRequest = useCallback(
    async (level: number, questionText: string) => {
      hintsUsedRef.current++;
      
      const message = level === 4 
        ? `I need the full solution for: ${questionText}`
        : `I need a level ${level} hint for: ${questionText}`;
      
      await sendMessage(message, 'solve');
    },
    [sendMessage]
  );

  // =====================================================
  // REMEDIATION (FIX-WITH-COGNI)
  // =====================================================

  const startRemediation = useCallback(
    async (context: {
      questionId: string;
      question: string;
      userAnswer: string;
      correctAnswer: string;
      topic: string;
    }) => {
      // Add system message to show context
      const systemMessage: Message = {
        id: uuidv4(),
        role: "system",
        content: `Fix-With-Cogni: Analyzing your answer for "${context.topic}"`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, systemMessage]);

      // Send remediation request
      const response = await fetch("/api/ai-tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Help me understand my mistake",
          sessionId,
          userContext,
          history: [],
          mode: "remediate",
          remediationContext: context,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          id: uuidv4(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
          structured: data.structured,
          mode: "remediate",
          topicsDiscussed: [context.topic],
        };

        setMessages(prev => [...prev, assistantMessage]);
      }
    },
    [sessionId, userContext]
  );

  // =====================================================
  // UTILITY FUNCTIONS
  // =====================================================

  const clearHistory = useCallback(() => {
    setMessages([]);
    setError(null);
    topicsDiscussedRef.current.clear();
    hintsUsedRef.current = 0;
    correctResponsesRef.current = 0;
  }, []);

  const retryLast = useCallback(async () => {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMessage) {
      setMessages((prev) => prev.filter((m) => m.id !== lastUserMessage.id));
      await sendMessage(lastUserMessage.content, lastUserMessage.mode);
    }
  }, [messages, sendMessage]);

  // =====================================================
  // RETURN
  // =====================================================

  return {
    messages,
    isLoading,
    isStreaming,
    error,
    sessionId,
    sendMessage,
    sendCapabilityRequest,
    sendHintRequest,
    startRemediation,
    clearHistory,
    retryLast,
    suggestions,
    cogniState,
    memoryStats,
  };
}

export default useCogniChat;
