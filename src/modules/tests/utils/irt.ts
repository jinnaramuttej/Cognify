// ============================================
// IRT (Item Response Theory) Utilities
// Cognify Academic Performance OS
// ============================================

import type { IRTParameters, ThetaRecord, ItemStats } from '@/modules/tests/types'

// ============================================
// 3PL MODEL - Three Parameter Logistic Model
// ============================================

/**
 * Calculate the probability of a correct response using the 3PL model
 * P(θ) = c + (1 - c) / (1 + e^(-a(θ - b)))
 * 
 * @param theta - Ability parameter (typically -3 to +3)
 * @param params - IRT parameters (a, b, c)
 * @returns Probability of correct response (0 to 1)
 */
export function calculateProbability(
  theta: number,
  params: IRTParameters
): number {
  const { a, b, c } = params
  const exponent = -a * (theta - b)
  // Prevent overflow
  const clampedExponent = Math.max(-20, Math.min(20, exponent))
  return c + (1 - c) / (1 + Math.exp(clampedExponent))
}

/**
 * Calculate the item information function
 * I(θ) = a² * P(θ) * Q(θ) * [(P(θ) - c) / (1 - c)]² / P(θ)
 * Simplified: I(θ) = a² * P(θ) * (1 - P(θ)) * [(P(θ) - c) / ((1 - c) * P(θ))]²
 * 
 * @param theta - Ability parameter
 * @param params - IRT parameters
 * @returns Information value
 */
export function calculateInformation(
  theta: number,
  params: IRTParameters
): number {
  const p = calculateProbability(theta, params)
  if (p <= 0 || p >= 1) return 0
  
  const { a, c } = params
  const q = 1 - p
  
  // Fisher information for 3PL
  const numerator = Math.pow(a, 2) * Math.pow(p - c, 2) * q
  const denominator = Math.pow(1 - c, 2) * p
  
  return numerator / denominator
}

/**
 * Calculate the test information function (sum of item informations)
 * 
 * @param theta - Ability parameter
 * @param items - Array of IRT parameters for all items
 * @returns Total test information
 */
export function calculateTestInformation(
  theta: number,
  items: IRTParameters[]
): number {
  return items.reduce((sum, item) => sum + calculateInformation(theta, item), 0)
}

// ============================================
// ABILITY ESTIMATION
// ============================================

/**
 * Estimate ability (θ) using Maximum Likelihood Estimation (MLE)
 * Uses Newton-Raphson iteration
 * 
 * @param responses - Array of response records
 * @param items - Array of IRT parameters for administered items
 * @param maxIterations - Maximum iterations for convergence
 * @param tolerance - Convergence tolerance
 * @returns Estimated theta and standard error
 */
export function estimateThetaMLE(
  responses: { isCorrect: boolean; params: IRTParameters }[],
  maxIterations: number = 50,
  tolerance: number = 0.001
): { theta: number; standardError: number } {
  // Start with prior theta of 0
  let theta = 0
  
  for (let iter = 0; iter < maxIterations; iter++) {
    let firstDerivative = 0
    let secondDerivative = 0
    
    for (const response of responses) {
      const { params, isCorrect } = response
      const { a, b, c } = params
      
      const p = calculateProbability(theta, params)
      const q = 1 - p
      
      // First derivative (gradient)
      const term1 = (isCorrect ? 1 : 0) - p
      const term2 = a * (p - c) / ((1 - c) * p)
      firstDerivative += term1 * term2
      
      // Second derivative (Hessian approximation)
      secondDerivative -= Math.pow(a * (p - c) / (1 - c), 2) * q / p
    }
    
    // Newton-Raphson update
    if (Math.abs(secondDerivative) < 0.0001) break
    
    const delta = firstDerivative / secondDerivative
    theta = theta - delta
    
    // Check convergence
    if (Math.abs(delta) < tolerance) break
    
    // Clamp theta to reasonable range
    theta = Math.max(-4, Math.min(4, theta))
  }
  
  // Calculate standard error
  const testInfo = calculateTestInformation(
    theta,
    responses.map(r => r.params)
  )
  const standardError = testInfo > 0 ? 1 / Math.sqrt(testInfo) : 1
  
  return { theta, standardError }
}

/**
 * Estimate ability using Expected A Posteriori (EAP)
 * Bayesian estimation with standard normal prior
 * 
 * @param responses - Array of response records
 * @param quadraturePoints - Number of quadrature points (default 41)
 * @returns Estimated theta and standard error
 */
