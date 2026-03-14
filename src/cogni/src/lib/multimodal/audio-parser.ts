/**
 * Cogni Multimodal - Audio Parsing Service
 * 
 * Uses ASR for:
 * - Speech-to-text transcription
 * - Mathematical punctuation handling
 * - Voice command detection
 */

import ZAI from 'z-ai-web-dev-sdk';
import { db } from '@/lib/db';

// ============================================================
// Types
// ============================================================

export interface AudioParseResult {
  transcript: string;
  cleanedTranscript: string;
  mathematicalText: string;
  confidence: number;
  detectedCommands: VoiceCommand[];
  detectedMath: MathExpression[];
  needsManualReview: boolean;
  duration: number;
}

export interface VoiceCommand {
  command: 'explain' | 'solve' | 'simplify' | 'prove' | 'define' | 'example' | 'hint' | 'next' | 'repeat';
  position: number;
  text: string;
}

export interface MathExpression {
  text: string;
  latex: string;
  position: { start: number; end: number };
}

// ============================================================
// Math Text Normalization
// ============================================================

/**
 * Mapping of spoken math terms to LaTeX notation
 */
const MATH_SPEECH_TO_LATEX: Record<string, string> = {
  // Basic operations
  'plus': '+',
  'minus': '-',
  'times': '\\times',
  'multiplied by': '\\times',
  'divided by': '\\div',
  'over': '\\frac{}{}',
  'equals': '=',
  'is equal to': '=',
  
  // Powers and roots
  'squared': '^2',
  'cubed': '^3',
  'to the power of': '^{}',
  'raised to': '^{}',
  'square root of': '\\sqrt{}',
  'cube root of': '\\sqrt[3]{}',
  'root of': '\\sqrt{}',
  
  // Fractions
  'fraction': '\\frac{}{}',
  'numerator': '',
  'denominator': '',
  
  // Calculus
  'derivative of': '\\frac{d}{dx}',
  'integral of': '\\int',
  'integral from': '\\int_{}^{}',
  'limit of': '\\lim_{}',
  'partial derivative': '\\frac{\\partial}{\\partial x}',
  'sum of': '\\sum',
  'product of': '\\prod',
  
  // Trigonometry
  'sine of': '\\sin',
  'cosine of': '\\cos',
  'tangent of': '\\tan',
  'arc sine': '\\arcsin',
  'arc cosine': '\\arccos',
  'arc tangent': '\\arctan',
  
  // Greek letters
  'alpha': '\\alpha',
  'beta': '\\beta',
  'gamma': '\\gamma',
  'delta': '\\delta',
  'theta': '\\theta',
  'lambda': '\\lambda',
  'mu': '\\mu',
  'pi': '\\pi',
  'sigma': '\\sigma',
  'phi': '\\phi',
  'omega': '\\omega',
  'Omega': '\\Omega',
  
  // Sets and logic
  'union': '\\cup',
  'intersection': '\\cap',
  'subset': '\\subset',
  'element of': '\\in',
  'for all': '\\forall',
  'there exists': '\\exists',
  'not': '\\neg',
  'and': '\\land',
  'or': '\\lor',
  'implies': '\\implies',
  'if and only if': '\\iff',
  
  // Other symbols
  'infinity': '\\infty',
  'pi': '\\pi',
  'approximately': '\\approx',
  'less than or equal': '\\leq',
  'greater than or equal': '\\geq',
  'not equal': '\\neq',
  'percent': '\\%',
  'degree': '^\\circ',
};

/**
 * Voice command patterns
 */
const VOICE_COMMANDS: Array<{
  patterns: RegExp[];
  command: VoiceCommand['command'];
}> = [
  { patterns: [/please explain/i, /can you explain/i, /explain this/i], command: 'explain' },
  { patterns: [/solve this/i, /find the solution/i, /solve for/i], command: 'solve' },
  { patterns: [/simplify/i, /simplify this/i], command: 'simplify' },
  { patterns: [/prove that/i, /show that/i, /prove the/i], command: 'prove' },
  { patterns: [/define/i, /what is/i, /what are/i], command: 'define' },
  { patterns: [/give me an example/i, /show an example/i, /for example/i], command: 'example' },
  { patterns: [/give me a hint/i, /hint please/i, /i need a hint/i], command: 'hint' },
  { patterns: [/next question/i, /move to next/i, /next problem/i], command: 'next' },
  { patterns: [/can you repeat/i, /repeat that/i, /say again/i], command: 'repeat' },
];

// ============================================================
// ASR Processing
// ============================================================

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

/**
 * Transcribe audio using ASR
 */
