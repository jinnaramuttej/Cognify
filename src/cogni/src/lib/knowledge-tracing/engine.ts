/**
 * Cogni Core - Knowledge Tracing Engine
 * 
 * Hybrid model combining:
 * 1. Bayesian Knowledge Tracing (BKT) - Per-skill mastery estimation
 * 2. DeepKT-inspired short/long term states
 * 3. Forgetting curve integration
 * 
 * BKT Update Equations:
 * - If correct: P(Ln) = P(Ln-1) + P(T) * (1 - P(Ln-1))
 * - If incorrect: P(Ln) = P(Ln-1) * (1 - P(S)) / [P(Ln-1) * (1 - P(S)) + (1 - P(Ln-1)) * P(G)]
 */

// ============================================================
// Types & Interfaces
// ============================================================

export interface BKTParameters {
  pLearn: number;    // P(T) - Probability of learning after opportunity
  pGuess: number;    // P(G) - Probability of correct guess (not knowing)
  pSlip: number;     // P(S) - Probability of incorrect response (knowing)
  pKnow: number;     // P(L0) - Initial probability of knowing
}

export interface DeepKTState {
  shortTerm: number;   // Recent performance window (last N attempts)
  longTerm: number;    // Cumulative mastery estimate
  decayRate: number;   // Forgetting curve parameter
  lastUpdate: number;  // Timestamp of last update
}

export interface SkillState {
  skillId: string;
  bkt: BKTParameters;
  deepKT: DeepKTState;
  history: SkillHistoryEntry[];
  mastery: number;       // Combined mastery estimate [0, 1]
  attemptCount: number;
  correctCount: number;
  lastAttemptAt: Date | null;
}

export interface SkillHistoryEntry {
  timestamp: number;
  correct: boolean;
  pKnowBefore: number;
  pKnowAfter: number;
  responseTime?: number;
  itemId?: string;
}

export interface KTMasteryUpdate {
  skillId: string;
  correct: boolean;
  responseTime?: number;
  itemId?: string;
}

// ============================================================
// Default Parameters
// ============================================================

export const DEFAULT_BKT_PARAMS: BKTParameters = {
  pLearn: 0.1,   // 10% chance to learn per opportunity
  pGuess: 0.25,  // 25% guess rate (4 options)
  pSlip: 0.1,    // 10% slip rate
  pKnow: 0.5,    // 50% prior probability of knowing
};

// Subject-specific parameter adjustments
export const SUBJECT_PARAMS: Record<string, Partial<BKTParameters>> = {
  physics: { pLearn: 0.12, pSlip: 0.08 },
  chemistry: { pLearn: 0.11, pGuess: 0.2 },
  mathematics: { pLearn: 0.15, pSlip: 0.12 },
  biology: { pLearn: 0.08, pGuess: 0.25 },
};

// ============================================================
// Bayesian Knowledge Tracing Core
// ============================================================

/**
 * Update P(L) after a correct response
 * P(Ln) = P(Ln-1) * (1 - P(S)) / [P(Ln-1) * (1 - P(S)) + (1 - P(Ln-1)) * P(G)]
 * 
 * Wait, this is actually for incorrect. For correct:
 * P(Ln) = P(Ln-1) * (1 - P(S)) / P(C)
 * where P(C) = P(Ln-1) * (1 - P(S)) + (1 - P(Ln-1)) * P(G)
 */
export function updatePKnowAfterCorrect(params: BKTParameters): number {
  const { pKnow, pSlip, pGuess } = params;
  
  // P(correct | know) = 1 - P(slip)
  const pCorrectGivenKnow = 1 - pSlip;
  
  // P(correct | not know) = P(guess)
  const pCorrectGivenNotKnow = pGuess;
  
  // P(correct) = P(know) * P(correct|know) + P(not know) * P(correct|not know)
  const pCorrect = pKnow * pCorrectGivenKnow + (1 - pKnow) * pCorrectGivenNotKnow;
  
  // P(know | correct) = P(know) * P(correct|know) / P(correct)
  const pKnowAfterCorrect = pKnow * pCorrectGivenKnow / pCorrect;
  
  return pKnowAfterCorrect;
}

/**
 * Update P(L) after an incorrect response
 * P(Ln) = P(Ln-1) * P(S) / P(I)
 * where P(I) = P(Ln-1) * P(S) + (1 - P(Ln-1)) * (1 - P(G))
 */
