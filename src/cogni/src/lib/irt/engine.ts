/**
 * Cogni Core - Item Response Theory (IRT) Engine
 * 
 * Implements 3PL Model for adaptive testing:
 * P(θ) = c + (1-c) / (1 + e^(-a(θ-b)))
 * 
 * Where:
 * - θ (theta): Student ability parameter
 * - a: Item discrimination (slope)
 * - b: Item difficulty (location)
 * - c: Guessing parameter (lower asymptote)
 */

// ============================================================
// Types & Interfaces
// ============================================================

export interface IRTParameters {
  a: number; // Discrimination
  b: number; // Difficulty
  c: number; // Guessing
}

export interface IRTItem extends IRTParameters {
  id: string;
  topic?: string;
  skillId?: string;
  exposureCount?: number;
}

export interface AbilityEstimate {
  theta: number;
  se: number; // Standard error
  method: 'MLE' | 'EAP' | 'MAP';
  confidence: number; // 95% CI half-width
}

export interface ResponseRecord {
  itemId: string;
  theta: number; // θ at time of response
  response: boolean; // correct/incorrect
  responseTime?: number;
}

export interface FisherInformation {
  theta: number;
  information: number;
  se: number;
}

// ============================================================
// 3PL Model Core Functions
// ============================================================

/**
 * Calculate probability of correct response using 3PL model
 * P(θ) = c + (1-c) / (1 + e^(-a(θ-b)))
 */
export function probability3PL(theta: number, params: IRTParameters): number {
  const { a, b, c } = params;
  const exponent = -a * (theta - b);
  // Numerical stability: prevent overflow
  const expTerm = exponent > 20 ? 0 : exponent < -20 ? Math.exp(20) : Math.exp(-exponent);
  return c + (1 - c) / (1 + expTerm);
}

/**
 * Calculate probability using 2PL model (c = 0)
 */
export function probability2PL(theta: number, a: number, b: number): number {
  return probability3PL(theta, { a, b, c: 0 });
}

/**
 * Calculate probability using Rasch model (a = 1, c = 0)
 */
export function probabilityRasch(theta: number, b: number): number {
  return probability3PL(theta, { a: 1, b, c: 0 });
}

/**
 * First derivative of P(θ) with respect to θ
 * P'(θ) = a(1-c) * e^(-a(θ-b)) / (1 + e^(-a(θ-b)))^2
 */
export function probabilityDerivative(theta: number, params: IRTParameters): number {
  const { a, b, c } = params;
  const exponent = -a * (theta - b);
  const expTerm = Math.exp(Math.max(-20, Math.min(20, exponent)));
  const denominator = Math.pow(1 + expTerm, 2);
  return a * (1 - c) * expTerm / denominator;
}

// ============================================================
// Information Functions
// ============================================================

/**
 * Calculate Fisher Information for an item at given θ
 * I(θ) = a^2 * (1-c) * P*(θ) * (1 - P*(θ)) / P(θ) * (1 - P(θ))
 * where P*(θ) = (1-c)^(-1) * (P(θ) - c) = 1/(1+e^(-a(θ-b)))
 */
export function fisherInformation(theta: number, params: IRTParameters): number {
  const { a, c } = params;
  const P = probability3PL(theta, params);
  
  // Edge cases
  if (P <= c || P >= 1) return 0;
  
  const P_star = (P - c) / (1 - c); // True probability without guessing
  const Q_star = 1 - P_star;
  const Q = 1 - P;
  
  // Fisher information formula for 3PL
  const numerator = Math.pow(a, 2) * Math.pow(P - c, 2) * Q;
  const denominator = P * Math.pow(1 - c, 2);
  
  return numerator / denominator;
}

/**
 * Calculate test information (sum of item informations)
 */
export function testInformation(theta: number, items: IRTParameters[]): number {
  return items.reduce((sum, item) => sum + fisherInformation(theta, item), 0);
}

/**
 * Calculate standard error of measurement at θ
 * SE(θ) = 1 / sqrt(I(θ))
 */
