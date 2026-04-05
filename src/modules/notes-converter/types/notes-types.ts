/**
 * Notes Converter v1 frontend types
 */

export type ConversionType = 'flashcards' | 'summary' | 'quiz';
export type SourceType = 'text' | 'pdf';
export type DetectedExam = 'jee' | 'neet' | 'bitsat' | 'generic';
export type ExamFocus = 'high' | 'medium' | 'low';
export type ExamRelevance = 'high' | 'medium' | 'low';
export type ProcessingStage =
    | 'idle'
    | 'extracting'
    | 'reviewing'
    | 'generating'
    | 'review'
    | 'ready'
    | 'completed'
    | 'failed';

export interface SummaryConcept {
    title: string;
    explanation: string;
    topicTags: string[];
    examRelevance: ExamRelevance;
}

export interface SummaryResult {
    quickSummary: string[];
    coreConcepts: SummaryConcept[];
    examTips: string[];
}

export interface Flashcard {
    id: string;
    front: string;
    back: string;
    topicTags: string[];
    examRelevance: ExamRelevance;
}

export interface FlashcardResult {
    cards: Flashcard[];
}

export interface QuizQuestion {
    id: string;
    type: 'conceptual' | 'application' | 'tricky';
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    topicTags: string[];
    examRelevance: ExamRelevance;
}

export interface QuizResult {
    meta: {
        questionCount: number;
        distribution: {
            conceptual: number;
            application: number;
            tricky: number;
        };
    };
    questions: QuizQuestion[];
}

export interface OutputMap {
    summary: SummaryResult;
    flashcards: FlashcardResult;
    quiz: QuizResult;
}

export interface IngestResponse {
    generationId: string;
    sourceType: SourceType;
    sourceName: string;
    detectedExam: DetectedExam;
    examFocus: ExamFocus;
    extractedText: string;
    normalizedText: string;
    characterCount: number;
    processingStage: 'review';
}

export interface UpdateSourceResponse {
    generationId: string;
    normalizedText: string;
    characterCount: number;
    processingStage: 'ready';
}

export interface GenerateResponse<T extends ConversionType = ConversionType> {
    generationId: string;
    outputType: T;
    result: OutputMap[T];
    processingStage: 'completed';
}
