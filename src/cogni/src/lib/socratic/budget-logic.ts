/**
 * Socratic Hint Ladder - Budget Logic
 * 
 * Manages hint budgets, weights, and adaptive adjustments
 */

import type { HintLevel, HintBudget, HintBudgetConfig, EscalationState, EscalationType } from './types';
import { DEFAULT_BUDGET_CONFIG } from './types';

// ============================================================
// Budget Calculation Functions
// ============================================================

/**
 * Calculate the cost of a hint based on its level
 */
export function calculateHintCost(level: HintLevel, config: HintBudgetConfig): number {
  return config.levelWeights[level];
}

/**
 * Check if a hint can be afforded within the budget
 */
export function canAffordHint(
  level: HintLevel,
  budget: HintBudget,
  config: HintBudgetConfig = DEFAULT_BUDGET_CONFIG
): { canAfford: boolean; reason?: string } {
  const cost = calculateHintCost(level, config);
  
  // Check total budget
  if (budget.remaining < cost) {
    return { 
      canAfford: false, 
      reason: `Insufficient hint budget. Need ${cost}, have ${budget.remaining.toFixed(1)}.` 
    };
  }
  
  // Check level-4 specific limit
  if (level === 4 && budget.level4Used >= config.maxLevel4PerSession) {
    return { 
      canAfford: false, 
      reason: `Maximum full solutions (${config.maxLevel4PerSession}) reached for this session.` 
    };
  }
  
  return { canAfford: true };
}

/**
 * Deduct hint cost from budget
 */
export function deductHintCost(
  level: HintLevel,
  budget: HintBudget,
  config: HintBudgetConfig = DEFAULT_BUDGET_CONFIG
): HintBudget {
  const cost = calculateHintCost(level, config);
  
  return {
    ...budget,
    remaining: Math.max(0, budget.remaining - cost),
    used: budget.used + 1,
    level4Used: level === 4 ? budget.level4Used + 1 : budget.level4Used,
  };
}

/**
 * Create initial budget from config
 */
export function createInitialBudget(config: HintBudgetConfig = DEFAULT_BUDGET_CONFIG): HintBudget {
  const total = config.maxHintsPerSession * config.levelWeights[1] * 2;
  return {
    total,
    remaining: total,
    used: 0,
    level4Used: 0,
    maxLevel4: config.maxLevel4PerSession,
    escalationThreshold: config.escalationThreshold,
    isEscalationTriggered: false,
  };
}

/**
 * Adjust budget based on student performance
 */
export function adjustBudgetForPerformance(
  budget: HintBudget,
  wasCorrect: boolean,
  config: HintBudgetConfig = DEFAULT_BUDGET_CONFIG
): HintBudget {
  let adjustment = 0;
  
  if (wasCorrect && config.reduceOnCorrect) {
    adjustment = -config.levelWeights[1] * 0.5;
  } else if (!wasCorrect && config.increaseOnStruggle) {
    adjustment = config.levelWeights[1] * 0.25;
  }
  
  return {
    ...budget,
    total: Math.max(10, budget.total + adjustment),
    remaining: Math.max(0, budget.remaining + adjustment),
  };
}

// ============================================================
// Escalation Logic
// ============================================================

/**
 * Check if escalation should be triggered
 */
export function checkEscalation(
  budget: HintBudget,
  level4Count: number,
  config: HintBudgetConfig = DEFAULT_BUDGET_CONFIG
): EscalationState {
  const isTriggered = level4Count >= config.escalationThreshold;
  
  return {
    isTriggered,
    triggerCount: level4Count,
    recommendedAction: getRecommendedEscalationAction(level4Count),
    availableOptions: getAvailableEscalationOptions(level4Count),
  };
}

/**
 * Get recommended escalation action based on struggle pattern
 */
function getRecommendedEscalationAction(level4Count: number): EscalationType {
  if (level4Count >= 5) {
    return 'teacher_help';
  } else if (level4Count >= 4) {
    return 'eli5';
  }
  return 'worked_example';
}

