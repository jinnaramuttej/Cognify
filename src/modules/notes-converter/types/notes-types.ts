/**
 * Notes Converter Module — Types
 */

export type ConversionType =
    | 'flashcards'
    | 'questions'
    | 'quiz'
    | 'summary'
    | 'mindmap'
    | 'formulas'
    | 'keypoints';

export interface Flashcard {
    id: string;
    front: string;
    back: string;
    learned?: boolean;
}

export interface PracticeQuestion {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}

export interface QuizQuestion extends PracticeQuestion {
    userAnswer?: number;
}

export interface SummarySection {
    heading: string;
    content: string;
}

export interface MindMapNode {
    id: string;
    label: string;
    children: MindMapNode[];
}

export interface FormulaEntry {
    formula: string;
    name: string;
    explanation: string;
    example?: string;
}

export interface KeyPoint {
    id: string;
    point: string;
    importance: 'high' | 'medium' | 'low';
}

export interface ConversionResult {
    type: ConversionType;
    data: Flashcard[] | PracticeQuestion[] | SummarySection[] | MindMapNode | FormulaEntry[] | KeyPoint[];
    generatedAt: string;
}

export interface ConversionHistory {
    id: string;
    user_id: string;
    input_text: string;
    conversion_type: ConversionType;
    generated_output: any;
    created_at: string;
}

export interface NotesConverterState {
    inputText: string;
    selectedTool: ConversionType | null;
    result: ConversionResult | null;
    isGenerating: boolean;
    error: string | null;
}
