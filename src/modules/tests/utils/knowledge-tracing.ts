// ============================================
// KNOWLEDGE TRACING UTILITIES
// Bayesian Knowledge Tracing (BKT) Implementation
// Cognify Academic Performance OS
// ============================================

import type { RemediationPlan } from '@/modules/tests/types'

// ============================================
// BKT MODEL PARAMETERS
// ============================================

export interface BKTParameters {
  pLearn: number    // Probability of learning after an opportunity
  pGuess: number    // Probability of guessing correctly
  pSlip: number     // Probability of slipping (incorrect despite knowing)
  pInit: number     // Initial probability of knowing the skill
}

export interface SkillState {
  skillId: string
  pKnown: number    // Current probability of knowing the skill
  opportunities: number // Number of practice opportunities
  correctCount: number
  incorrectCount: number
  lastUpdated: Date
}

// Default BKT parameters (can be tuned per skill/topic)
export const DEFAULT_BKT_PARAMS: BKTParameters = {
  pLearn: 0.1,    // 10% chance to learn per opportunity
  pGuess: 0.25,   // 25% chance to guess (4 options)
  pSlip: 0.1,     // 10% chance to slip
  pInit: 0.2,     // 20% initial knowledge probability
}

// ============================================
// BAYESIAN KNOWLEDGE TRACING
// ============================================

/**
 * Update knowledge probability using BKT
 * 
 * P(K|correct) = P(K) * (1 - P(S)) / [P(K) * (1 - P(S)) + (1 - P(K)) * P(G)]
 * P(K|incorrect) = P(K) * P(S) / [P(K) * P(S) + (1 - P(K)) * (1 - P(G))]
 * 
 * After update: P(K_new) = P(K|response) + (1 - P(K|response)) * P(L)
 */
export function updateBKT(
  currentPKnown: number,
  isCorrect: boolean,
  params: BKTParameters = DEFAULT_BKT_PARAMS
): number {
  const { pLearn, pGuess, pSlip } = params
  
  // Calculate P(K|response) using Bayes' theorem
  let pKnownAfterResponse: number
  
  if (isCorrect) {
    // P(K|correct)
    const numerator = currentPKnown * (1 - pSlip)
    const denominator = currentPKnown * (1 - pSlip) + (1 - currentPKnown) * pGuess
    pKnownAfterResponse = denominator > 0 ? numerator / denominator : currentPKnown
  } else {
    // P(K|incorrect)
    const numerator = currentPKnown * pSlip
    const denominator = currentPKnown * pSlip + (1 - currentPKnown) * (1 - pGuess)
    pKnownAfterResponse = denominator > 0 ? numerator / denominator : currentPKnown
  }
  
  // Apply learning: P(K_new) = P(K|response) + (1 - P(K|response)) * P(L)
  const newPKnown = pKnownAfterResponse + (1 - pKnownAfterResponse) * pLearn
  
  // Clamp to [0, 1]
  return Math.max(0, Math.min(1, newPKnown))
}

/**
 * Predict probability of correct response
 * P(correct) = P(K) * (1 - P(S)) + (1 - P(K)) * P(G)
 */
export function predictCorrect(
  pKnown: number,
  params: BKTParameters = DEFAULT_BKT_PARAMS
): number {
  const { pGuess, pSlip } = params
  return pKnown * (1 - pSlip) + (1 - pKnown) * pGuess
}

/**
 * Calculate mastery threshold check
 * Returns true if skill is considered mastered
 */
export function isMastered(
  pKnown: number,
  threshold: number = 0.95
): boolean {
  return pKnown >= threshold
}

/**
 * Estimate number of additional practice opportunities needed
 * to reach mastery threshold
 */
export function estimateOpportunitiesToMastery(
  pKnown: number,
  params: BKTParameters = DEFAULT_BKT_PARAMS,
  threshold: number = 0.95,
  maxEstimate: number = 20
): number {
  let p = pKnown
  let opportunities = 0
  
  while (p < threshold && opportunities < maxEstimate) {
    // Assume correct response for best-case estimation
    p = updateBKT(p, true, params)
    opportunities++
  }
  
  return opportunities
}

// ============================================
// MULTI-SKILL KNOWLEDGE TRACING
// ============================================

export interface MultiSkillState {
  [skillId: string]: SkillState
}

/**
 * Initialize knowledge state for multiple skills
 */
export function initializeMultiSkillState(
  skillIds: string[],
  pInit: number = DEFAULT_BKT_PARAMS.pInit
): MultiSkillState {
  const state: MultiSkillState = {}
  const now = new Date()
  
  for (const skillId of skillIds) {
    state[skillId] = {
      skillId,
      pKnown: pInit,
      opportunities: 0,
      correctCount: 0,
      incorrectCount: 0,
      lastUpdated: now
    }
  }
  
  return state
}

/**
 * Update knowledge state for skills practiced in a question
 */
export function updateMultiSkillState(
  state: MultiSkillState,
  skillIds: string[],
  isCorrect: boolean,
  params: BKTParameters = DEFAULT_BKT_PARAMS
): MultiSkillState {
  const now = new Date()
  const newState = { ...state }
  
  for (const skillId of skillIds) {
    if (newState[skillId]) {
      const skill = newState[skillId]
      const newPKnown = updateBKT(skill.pKnown, isCorrect, params)
      
      newState[skillId] = {
        ...skill,
        pKnown: newPKnown,
        opportunities: skill.opportunities + 1,
        correctCount: skill.correctCount + (isCorrect ? 1 : 0),
        incorrectCount: skill.incorrectCount + (isCorrect ? 0 : 1),
        lastUpdated: now
      }
    }
  }
  
  return newState
}

/**
 * Get overall mastery percentage
 */
