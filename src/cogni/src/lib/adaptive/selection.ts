/**
 * Cogni Core - Hybrid Adaptive Selection Algorithm
 * 
 * Combines IRT-based ability estimation with Knowledge Tracing
 * for optimal item selection that balances:
 * 1. Information gain (IRT Fisher Information)
 * 2. Skill mastery targeting (KT mastery gaps)
 * 3. Pedagogical constraints (topic coverage, exposure limits)
 * 4. Engagement factors (difficulty matching, variety)
 */

import { IRTEngine, type IRTItem, type AbilityEstimate } from '../irt/engine';
import { KnowledgeTracingEngine, type SkillState } from '../knowledge-tracing/engine';

// ============================================================
// Types & Interfaces
// ============================================================

export interface SelectionContext {
  userId: string;
  sessionId: string;
  theta: AbilityEstimate;
  skillStates: Map<string, SkillState>;
  selectedItems: Set<string>;
  topicExposure: Map<string, number>;
  teacherOverrides?: TeacherOverrides;
}

export interface TeacherOverrides {
  forceTopic?: string;
  forceDifficulty?: 'easy' | 'medium' | 'hard';
  skipItems?: string[];
  allowedTopics?: string[];
  blockedItems?: string[];
}

export interface PedagogicalConstraints {
  maxExposurePerItem: number;
  maxExposurePerTopic: number;
  minTopicCoverage: number;
  targetDifficultyRange: [number, number];
  requireUnseenItems: boolean;
}

export interface SelectionResult {
  item: IRTItem | null;
  reason: SelectionReason;
  alternateItems: IRTItem[];
  expectedInfo: number;
  expectedMasteryGain: number;
  thetaTarget: number;
}

export interface SelectionReason {
  primary: 'max_information' | 'skill_targeting' | 'topic_coverage' | 'teacher_override' | 'fallback';
  secondary: string[];
  score: number;
}

export interface ItemScore {
  item: IRTItem;
  informationScore: number;
  masteryScore: number;
  varietyScore: number;
  constraintScore: number;
  totalScore: number;
}

// ============================================================
// Default Constraints
// ============================================================

export const DEFAULT_CONSTRAINTS: PedagogicalConstraints = {
  maxExposurePerItem: 3,
  maxExposurePerTopic: 10,
  minTopicCoverage: 0.8,
  targetDifficultyRange: [-1, 1], // θ range around current ability
  requireUnseenItems: true,
};

// ============================================================
// Scoring Functions
// ============================================================

/**
 * Calculate information-based score
 * Higher Fisher information = better item for estimating θ
 */
function scoreInformation(theta: number, item: IRTItem): number {
  return IRTEngine.fisherInformation(theta, item);
}

/**
 * Calculate mastery-targeting score
 * Prioritize items that target skills needing practice
 */
function scoreMasteryTargeting(
  item: IRTItem,
  skillStates: Map<string, SkillState>
): number {
  if (!item.skillId) return 0;
  
  const skillState = skillStates.get(item.skillId);
  if (!skillState) return 0;
  
  // Higher score for lower mastery skills
  const masteryGap = 1 - skillState.mastery;
  
  // Consider prediction accuracy
  const predictedPerformance = KnowledgeTracingEngine.predictPerformance(skillState);
  const optimalDifficulty = 0.5; // Target 50% success rate
  const difficultyMatch = 1 - Math.abs(predictedPerformance - optimalDifficulty);
  
  return masteryGap * 0.7 + difficultyMatch * 0.3;
}

/**
 * Calculate variety/exposure score
 * Penalize over-exposed items
 */
function scoreVariety(
  item: IRTItem,
  selectedItems: Set<string>,
  topicExposure: Map<string, number>,
  constraints: PedagogicalConstraints
): number {
  // Penalize already-seen items
  const seenPenalty = selectedItems.has(item.id) ? 0.3 : 1.0;
  
  // Penalize over-exposed topics
  const topicCount = item.topic ? topicExposure.get(item.topic) || 0 : 0;
  const topicPenalty = Math.max(0.5, 1 - topicCount / constraints.maxExposurePerTopic);
  
  // Penalize over-exposed items
  const exposurePenalty = Math.max(0.3, 1 - (item.exposureCount || 0) / constraints.maxExposurePerItem);
  
  return seenPenalty * topicPenalty * exposurePenalty;
}

/**
 * Calculate constraint compliance score
 */
function scoreConstraints(
  item: IRTItem,
  theta: number,
  constraints: PedagogicalConstraints,
  overrides?: TeacherOverrides
): number {
  let score = 1.0;
  
  // Difficulty range check
  const itemDifficulty = item.b; // IRT difficulty parameter
  const [minDiff, maxDiff] = constraints.targetDifficultyRange;
  const targetMin = theta + minDiff;
  const targetMax = theta + maxDiff;
  
  if (itemDifficulty < targetMin || itemDifficulty > targetMax) {
    score *= 0.5; // Penalize out-of-range items
  }
  
  // Teacher override: force difficulty
  if (overrides?.forceDifficulty) {
    const difficultyMap = { easy: -1, medium: 0, hard: 1 };
    const targetDiff = difficultyMap[overrides.forceDifficulty];
    const diffDistance = Math.abs(itemDifficulty - targetDiff);
    score *= Math.max(0.2, 1 - diffDistance * 0.3);
  }
  
  // Teacher override: blocked items
  if (overrides?.blockedItems?.includes(item.id)) {
    score = 0; // Hard block
  }
  
  // Teacher override: allowed topics
  if (overrides?.allowedTopics && item.topic) {
    if (!overrides.allowedTopics.includes(item.topic)) {
      score = 0; // Hard constraint
    }
  }
  
  return score;
}

