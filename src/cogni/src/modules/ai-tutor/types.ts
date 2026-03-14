// Cogni AI Academic Intelligence Engine - Types
// Enhanced for Production-Grade Adaptive Learning

// =====================================================
// COLOR THEME CONSTANTS
// =====================================================

export const COGNI_THEME = {
  // Flat properties for backward compatibility
  primary: "#2563EB",
  primaryHover: "#1D4ED8",
  success: "#10B981",
  warning: "#DC2626",
  border: "#E5E7EB",
  lightPanel: "#F8FAFF",
  white: "#FFFFFF",
  
  // Nested color object
  colors: {
    primary: "#2563EB",
    primaryHover: "#1D4ED8",
    primaryLight: "#3B82F6",
    deepBlue: "#1E40AF",
    success: "#10B981",
    warning: "#DC2626",
    error: "#EF4444",
    border: "#E5E7EB",
    borderHover: "#2563EB",
    background: "#F8FAFF",
    backgroundAlt: "#EEF2FF",
    card: "#FFFFFF",
    text: "#111827",
    textMuted: "#6B7280",
  },
  gradients: {
    primary: "linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)",
    background: "linear-gradient(180deg, #F8FAFF 0%, #EEF2FF 100%)",
    cardGlow: "linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(30, 64, 175, 0.02) 100%)",
  },
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.07)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.08)",
    glow: "0 0 20px rgba(37, 99, 235, 0.15)",
    glowStrong: "0 0 30px rgba(37, 99, 235, 0.25)",
  },
  borderRadius: {
    sm: "6px",
    md: "10px",
    lg: "14px",
    xl: "20px",
    full: "9999px",
  },
} as const;

// =====================================================
// STRUCTURED RESPONSE TYPES (COGNI INTELLIGENCE CORE)
// =====================================================

/**
 * Structured explanation response from Cogni
 * Every answer follows a pedagogy-driven structure
 */
export interface StructuredResponse {
  /** What the student is asking/trying to solve */
  understanding: string;
  /** The approach/strategy to solve the problem */
  strategy: string;
  /** Step-by-step solution with explanations */
  steps: SolutionStep[];
  /** The final answer, clearly highlighted */
  finalAnswer: string;
  /** A follow-up question to check understanding */
  followUpQuestion: string;
  /** Confidence level in the explanation (0-1) */
  confidence: number;
  /** Topics covered in this explanation */
  topicsCovered: string[];
  /** Difficulty level of the explanation */
  difficulty: 'basic' | 'intermediate' | 'advanced';
  /** Suggested next steps for the student */
  nextSteps?: string[];
}

/**
 * Individual step in a solution
 */
export interface SolutionStep {
  stepNumber: number;
  title: string;
  content: string;
  explanation: string;
  formulas?: string[];
  isKey?: boolean;
}

/**
 * Response type for different query modes
 */
export type QueryMode = 
  | 'explain'           // Concept explanation
  | 'solve'             // Problem solving
  | 'practice'          // Practice question generation
  | 'review_mistake'    // Mistake analysis
  | 'summarize'         // Chapter/topic summary
  | 'remediate';        // Fix-With-Cogni mode

/**
 * Enriched message with structured data
 */
export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  tokens?: number;
  // New: Structured response data
  structured?: StructuredResponse;
  // New: Query mode
  mode?: QueryMode;
  // New: Related topics
  topicsDiscussed?: string[];
  // New: Confidence rating from student
  studentConfidence?: 'confident' | 'somewhat' | 'confused';
  // New: Hint level used (if applicable)
  hintLevel?: number;
  // New: Mistake classification (if applicable)
  mistakeType?: MistakeType;
}

// =====================================================
// USER CONTEXT & KNOWLEDGE STATE
// =====================================================

/**
 * User context for AI personalization
 */
export interface UserContext {
  userId: string;
  grade: string;
  target: "JEE" | "NEET" | "Other";
  weakTopics: WeakTopic[];
  recentAccuracy: number;
  recentTestAttempts: TestAttemptSummary[];
  studyStreak: number;
  lastActiveDate: Date | null;
  // New: Knowledge state
  knowledgeState?: KnowledgeState;
  // New: Current session context
  currentSession?: SessionContext;
}

/**
 * Knowledge state for adaptive tutoring
 */
export interface KnowledgeState {
  /** Overall mastery score (0-1) */
  overallMastery: number;
  /** Subject-wise mastery */
  subjectMastery: Record<string, number>;
  /** Topic-wise mastery */
  topicMastery: Record<string, number>;
  /** Recent mistake patterns */
  mistakePatterns: MistakePattern[];
  /** Learning velocity (questions per session avg) */
  learningVelocity: number;
  /** Preferred explanation style */
  preferredStyle: 'visual' | 'analytical' | 'intuitive' | 'balanced';
}

/**
 * Current session context
 */
export interface SessionContext {
  sessionId: string;
  startedAt: Date;
  topicsDiscussed: string[];
  questionsAsked: number;
  hintsUsed: number;
  correctResponses: number;
  currentMode: QueryMode;
}

/**
 * Mistake pattern for analysis
 */
export interface MistakePattern {
  type: MistakeType;
  frequency: number;
  recentOccurrence: Date;
  affectedTopics: string[];
}

