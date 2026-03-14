/**
 * Socratic Hint Ladder Module - Exports
 */

// Components
export { SocraticHintLadder } from './components/SocraticHintLadder';
export { SocraticHintLadderDemo } from './components/SocraticHintLadderDemo';

// Types
export type {
  HintLevel,
  HintLevelConfig,
  HintContext,
  GeneratedHint,
  HintBudget,
  HintBudgetConfig,
  EscalationState,
  EscalationType,
  FeedbackRating,
  FeedbackType,
  HintFeedbackInput,
  SocraticHintLadderProps,
} from '@/lib/socratic/types';

export { HINT_LEVELS, DEFAULT_BUDGET_CONFIG } from '@/lib/socratic/types';

// Budget Logic
export {
  calculateHintCost,
  canAffordHint,
  deductHintCost,
  createInitialBudget,
  adjustBudgetForPerformance,
  checkEscalation,
  getEscalationDescription,
  getBudgetStatusText,
  recommendNextHintLevel,
  calculateQualityScore,
  meetsQualityThreshold,
} from '@/lib/socratic/budget-logic';

// Prompt Templates
export {
  SYSTEM_PROMPTS,
  USER_PROMPT_TEMPLATES,
  ESCALATION_PROMPTS,
  buildHintPrompt,
  buildEscalationPrompt,
  DEFAULT_HINT_TEMPLATES,
} from '@/lib/socratic/prompt-templates';