export function standardError(theta: number, items: IRTParameters[]): number {
  const info = testInformation(theta, items);
  return info > 0 ? 1 / Math.sqrt(info) : Infinity;
}

/**
 * Find θ that maximizes information for an item
 * For 3PL, this is approximately at θ ≈ b + (1/a) * ln((1 + sqrt(1 + 8c)) / 2)
 */
export function optimalTheta(params: IRTParameters): number {
  const { a, b, c } = params;
  if (c === 0) return b; // For 2PL, maximum information is at b
  
  // Approximate solution for 3PL
  const optimalOffset = (1 / a) * Math.log((1 + Math.sqrt(1 + 8 * c)) / 2);
  return b + optimalOffset;
}

// ============================================================
// Ability Estimation Methods
// ============================================================

/**
 * Maximum Likelihood Estimation (MLE) for θ
 * Uses Newton-Raphson iteration
 */
export function estimateMLE(
  responses: ResponseRecord[],
  items: Map<string, IRTItem>,
  options: {
    maxIterations?: number;
    tolerance?: number;
    bounds?: [number, number];
  } = {}
): AbilityEstimate {
  const { maxIterations = 50, tolerance = 0.001, bounds = [-4, 4] } = options;
  
  // Initial estimate: proportion correct transformed to θ
  let theta = estimateInitialTheta(responses);
  
  for (let iter = 0; iter < maxIterations; iter++) {
    let firstDerivative = 0;
    let secondDerivative = 0;
    
    for (const response of responses) {
      const item = items.get(response.itemId);
      if (!item) continue;
      
      const P = probability3PL(theta, item);
      const Q = 1 - P;
      const P_prime = probabilityDerivative(theta, item);
      
      // Log-likelihood derivatives
      const u = response.response ? 1 : 0;
      firstDerivative += (u - P) / (P * Q) * P_prime;
      secondDerivative -= P_prime * P_prime / (P * Q);
    }
    
    // Newton-Raphson update
    if (Math.abs(secondDerivative) < 1e-10) break;
    
    const delta = firstDerivative / (-secondDerivative);
    const newTheta = Math.max(bounds[0], Math.min(bounds[1], theta + delta));
    
    if (Math.abs(newTheta - theta) < tolerance) {
      const se = calculateSE(newTheta, responses, items);
      return {
        theta: newTheta,
        se,
        method: 'MLE',
        confidence: 1.96 * se,
      };
    }
    
    theta = newTheta;
  }
  
  const se = calculateSE(theta, responses, items);
  return {
    theta,
    se,
    method: 'MLE',
    confidence: 1.96 * se,
  };
}

/**
 * Expected a Posteriori (EAP) estimation
 * Bayesian method with standard normal prior
 */
export function estimateEAP(
  responses: ResponseRecord[],
  items: Map<string, IRTItem>,
  options: {
    quadraturePoints?: number;
    bounds?: [number, number];
    priorMean?: number;
    priorSD?: number;
  } = {}
): AbilityEstimate {
  const {
    quadraturePoints = 41,
    bounds = [-4, 4],
    priorMean = 0,
    priorSD = 1,
  } = options;
  
  // Generate quadrature points
  const step = (bounds[1] - bounds[0]) / (quadraturePoints - 1);
  const points: number[] = [];
  const weights: number[] = [];
  
  for (let i = 0; i < quadraturePoints; i++) {
    const q = bounds[0] + i * step;
    points.push(q);
    // Normal prior weight
    weights.push(normalPDF(q, priorMean, priorSD) * step);
  }
  
  // Calculate posterior at each point
  const posteriors: number[] = [];
  let totalPosterior = 0;
  
  for (let i = 0; i < quadraturePoints; i++) {
    const theta = points[i];
    let likelihood = 1;
    
    for (const response of responses) {
      const item = items.get(response.itemId);
      if (!item) continue;
      
      const P = probability3PL(theta, item);
      likelihood *= response.response ? P : (1 - P);
    }
    
    posteriors[i] = likelihood * weights[i];
    totalPosterior += posteriors[i];
  }
  
  // Normalize posteriors
  for (let i = 0; i < posteriors.length; i++) {
    posteriors[i] /= totalPosterior;
  }
  
  // EAP estimate (mean of posterior)
  let theta = 0;
  let variance = 0;
  
  for (let i = 0; i < quadraturePoints; i++) {
    theta += points[i] * posteriors[i];
  }
  
  for (let i = 0; i < quadraturePoints; i++) {
    variance += Math.pow(points[i] - theta, 2) * posteriors[i];
  }
  
  const se = Math.sqrt(variance);
  
  return {
    theta,
    se,
    method: 'EAP',
    confidence: 1.96 * se,
  };
}

