/**
 * Cogni Core - Test Harness for Simulated Students
 * 
 * Simulates θ ∈ [-3, +3] with 1000 simulated students
 * to validate the adaptive selection algorithm
 */

import { IRTEngine, type IRTItem, type AbilityEstimate } from '../irt/engine';
import { KnowledgeTracingEngine, type SkillState } from '../knowledge-tracing/engine';
import { AdaptiveSelection, type PedagogicalConstraints } from '../adaptive/selection';

// ============================================================
// Types
// ============================================================

interface SimulatedStudent {
  id: string;
  trueTheta: number;
  estimatedTheta: number;
  thetaSE: number;
  responses: Array<{
    itemId: string;
    correct: boolean;
    trueProbability: number;
    estimatedProbability: number;
  }>;
  skillStates: Map<string, SkillState>;
}

interface SimulationResult {
  studentId: string;
  trueTheta: number;
  estimatedTheta: number;
  thetaSE: number;
  bias: number;
  rmse: number;
  items: number;
  accuracy: number;
  convergenceItem: number | null;
}

interface SimulationConfig {
  numStudents: number;
  thetaRange: [number, number];
  items: IRTItem[];
  maxItems: number;
  targetSE: number;
  minItems: number;
}

// ============================================================
// Simulation Functions
// ============================================================

/**
 * Generate simulated students across θ range
 */
export function generateSimulatedStudents(
  numStudents: number,
  thetaRange: [number, number] = [-3, 3]
): SimulatedStudent[] {
  const students: SimulatedStudent[] = [];
  
  // Distribute students evenly across theta range
  for (let i = 0; i < numStudents; i++) {
    const trueTheta = thetaRange[0] + (i / (numStudents - 1)) * (thetaRange[1] - thetaRange[0]);
    
    students.push({
      id: `student_${i.toString().padStart(4, '0')}`,
      trueTheta,
      estimatedTheta: 0,
      thetaSE: 1.0,
      responses: [],
      skillStates: new Map(),
    });
  }
  
  return students;
}

/**
 * Simulate response based on true θ and item parameters
 */
function simulateResponse(
  trueTheta: number,
  item: IRTItem
): { correct: boolean; trueProbability: number } {
  const trueProbability = IRTEngine.probability3PL(trueTheta, item);
  const random = Math.random();
  const correct = random < trueProbability;
  
  return { correct, trueProbability };
}

/**
 * Run adaptive test simulation for a single student
 */
export function simulateAdaptiveTest(
  student: SimulatedStudent,
  items: IRTItem[],
  config: {
    maxItems: number;
    targetSE: number;
    minItems: number;
  }
): SimulationResult {
  const { maxItems, targetSE, minItems } = config;
  
  const selectedItems = new Set<string>();
  const thetaHistory: number[] = [0]; // Initial theta
  let currentEstimate: AbilityEstimate = {
    theta: 0,
    se: 1.0,
    method: 'EAP',
    confidence: 1.96,
  };
  
  let convergenceItem: number | null = null;
  
  // Build items map for estimation
  const itemsMap = new Map<string, IRTItem>();
  items.forEach(item => itemsMap.set(item.id, item));
  
  for (let i = 0; i < maxItems; i++) {
    // Select next item
    const selection = AdaptiveSelection.selectNextItem(
      items,
      {
        userId: student.id,
        sessionId: `sim_${student.id}`,
        theta: currentEstimate,
        skillStates: student.skillStates,
        selectedItems,
        topicExposure: new Map(),
      }
    );
    
    if (!selection.item) {
      break; // No more suitable items
    }
    
    // Simulate response
    const { correct, trueProbability } = simulateResponse(student.trueTheta, selection.item);
    
    // Update response record
    student.responses.push({
      itemId: selection.item.id,
      correct,
      trueProbability,
      estimatedProbability: IRTEngine.probability3PL(currentEstimate.theta, selection.item),
    });
    
    selectedItems.add(selection.item.id);
    
    // Update theta estimate
    const responseRecords = student.responses.map((r, idx) => ({
      itemId: r.itemId,
      theta: thetaHistory[idx],
      response: r.correct,
    }));
    
    currentEstimate = IRTEngine.estimateEAP(responseRecords, itemsMap);
    thetaHistory.push(currentEstimate.theta);
    student.estimatedTheta = currentEstimate.theta;
    student.thetaSE = currentEstimate.se;
    
    // Update skill state if item has skill
    if (selection.item.skillId) {
      const currentSkillState = student.skillStates.get(selection.item.skillId) ||
        KnowledgeTracingEngine.initializeSkillState(selection.item.skillId);
      
      const updatedState = KnowledgeTracingEngine.updateSkillState(currentSkillState, correct);
      student.skillStates.set(selection.item.skillId, updatedState);
    }
    
    // Check convergence
    if (currentEstimate.se <= targetSE && convergenceItem === null) {
      convergenceItem = i + 1;
      
      if (i + 1 >= minItems) {
        break; // Sufficient precision reached
      }
    }
  }
  
  // Calculate metrics
  const bias = student.estimatedTheta - student.trueTheta;
  const squaredErrors = student.responses.map(r => 
    Math.pow(r.estimatedProbability - r.trueProbability, 2)
  );
  const rmse = Math.sqrt(
    squaredErrors.reduce((sum, se) => sum + se, 0) / squaredErrors.length
  );
  const accuracy = student.responses.filter(r => r.correct).length / student.responses.length;
  
  return {
    studentId: student.id,
    trueTheta: student.trueTheta,
    estimatedTheta: student.estimatedTheta,
    thetaSE: student.thetaSE,
    bias,
    rmse,
    items: student.responses.length,
    accuracy,
    convergenceItem,
  };
}

