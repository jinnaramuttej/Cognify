/**
 * Cogni Core - Item Calibration Batch Job
 * 
 * Computes item statistics daily:
 * - Classical Test Theory: p-value, point-biserial correlation
 * - IRT Fit Statistics: chi-square, RMSEA, infit/outfit
 * - Time Statistics: mean, median, SD
 * - Differential Item Functioning (DIF) detection
 * 
 * Designed for serverless execution via cron or API trigger
 */

import { db } from '@/lib/db';

// ============================================================
// Types
// ============================================================

interface CalibrationConfig {
  batchId: string;
  minResponses: number; // Minimum responses for calibration
  includeItemIds?: string[]; // Specific items to calibrate
  excludeItemIds?: string[];
}

interface CalibrationResult {
  batchId: string;
  itemCount: number;
  responseCount: number;
  itemsUpdated: number;
  itemsFlagged: number;
  avgRMSEA: number | null;
  duration: number;
  errors: string[];
}

interface ItemCalibrationData {
  itemId: string;
  responses: Array<{
    isCorrect: boolean;
    thetaBefore: number;
    responseTime: number;
    userId: string;
  }>;
}

// ============================================================
// Classical Test Theory Statistics
// ============================================================

/**
 * Calculate p-value (proportion correct / difficulty index)
 */
function calculatePValue(responses: Array<{ isCorrect: boolean }>): number {
  if (responses.length === 0) return 0.5;
  const correct = responses.filter(r => r.isCorrect).length;
  return correct / responses.length;
}

/**
 * Calculate point-biserial correlation (item-total correlation)
 * Measures discrimination: correlation between item score and total score
 */
