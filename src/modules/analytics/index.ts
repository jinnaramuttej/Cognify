/**
 * Analytics Module — Barrel file
 */

// Services (migrated from src/lib/analytics/ and src/lib/learning/)
export { calibrateDifficulty, calibrateAllQuestions } from './services/difficulty-calibrator';
export { calculateQuestionQuality } from './services/question-quality';
export { analyzeStudentMistakes, generateInsightSummary } from './services/mistake-detector';
export { getPrerequisites, getDependents, getOptimalOrder, recommendNextTopics } from './services/knowledge-graph';

// Hooks
export { usePerformance } from './hooks/usePerformance';

// Types
export type * from './types';