export function estimateThetaEAP(
  responses: { isCorrect: boolean; params: IRTParameters }[],
  quadraturePoints: number = 41
): { theta: number; standardError: number } {
  // Quadrature points from -4 to 4
  const thetaPoints: number[] = []
  const weights: number[] = []
  const step = 8 / (quadraturePoints - 1)
  
  for (let i = 0; i < quadraturePoints; i++) {
    const t = -4 + i * step
    thetaPoints.push(t)
    // Standard normal weight (simplified)
    weights.push(Math.exp(-0.5 * t * t) / Math.sqrt(2 * Math.PI))
  }
  
  // Calculate likelihood at each quadrature point
  const likelihoods: number[] = thetaPoints.map(theta => {
    let likelihood = 1
    for (const response of responses) {
      const p = calculateProbability(theta, response.params)
      likelihood *= response.isCorrect ? p : (1 - p)
    }
    return likelihood
  })
  
  // Calculate posterior
  const posteriors = likelihoods.map((l, i) => l * weights[i])
  const totalPosterior = posteriors.reduce((sum, p) => sum + p, 0)
  
  if (totalPosterior === 0) {
    return { theta: 0, standardError: 1 }
  }
  
  // EAP estimate (mean of posterior)
  const theta = posteriors.reduce((sum, p, i) => sum + p * thetaPoints[i], 0) / totalPosterior
  
  // Standard error (standard deviation of posterior)
  const variance = posteriors.reduce((sum, p, i) => {
    return sum + p * Math.pow(thetaPoints[i] - theta, 2)
  }, 0) / totalPosterior
  
  return { theta, standardError: Math.sqrt(variance) }
}

// ============================================
// ITEM SELECTION - Adaptive Testing
// ============================================

/**
 * Select the next item using Maximum Information criterion
 * 
 * @param currentTheta - Current ability estimate
 * @param availableItems - Items available for selection
 * @param administeredItems - Items already administered
 * @returns Best item for selection or null if none available
 */
export function selectNextItem(
  currentTheta: number,
  availableItems: Array<{ id: string; params: IRTParameters }>,
  administeredItems: string[]
): { id: string; information: number } | null {
  // Filter out already administered items
  const candidateItems = availableItems.filter(
    item => !administeredItems.includes(item.id)
  )
  
  if (candidateItems.length === 0) return null
  
  // Find item with maximum information at current theta
  let bestItem = null
  let maxInformation = -Infinity
  
  for (const item of candidateItems) {
    const info = calculateInformation(currentTheta, item.params)
    if (info > maxInformation) {
      maxInformation = info
      bestItem = { id: item.id, information: info }
    }
  }
  
  return bestItem
}

/**
 * Select items using Balanced Adaptive Testing Strategy (BATS)
 * Balances information gain with content coverage
 * 
 * @param currentTheta - Current ability estimate
 * @param availableItems - Items available for selection
 * @param administeredItems - Items already administered
 * @param contentAreas - Content area assignments for items
 * @param targetDistribution - Target distribution across content areas
 * @returns Best item for selection
 */
export function selectNextItemBalanced(
  currentTheta: number,
  availableItems: Array<{ id: string; params: IRTParameters; contentArea: string }>,
  administeredItems: string[],
  targetDistribution: Record<string, number>
): { id: string; information: number } | null {
  const candidateItems = availableItems.filter(
    item => !administeredItems.includes(item.id)
  )
  
  if (candidateItems.length === 0) return null
  
  // Count current distribution
  const currentCounts: Record<string, number> = {}
  for (const item of availableItems) {
    if (administeredItems.includes(item.id)) {
      currentCounts[item.contentArea] = (currentCounts[item.contentArea] || 0) + 1
    }
  }
  
  // Calculate deficiency for each content area
  const totalAdministered = administeredItems.length
  const deficiencies: Record<string, number> = {}
  
  for (const [area, target] of Object.entries(targetDistribution)) {
    const current = currentCounts[area] || 0
    const targetCount = totalAdministered * target
    deficiencies[area] = Math.max(0, targetCount - current)
  }
  
  // Score each item (information + balance bonus)
  let bestItem = null
  let bestScore = -Infinity
  
  for (const item of candidateItems) {
    const info = calculateInformation(currentTheta, item.params)
    const balanceBonus = (deficiencies[item.contentArea] || 0) * 0.5
    const score = info + balanceBonus
    
    if (score > bestScore) {
      bestScore = score
      bestItem = { id: item.id, information: info }
    }
  }
  
  return bestItem
}

// ============================================
// STOPPING RULES
// ============================================

/**
 * Check if adaptive test should stop
 * 
 * @param standardError - Current standard error of ability estimate
 * @param minItems - Minimum items required
 * @param maxItems - Maximum items allowed
 * @param administeredCount - Number of items administered
 * @param targetSE - Target standard error
 * @returns Whether to stop and reason
 */
export function shouldStop(
  standardError: number,
  minItems: number,
  maxItems: number,
  administeredCount: number,
  targetSE: number = 0.3
): { stop: boolean; reason: string } {
  if (administeredCount < minItems) {
    return { stop: false, reason: 'minimum_not_reached' }
  }
  
  if (administeredCount >= maxItems) {
    return { stop: true, reason: 'maximum_reached' }
  }
  
  if (standardError <= targetSE) {
    return { stop: true, reason: 'precision_achieved' }
  }
  
  return { stop: false, reason: 'continue' }
}