function calculatePointBiserial(
  itemResponses: Array<{ isCorrect: boolean; userId: string }>,
  allUserScores: Map<string, { total: number; count: number }>
): number {
  // Build paired data
  const paired: Array<{ itemScore: number; totalScore: number }> = [];
  
  for (const response of itemResponses) {
    const userScore = allUserScores.get(response.userId);
    if (userScore && userScore.count > 0) {
      // Total score excluding this item
      const totalExcluding = userScore.total - (response.isCorrect ? 1 : 0);
      const countExcluding = userScore.count - 1;
      
      if (countExcluding > 0) {
        paired.push({
          itemScore: response.isCorrect ? 1 : 0,
          totalScore: totalExcluding / countExcluding, // Average excluding this item
        });
      }
    }
  }
  
  if (paired.length < 10) return 0;
  
  // Calculate correlation
  const n = paired.length;
  const sumX = paired.reduce((sum, p) => sum + p.itemScore, 0);
  const sumY = paired.reduce((sum, p) => sum + p.totalScore, 0);
  const sumXY = paired.reduce((sum, p) => sum + p.itemScore * p.totalScore, 0);
  const sumX2 = paired.reduce((sum, p) => sum + p.itemScore * p.itemScore, 0);
  const sumY2 = paired.reduce((sum, p) => sum + p.totalScore * p.totalScore, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt(
    (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
  );
  
  if (denominator === 0) return 0;
  
  return numerator / denominator;
}

/**
 * Calculate time statistics
 */
function calculateTimeStats(responses: Array<{ responseTime: number }>): {
  avg: number;
  median: number;
  sd: number;
} {
  if (responses.length === 0) {
    return { avg: 0, median: 0, sd: 0 };
  }
  
  const times = responses.map(r => r.responseTime).sort((a, b) => a - b);
  
  const avg = times.reduce((sum, t) => sum + t, 0) / times.length;
  
  const median = times.length % 2 === 0
    ? (times[times.length / 2 - 1] + times[times.length / 2]) / 2
    : times[Math.floor(times.length / 2)];
  
  const variance = times.reduce((sum, t) => sum + Math.pow(t - avg, 2), 0) / times.length;
  const sd = Math.sqrt(variance);
  
  return { avg, median, sd };
}

// ============================================================
// IRT Fit Statistics
// ============================================================

/**
 * Calculate chi-square fit statistic
 */
function calculateChiSquareFit(
  responses: Array<{ isCorrect: boolean; thetaBefore: number }>,
  a: number, b: number, c: number
): number {
  // Group responses by theta ranges
  const thetaGroups = new Map<string, { observed: number[]; expected: number[] }>();
  
  for (const response of responses) {
    // Bin theta into ranges
    const thetaBin = Math.round(response.thetaBefore * 2) / 2; // 0.5 increments
    const key = thetaBin.toString();
    
    if (!thetaGroups.has(key)) {
      thetaGroups.set(key, { observed: [], expected: [] });
    }
    
    const group = thetaGroups.get(key)!;
    group.observed.push(response.isCorrect ? 1 : 0);
    
    // Expected probability from 3PL model
    const exponent = -a * (response.thetaBefore - b);
    const expected = c + (1 - c) / (1 + Math.exp(exponent));
    group.expected.push(expected);
  }
  
  // Calculate chi-square
  let chiSquare = 0;
  
  for (const [, group] of thetaGroups) {
    const n = group.observed.length;
    if (n < 5) continue; // Skip small groups
    
    const observedSum = group.observed.reduce((sum, o) => sum + o, 0);
    const expectedSum = group.expected.reduce((sum, e) => sum + e, 0);
    
    chiSquare += Math.pow(observedSum - expectedSum, 2) / (expectedSum * (1 - expectedSum / n) + 0.001);
  }
  
  return chiSquare;
}

/**
 * Calculate RMSEA (Root Mean Square Error of Approximation)
 */
function calculateRMSEA(chiSquare: number, df: number, n: number): number {
  if (df <= 0 || n <= 0) return 0;
  
  const rmsea = Math.sqrt(Math.max(0, (chiSquare - df) / (df * (n - 1))));
  return rmsea;
}

/**
 * Calculate infit and outfit mean square statistics
 */
function calculateInfitOutfit(
  responses: Array<{ isCorrect: boolean; thetaBefore: number }>,
  a: number, b: number, c: number
): { infit: number; outfit: number } {
  let outfitNumerator = 0;
  let outfitDenominator = 0;
  let infitNumerator = 0;
  let infitDenominator = 0;
  
  for (const response of responses) {
    // Calculate expected and variance
    const exponent = -a * (response.thetaBefore - b);
    const P = c + (1 - c) / (1 + Math.exp(exponent));
    const Q = 1 - P;
    
    // Standardized residual
    const residual = (response.isCorrect ? 1 : 0) - P;
    const variance = P * Q;
    
    if (variance < 0.001) continue;
    
    const z = residual / Math.sqrt(variance);
    const z2 = z * z;
    
    // Outfit (unweighted)
    outfitNumerator += z2;
    outfitDenominator += 1;
    
    // Infit (weighted by variance)
    infitNumerator += residual * residual;
    infitDenominator += variance;
  }
  
  const outfit = outfitDenominator > 0 ? outfitNumerator / outfitDenominator : 1;
  const infit = infitDenominator > 0 ? infitNumerator / infitDenominator : 1;
  
  return { infit, outfit };
}

// ============================================================
// DIF Detection (Mantel-Haenszel)
// ============================================================

/**
 * Detect Differential Item Functioning using Mantel-Haenszel
 * Compares performance between groups at same ability level
 */
async function detectDIF(
  itemId: string,
  responses: Array<{ isCorrect: boolean; thetaBefore: number; userId: string }>
): Promise<{ flagged: boolean; magnitude: number | null }> {
  // This is a simplified DIF detection
  // Full implementation would require demographic group assignments
  
  // For now, check if item performs differently at different theta levels
  const lowTheta = responses.filter(r => r.thetaBefore < -0.5);
  const highTheta = responses.filter(r => r.thetaBefore > 0.5);
  
  if (lowTheta.length < 10 || highTheta.length < 10) {
    return { flagged: false, magnitude: null };
  }
  
  const pLow = calculatePValue(lowTheta);
  const pHigh = calculatePValue(highTheta);
  
  // DIF if performance difference is unexpected given theta difference
  const expectedDiff = 0.3; // Expected difference due to ability
  const actualDiff = pHigh - pLow;
  
  // Flag if actual difference significantly deviates from expected
  const magnitude = Math.abs(actualDiff - expectedDiff);
  
  return {
    flagged: magnitude > 0.2,
    magnitude,
  };
}

// ============================================================
// Main Calibration Function
// ============================================================

export async function runCalibration(config: CalibrationConfig): Promise<CalibrationResult> {
  const startTime = Date.now();
  const { batchId, minResponses = 30, includeItemIds, excludeItemIds = [] } = config;
  
  let itemCount = 0;
  let responseCount = 0;
  let itemsUpdated = 0;
  let itemsFlagged = 0;
  let totalRMSEA = 0;
  let rmseaCount = 0;
  const errors: string[] = [];
  
  try {
    // Create calibration log
    await db.calibrationLog.create({
      data: {
        batchId,
        status: 'running',
        itemCount: 0,
        responseCount: 0,
        itemsUpdated: 0,
        itemsFlagged: 0,
      },
    });
    
    // Fetch items to calibrate
    const whereClause: Record<string, unknown> = {
      isPublished: true,
    };
    
    if (includeItemIds) {
      whereClause.id = { in: includeItemIds };
    }
    if (excludeItemIds.length > 0) {
      whereClause.id = { notIn: excludeItemIds };
    }
    
    const items = await db.adaptiveItem.findMany({
      where: whereClause,
      include: {
        responses: {
          include: {
            item: true,
          },
        },
      },
    });
    
    itemCount = items.length;
    
    // Build user total scores map for point-biserial calculation
    const userScores = new Map<string, { total: number; count: number }>();
    const allResponses = await db.itemResponse.findMany();
    
    for (const response of allResponses) {
      if (!userScores.has(response.userId)) {
        userScores.set(response.userId, { total: 0, count: 0 });
      }
      const score = userScores.get(response.userId)!;
      score.total += response.isCorrect ? 1 : 0;
      score.count += 1;
    }
    
    // Process each item
    for (const item of items) {
      try {
        const responses = item.responses;
        responseCount += responses.length;
        
        // Skip items with insufficient responses
        if (responses.length < minResponses) {
          continue;
        }
        
        const responseData = responses.map(r => ({
          isCorrect: r.isCorrect,
          thetaBefore: r.thetaBefore,
          responseTime: r.responseTime,
          userId: r.userId,
        }));
        
        // Calculate CTT statistics
        const pValue = calculatePValue(responseData);
        const pointBiserial = calculatePointBiserial(
          responseData.map(r => ({ isCorrect: r.isCorrect, userId: r.userId })),
          userScores
        );
        
        // Calculate time statistics
        const timeStats = calculateTimeStats(responseData);
        
        // Calculate IRT fit statistics
        const chiSquare = calculateChiSquareFit(
          responseData,
          item.discrimination,
          item.difficultyParam,
          item.guessing
        );
        
        const df = Math.max(1, Math.floor(responses.length / 10) - 3); // Approximate df
        const rmsea = calculateRMSEA(chiSquare, df, responses.length);
        
        const { infit, outfit } = calculateInfitOutfit(
          responseData,
          item.discrimination,
          item.difficultyParam,
          item.guessing
        );
        
        // DIF detection
        const dif = await detectDIF(item.id, responseData);
        
        // Determine if item should be flagged
        const isFlagged = 
          pointBiserial < 0.2 || // Poor discrimination
          rmsea > 0.1 || // Poor fit
          infit < 0.6 || infit > 1.4 || // Infit out of range
          outfit < 0.6 || outfit > 1.4 || // Outfit out of range
          dif.flagged; // DIF detected
        
        // Update or create item stats
        await db.itemStats.upsert({
          where: { itemId: item.id },
          create: {
            itemId: item.id,
            pValue,
            pointBiserial,
            chiSquareFit: chiSquare,
            rmsea,
            infitMNSQ: infit,
            outfitMNSQ: outfit,
            avgResponseTime: timeStats.avg,
            medianResponseTime: timeStats.median,
            timeSD: timeStats.sd,
            difFlagged: dif.flagged,
            difMagnitude: dif.magnitude,
            sampleSize: responses.length,
            lastCalibratedAt: new Date(),
            calibrationMethod: '3PL',
          },
          update: {
            pValue,
            pointBiserial,
            chiSquareFit: chiSquare,
            rmsea,
            infitMNSQ: infit,
            outfitMNSQ: outfit,
            avgResponseTime: timeStats.avg,
            medianResponseTime: timeStats.median,
            timeSD: timeStats.sd,
            difFlagged: dif.flagged,
            difMagnitude: dif.magnitude,
            sampleSize: responses.length,
            lastCalibratedAt: new Date(),
          },
        });
        
        // Update item's last calibrated timestamp
        await db.adaptiveItem.update({
          where: { id: item.id },
          data: { lastCalibratedAt: new Date() },
        });
        
        itemsUpdated++;
        if (isFlagged) itemsFlagged++;
        
        if (rmsea > 0 && rmsea < 1) {
          totalRMSEA += rmsea;
          rmseaCount++;
        }
        
      } catch (itemError) {
        errors.push(`Item ${item.id}: ${itemError instanceof Error ? itemError.message : 'Unknown error'}`);
      }
    }
    
    // Update calibration log
    await db.calibrationLog.update({
      where: { batchId },
      data: {
        status: 'completed',
        completedAt: new Date(),
        itemCount,
        responseCount,
        itemsUpdated,
        itemsFlagged,
        avgRMSEA: rmseaCount > 0 ? totalRMSEA / rmseaCount : null,
      },
    });
    
    return {
      batchId,
      itemCount,
      responseCount,
      itemsUpdated,
      itemsFlagged,
      avgRMSEA: rmseaCount > 0 ? totalRMSEA / rmseaCount : null,
      duration: Date.now() - startTime,
      errors,
    };
    
  } catch (error) {
    // Update log with error
    await db.calibrationLog.update({
      where: { batchId },
      data: {
        status: 'failed',
        completedAt: new Date(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
      },
    });
    
    return {
      batchId,
      itemCount,
      responseCount,
      itemsUpdated,
      itemsFlagged,
      avgRMSEA: null,
      duration: Date.now() - startTime,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
}

// ============================================================
// Export
// ============================================================

export const CalibrationJob = {
  run: runCalibration,
  calculatePValue,
  calculatePointBiserial,
  calculateTimeStats,
  calculateChiSquareFit,
  calculateRMSEA,
  calculateInfitOutfit,
  detectDIF,
};

export default CalibrationJob;
