/**
 * Equation Parser — Converts mathematical expressions to LaTeX format
 * 
 * Uses AI to convert detected equations into proper LaTeX notation
 * for storage in question_text fields.
 */

import {
    callFeatherlessChat,
    getFeatherlessApiKey,
    getFeatherlessModel,
} from './featherless-client';

/**
 * Common equation patterns found in JEE/NEET papers.
 * Simple regex-based conversions for common patterns.
 */
const EQUATION_PATTERNS: [RegExp, string][] = [
    // Superscripts: x^2, x^n
    [/(\w)\^(\d+)/g, '$$$1^{$2}$$'],
    // Fractions written as a/b
    [/(\d+)\/(\d+)/g, '$$\\frac{$1}{$2}$$'],
    // Square root
    [/sqrt\(([^)]+)\)/gi, '$$\\sqrt{$1}$$'],
    // Greek letters
    [/\balpha\b/gi, '$$\\alpha$$'],
    [/\bbeta\b/gi, '$$\\beta$$'],
    [/\bgamma\b/gi, '$$\\gamma$$'],
    [/\bdelta\b/gi, '$$\\delta$$'],
    [/\btheta\b/gi, '$$\\theta$$'],
    [/\bomega\b/gi, '$$\\omega$$'],
    [/\blambda\b/gi, '$$\\lambda$$'],
    [/\bmu\b/gi, '$$\\mu$$'],
    [/\bpi\b/gi, '$$\\pi$$'],
    [/\bsigma\b/gi, '$$\\sigma$$'],
    // Common physics notation
    [/\binfinity\b/gi, '$$\\infty$$'],
    [/\bintegral\b/gi, '$$\\int$$'],
    [/\bdelta\s*x\b/gi, '$$\\Delta x$$'],
];

/**
 * Apply basic regex-based LaTeX conversions to text.
 */
export function applyBasicLatex(text: string): string {
    let result = text;
    for (const [pattern, replacement] of EQUATION_PATTERNS) {
        result = result.replace(pattern, replacement);
    }
    return result;
}

/**
 * Use Featherless AI to convert complex equations to LaTeX.
 */
export async function convertEquationsWithAI(text: string): Promise<string> {
    const apiKey = getFeatherlessApiKey();
    if (!apiKey) {
        // Fall back to basic regex conversion
        return applyBasicLatex(text);
    }

    // Only call AI if text likely contains equations
    const hasEquation = /[=+\-*/^√∫∑∏]/.test(text) ||
        /\b(sin|cos|tan|log|ln|lim|sum|integral)\b/i.test(text);

    if (!hasEquation) {
        return text;
    }

    try {
        const content = await callFeatherlessChat([
            {
                role: 'system',
                content: 'Convert any mathematical expressions in the text to inline LaTeX (wrapped in $ delimiters). Preserve all non-mathematical text exactly. Only respond with the converted text, nothing else.',
            },
            { role: 'user', content: text },
        ], {
            model: getFeatherlessModel('meta-llama/Meta-Llama-3.1-8B-Instruct'),
            temperature: 0,
            max_tokens: 2000,
        });
        return content || applyBasicLatex(text);
    } catch {
        return applyBasicLatex(text);
    }
}

/**
 * Process all equations in a question's text and options.
 */
export async function processEquations(question: {
    question_text: string;
    options?: { label: string; text: string }[];
}): Promise<{
    question_text: string;
    options?: { label: string; text: string }[];
}> {
    const processed = {
        question_text: await convertEquationsWithAI(question.question_text),
        options: question.options ? await Promise.all(
            question.options.map(async opt => ({
                label: opt.label,
                text: await convertEquationsWithAI(opt.text),
            }))
        ) : undefined,
    };

    return processed;
}
