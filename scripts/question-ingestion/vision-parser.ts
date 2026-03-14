/**
 * Vision Parser — Uses Gemini Vision API to interpret page layouts from scanned PDFs
 * 
 * Sends page images directly to Gemini for visual understanding of:
 * - Question boundaries and numbering
 * - Option blocks (A/B/C/D)
 * - Diagrams and figures
 * - Mathematical equations
 * - Answers and explanations
 */

import * as fs from 'fs';

export interface VisionBlock {
    type: 'question' | 'options' | 'diagram' | 'equation' | 'answer' | 'header' | 'unknown';
    content: string;
    questionNumber?: number;
    diagramDescription?: string;
    equationLatex?: string;
}

export interface VisionPageResult {
    pageNumber: number;
    blocks: VisionBlock[];
    rawResponse: string;
}

const VISION_SYSTEM_PROMPT = `You are analyzing a scanned page from an Indian competitive exam question paper (JEE/NEET/BITSAT).

Analyze the image and extract ALL questions visible on this page.

For EACH question found, output a JSON object with:
{
  "questions": [
    {
      "question_number": 1,
      "question_text": "The complete question text, including any referenced values",
      "has_diagram": true/false,
      "diagram_description": "Description of the diagram if present (e.g., 'circuit diagram with resistor R and capacitor C')",
      "equations": ["E = mc^2", "F = ma"],
      "options": [
        {"label": "A", "text": "Option A text"},
        {"label": "B", "text": "Option B text"},
        {"label": "C", "text": "Option C text"},
        {"label": "D", "text": "Option D text"}
      ],
      "correct_option": "B",
      "question_type": "single_correct",
      "topic_hint": "The physics/chemistry/math topic"
    }
  ]
}

Rules:
- Convert ALL math expressions to LaTeX format (e.g., $F = ma$, $\\frac{1}{2}mv^2$)
- If the image contains a diagram, set has_diagram=true and describe it
- question_type: "single_correct" for standard MCQs, "multi_correct" if marked, "integer" for integer-answer, "numerical" for decimal answers
- If you can see the answer key, include correct_option
- If answer is not visible, set correct_option to null
- Detect the topic from question content (e.g., "Kinematics", "Organic Chemistry", "Calculus")
- Return ONLY valid JSON`;

/**
 * Send a page image to Gemini Vision API for analysis.
 */
export async function parsePageWithVision(
    imagePath: string,
    pageNumber: number,
    context?: { exam?: string; subject?: string; year?: number }
): Promise<VisionPageResult> {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY or GOOGLE_API_KEY not set in environment');
    }

    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';

    const contextInfo = context
        ? `\nContext: This is from ${context.exam || 'competitive exam'}, Subject: ${context.subject || 'unknown'}, Year: ${context.year || 'unknown'}`
        : '';

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        {
                            inlineData: {
                                mimeType,
                                data: base64Image,
                            },
                        },
                        {
                            text: `${VISION_SYSTEM_PROMPT}${contextInfo}\n\nAnalyze this exam page image and extract all questions.`,
                        },
                    ],
                }],
                generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 8192,
                    responseMimeType: 'application/json',
                },
            }),
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini Vision API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{"questions":[]}';

    try {
        const parsed = JSON.parse(rawText);
        const questions = parsed.questions || [];

        const blocks: VisionBlock[] = questions.map((q: any) => ({
            type: 'question' as const,
            content: JSON.stringify(q),
            questionNumber: q.question_number,
            diagramDescription: q.diagram_description,
            equationLatex: q.equations?.join(', '),
        }));

        console.log(`👁️  Page ${pageNumber}: Vision detected ${blocks.length} questions`);

        return {
            pageNumber,
            blocks,
            rawResponse: rawText,
        };
    } catch (e: any) {
        console.error(`❌ Page ${pageNumber}: Failed to parse Vision response: ${e.message}`);
        return {
            pageNumber,
            blocks: [],
            rawResponse: rawText,
        };
    }
}

/**
 * Parse multiple page images with Vision AI.
 * Includes rate limiting between pages.
 */
export async function parseAllPagesWithVision(
    pages: { pageNumber: number; imagePath: string }[],
    context?: { exam?: string; subject?: string; year?: number }
): Promise<VisionPageResult[]> {
    const results: VisionPageResult[] = [];

    for (const page of pages) {
        try {
            const result = await parsePageWithVision(page.imagePath, page.pageNumber, context);
            results.push(result);
        } catch (error: any) {
            console.error(`❌ Page ${page.pageNumber}: Vision parsing failed — ${error.message}`);
            results.push({
                pageNumber: page.pageNumber,
                blocks: [],
                rawResponse: '',
            });
        }

        // Rate limit: 1 second between Vision API calls
        await new Promise(r => setTimeout(r, 1000));
    }

    return results;
}
