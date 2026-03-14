/**
 * Cogni Multimodal - Image Parsing Service
 * 
 * Uses VLM for:
 * - OCR text extraction
 * - LaTeX equation extraction
 * - Handwriting recognition
 * - Context extraction (variables, problem type)
 */

import ZAI from 'z-ai-web-dev-sdk';
import { db } from '@/lib/db';

// ============================================================
// Types
// ============================================================

export interface ImageParseResult {
  rawText: string;
  latexExpressions: string[];
  normalizedText: string;
  confidence: number;
  regions: AnnotationRegion[];
  context: ExtractedContext;
  needsManualReview: boolean;
}

export interface AnnotationRegion {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  text: string;
  confidence: number;
}

export interface ExtractedContext {
  problemType: 'solve' | 'prove' | 'simplify' | 'evaluate' | 'derive' | 'unknown';
  subject: 'math' | 'physics' | 'chemistry' | 'biology' | 'unknown';
  variables: string[];
  concepts: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

// ============================================================
// VLM-based Image Parsing
// ============================================================

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

/**
 * Parse image using Vision Language Model
 * Extracts text, LaTeX, and context from mathematical/scientific images
 */
export async function parseImageWithVLM(
  imageBase64: string,
  mimeType: string = 'image/png'
): Promise<ImageParseResult> {
  const zai = await getZAI();
  
  const prompt = `You are an expert mathematical OCR system. Analyze this image of a math or science problem.

Your task is to extract and structure the content. Respond ONLY with valid JSON in this exact format:
{
  "rawText": "The complete text extracted from the image",
  "latexExpressions": ["List of LaTeX expressions found, e.g., \\\\frac{dy}{dx} = x^2"],
  "normalizedText": "Clean, readable version of the problem statement",
  "confidence": 0.95,
  "regions": [
    {
      "id": "region_1",
      "x": 0.1,
      "y": 0.2,
      "width": 0.8,
      "height": 0.3,
      "label": "equation",
      "text": "The text in this region",
      "confidence": 0.92
    }
  ],
  "context": {
    "problemType": "solve|prove|simplify|evaluate|derive|unknown",
    "subject": "math|physics|chemistry|biology|unknown",
    "variables": ["x", "y", "n"],
    "concepts": ["derivative", "integral", "quadratic equation"],
    "difficulty": "easy|medium|hard"
  },
  "needsManualReview": false
}

Important:
- Extract ALL text visible in the image
- Convert mathematical notation to proper LaTeX
- Identify the problem type (solve, prove, simplify, evaluate, derive)
- List all variables mentioned (x, y, θ, etc.)
- Identify key mathematical/scientific concepts
- Set needsManualReview to true if handwriting is unclear or confidence < 0.7
- Confidence should be 0-1 based on clarity of the image`;

  try {
    const response = await zai.chat.completions.createVision({
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      thinking: { type: 'disabled' },
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      return createFallbackResult('No response from vision model');
    }

    // Parse JSON response
    try {
      // Extract JSON from response (handle markdown code blocks)
      let jsonStr = content;
      if (content.includes('```json')) {
        jsonStr = content.split('```json')[1].split('```')[0].trim();
      } else if (content.includes('```')) {
        jsonStr = content.split('```')[1].split('```')[0].trim();
      }
      
      const parsed = JSON.parse(jsonStr);
      
      return {
        rawText: parsed.rawText || '',
        latexExpressions: parsed.latexExpressions || [],
        normalizedText: parsed.normalizedText || parsed.rawText || '',
        confidence: parsed.confidence || 0.5,
        regions: parsed.regions || [],
        context: {
          problemType: parsed.context?.problemType || 'unknown',
          subject: parsed.context?.subject || 'unknown',
          variables: parsed.context?.variables || [],
          concepts: parsed.context?.concepts || [],
          difficulty: parsed.context?.difficulty || 'medium',
        },
        needsManualReview: parsed.needsManualReview || parsed.confidence < 0.7,
      };
    } catch (parseError) {
      console.error('[VLM] JSON parse error:', parseError);
      // Try to extract text from unstructured response
      return {
        rawText: content,
        latexExpressions: extractLatexFromText(content),
        normalizedText: content,
        confidence: 0.5,
        regions: [],
        context: {
          problemType: 'unknown',
          subject: 'unknown',
          variables: [],
          concepts: [],
          difficulty: 'medium',
        },
        needsManualReview: true,
      };
    }
  } catch (error) {
    console.error('[VLM] Image parsing error:', error);
    return createFallbackResult(error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Extract LaTeX expressions from text using regex patterns
 */
function extractLatexFromText(text: string): string[] {
  const latexPatterns = [
    // Inline math: $...$
    /\$([^$]+)\$/g,
    // Display math: $$...$$
    /\$\$([^$]+)\$\$/g,
    // Common LaTeX commands
    /\\frac\{[^}]+\}\{[^}]+\}/g,
    /\\int[_^][^a-z]*/g,
    /\\sum[_^][^a-z]*/g,
    /\\sqrt\{[^}]+\}/g,
    /\\partial[^a-z]*/g,
    // Subscripts and superscripts
    /[a-zA-Z]_[a-zA-Z0-9]+/g,
    /[a-zA-Z]\^[a-zA-Z0-9]+/g,
  ];
  
  const expressions: string[] = [];
  
  for (const pattern of latexPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      expressions.push(...matches);
    }
  }
  
  return [...new Set(expressions)]; // Remove duplicates
}

/**
 * Create fallback result for error cases
 */
function createFallbackResult(errorMessage: string): ImageParseResult {
  return {
    rawText: '',
    latexExpressions: [],
    normalizedText: '',
    confidence: 0,
    regions: [],
    context: {
      problemType: 'unknown',
      subject: 'unknown',
      variables: [],
      concepts: [],
      difficulty: 'medium',
    },
    needsManualReview: true,
  };
}

/**
 * Store parsed problem in database
 */
export async function storeParsedProblem(
  userId: string,
  sourceType: 'image' | 'camera' | 'screenshot',
  result: ImageParseResult,
  fileName?: string,
  mimeType?: string
) {
  const parsed = await db.parsedProblem.create({
    data: {
      userId,
      sourceType,
      originalFileName: fileName,
      mimeType,
      rawText: result.rawText,
      latexExpression: result.latexExpressions.join('\n'),
      normalizedText: result.normalizedText,
      ocrConfidence: result.confidence,
      latexConfidence: result.confidence,
      overallConfidence: result.confidence,
      problemType: result.context.problemType,
      subject: result.context.subject,
      detectedVariables: JSON.stringify(result.context.variables),
      detectedConcepts: JSON.stringify(result.context.concepts),
      annotationRegions: JSON.stringify(result.regions),
      status: result.needsManualReview ? 'pending' : 'verified',
      needsReview: result.needsManualReview,
    },
  });
  
  return parsed;
}

/**
 * Save user corrections for model improvement
 */
export async function saveCorrection(
  parsedProblemId: string,
  originalText: string,
  correctedText: string,
  originalLatex?: string,
  correctedLatex?: string,
  correctionSource: 'user' | 'teacher' = 'user'
) {
  // Store the correction
  const correction = await db.recognitionCorrection.create({
    data: {
      parsedProblemId,
      originalText,
      originalLatex,
      correctedText,
      correctedLatex,
      correctionSource,
    },
  });
  
  // Update the parsed problem
  await db.parsedProblem.update({
    where: { id: parsedProblemId },
    data: {
      correctedText,
      correctedLatex,
      correctionCount: { increment: 1 },
      status: 'corrected',
    },
  });
  
  return correction;
}

// ============================================================
// Export
// ============================================================

export const ImageParser = {
  parse: parseImageWithVLM,
  store: storeParsedProblem,
  saveCorrection,
  extractLatexFromText,
};

export default ImageParser;