// ============================================================
// Main Selection Algorithm
// ============================================================

/**
 * Select next item using hybrid IRT + KT algorithm
 * 
 * Pseudocode:
 * 1. Filter items by hard constraints (blocked, embargoed)
 * 2. Apply teacher overrides if present
 * 3. Score remaining items on multiple dimensions
 * 4. Combine scores with weighted sum
 * 5. Select highest-scoring item
 * 6. Fall back gracefully if no suitable items
 */
export function selectNextItem(
  availableItems: IRTItem[],
  context: SelectionContext,
  constraints: PedagogicalConstraints = DEFAULT_CONSTRAINTS
): SelectionResult {
  const { theta, skillStates, selectedItems, topicExposure, teacherOverrides } = context;
  
  // Step 1: Filter by hard constraints
  let candidateItems = availableItems.filter(item => {
    // Embargoed items
    if (item.exposureCount !== undefined && item.exposureCount >= constraints.maxExposurePerItem) {
      return false;
    }
    
    // Blocked items (teacher override)
    if (teacherOverrides?.blockedItems?.includes(item.id)) {
      return false;
    }
    
    // Topic restrictions (teacher override)
    if (teacherOverrides?.allowedTopics && item.topic) {
      if (!teacherOverrides.allowedTopics.includes(item.topic)) {
        return false;
      }
    }
    
    return true;
  });
  
  // Step 2: Apply teacher force topic override
  if (teacherOverrides?.forceTopic) {
    const topicItems = candidateItems.filter(item => item.topic === teacherOverrides.forceTopic);
    if (topicItems.length > 0) {
      candidateItems = topicItems;
    }
  }
  
  // Step 3: Check if we have items
  if (candidateItems.length === 0) {
    return {
      item: null,
      reason: {
        primary: 'fallback',
        secondary: ['No items available after constraint filtering'],
        score: 0,
      },
      alternateItems: [],
      expectedInfo: 0,
      expectedMasteryGain: 0,
      thetaTarget: theta.theta,
    };
  }
  
  // Step 4: Score all candidate items
  const scoredItems: ItemScore[] = candidateItems.map(item => {
    const informationScore = scoreInformation(theta.theta, item);
    const masteryScore = scoreMasteryTargeting(item, skillStates);
    const varietyScore = scoreVariety(item, selectedItems, topicExposure, constraints);
    const constraintScore = scoreConstraints(item, theta.theta, constraints, teacherOverrides);
    
    // Weighted combination
    // - Information: 40% (primary goal)
    // - Mastery targeting: 30% (pedagogical relevance)
    // - Variety: 15% (engagement)
    // - Constraints: 15% (compliance)
    const totalScore = (
      informationScore * 0.4 +
      masteryScore * 0.3 +
      varietyScore * 0.15 +
      constraintScore * 0.15
    );
    
    return {
      item,
      informationScore,
      masteryScore,
      varietyScore,
      constraintScore,
      totalScore,
    };
  });
  
  // Step 5: Sort by total score
  scoredItems.sort((a, b) => b.totalScore - a.totalScore);
  
  // Step 6: Select best item
  const best = scoredItems[0];
  const alternates = scoredItems.slice(1, 4).map(s => s.item);
  
  // Determine primary reason
  let primaryReason: SelectionReason['primary'] = 'max_information';
  const secondaryReasons: string[] = [];
  
  if (teacherOverrides?.forceTopic) {
    primaryReason = 'teacher_override';
    secondaryReasons.push(`Forced topic: ${teacherOverrides.forceTopic}`);
  } else if (best.masteryScore > best.informationScore * 0.7) {
    primaryReason = 'skill_targeting';
    secondaryReasons.push(`Targeting skill gap: ${best.item.skillId || 'unknown'}`);
  }
  
  if (best.varietyScore < 0.8) {
    secondaryReasons.push('Variety adjustment applied');
  }
  
  // Calculate expected outcomes
  const expectedInfo = best.informationScore;
  const expectedMasteryGain = best.masteryScore;
  
  // Target theta for this item (where it provides max info)
  const thetaTarget = IRTEngine.optimalTheta(best.item);
  
  return {
    item: best.item,
    reason: {
      primary: primaryReason,
      secondary: secondaryReasons,
      score: best.totalScore,
    },
    alternateItems: alternates,
    expectedInfo,
    expectedMasteryGain,
    thetaTarget,
  };
}

/**
 * Select item for initial theta estimation
 * Uses items with high information near θ = 0
 */
