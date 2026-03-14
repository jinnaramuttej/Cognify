/**
 * Socratic Hint Ladder - Types and Interfaces
 * 
 * Progressive hint system with 4-level Socratic approach
 */

// ============================================================
// Hint Level Types
// ============================================================

export type HintLevel = 1 | 2 | 3 | 4;

export interface HintLevelConfig {
  level: HintLevel;
  name: string;
  description: string;
  icon: string;
  color: string;
  weight: number;
  socraticPurpose: string;
}

export const HINT_LEVELS: Record<HintLevel, HintLevelConfig> = {
  1: {
    level: 1,
    name: 'Conceptual Nudge',
    description: 'A gentle push in the right direction',
    icon: 'Lightbulb',
    color: 'blue',
    weight: 0.5,
    socraticPurpose: 'Guide discovery without revealing the path',
  },
  2: {
    level: 2,
    name: 'Targeted Question',
    description: 'A probing question to stimulate thinking',
    icon: 'HelpCircle',
    color: 'amber',
    weight: 1.0,
    socraticPurpose: 'Ask probing questions (why, what if, what assumptions)',
  },
  3: {
    level: 3,
    name: 'Next Step',
    description: 'Show the immediate next step in solving',
    icon: 'ArrowRight',
    color: 'purple',
    weight: 1.5,
    socraticPurpose: 'Reveal the next logical step without the full solution',
  },
  4: {
    level: 4,
    name: 'Full Solution',
    description: 'Complete worked solution',
    icon: 'CheckCircle',
    color: 'green',
    weight: 2.5,
    socraticPurpose: 'Provide complete solution for learning',
  },
};

// ============================================================
// Hint Context Types
// ============================================================

export interface HintContext {
  questionText: string;
  questionId?: string;
  subject?: string;
  topic?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  studentAnswer?: string;
  previousAttempts?: number;
  timeSpent?: number; // seconds
  skillLevel?: number; // 0-1, from knowledge tracing
  previousHints?: HintLevel[];
}

export interface GeneratedHint {
  id: string;
  level: HintLevel;
  content: string;
  questionAsked?: string; // For level 2 - the probing question
  nextStep?: string; // For level 3
  solution?: string; // For level 4
  templateUsed?: string;
  generatedAt: Date;
  modelUsed?: string;
  latency?: number;
}

// ============================================================
// Budget Types
// ============================================================

export interface HintBudget {
  total: number;
  remaining: number;
  used: number;
  level4Used: number;
  maxLevel4: number;
  escalationThreshold: number;
  isEscalationTriggered: boolean;
}

export interface HintBudgetConfig {
  maxHintsPerItem: number;
  maxHintsPerSession: number;
  maxLevel4PerSession: number;
  escalationThreshold: number;
  levelWeights: {
    1: number;
    2: number;
    3: number;
    4: number;
  };
  reduceOnCorrect: boolean;
  increaseOnStruggle: boolean;
}

export const DEFAULT_BUDGET_CONFIG: HintBudgetConfig = {
  maxHintsPerItem: 4,
  maxHintsPerSession: 20,
  maxLevel4PerSession: 3,
  escalationThreshold: 3,
  levelWeights: {
    1: 0.5,
    2: 1.0,
    3: 1.5,
    4: 2.5,
  },
  reduceOnCorrect: true,
  increaseOnStruggle: true,
};

// ============================================================
// Feedback Types
// ============================================================

export type FeedbackRating = 1 | 2 | 3 | 4 | 5;
export type FeedbackType = 'too_vague' | 'too_revealing' | 'just_right' | 'confusing' | 'helpful';

export interface HintFeedbackInput {
  hintUsageId: string;
  wasHelpful?: boolean;
  rating?: FeedbackRating;
  feedbackType?: FeedbackType;
  freeformFeedback?: string;
}

export interface HintFeedbackStats {
  totalFeedback: number;
  avgHelpfulness: number;
  helpfulCount: number;
  unhelpfulCount: number;
  feedbackByType: Record<FeedbackType, number>;
}

// ============================================================
// Escalation Types
// ============================================================

export type EscalationType = 'eli5' | 'worked_example' | 'video' | 'teacher_help';

export interface EscalationContent {
  id: string;
  type: EscalationType;
  title: string;
  content: string;
  topic?: string;
  concept?: string;
}

export interface EscalationState {
  isTriggered: boolean;
  triggerCount: number;
  recommendedAction: EscalationType;
  availableOptions: EscalationType[];
}

// ============================================================
// Template Types
// ============================================================

export interface HintTemplate {
  id: string;
  name: string;
  level: HintLevel;
  subject?: string;
  topic?: string;
  systemPrompt: string;
  userPromptTemplate: string;
  requiredVariables: string[];
  optionalVariables?: string[];
  avgHelpfulness: number;
  usageCount: number;
  isActive?: boolean;
  version?: number;
}

// ============================================================
// API Types
// ============================================================

export interface GenerateHintRequest {
  userId: string;
  sessionId?: string;
  context: HintContext;
  requestedLevel?: HintLevel;
}

export interface GenerateHintResponse {
  success: boolean;
  hint?: GeneratedHint;
  budget?: HintBudget;
  escalation?: EscalationState;
  error?: string;
}

export interface SubmitFeedbackRequest {
  hintUsageId: string;
  userId: string;
  wasHelpful: boolean;
  rating?: FeedbackRating;
  feedbackType?: FeedbackType;
  freeformFeedback?: string;
  helpedSolve?: boolean;
  timeToSolve?: number;
}

export interface SubmitFeedbackResponse {
  success: boolean;
  updatedStats?: HintFeedbackStats;
  error?: string;
}

// ============================================================
// Component Props Types
// ============================================================

export interface SocraticHintLadderProps {
  questionText: string;
  questionId?: string;
  subject?: string;
  topic?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  userId: string;
  sessionId?: string;
  currentAnswer?: string;
  attemptsCount?: number;
  timeSpent?: number;
  skillLevel?: number;
  onHintUsed?: (hint: GeneratedHint) => void;
  onEscalation?: (type: EscalationType) => void;
  className?: string;
}

export interface HintMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevel: HintLevel | null;
  budget: HintBudget;
  hints: GeneratedHint[];
  onRequestHint: (level: HintLevel) => void;
  isGenerating: boolean;
  escalation?: EscalationState;
  onEscalate?: (type: EscalationType) => void;
}

export interface HintFeedbackProps {
  hintId: string;
  onSubmit: (feedback: { wasHelpful: boolean; feedbackType?: FeedbackType }) => void;
  isOpen: boolean;
}
