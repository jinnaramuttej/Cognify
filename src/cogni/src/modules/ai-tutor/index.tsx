"use client";

import { useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lightbulb, 
  Send, 
  Mic, 
  Image, 
  Trash2, 
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
  Target,
  Brain,
  X
} from "lucide-react";
import { CogniScene } from "./components/CogniScene";
import { StructuredSolution, QuickActions } from "./components/StructuredSolution";
import { useCogniChat } from "./hooks/useCogniChat";
import { BackgroundSystem, StaggerContainer, StaggerItem } from "@/components/shared";
import { 
  COGNI_THEME, 
  type UserContext, 
  type AIInsights,
  type StructuredResponse 
} from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { SocraticHintLadder } from "@/modules/socratic-hints";

// =====================================================
// DEMO DATA
// =====================================================

const demoUserContext: UserContext = {
  userId: "DEMO_USER_001",
  grade: "12",
  target: "JEE",
  weakTopics: [
    {
      id: "weak_1",
      topic: "Electrostatics",
      subject: "Physics",
      accuracy: 45.5,
      attemptCount: 12,
      lastPracticed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      mistakeType: "conceptual",
      masteryLevel: 0.45,
      priority: 1,
    },
    {
      id: "weak_2",
      topic: "Organic Chemistry",
      subject: "Chemistry",
      accuracy: 52.0,
      attemptCount: 8,
      lastPracticed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      mistakeType: "conceptual",
      masteryLevel: 0.52,
      priority: 2,
    },
    {
      id: "weak_3",
      topic: "Integration",
      subject: "Mathematics",
      accuracy: 58.0,
      attemptCount: 15,
      lastPracticed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      mistakeType: "calculation",
      masteryLevel: 0.58,
      priority: 3,
    },
  ],
  recentAccuracy: 62,
  recentTestAttempts: [
    {
      id: "attempt_1",
      subject: "Physics",
      score: 65,
      totalQuestions: 30,
      accuracy: 65,
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  ],
  studyStreak: 7,
  lastActiveDate: new Date(),
  knowledgeState: {
    overallMastery: 0.62,
    subjectMastery: { Physics: 0.58, Chemistry: 0.55, Mathematics: 0.72 },
    topicMastery: { Electrostatics: 0.45, Integration: 0.58 },
    mistakePatterns: [],
    learningVelocity: 8.5,
    preferredStyle: 'analytical',
  },
};

const demoInsights: AIInsights = {
  conceptMastery: 68,
  topicDifficultyIndex: 72,
  timeEfficiencyIndex: 65,
  predictedNextScore: 70,
  recommendedNextTest: "Electrostatics Practice Test",
  suggestedChapters: ["Electric Field & Potential", "Gauss's Law", "Capacitance"],
};

// =====================================================
// MAIN COMPONENT
// =====================================================

interface AiTutorProps {
  userContext?: UserContext;
  className?: string;
}

export default function AiTutor({ userContext = demoUserContext, className }: AiTutorProps) {
  const [input, setInput] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [selectedHintTopic, setSelectedHintTopic] = useState<string | null>(null);
  
  const {
    messages,
    isLoading,
    error,
    sessionId,
    sendMessage,
    sendCapabilityRequest,
    clearHistory,
    retryLast,
    suggestions,
    cogniState,
    memoryStats,
  } = useCogniChat({ userContext });

  const insights = useMemo(() => demoInsights, []);

  // Handle sending message
  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    const message = input.trim();
    setInput("");
    await sendMessage(message);
  }, [input, isLoading, sendMessage]);

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = useCallback(async (suggestion: typeof suggestions[0]) => {
    if (suggestion.label.includes("Improve")) {
      await sendMessage(`Help me improve my understanding of ${suggestion.context}`);
    } else {
      await sendMessage(suggestion.label);
    }
  }, [sendMessage]);

  // Handle follow-up question click
  const handleFollowUpClick = useCallback((question: string) => {
    sendMessage(question);
  }, [sendMessage]);

  return (
    <BackgroundSystem showOrbs={true} showNoise={true} showGrid={false}>
      <div className={cn("h-screen flex flex-col overflow-hidden", className)}>
        {/* Header */}
        <header className="shrink-0 bg-white/90 backdrop-blur-sm border-b px-4 py-3">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900 flex items-center gap-2">
                  Cogni
                  <Badge variant="secondary" className="text-xs font-normal">
                    AI Tutor
                  </Badge>
                </h1>
                <p className="text-xs text-gray-500">
                  {cogniState.isThinking ? "Thinking..." : "Ready to help you learn"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Memory Stats */}
              <div className="hidden md:flex items-center gap-4 mr-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  {memoryStats.topicsDiscussed.length} topics
                </span>
                <span className="flex items-center gap-1">
                  <Target className="w-3.5 h-3.5" />
                  {memoryStats.sessionLength} messages
                </span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={clearHistory}
                className="text-gray-500 hover:text-gray-700"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Clear
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="max-w-3xl mx-auto space-y-4">
                {/* Welcome Message */}
                {messages.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12"
                  >
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
                      <Brain className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      Welcome to Cogni
                    </h2>
                    <p className="text-gray-500 max-w-md mx-auto mb-8">
                      Your AI Academic Intelligence System. I adapt to your learning style
                      and help you master concepts, not just memorize answers.
                    </p>

                    {/* Quick Start Suggestions */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
                      {suggestions.slice(0, 4).map((suggestion) => (
                        <motion.button
                          key={suggestion.id}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all text-left group"
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mb-2 group-hover:bg-blue-100 transition-colors">
                            <Sparkles className="w-4 h-4 text-blue-500" />
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            {suggestion.label}
                          </p>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Message List */}
                {messages.map((message) => (
                  <MessageItem
                    key={message.id}
                    message={message}
                    onFollowUpClick={handleFollowUpClick}
                  />
                ))}

                {/* Loading Indicator */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-semibold">
                        C
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-white rounded-2xl rounded-tl-md p-4 border border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-2 h-2 rounded-full bg-blue-500"
                              animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.12 }}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-400 ml-2">
                          {cogniState.currentEmotion === 'thinking' ? 'Analyzing your question...' : 'Preparing response...'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                      <X className="w-4 h-4 text-red-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={retryLast}>
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Retry
                    </Button>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="shrink-0 bg-white/95 backdrop-blur-sm border-t p-4">
              <div className="max-w-3xl mx-auto">
                {/* Quick Actions */}
                {messages.length > 0 && messages[messages.length - 1]?.role === 'assistant' && !isLoading && (
                  <div className="flex justify-center mb-3">
                    <QuickActions
                      onSimpler={() => sendMessage("Explain this more simply, use analogies")}
                      onHarder={() => sendMessage("Give me a harder version of this problem")}
                      onSimilar={() => sendMessage("Give me a similar practice question")}
                      onExplainMore={() => sendMessage("Explain this concept in more detail")}
                    />
                  </div>
                )}

                {/* Suggestion Chips */}
                {suggestions.length > 0 && !isLoading && (
                  <div className="flex flex-wrap gap-2 justify-center mb-3">
                    {suggestions.slice(0, 3).map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-full text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors border border-gray-200 hover:border-gray-300"
                      >
                        {suggestion.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input Field */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask Cogni anything... (concepts, problems, practice)"
                      disabled={isLoading}
                      className="h-12 pr-24 text-sm border-gray-200 focus:border-blue-400 focus:ring-blue-100"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-gray-600"
                        title="Voice input"
                      >
                        <Mic className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-gray-600"
                        title="Upload image"
                      >
                        <Image className="w-4 h-4" alt="Upload image" />
                      </Button>
                    </div>
                  </div>

                  <Button
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    className="h-12 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-200"
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <RotateCcw className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Context & Weak Topics */}
          <AnimatePresence>
            {showSidebar && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="shrink-0 bg-white/90 backdrop-blur-sm border-l overflow-hidden"
              >
                <div className="w-80 h-full flex flex-col">
                  {/* Sidebar Header */}
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Learning Context</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowSidebar(false)}
                        className="h-8 w-8"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Weak Topics */}
                  <div className="p-4 border-b">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4 text-amber-500" />
                      Focus Areas
                    </h4>
                    <div className="space-y-2">
                      {userContext.weakTopics.slice(0, 3).map((topic) => (
                        <button
                          key={topic.id}
                          onClick={() => sendMessage(`Help me with ${topic.topic}. My accuracy is ${topic.accuracy}%`)}
                          className="w-full p-3 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-100 hover:border-blue-200 transition-all text-left group"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900 group-hover:text-blue-900">
                              {topic.topic}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {topic.accuracy}%
                            </Badge>
                          </div>
                          <Progress 
                            value={topic.accuracy} 
                            className="h-1.5"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {topic.mistakeType} errors • {topic.attemptCount} attempts
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Session Stats */}
                  <div className="p-4 border-b">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <Brain className="w-4 h-4 text-blue-500" />
                      This Session
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-2xl font-bold text-blue-600">
                          {memoryStats.topicsDiscussed.length}
                        </p>
                        <p className="text-xs text-blue-600/70">Topics Covered</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-2xl font-bold text-green-600">
                          {memoryStats.sessionLength}
                        </p>
                        <p className="text-xs text-green-600/70">Exchanges</p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Help */}
                  <div className="p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      Quick Help
                    </h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => sendMessage("What are my weakest topics and how can I improve?")}
                        className="w-full p-2 text-left text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        📊 Analyze my weak topics
                      </button>
                      <button
                        onClick={() => sendMessage("Create a study plan for this week based on my progress")}
                        className="w-full p-2 text-left text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        📅 Create study plan
                      </button>
                      <button
                        onClick={() => sendMessage("Give me practice questions for my weakest subject")}
                        className="w-full p-2 text-left text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        📝 Practice weak areas
                      </button>
                    </div>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Sidebar Toggle */}
          {!showSidebar && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSidebar(true)}
              className="fixed right-4 top-20 bg-white shadow-md"
            >
              <ChevronUp className="w-4 h-4 mr-1" />
              Show Context
            </Button>
          )}
        </div>
      </div>
    </BackgroundSystem>
  );
}

// =====================================================
// MESSAGE ITEM COMPONENT
// =====================================================

interface MessageItemProps {
  message: typeof messages extends (infer T)[] ? T : never;
  onFollowUpClick: (question: string) => void;
}

function MessageItem({ message, onFollowUpClick }: MessageItemProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center"
      >
        <Badge variant="secondary" className="text-xs">
          {message.content}
        </Badge>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-3", isUser && "flex-row-reverse")}
    >
      {/* Avatar */}
      <Avatar className="w-8 h-8 shrink-0 mt-1">
        <AvatarFallback className={cn(
          "text-xs font-semibold",
          isUser 
            ? "bg-gray-100 text-gray-600" 
            : "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
        )}>
          {isUser ? "U" : "C"}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className={cn(
        "flex-1 max-w-[85%]",
        isUser ? "items-end" : "items-start"
      )}>
        {message.structured ? (
          // Render structured response
          <StructuredSolution
            structured={message.structured}
            onFollowUpClick={onFollowUpClick}
          />
        ) : (
          // Render plain text
          <div className={cn(
            "rounded-2xl p-4",
            isUser 
              ? "bg-blue-500 text-white rounded-tr-md" 
              : "bg-white border border-gray-100 rounded-tl-md"
          )}>
            <p className={cn(
              "text-sm whitespace-pre-wrap",
              isUser ? "text-white" : "text-gray-700"
            )}>
              {message.content}
            </p>
          </div>
        )}

        {/* Timestamp */}
        <p className={cn(
          "text-xs text-gray-400 mt-1 px-1",
          isUser ? "text-right" : "text-left"
        )}>
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
          {message.tokens && (
            <span className="ml-2 opacity-50">({message.tokens} tokens)</span>
          )}
        </p>
      </div>
    </motion.div>
  );
}

// Export components for individual use
export { CogniScene } from "./components/CogniScene";
export { StructuredSolution } from "./components/StructuredSolution";
export { useCogniChat } from "./hooks/useCogniChat";
export { COGNI_THEME };
export type {
  Message,
  UserContext,
  WeakTopic,
  SuggestionChip,
  CogniState,
  CogniCapability,
  AIInsights,
  StructuredResponse,
} from "./types";
