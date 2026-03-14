/**
 * Teacher Module — Barrel file
 */

// Components (copied from src/app/teacher/components/)
export { default as TeacherDashboardHeader } from './components/TeacherDashboardHeader';
export { default as TeacherStatsCards } from './components/TeacherStatsCards';
export { default as TeacherQuickActions } from './components/TeacherQuickActions';
export { default as ActiveBatchesPanel } from './components/ActiveBatchesPanel';
export { default as RecentTestsPanel } from './components/RecentTestsPanel';
export { default as QuestionBankOverview } from './components/QuestionBankOverview';
export { default as QuestionBankChart } from './components/QuestionBankChart';
export { default as RecentPDFImports } from './components/RecentPDFImports';
export { default as TeacherSidebar } from './components/TeacherSidebar';

// Services
export * from './services/teacher-service';

// Types
export type * from './types';