/**
 * Run full simulation study
 */
export async function runSimulationStudy(
  config: SimulationConfig,
  onProgress?: (completed: number, total: number) => void
): Promise<{
  results: SimulationResult[];
  summary: {
    totalStudents: number;
    meanBias: number;
    meanRMSE: number;
    meanItems: number;
    meanAccuracy: number;
    convergenceRate: number;
    thetaCorrelation: number;
    latency: {
      mean: number;
      p95: number;
    };
  };
}> {
  const startTime = Date.now();
  
  // Generate students
  const students = generateSimulatedStudents(config.numStudents, config.thetaRange);
  
  // Run simulations
  const results: SimulationResult[] = [];
  const latencies: number[] = [];
  
  for (let i = 0; i < students.length; i++) {
    const itemStartTime = Date.now();
    
    const result = simulateAdaptiveTest(students[i], config.items, {
      maxItems: config.maxItems,
      targetSE: config.targetSE,
      minItems: config.minItems,
    });
    
    latencies.push(Date.now() - itemStartTime);
    results.push(result);
    
    if (onProgress && i % 100 === 0) {
      onProgress(i + 1, students.length);
    }
  }
  
  // Calculate summary statistics
  const meanBias = results.reduce((sum, r) => sum + r.bias, 0) / results.length;
  const meanRMSE = results.reduce((sum, r) => sum + r.rmse, 0) / results.length;
  const meanItems = results.reduce((sum, r) => sum + r.items, 0) / results.length;
  const meanAccuracy = results.reduce((sum, r) => sum + r.accuracy, 0) / results.length;
  const convergenceRate = results.filter(r => r.convergenceItem !== null).length / results.length;
  
  // Calculate theta correlation
  const thetaCorrelation = calculateCorrelation(
    results.map(r => r.trueTheta),
    results.map(r => r.estimatedTheta)
  );
  
  // Calculate latency statistics
  latencies.sort((a, b) => a - b);
  const meanLatency = latencies.reduce((sum, l) => sum + l, 0) / latencies.length;
  const p95Latency = latencies[Math.floor(latencies.length * 0.95)];
  
  return {
    results,
    summary: {
      totalStudents: results.length,
      meanBias,
      meanRMSE,
      meanItems,
      meanAccuracy,
      convergenceRate,
      thetaCorrelation,
      latency: {
        mean: meanLatency,
        p95: p95Latency,
      },
    },
  };
}

/**
 * Calculate Pearson correlation coefficient
 */
function calculateCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  
  const sumX = x.reduce((sum, val) => sum + val, 0);
  const sumY = y.reduce((sum, val) => sum + val, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
  const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
  const sumY2 = y.reduce((sum, val) => sum + val * val, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt(
    (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
  );
  
  return numerator / denominator;
}

/**
 * Generate sample items for testing
 */
export function generateSampleItems(count: number): IRTItem[] {
  const items: IRTItem[] = [];
  const topics = ['Mechanics', 'Electromagnetism', 'Thermodynamics', 'Optics', 'Waves'];
  const skills = ['kinematics', 'forces', 'energy', 'momentum', 'circuits', 'fields'];
  
  for (let i = 0; i < count; i++) {
    // Generate IRT parameters with realistic distributions
    const discrimination = 0.5 + Math.random() * 2; // 0.5 - 2.5
    const difficultyParam = (Math.random() * 6) - 3; // -3 to +3
    const guessing = Math.random() * 0.3; // 0 - 0.3
    
    items.push({
      id: `item_${i.toString().padStart(4, '0')}`,
      a: discrimination,
      b: difficultyParam,
      c: guessing,
      topic: topics[i % topics.length],
      skillId: skills[i % skills.length],
      exposureCount: 0,
    });
  }
  
  return items;
}

// ============================================================
// Export
// ============================================================

export const TestHarness = {
  generateSimulatedStudents,
  simulateAdaptiveTest,
  runSimulationStudy,
  generateSampleItems,
};

export default TestHarness;