export async function transcribeAudio(
  audioBase64: string
): Promise<AudioParseResult> {
  const startTime = Date.now();
  const zai = await getZAI();
  
  try {
    const response = await zai.audio.asr.create({
      file_base64: audioBase64,
    });
    
    const transcript = response.text || '';
    
    // Process the transcript
    const cleanedTranscript = cleanTranscript(transcript);
    const mathematicalText = convertToMathematical(cleanedTranscript);
    const detectedCommands = detectVoiceCommands(transcript);
    const detectedMath = detectMathExpressions(transcript);
    
    // Estimate confidence based on transcript quality
    const confidence = estimateConfidence(transcript);
    
    const duration = Date.now() - startTime;
    
    return {
      transcript,
      cleanedTranscript,
      mathematicalText,
      confidence,
      detectedCommands,
      detectedMath,
      needsManualReview: confidence < 0.7 || detectedMath.length === 0,
      duration,
    };
  } catch (error) {
    console.error('[ASR] Transcription error:', error);
    return {
      transcript: '',
      cleanedTranscript: '',
      mathematicalText: '',
      confidence: 0,
      detectedCommands: [],
      detectedMath: [],
      needsManualReview: true,
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Clean transcript by removing filler words and fixing punctuation
 */
function cleanTranscript(text: string): string {
  let cleaned = text;
  
  // Remove filler words
  const fillers = ['um', 'uh', 'ah', 'er', 'like', 'you know', 'basically'];
  for (const filler of fillers) {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    cleaned = cleaned.replace(regex, '');
  }
  
  // Remove multiple spaces
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // Add punctuation
  cleaned = addPunctuation(cleaned);
  
  return cleaned;
}

/**
 * Add punctuation to unpunctuated text
 */
function addPunctuation(text: string): string {
  // Capitalize first letter
  let result = text.charAt(0).toUpperCase() + text.slice(1);
  
  // Add period at end if not present
  if (!/[.!?]$/.test(result)) {
    result += '.';
  }
  
  // Add periods after common sentence endings
  result = result.replace(/(then|therefore|so|hence|thus)\s+(?=[A-Z])/gi, '$1. ');
  
  return result;
}

/**
 * Convert spoken math to LaTeX-style notation
 */
function convertToMathematical(text: string): string {
  let result = text;
  
  // Sort by length (longest first) to avoid partial replacements
  const sortedEntries = Object.entries(MATH_SPEECH_TO_LATEX)
    .sort((a, b) => b[0].length - a[0].length);
  
  for (const [spoken, latex] of sortedEntries) {
    const regex = new RegExp(`\\b${spoken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    result = result.replace(regex, latex);
  }
  
  return result;
}

/**
 * Detect voice commands in transcript
 */
function detectVoiceCommands(text: string): VoiceCommand[] {
  const commands: VoiceCommand[] = [];
  
  for (const { patterns, command } of VOICE_COMMANDS) {
    for (const pattern of patterns) {
      const match = pattern.exec(text);
      if (match) {
        commands.push({
          command,
          position: match.index,
          text: match[0],
        });
      }
    }
  }
  
  return commands.sort((a, b) => a.position - b.position);
}

/**
 * Detect mathematical expressions in transcript
 */
function detectMathExpressions(text: string): MathExpression[] {
  const expressions: MathExpression[] = [];
  
  // Pattern for spoken math expressions
  const mathPatterns = [
    // Equations: "x equals 5", "y is equal to 2x plus 3"
    /(\w+)\s+(equals?|is equal to)\s+([\w\s+\-*/^]+)/gi,
    // Fractions: "x over y"
    /(\w+)\s+over\s+(\w+)/gi,
    // Derivatives: "derivative of x squared"
    /derivative\s+of\s+([\w\s]+?)(?=\s+is|\s+equals|\.|$)/gi,
    // Integrals: "integral of x dx"
    /integral\s+of\s+([\w\s]+?dx)/gi,
  ];
  
  for (const pattern of mathPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      expressions.push({
        text: match[0],
        latex: convertToMathematical(match[0]),
        position: {
          start: match.index,
          end: match.index + match[0].length,
        },
      });
    }
  }
  
  return expressions;
}

/**
 * Estimate confidence based on transcript characteristics
 */
function estimateConfidence(transcript: string): number {
  if (!transcript || transcript.trim().length === 0) {
    return 0;
  }
  
  let confidence = 0.8; // Base confidence
  
  // Adjust based on characteristics
  
  // Penalize very short transcripts
  if (transcript.length < 10) {
    confidence -= 0.2;
  }
  
  // Penalize if no detected math terms
  const mathTermCount = Object.keys(MATH_SPEECH_TO_LATEX).filter(term => 
    transcript.toLowerCase().includes(term)
  ).length;
  
  if (mathTermCount === 0) {
    confidence -= 0.1;
  } else if (mathTermCount > 3) {
    confidence += 0.1; // Bonus for multiple math terms
  }
  
  // Penalize for many filler words (indicating unclear speech)
  const fillerCount = (transcript.match(/\b(um|uh|ah|er)\b/gi) || []).length;
  if (fillerCount > 2) {
    confidence -= 0.1;
  }
  
  return Math.max(0, Math.min(1, confidence));
}

/**
 * Store parsed audio in database
 */
export async function storeAudioTranscription(
  userId: string,
  result: AudioParseResult,
  fileName?: string
) {
  const parsed = await db.parsedProblem.create({
    data: {
      userId,
      sourceType: 'audio',
      originalFileName: fileName,
      mimeType: 'audio/wav',
      rawText: result.transcript,
      latexExpression: result.mathematicalText,
      normalizedText: result.cleanedTranscript,
      ocrConfidence: result.confidence,
      overallConfidence: result.confidence,
      problemType: result.detectedCommands[0]?.command || 'solve',
      status: result.needsManualReview ? 'pending' : 'verified',
      needsReview: result.needsManualReview,
    },
  });
  
  return parsed;
}

// ============================================================
// Export
// ============================================================

export const AudioParser = {
  transcribe: transcribeAudio,
  store: storeAudioTranscription,
  cleanTranscript,
  convertToMathematical,
  detectVoiceCommands,
  detectMathExpressions,
};

export default AudioParser;