// =====================================================
// TEST & WEAK TOPIC ANALYSIS
// =====================================================

export interface TestAttemptSummary {
  id: string;
  subject: string;
  score: number;
  totalQuestions: number;
  accuracy: number;
  date: Date;
}

export interface WeakTopic {
  id: string;
  topic: string;
  subject: string;
  accuracy: number;
  attemptCount: number;
  lastPracticed: Date | null;
  mistakeType: MistakeType | null;
  recommendedAction?: string;
  // New: Mastery level
  masteryLevel?: number;
  // New: Priority score
  priority?: number;
}

// =====================================================
// MISTAKE CLASSIFICATION
// =====================================================

export type MistakeType = "conceptual" | "calculation" | "time_pressure" | "careless" | "misread";

export interface MistakeAnalysis {
  questionId: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  topic: string;
  concept: string;
  mistakeType: MistakeType;
  explanation: string;
  remediationSteps: string[];
  similarQuestions: string[];
}

// =====================================================
// SOCRATIC HINT INTEGRATION
// =====================================================

export interface HintContext {
  questionText: string;
  questionId?: string;
  subject?: string;
  topic?: string;
  difficulty?: string;
  studentAnswer?: string;
  previousAttempts?: number;
  timeSpent?: number;
  skillLevel?: number;
  previousHints?: number[];
}

export interface GeneratedHint {
  id: string;
  level: number;
  content: string;
  createdAt: Date;
  wasHelpful?: boolean;
}

// =====================================================
// AI CAPABILITIES & SUGGESTIONS
// =====================================================

export type CogniCapability =
  | "explain_concept"
  | "generate_practice"
  | "solve_mistakes"
  | "summarize_chapter"
  | "create_mini_test"
  | "revise_weak_topic"
  | "fix_with_cogni"
  | "challenge_mode"
  | "simpler_explanation";

export interface CapabilityAction {
  id: CogniCapability;
  label: string;
  icon: string;
  description: string;
  promptTemplate: string;
}

export interface SuggestionChip {
  id: string;
  label: string;
  type: "concept" | "pyq" | "practice" | "summary" | "weakness" | "mistake" | "challenge";
  context: string;
  capability?: CogniCapability;
}

// =====================================================
// AI SESSION & MEMORY
// =====================================================

export interface AISession {
  id: string;
  userId: string;
  title: string | null;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  // New: Session summary
  summary?: SessionSummary;
}

export interface SessionSummary {
  topicsCovered: string[];
  questionsAnswered: number;
  correctResponses: number;
  hintsUsed: number;
  masteryChange: number;
  recommendations: string[];
}

export interface ContextPayload {
  user_id: string;
  grade: string;
  target_exam: string;
  weak_topics: string[];
  recent_accuracy: number;
  last_test_chapter?: string;
  study_streak: number;
  current_session_id?: string;
  // New: Knowledge state for adaptive tutoring
  knowledge_state?: KnowledgeState;
  // New: Current difficulty preference
  target_difficulty?: 'basic' | 'intermediate' | 'advanced';
}

// =====================================================
// COGNI STATE (for animations)
// =====================================================

export interface CogniState {
  isIdle: boolean;
  isListening: boolean;
  isExplaining: boolean;
  isEncouraging: boolean;
  isThinking?: boolean;
  isCelebrating?: boolean;
  currentEmotion?: 'neutral' | 'happy' | 'concerned' | 'encouraging' | 'thinking';
}

// =====================================================
// AI INSIGHTS
// =====================================================

export interface AIInsights {
  conceptMastery: number;
  topicDifficultyIndex: number;
  timeEfficiencyIndex: number;
  predictedNextScore: number;
  recommendedNextTest: string;
  suggestedChapters: string[];
  timeEfficiency?: number;
  predictedScore?: number;
}

// =====================================================
// CHAT STATE
// =====================================================

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  sessionId: string;
}

// =====================================================
// API TYPES
// =====================================================

export interface ChatRequest {
  message: string;
  sessionId: string;
  userContext: UserContext;
  history: Message[];
  capability?: CogniCapability;
  // New: Query mode
  mode?: QueryMode;
  // New: Structured response requested
  structured?: boolean;
  // New: Hint context (for hint requests)
  hintContext?: HintContext;
  // New: Fix-With-Cogni context
  remediationContext?: {
    questionId: string;
    question: string;
    userAnswer: string;
    correctAnswer: string;
    topic: string;
    timeTaken?: number;
  };
}

export interface ChatResponse {
  success: boolean;
  response: string;
  timestamp: string;
  tokensUsed?: number;
  // New: Structured response
  structured?: StructuredResponse;
  // New: Query mode used
  mode?: QueryMode;
  // New: Topics discussed
  topicsDiscussed?: string[];
  // New: Suggested follow-ups
  followUpSuggestions?: SuggestionChip[];
}

// =====================================================
// PERFORMANCE METRICS
// =====================================================

export interface PerformanceMetrics {
  overallAccuracy: number;
  testsAttempted: number;
  strongestSubject: string;
  weakestSubject: string;
  averageScore: number;
  improvementTrend: "up" | "down" | "stable";
}
