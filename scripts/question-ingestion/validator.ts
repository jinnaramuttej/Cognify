/**
 * Validator — Validates extracted questions against the Cognify schema
 * 
 * Ensures all questions conform to the constraints defined in db/schema.sql.
 */

import type { RawQuestion } from './ai-parser';

export interface ValidatedQuestion extends RawQuestion {
    _valid: true;
}

export interface ValidationError {
    question_text: string;
    reasons: string[];
}

const VALID_DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;
const VALID_QUESTION_TYPES = ['single_correct', 'multi_correct', 'integer', 'numerical'] as const;

/**
 * Validate a single question against schema constraints.
 * Returns [valid, errors].
 */
function validateOne(q: RawQuestion): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields
    if (!q.question_text || q.question_text.trim().length < 5) {
        errors.push('Missing or too short question_text');
    }

    if (!q.correct_option || q.correct_option.trim().length === 0) {
        errors.push('Missing correct_option');
    }

    // Options validation (required for single_correct and multi_correct)
    const qType = q.question_type || 'single_correct';
    if (qType === 'single_correct' || qType === 'multi_correct') {
        if (!q.options || !Array.isArray(q.options) || q.options.length < 2) {
            errors.push('MCQ questions must have at least 2 options');
        } else {
            for (const opt of q.options) {
                if (!opt.label || !opt.text) {
                    errors.push('Each option must have label and text');
                    break;
                }
            }
        }
    }

    // Enum: difficulty
    if (q.difficulty && !VALID_DIFFICULTIES.includes(q.difficulty as any)) {
        errors.push(`Invalid difficulty "${q.difficulty}" — must be: ${VALID_DIFFICULTIES.join(', ')}`);
    }

    // Enum: question_type
    if (q.question_type && !VALID_QUESTION_TYPES.includes(q.question_type as any)) {
        errors.push(`Invalid question_type "${q.question_type}" — must be: ${VALID_QUESTION_TYPES.join(', ')}`);
    }

    // Year validation (if provided)
    if (q.year !== undefined && q.year !== null) {
        if (typeof q.year !== 'number' || q.year < 1990 || q.year > 2030) {
            errors.push(`Invalid year ${q.year} — must be between 1990 and 2030`);
        }
    }

    return { valid: errors.length === 0, errors };
}

/**
 * Auto-fix common issues in question data.
 */
function autoFix(q: RawQuestion): RawQuestion {
    const fixed = { ...q };

    // Normalize difficulty
    if (fixed.difficulty) {
        const lower = fixed.difficulty.toLowerCase();
        if (lower === 'easy') fixed.difficulty = 'Easy';
        else if (lower === 'medium') fixed.difficulty = 'Medium';
        else if (lower === 'hard') fixed.difficulty = 'Hard';
    } else {
        fixed.difficulty = 'Medium'; // Default
    }

    // Normalize question_type
    if (!fixed.question_type) {
        fixed.question_type = 'single_correct'; // Default
    }

    // Ensure is_pyq is boolean
    fixed.is_pyq = !!fixed.is_pyq;

    // Trim question text
    if (fixed.question_text) {
        fixed.question_text = fixed.question_text.trim();
    }

    // Ensure options have proper structure
    if (fixed.options && Array.isArray(fixed.options)) {
        fixed.options = fixed.options.map((opt, i) => ({
            label: opt.label || String.fromCharCode(65 + i), // A, B, C, D
            text: (opt.text || '').trim(),
        }));
    }

    return fixed;
}

export interface ValidationResult {
    valid: ValidatedQuestion[];
    invalid: ValidationError[];
    totalInput: number;
}

/**
 * Validate and auto-fix an array of questions.
 */
export function validateQuestions(questions: RawQuestion[]): ValidationResult {
    const valid: ValidatedQuestion[] = [];
    const invalid: ValidationError[] = [];

    for (const raw of questions) {
        // Auto-fix first
        const fixed = autoFix(raw);

        // Then validate
        const result = validateOne(fixed);

        if (result.valid) {
            valid.push({ ...fixed, _valid: true as const });
        } else {
            invalid.push({
                question_text: fixed.question_text?.slice(0, 80) || '[empty]',
                reasons: result.errors,
            });
        }
    }

    return { valid, invalid, totalInput: questions.length };
}