export function updatePKnowAfterIncorrect(params: BKTParameters): number {
  const { pKnow, pSlip, pGuess } = params;
  
  // P(incorrect | know) = P(slip)
  const pIncorrectGivenKnow = pSlip;
  
  // P(incorrect | not know) = 1 - P(guess)
  const pIncorrectGivenNotKnow = 1 - pGuess;
  
  // P(incorrect)
  const pIncorrect = pKnow * pIncorrectGivenKnow + (1 - pKnow) * pIncorrectGivenNotKnow;
  
  // P(know | incorrect)
  const pKnowAfterIncorrect = pKnow * pIncorrectGivenKnow / pIncorrect;
  
  return pKnowAfterIncorrect;
}

/**
 * Apply learning transition after response
 * P(Ln) = P(Ln | response) + (1 - P(Ln | response)) * P(T)
 */
export function applyLearningTransition(pKnowAfterResponse: number, pLearn: number): number {
  return pKnowAfterResponse + (1 - pKnowAfterResponse) * pLearn;
}

/**
 * Full BKT update for a single response
 */
export function bktUpdate(
  currentParams: BKTParameters,
  correct: boolean
): BKTParameters {
  // Step 1: Update P(L) based on response
  const pKnowAfterResponse = correct
    ? updatePKnowAfterCorrect(currentParams)
    : updatePKnowAfterIncorrect(currentParams);
  
  // Step 2: Apply learning transition
  const pKnowAfterLearning = applyLearningTransition(pKnowAfterResponse, currentParams.pLearn);
  
  // Return updated parameters (only pKnow changes, other params are stable)
  return {
    ...currentParams,
    pKnow: Math.min(0.99, Math.max(0.01, pKnowAfterLearning)), // Clamp to avoid extremes
  };
}

// ============================================================
// DeepKT Extension (Short/Long Term States)
// ============================================================

/**
 * Update short-term state using exponential moving average
 * Captures recent performance trends
 */
export function updateShortTermState(
  currentState: number,
  correct: boolean,
  windowSize: number = 5
): number {
  const alpha = 2 / (windowSize + 1); // EMA smoothing factor
  const value = correct ? 1 : 0;
  return alpha * value + (1 - alpha) * currentState;
}

/**
 * Update long-term state using slower learning rate
 * Represents cumulative mastery
 */
export function updateLongTermState(
  currentState: number,
  correct: boolean,
  learningRate: number = 0.1
): number {
  const value = correct ? 1 : 0;
  const error = value - currentState;
  return currentState + learningRate * error;
}

/**
 * Apply forgetting curve decay based on time elapsed
 * R(t) = e^(-t/s) where s is stability
 */
export function applyForgettingDecay(
  currentState: number,
  timeElapsedHours: number,
  decayRate: number = 0.1
): number {
  const decayFactor = Math.exp(-decayRate * timeElapsedHours);
  const baseLevel = 0.5; // Minimum baseline
  return baseLevel + (currentState - baseLevel) * decayFactor;
}

/**
 * Full DeepKT state update
 */
export function deepKTUpdate(
  currentState: DeepKTState,
  correct: boolean,
  timeElapsedHours: number = 0
): DeepKTState {
  // Apply forgetting to long-term state
  const longTermAfterDecay = timeElapsedHours > 0
    ? applyForgettingDecay(currentState.longTerm, timeElapsedHours, currentState.decayRate)
    : currentState.longTerm;
  
  // Update states
  const newShortTerm = updateShortTermState(currentState.shortTerm, correct);
  const newLongTerm = updateLongTermState(longTermAfterDecay, correct);
  
  return {
    shortTerm: newShortTerm,
    longTerm: newLongTerm,
    decayRate: currentState.decayRate,
    lastUpdate: Date.now(),
  };
}

// ============================================================
// Hybrid Mastery Estimation
// ============================================================

/**
 * Combine BKT and DeepKT estimates into single mastery score
 * Weighted combination based on data availability and recency
 */
export function computeHybridMastery(
  bktPKnow: number,
  deepKTState: DeepKTState,
  attemptCount: number
): number {
  // Weights based on number of attempts (more attempts = more weight to BKT)
  const bktWeight = Math.min(0.7, 0.3 + attemptCount * 0.05);
  const deepKTWeight = 1 - bktWeight;
  
  // Combine short-term (recent) and long-term (cumulative) from DeepKT
  const shortTermWeight = 0.3;
  const longTermWeight = 0.7;
  const deepKTScore = shortTermWeight * deepKTState.shortTerm + 
                      longTermWeight * deepKTState.longTerm;
  
  // Weighted combination
  const mastery = bktWeight * bktPKnow + deepKTWeight * deepKTScore;
  
  return Math.max(0, Math.min(1, mastery));
}