export function selectInitialItem(
  availableItems: IRTItem[],
  excludedIds: Set<string> = new Set()
): IRTItem | null {
  // Target θ = 0 for initial items
  const targetTheta = 0;
  
  let bestItem: IRTItem | null = null;
  let maxInfo = -Infinity;
  
  for (const item of availableItems) {
    if (excludedIds.has(item.id)) continue;
    
    // Prefer items with difficulty near 0
    const difficultyPenalty = Math.abs(item.b) * 0.2;
    const info = IRTEngine.fisherInformation(targetTheta, item) - difficultyPenalty;
    
    if (info > maxInfo) {
      maxInfo = info;
      bestItem = item;
    }
  }
  
  return bestItem;
}

/**
 * Check if testing should continue
 */
export function shouldContinueTesting(
  theta: AbilityEstimate,
  items: IRTItem[],
  options: {
    maxItems?: number;
    targetSE?: number;
    minItems?: number;
    currentItemIndex?: number;
  } = {}
): { continue: boolean; reason: string } {
  const { maxItems = 50, targetSE = 0.3, minItems = 10, currentItemIndex = 0 } = options;
  
  // Check minimum items
  if (currentItemIndex < minItems) {
    return { continue: true, reason: 'Minimum items not reached' };
  }
  
  // Check maximum items
  if (currentItemIndex >= maxItems) {
    return { continue: false, reason: 'Maximum items reached' };
  }
  
  // Check precision target
  if (theta.se <= targetSE) {
    return { continue: false, reason: `Target precision achieved (SE = ${theta.se.toFixed(3)})` };
  }
  
  // Check if any items provide meaningful information
  const maxPossibleInfo = Math.max(
    ...items.map(item => IRTEngine.fisherInformation(theta.theta, item))
  );
  
  if (maxPossibleInfo < 0.1) {
    return { continue: false, reason: 'No items provide sufficient information at current θ' };
  }
  
  return { continue: true, reason: 'Precision target not yet achieved' };
}

/**
 * Calculate test progress metrics
 */
export function calculateProgress(
  theta: AbilityEstimate,
  targetSE: number = 0.3
): {
  precisionProgress: number;
  thetaChange: number;
  reliability: number;
} {
  // Precision progress (0 to 1, where 1 = target achieved)
  const initialSE = 1.0;
  const precisionProgress = Math.min(1, (initialSE - theta.se) / (initialSE - targetSE));
  
  // Theta stability (lower change = more stable)
  const thetaChange = theta.confidence;
  
  // Reliability estimate
  const reliability = 1 - Math.pow(theta.se, 2);
  
  return {
    precisionProgress,
    thetaChange,
    reliability,
  };
}

// ============================================================
// Topic Coverage Analysis
// ============================================================

/**
 * Analyze topic coverage for the session
 */
export function analyzeTopicCoverage(
  selectedItems: IRTItem[],
  allTopics: string[]
): {
  coveredTopics: string[];
  uncoveredTopics: string[];
  coverageRatio: number;
  topicCounts: Map<string, number>;
} {
  const topicCounts = new Map<string, number>();
  
  for (const item of selectedItems) {
    if (item.topic) {
      topicCounts.set(item.topic, (topicCounts.get(item.topic) || 0) + 1);
    }
  }
  
  const coveredTopics = Array.from(topicCounts.keys());
  const uncoveredTopics = allTopics.filter(t => !coveredTopics.includes(t));
  const coverageRatio = coveredTopics.length / allTopics.length;
  
  return {
    coveredTopics,
    uncoveredTopics,
    coverageRatio,
    topicCounts,
  };
}

/**
 * Get recommended next topic based on coverage gaps
 */
export function getRecommendedTopic(
  coverage: ReturnType<typeof analyzeTopicCoverage>,
  skillStates: Map<string, SkillState>
): string | null {
  // Prioritize uncovered topics
  if (coverage.uncoveredTopics.length > 0) {
    return coverage.uncoveredTopics[0];
  }
  
  // Find topics with lowest average mastery
  const topicMastery = new Map<string, number[]>();
  
  for (const [skillId, state] of skillStates) {
    // Assume skillId contains topic info or map separately
    const topic = skillId.split('_')[0]; // Simple extraction
    if (!topicMastery.has(topic)) {
      topicMastery.set(topic, []);
    }
    topicMastery.get(topic)!.push(state.mastery);
  }
  
  let lowestMasteryTopic: string | null = null;
  let lowestAvgMastery = Infinity;
  
  for (const [topic, masteries] of topicMastery) {
    const avg = masteries.reduce((a, b) => a + b, 0) / masteries.length;
    if (avg < lowestAvgMastery) {
      lowestAvgMastery = avg;
      lowestMasteryTopic = topic;
    }
  }
  
  return lowestMasteryTopic;
}

// ============================================================
// Export All
// ============================================================

export const AdaptiveSelection = {
  selectNextItem,
  selectInitialItem,
  shouldContinueTesting,
  calculateProgress,
  analyzeTopicCoverage,
  getRecommendedTopic,
};

export default AdaptiveSelection;
