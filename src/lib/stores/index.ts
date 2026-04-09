/**
 * Centralized Zustand stores barrel file.
 * Import stores from here for clean paths.
 *
 * Usage:
 *   import { useUserStore } from '@/lib/stores'
 *   import { useAIStore } from '@/lib/stores'
 */

export { useUserStore } from './user-store';
export type { UserProfile, DashboardStats } from './user-store';

export { useAIStore } from './ai-store';
export type { AIMessage, AISession } from './ai-store';