// ============================================================
// Skill State Management
// ============================================================

/**
 * Initialize a new skill state
 */
export function initializeSkillState(
  skillId: string,
  subject?: string
): SkillState {
  const subjectParams = subject ? SUBJECT_PARAMS[subject] || {} : {};
  
  return {
    skillId,
    bkt: {
      ...DEFAULT_BKT_PARAMS,
      ...subjectParams,
    },
    deepKT: {
      shortTerm: 0.5,
      longTerm: 0.5,
      decayRate: 0.1,
      lastUpdate: Date.now(),
    },
    history: [],
    mastery: 0.5,
    attemptCount: 0,
    correctCount: 0,
    lastAttemptAt: null,
  };
}

/**
 * Update skill state after a response
 */
export function updateSkillState(
  state: SkillState,
  correct: boolean,
  options: {
    responseTime?: number;
    itemId?: string;
    timeElapsedHours?: number;
  } = {}
): SkillState {
  const { responseTime, itemId, timeElapsedHours = 0 } = options;
  
  // Store previous P(L) for history
  const pKnowBefore = state.bkt.pKnow;
  
  // Update BKT
  const updatedBKT = bktUpdate(state.bkt, correct);
  
  // Update DeepKT
  const updatedDeepKT = deepKTUpdate(state.deepKT, correct, timeElapsedHours);
  
  // Compute new mastery
  const newAttemptCount = state.attemptCount + 1;
  const mastery = computeHybridMastery(updatedBKT.pKnow, updatedDeepKT, newAttemptCount);
  
  // Add history entry
  const historyEntry: SkillHistoryEntry = {
    timestamp: Date.now(),
    correct,
    pKnowBefore,
    pKnowAfter: updatedBKT.pKnow,
    responseTime,
    itemId,
  };
  
  return {
    ...state,
    bkt: updatedBKT,
    deepKT: updatedDeepKT,
    history: [...state.history, historyEntry].slice(-50), // Keep last 50 entries
    mastery,
    attemptCount: newAttemptCount,
    correctCount: state.correctCount + (correct ? 1 : 0),
    lastAttemptAt: new Date(),
  };
}

/**
 * Get mastery level category
 */
export function getMasteryLevel(mastery: number): 'novice' | 'developing' | 'proficient' | 'expert' {
  if (mastery < 0.3) return 'novice';
  if (mastery < 0.6) return 'developing';
  if (mastery < 0.85) return 'proficient';
  return 'expert';
}

/**
 * Predict probability of correct response for a skill
 * P(correct) = P(know) * (1 - P(slip)) + (1 - P(know)) * P(guess)
 */
export function predictPerformance(state: SkillState): number {
  const { pKnow, pSlip, pGuess } = state.bkt;
  return pKnow * (1 - pSlip) + (1 - pKnow) * pGuess;
}

/**
 * Get skills that need practice (low mastery or due for review)
 */
export function getSkillsNeedingPractice(
  skills: SkillState[],
  options: {
    masteryThreshold?: number;
    maxTimeSincePractice?: number; // hours
  } = {}
): SkillState[] {
  const { masteryThreshold = 0.7, maxTimeSincePractice = 48 } = options;
  
  const now = Date.now();
  const maxTimeMs = maxTimeSincePractice * 60 * 60 * 1000;
  
  return skills.filter(skill => {
    // Low mastery
    if (skill.mastery < masteryThreshold) return true;
    
    // Due for review (forgetting curve)
    if (skill.lastAttemptAt) {
      const timeSincePractice = now - skill.lastAttemptAt.getTime();
      if (timeSincePractice > maxTimeMs) return true;
    }
    
    return false;
  }).sort((a, b) => a.mastery - b.mastery); // Sort by lowest mastery first
}

// ============================================================
// Export All
// ============================================================

export const KnowledgeTracingEngine = {
  // BKT Core
  updatePKnowAfterCorrect,
  updatePKnowAfterIncorrect,
  applyLearningTransition,
  bktUpdate,
  
  // DeepKT
  updateShortTermState,
  updateLongTermState,
  applyForgettingDecay,
  deepKTUpdate,
  
  // Hybrid
  computeHybridMastery,
  
  // State Management
  initializeSkillState,
  updateSkillState,
  getMasteryLevel,
  predictPerformance,
  getSkillsNeedingPractice,
};

export default KnowledgeTracingEngine;