/**
 * Get available escalation options
 */
function getAvailableEscalationOptions(level4Count: number): EscalationType[] {
  const options: EscalationType[] = [];
  
  if (level4Count >= 3) {
    options.push('eli5', 'worked_example');
  }
  if (level4Count >= 4) {
    options.push('video');
  }
  if (level4Count >= 5) {
    options.push('teacher_help');
  }
  
  return options;
}

/**
 * Get escalation content description
 */
export function getEscalationDescription(type: EscalationType): {
  title: string;
  description: string;
  icon: string;
} {
  const descriptions: Record<EscalationType, { title: string; description: string; icon: string }> = {
    eli5: {
      title: 'Explain Like I\'m 5',
      description: 'A simple, story-based explanation using everyday examples',
      icon: 'Baby',
    },
    worked_example: {
      title: 'Worked Example',
      description: 'See a similar problem solved step-by-step',
      icon: 'FileText',
    },
    video: {
      title: 'Video Explanation',
      description: 'Watch a short video explaining this concept',
      icon: 'Video',
    },
    teacher_help: {
      title: 'Get Teacher Help',
      description: 'Request help from your teacher or a tutor',
      icon: 'Users',
    },
  };
  
  return descriptions[type];
}

// ============================================================
// Budget Display Helpers
// ============================================================

/**
 * Get budget status text for display
 */
export function getBudgetStatusText(budget: HintBudget): {
  status: 'good' | 'warning' | 'critical';
  text: string;
} {
  const percentRemaining = (budget.remaining / budget.total) * 100;
  
  if (percentRemaining > 50) {
    return {
      status: 'good',
      text: `${Math.round(budget.remaining)} hint credits remaining`,
    };
  } else if (percentRemaining > 20) {
    return {
      status: 'warning',
      text: `${Math.round(budget.remaining)} credits left - use hints wisely`,
    };
  } else {
    return {
      status: 'critical',
      text: `Only ${Math.round(budget.remaining)} credits remaining`,
    };
  }
}

/**
 * Calculate recommended next hint level based on context
 */
export function recommendNextHintLevel(
  previousLevels: HintLevel[],
  attempts: number,
  skillLevel: number = 0.5
): HintLevel {
  // No hints yet - start with level 1
  if (previousLevels.length === 0) {
    return 1;
  }
  
  const lastLevel = previousLevels[previousLevels.length - 1];
  
  // High skill level - try to skip ahead
  if (skillLevel > 0.7 && attempts <= 1) {
    return Math.min(lastLevel + 1, 3) as HintLevel;
  }
  
  // Low skill level + multiple attempts - escalate faster
  if (skillLevel < 0.3 && attempts >= 2) {
    return Math.min(lastLevel + 2, 4) as HintLevel;
  }
  
  // Progressive approach - increment by 1
  if (attempts >= 2 && lastLevel < 4) {
    return Math.min(lastLevel + 1, 4) as HintLevel;
  }
  
  // Stay at same level if just starting
  return lastLevel;
}

// ============================================================
// Quality Scoring Functions
// ============================================================

/**
 * Calculate quality score from feedback
 */
export function calculateQualityScore(
  helpfulCount: number,
  unhelpfulCount: number,
  avgRating: number
): number {
  // Weighted combination of helpfulness ratio and rating
  const helpfulnessRatio = helpfulCount / (helpfulCount + unhelpfulCount || 1);
  const normalizedRating = (avgRating - 1) / 4; // Normalize 1-5 to 0-1
  
  return (helpfulnessRatio * 0.6 + normalizedRating * 0.4) * 5; // Scale to 0-5
}

/**
 * Check if quality meets acceptance criteria (> 4/5)
 */
export function meetsQualityThreshold(score: number, threshold: number = 4.0): boolean {
  return score >= threshold;
}

const budgetLogicExports = {
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
};

export default budgetLogicExports;
