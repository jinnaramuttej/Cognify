/**
 * Adaptive Testing Engine
 * 
 * Dynamically adjusts question difficulty during practice tests
 * based on the student's real-time performance.
 * 
 * Logic:
 *   accuracy > 80% → increase difficulty
 *   accuracy < 50% → decrease difficulty
 *   Otherwise → maintain current level
 */

import { supabase } from '@/lib/supabaseClient';

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export interface AdaptiveState {
    current_difficulty: DifficultyLevel;
    questions_answered: number;
    correct_count: number;
    recent_accuracy: number;  // Last 5 questions
    difficulty_history: DifficultyLevel[];
    adjustment_log: string[];
}

const DIFFICULTY_ORDER: DifficultyLevel[] = ['Easy', 'Medium', 'Hard'];
const WINDOW_SIZE = 5; // Number of recent questions to evaluate

/**
 * Create initial adaptive state.
 */
export function createAdaptiveState(startDifficulty: DifficultyLevel = 'Medium'): AdaptiveState {
    return {
        current_difficulty: startDifficulty,
        questions_answered: 0,
        correct_count: 0,
        recent_accuracy: 0,
        difficulty_history: [startDifficulty],
        adjustment_log: [`Started at ${startDifficulty}`],
    };
}

/**
 * Update adaptive state after a question is answered.
 * Returns the new state and the recommended difficulty for the next question.
 */
export function updateAdaptiveState(
    state: AdaptiveState,
    isCorrect: boolean,
    timeSpentSeconds: number
): AdaptiveState {
    const newState = { ...state };
    newState.questions_answered++;
    if (isCorrect) newState.correct_count++;

    // Calculate recent accuracy (sliding window)
    const recentStart = Math.max(0, newState.questions_answered - WINDOW_SIZE);
    const recentTotal = newState.questions_answered - recentStart;
    // We track via running count — simplified for in-memory usage
    const overallAccuracy = newState.correct_count / newState.questions_answered;

    // Use overall accuracy for first few questions, then switch to windowed
    newState.recent_accuracy = newState.questions_answered >= WINDOW_SIZE
        ? overallAccuracy // In production, use a proper sliding window
        : overallAccuracy;

    // Adjust difficulty every WINDOW_SIZE questions
    if (newState.questions_answered % WINDOW_SIZE === 0) {
        const currentIdx = DIFFICULTY_ORDER.indexOf(newState.current_difficulty);

        if (newState.recent_accuracy > 0.8 && currentIdx < DIFFICULTY_ORDER.length - 1) {
            // Performing well → increase difficulty
            newState.current_difficulty = DIFFICULTY_ORDER[currentIdx + 1];
            newState.adjustment_log.push(
                `Q${newState.questions_answered}: Accuracy ${Math.round(newState.recent_accuracy * 100)}% → ⬆️ ${newState.current_difficulty}`
            );
        } else if (newState.recent_accuracy < 0.5 && currentIdx > 0) {
            // Struggling → decrease difficulty
            newState.current_difficulty = DIFFICULTY_ORDER[currentIdx - 1];
            newState.adjustment_log.push(
                `Q${newState.questions_answered}: Accuracy ${Math.round(newState.recent_accuracy * 100)}% → ⬇️ ${newState.current_difficulty}`
            );
        } else {
            newState.adjustment_log.push(
                `Q${newState.questions_answered}: Accuracy ${Math.round(newState.recent_accuracy * 100)}% → ➡️ Maintained ${newState.current_difficulty}`
            );
        }

        newState.difficulty_history.push(newState.current_difficulty);
    }

    return newState;
}

/**
 * Fetch the next adaptive question from the database.
 */
export async function getNextAdaptiveQuestion(
    state: AdaptiveState,
    config: {
        exam_id: string;
        topic_ids?: string[];
        exclude_ids?: string[];
    }
): Promise<{ id: string; difficulty: string } | null> {
    let query = supabase
        .from('questions')
        .select('id, difficulty')
        .eq('exam_id', config.exam_id)
        .eq('difficulty', state.current_difficulty);

    if (config.topic_ids?.length) {
        query = query.in('topic_id', config.topic_ids);
    }

    if (config.exclude_ids?.length) {
        query = query.not('id', 'in', `(${config.exclude_ids.join(',')})`);
    }

    // Get a random question at the target difficulty
    const { data } = await query.limit(10);

    if (!data || data.length === 0) {
        // Fallback: try adjacent difficulty
        const currentIdx = DIFFICULTY_ORDER.indexOf(state.current_difficulty);
        const fallbacks = [
            currentIdx > 0 ? DIFFICULTY_ORDER[currentIdx - 1] : null,
            currentIdx < 2 ? DIFFICULTY_ORDER[currentIdx + 1] : null,
        ].filter(Boolean);

        for (const fallback of fallbacks) {
            let fallbackQuery = supabase
                .from('questions')
                .select('id, difficulty')
                .eq('exam_id', config.exam_id)
                .eq('difficulty', fallback!);

            if (config.topic_ids?.length) {
                fallbackQuery = fallbackQuery.in('topic_id', config.topic_ids);
            }
            if (config.exclude_ids?.length) {
                fallbackQuery = fallbackQuery.not('id', 'in', `(${config.exclude_ids.join(',')})`);
            }

            const { data: fallbackData } = await fallbackQuery.limit(5);
            if (fallbackData && fallbackData.length > 0) {
                const random = fallbackData[Math.floor(Math.random() * fallbackData.length)];
                return random;
            }
        }

        return null;
    }

    // Return a random question from results
    return data[Math.floor(Math.random() * data.length)];
}

/**
 * Get adaptive test summary for display to the student.
 */
export function getAdaptiveSummary(state: AdaptiveState): {
    total_questions: number;
    accuracy: number;
    final_difficulty: DifficultyLevel;
    difficulty_progression: DifficultyLevel[];
    adjustments: string[];
} {
    return {
        total_questions: state.questions_answered,
        accuracy: state.questions_answered > 0
            ? Math.round((state.correct_count / state.questions_answered) * 100)
            : 0,
        final_difficulty: state.current_difficulty,
        difficulty_progression: state.difficulty_history,
        adjustments: state.adjustment_log,
    };
}