// ============================================
// ITEM CALIBRATION
// ============================================

/**
 * Calculate classical test theory statistics for an item
 * 
 * @param responses - Array of responses (1 = correct, 0 = incorrect)
 * @param totalScores - Total scores for all students
 * @returns CTT statistics
 */
export function calculateCTTStats(
  responses: number[],
  totalScores: number[]
): {
  pValue: number
  discriminationIndex: number
  pointBiserial: number
} {
  const n = responses.length
  if (n === 0) return { pValue: 0.5, discriminationIndex: 0, pointBiserial: 0 }
  
  // P-value (proportion correct)
  const pValue = responses.reduce((sum, r) => sum + r, 0) / n
  
  // Point-biserial correlation
  const meanTotal = totalScores.reduce((sum, s) => sum + s, 0) / n
  const sdTotal = Math.sqrt(
    totalScores.reduce((sum, s) => sum + Math.pow(s - meanTotal, 2), 0) / n
  )
  
  const meanCorrect = totalScores.filter((_, i) => responses[i] === 1).reduce((sum, s) => sum + s, 0) / 
    (responses.filter(r => r === 1).length || 1)
  
  const pointBiserial = sdTotal > 0 
    ? (meanCorrect - meanTotal) / sdTotal * Math.sqrt(pValue * (1 - pValue))
    : 0
  
  // Discrimination index (simplified)
  const discriminationIndex = pointBiserial
  
  return { pValue, discriminationIndex, pointBiserial }
}

/**
 * Estimate IRT parameters from CTT statistics
 * Initial estimates for calibration
 * 
 * @param pValue - Proportion correct
 * @param discriminationIndex - Point-biserial correlation
 * @returns Initial IRT parameters
 */
export function estimateIRTFromCTT(
  pValue: number,
  discriminationIndex: number
): IRTParameters {
  // Convert p-value to b-parameter (difficulty)
  // b = -Φ⁻¹(p) where Φ is the standard normal CDF
  const b = -normalInverseCDF(Math.max(0.01, Math.min(0.99, pValue)))
  
  // Convert discrimination to a-parameter
  // a ≈ discrimination / 1.7 (scaling factor)
  const a = Math.max(0.5, Math.min(2.5, discriminationIndex * 1.7))
  
  // Guessing parameter (default for multiple choice)
  const c = 0.25 // 1/4 for 4-option MCQ
  
  return { a, b, c }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Approximate inverse of standard normal CDF
 * Uses Abramowitz and Stegun approximation
 */
function normalInverseCDF(p: number): number {
  if (p <= 0) return -Infinity
  if (p >= 1) return Infinity
  if (p === 0.5) return 0
  
  const a = [
    -3.969683028665376e+01,
    2.209460984245205e+02,
    -2.759285104469687e+02,
    1.383577518672690e+02,
    -3.066479806614716e+01,
    2.506628277459239e+00
  ]
  
  const b = [
    -5.447609879822406e+01,
    1.615858368580409e+02,
    -1.556989798598866e+02,
    6.680131188771972e+01,
    -1.328068155288572e+01
  ]
  
  const c = [
    -7.784894002430293e-03,
    -3.223964580411365e-01,
    -2.400758277161838e+00,
    -2.549732539343734e+00,
    4.374664141464968e+00,
    2.938163982698783e+00
  ]
  
  const d = [
    7.784695709041462e-03,
    3.224671290700398e-01,
    2.445134137142996e+00,
    3.754408661907416e+00
  ]
  
  const pLow = 0.02425
  const pHigh = 1 - pLow
  
  let q, r
  
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p))
    return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
      ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1)
  } else if (p <= pHigh) {
    q = p - 0.5
    r = q * q
    return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q /
      (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1)
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p))
    return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
      ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1)
  }
}

/**
 * Convert IRT theta to percentage score
 * Assumes standard scaling
 */
export function thetaToPercentage(theta: number): number {
  // Map theta (-4 to +4) to percentage (0 to 100)
  const normalized = (theta + 4) / 8
  return Math.max(0, Math.min(100, Math.round(normalized * 100)))
}

/**
 * Convert percentage score to IRT theta
 */
export function percentageToTheta(percentage: number): number {
  const normalized = percentage / 100
  return normalized * 8 - 4
}

/**
 * Generate ability level label from theta
 */
export function getAbilityLevel(theta: number): {
  level: string
  description: string
  color: string
} {
  if (theta < -2) {
    return { level: 'Beginning', description: 'Needs significant support', color: '#EF4444' }
  } else if (theta < -1) {
    return { level: 'Developing', description: 'Building foundational skills', color: '#F59E0B' }
  } else if (theta < 1) {
    return { level: 'Proficient', description: 'Meeting grade-level expectations', color: '#2563EB' }
  } else if (theta < 2) {
    return { level: 'Advanced', description: 'Exceeding expectations', color: '#10B981' }
  } else {
    return { level: 'Mastery', description: 'Demonstrating exceptional ability', color: '#8B5CF6' }
  }
}
