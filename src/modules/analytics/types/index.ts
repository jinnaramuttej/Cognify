/**
 * Analytics Module — Types
 */

export interface PerformanceSnapshot {
    overall_accuracy: number;
    tests_completed: number;
    current_streak: number;
    total_study_time: number;
    subject_breakdown: SubjectPerformance[];
    weekly_trend: number[];
}

export interface SubjectPerformance {
    subject: string;
    accuracy: number;
    tests_taken: number;
    improvement: number; // percentage change
}

export interface WeakTopic {
    topic_name: string;
    chapter_name: string;
    accuracy: number;
    attempts: number;
}
