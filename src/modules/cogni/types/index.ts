/**
 * Cogni Module — Types
 */

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    topic?: string;
}

export interface TutorContext {
    user_id: string;
    current_topic?: string;
    weak_topics?: string[];
    recent_mistakes?: string[];
    exam_target?: string;
}

export interface CogniResponse {
    content: string;
    suggestions?: string[];
    related_topics?: string[];
}
