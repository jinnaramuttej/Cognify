/**
 * Teacher Module — Types
 */

export interface TeacherStats {
    totalQuestions: number;
    totalTests: number;
    totalStudents: number;
    activeBatches: number;
}

export interface QuestionImport {
    id: string;
    filename: string;
    status: 'processing' | 'completed' | 'failed';
    questions_extracted: number;
    created_at: string;
}
