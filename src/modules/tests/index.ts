/**
 * Tests Module — Barrel file
 * 
 * Re-exports all public APIs from the tests module.
 */

// Pages
export { default as TestDashboard } from './pages/TestDashboard';

// Services
export { SmartTestGenerator } from './services/smart-test-generator';
export { AdaptiveEngine } from './services/adaptive-engine';

// Hooks
export { useTestSession } from './hooks/use-test-session';
export { useTimer } from './hooks/use-timer';
export { useKeyboardNav } from './hooks/use-keyboard-nav';
export { useProctoring } from './hooks/use-proctoring';

// Types
export type * from './types';