/**
 * Maximum a Posteriori (MAP) estimation
 * Bayesian method with normal prior, uses Newton-Raphson
 */
export function estimateMAP(
  responses: ResponseRecord[],
  items: Map<string, IRTItem>,
  options: {
    maxIterations?: number;
    tolerance?: number;
    priorMean?: number;
    priorSD?: number;
  } = {}
): AbilityEstimate {
  const { maxIterations = 50, tolerance = 0.001, priorMean = 0, priorSD = 1 } = options;
  
  let theta = estimateInitialTheta(responses);
  
  for (let iter = 0; iter < maxIterations; iter++) {
    let firstDerivative = 0;
    let secondDerivative = 0;
    
    // Likelihood derivatives
    for (const response of responses) {
      const item = items.get(response.itemId);
      if (!item) continue;
      
      const P = probability3PL(theta, item);
      const Q = 1 - P;
      const P_prime = probabilityDerivative(theta, item);
      
      const u = response.response ? 1 : 0;
      firstDerivative += (u - P) / (P * Q) * P_prime;
      secondDerivative -= P_prime * P_prime / (P * Q);
    }
    
    // Prior derivatives (normal prior)
    firstDerivative += (priorMean - theta) / Math.pow(priorSD, 2);
    secondDerivative -= 1 / Math.pow(priorSD, 2);
    
    // Newton-Raphson update
    if (Math.abs(secondDerivative) < 1e-10) break;
    
    const delta = firstDerivative / (-secondDerivative);
    const newTheta = theta + delta;
    
    if (Math.abs(newTheta - theta) < tolerance) {
      const se = Math.sqrt(-1 / secondDerivative);
      return {
        theta: newTheta,
        se,
        method: 'MAP',
        confidence: 1.96 * se,
      };
    }
    
    theta = newTheta;
  }
  
  const se = calculateSE(theta, responses, items);
  return {
    theta,
    se,
    method: 'MAP',
    confidence: 1.96 * se,
  };
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Initial theta estimate from proportion correct
 * Using inverse normal transformation
 */
function estimateInitialTheta(responses: ResponseRecord[]): number {
  if (responses.length === 0) return 0;
  
  const correct = responses.filter(r => r.response).length;
  const total = responses.length;
  const proportion = correct / total;
  
  // Clamp to avoid extremes
  const clamped = Math.max(0.01, Math.min(0.99, proportion));
  
  // Inverse normal (probit) transformation
  return invPhi(clamped);
}

/**
 * Calculate standard error for MLE estimate
 */
function calculateSE(
  theta: number,
  responses: ResponseRecord[],
  items: Map<string, IRTItem>
): number {
  let totalInfo = 0;
  
  for (const response of responses) {
    const item = items.get(response.itemId);
    if (!item) continue;
    
    totalInfo += fisherInformation(theta, item);
  }
  
  return totalInfo > 0 ? 1 / Math.sqrt(totalInfo) : 1;
}

/**
 * Normal probability density function
 */
function normalPDF(x: number, mean: number, sd: number): number {
  const z = (x - mean) / sd;
  return Math.exp(-0.5 * z * z) / (sd * Math.sqrt(2 * Math.PI));
}

/**
 * Inverse standard normal CDF (probit function)
 * Approximation using Abramowitz and Stegun
 */
function invPhi(p: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  
  // Rational approximation for lower region
  if (p < 0.5) {
    return -invPhi(1 - p);
  }
  
  const t = Math.sqrt(-2 * Math.log(1 - p));
  const c0 = 2.515517;
  const c1 = 0.802853;
  const c2 = 0.010328;
  const d1 = 1.432788;
  const d2 = 0.189269;
  const d3 = 0.001308;
  
  return t - (c0 + c1 * t + c2 * t * t) / (1 + d1 * t + d2 * t * t + d3 * t * t * t);
}

// ============================================================
// Item Selection Functions
// ============================================================

/**
 * Select next item that maximizes Fisher information at current θ
 */
export function selectItemByInformation(
  theta: number,
  availableItems: IRTItem[],
  options: {
    excludeIds?: Set<string>;
    topicConstraints?: string[];
    minExposure?: number;
    maxExposure?: number;
  } = {}
): IRTItem | null {
  const { excludeIds = new Set(), topicConstraints, minExposure = 0, maxExposure = Infinity } = options;
  
  let bestItem: IRTItem | null = null;
  let maxInfo = -Infinity;
  
  for (const item of availableItems) {
    // Skip excluded items
    if (excludeIds.has(item.id)) continue;
    
    // Check topic constraints
    if (topicConstraints && item.topic && !topicConstraints.includes(item.topic)) continue;
    
    // Check exposure limits
    if (item.exposureCount !== undefined) {
      if (item.exposureCount < minExposure || item.exposureCount > maxExposure) continue;
    }
    
    const info = fisherInformation(theta, item);
    
    if (info > maxInfo) {
      maxInfo = info;
      bestItem = item;
    }
  }
  
  return bestItem;
}

/**
 * Calculate item information profile across θ range
 */
export function informationProfile(
  params: IRTParameters,
  thetaRange: [number, number] = [-3, 3],
  steps: number = 61
): FisherInformation[] {
  const results: FisherInformation[] = [];
  const stepSize = (thetaRange[1] - thetaRange[0]) / (steps - 1);
  
  for (let i = 0; i < steps; i++) {
    const theta = thetaRange[0] + i * stepSize;
    const info = fisherInformation(theta, params);
    results.push({
      theta,
      information: info,
      se: info > 0 ? 1 / Math.sqrt(info) : Infinity,
    });
  }
  
  return results;
}

/**
 * Check if ability estimate is sufficiently precise
 */
export function isPrecisionAdequate(
  estimate: AbilityEstimate,
  targetSE: number = 0.3
): boolean {
  return estimate.se <= targetSE;
}

/**
 * Calculate expected change in θ after a response
 */
export function expectedThetaChange(
  theta: number,
  params: IRTParameters
): { ifCorrect: number; ifIncorrect: number } {
  // Approximation: theta change proportional to information and residual
  const info = fisherInformation(theta, params);
  const P = probability3PL(theta, params);
  
  // Expected change if correct (residual = 1 - P)
  const ifCorrect = (1 - P) / (info * Math.sqrt(info) + 0.1);
  
  // Expected change if incorrect (residual = -P)
  const ifIncorrect = -P / (info * Math.sqrt(info) + 0.1);
  
  return { ifCorrect, ifIncorrect };
}

// ============================================================
// Export All
// ============================================================

export const IRTEngine = {
  // Core probability functions
  probability3PL,
  probability2PL,
  probabilityRasch,
  probabilityDerivative,
  
  // Information functions
  fisherInformation,
  testInformation,
  standardError,
  optimalTheta,
  informationProfile,
  
  // Ability estimation
  estimateMLE,
  estimateEAP,
  estimateMAP,
  
  // Item selection
  selectItemByInformation,
  
  // Utilities
  isPrecisionAdequate,
  expectedThetaChange,
};

export default IRTEngine;