export function getOverallMastery(state: MultiSkillState): number {
  const skills = Object.values(state)
  if (skills.length === 0) return 0
  
  const totalMastery = skills.reduce((sum, skill) => sum + skill.pKnown, 0)
  return totalMastery / skills.length
}

/**
 * Get weakest skills needing attention
 */
export function getWeakestSkills(
  state: MultiSkillState,
  limit: number = 5
): SkillState[] {
  return Object.values(state)
    .sort((a, b) => a.pKnown - b.pKnown)
    .slice(0, limit)
}

/**
 * Get mastered skills
 */
export function getMasteredSkills(
  state: MultiSkillState,
  threshold: number = 0.95
): SkillState[] {
  return Object.values(state).filter(skill => isMastered(skill.pKnown, threshold))
}

// ============================================
// DEEP KNOWLEDGE TRACING (DKT) - Simplified
// ============================================

/**
 * Simplified DKT-like sequential model
 * Uses exponential moving average for knowledge estimation
 */
export interface DKTSkillState {
  skillId: string
  knowledgeEstimate: number
  recentResponses: boolean[] // Last N responses
  timestamps: number[]
}

/**
 * Update DKT state with new response
 */
export function updateDKTState(
  state: DKTSkillState,
  isCorrect: boolean,
  windowSize: number = 10
): DKTSkillState {
  const recentResponses = [...state.recentResponses, isCorrect].slice(-windowSize)
  const timestamps = [...state.timestamps, Date.now()].slice(-windowSize)
  
  // Calculate weighted knowledge estimate
  // More recent responses have higher weight
  let weightedSum = 0
  let totalWeight = 0
  
  for (let i = 0; i < recentResponses.length; i++) {
    const weight = i + 1 // Linear increasing weight
    weightedSum += (recentResponses[i] ? 1 : 0) * weight
    totalWeight += weight
  }
  
  const knowledgeEstimate = totalWeight > 0 ? weightedSum / totalWeight : 0.5
  
  return {
    ...state,
    knowledgeEstimate,
    recentResponses,
    timestamps
  }
}

// ============================================
// ADAPTIVE PRACTICE RECOMMENDATION
// ============================================

export interface PracticeRecommendation {
  skillId: string
  priority: number // 0-1, higher = more urgent
  estimatedQuestions: number
  reason: string
}

/**
 * Generate practice recommendations based on knowledge state
 */
export function generatePracticeRecommendations(
  state: MultiSkillState,
  targetMastery: number = 0.95,
  maxRecommendations: number = 5
): PracticeRecommendation[] {
  const recommendations: PracticeRecommendation[] = []
  
  for (const skill of Object.values(state)) {
    if (skill.pKnown < targetMastery) {
      const gap = targetMastery - skill.pKnown
      const estimatedQuestions = estimateOpportunitiesToMastery(skill.pKnown)
      
      recommendations.push({
        skillId: skill.skillId,
        priority: gap, // Higher gap = higher priority
        estimatedQuestions,
        reason: skill.pKnown < 0.5 
          ? 'Skill needs significant practice'
          : skill.pKnown < 0.8
            ? 'Skill is developing, continue practice'
            : 'Skill approaching mastery'
      })
    }
  }
  
  // Sort by priority (descending)
  return recommendations
    .sort((a, b) => b.priority - a.priority)
    .slice(0, maxRecommendations)
}

/**
 * Generate a remediation plan for weak areas
 */
export function generateRemediationPlan(
  state: MultiSkillState,
  userId: string,
  targetMastery: number = 0.85
): RemediationPlan {
  const weakSkills = getWeakestSkills(state, 3)
  const recommendations = generatePracticeRecommendations(state, targetMastery)
  
  // Calculate total estimated questions
  const totalQuestions = recommendations.reduce(
    (sum, r) => sum + r.estimatedQuestions * 3, // 3x for thorough practice
    0
  )
  
  return {
    id: `remediation-${Date.now()}`,
    userId,
    chapterId: weakSkills[0]?.skillId, // Primary weak skill
    planType: 'topic_weakness',
    targetScore: targetMastery * 100,
    microLessons: weakSkills.map(s => `lesson-${s.skillId}`),
    practiceItems: recommendations.flatMap(r => 
      Array(Math.ceil(r.estimatedQuestions)).fill(`question-${r.skillId}`)
    ),
    progress: 0,
    status: 'active',
    createdAt: new Date()
  }
}

// ============================================
// SPACED REPETITION INTEGRATION
// ============================================

export interface SpacedRepetitionItem {
  skillId: string
  lastPractice: Date
  nextReview: Date
  interval: number // Days
  easeFactor: number
}

/**
 * Calculate next review date using SM-2 algorithm variant
 */
export function calculateNextReview(
  item: SpacedRepetitionItem,
  quality: number // 0-5, 5 = perfect, 0 = complete failure
): SpacedRepetitionItem {
  let { interval, easeFactor } = item
  
  // Update ease factor
  easeFactor = Math.max(
    1.3,
    easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  )
  
  // Calculate new interval
  if (quality < 3) {
    // Failed - reset interval
    interval = 1
  } else {
    if (interval === 0) {
      interval = 1
    } else if (interval === 1) {
      interval = 6
    } else {
      interval = Math.round(interval * easeFactor)
    }
  }
  
  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + interval)
  
  return {
    ...item,
    lastPractice: new Date(),
    nextReview,
    interval,
    easeFactor
  }
}

/**
 * Get skills due for review
 */
export function getSkillsDueForReview(
  items: SpacedRepetitionItem[]
): SpacedRepetitionItem[] {
  const now = new Date()
  return items.filter(item => item.nextReview <= now)
    .sort((a, b) => a.nextReview.getTime() - b.nextReview.getTime())
}
