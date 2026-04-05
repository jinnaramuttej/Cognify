import { z } from 'zod';
import { callFeatherlessChat } from '@/lib/featherless';
import type {
  ConversionType,
  DetectedExam,
  ExamFocus,
  FlashcardResult,
  OutputMap,
  QuizResult,
  SummaryResult,
} from '@/modules/notes-converter/types/notes-types';

const summarySchema = z.object({
  quickSummary: z.array(z.string()).min(5).max(6),
  coreConcepts: z.array(z.object({
    title: z.string(),
    explanation: z.string(),
    topicTags: z.array(z.string()),
    examRelevance: z.enum(['high', 'medium', 'low']),
  })).min(1),
  examTips: z.array(z.string()).min(1),
});

const flashcardsSchema = z.object({
  cards: z.array(z.object({
    id: z.string(),
    front: z.string(),
    back: z.string(),
    topicTags: z.array(z.string()),
    examRelevance: z.enum(['high', 'medium', 'low']),
  })).min(1),
});

const quizSchema = z.object({
  meta: z.object({
    questionCount: z.number(),
    distribution: z.object({
      conceptual: z.number(),
      application: z.number(),
      tricky: z.number(),
    }),
  }),
  questions: z.array(z.object({
    id: z.string(),
    type: z.enum(['conceptual', 'application', 'tricky']),
    question: z.string(),
    options: z.array(z.string()).length(4),
    correctIndex: z.number().min(0).max(3),
    explanation: z.string(),
    topicTags: z.array(z.string()),
    examRelevance: z.enum(['high', 'medium', 'low']),
  })).length(6),
});

function extractJsonBlock(text: string) {
  const objectMatch = text.match(/\{[\s\S]*\}/);
  if (!objectMatch) {
    throw new Error('No JSON object found in model response.');
  }
  return JSON.parse(objectMatch[0]);
}

export function normalizeNotesText(raw: string) {
  const lines = raw
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim());

  const normalized: string[] = [];
  let previous = '';
  for (const line of lines) {
    if (!line) {
      if (normalized[normalized.length - 1] !== '') {
        normalized.push('');
      }
      previous = '';
      continue;
    }

    if (/^\d+$/.test(line)) {
      continue;
    }

    if (line === previous) {
      continue;
    }

    normalized.push(line);
    previous = line;
  }

  return normalized.join('\n').replace(/\n{3,}/g, '\n\n').trim().slice(0, 40000);
}

export function detectExam(text: string): DetectedExam {
  const lower = text.toLowerCase();
  if (/\bneet|biology|botany|zoology|anatomy|physiology\b/.test(lower)) return 'neet';
  if (/\bbitsat|logical reasoning|english proficiency\b/.test(lower)) return 'bitsat';
  if (/\bjee|iit|mains|advanced|mechanics|calculus\b/.test(lower)) return 'jee';
  return 'generic';
}

export function computeExamFocus(text: string): ExamFocus {
  const lower = text.toLowerCase();
  const score = ['formula', 'problem', 'exam', 'mcq', 'question', 'derivation'].reduce((sum, keyword) => (
    sum + (lower.includes(keyword) ? 1 : 0)
  ), 0);

  if (score >= 4) return 'high';
  if (score >= 2) return 'medium';
  return 'low';
}

function chunkText(text: string) {
  const maxChunkLength = 8000;
  if (text.length <= maxChunkLength) {
    return [text];
  }

  const parts: string[] = [];
  let current = '';
  for (const paragraph of text.split(/\n{2,}/)) {
    const next = current ? `${current}\n\n${paragraph}` : paragraph;
    if (next.length > maxChunkLength && current) {
      parts.push(current);
      current = paragraph;
    } else {
      current = next;
    }
  }
  if (current) parts.push(current);
  return parts;
}

function buildPrompt(outputType: ConversionType, detectedExam: DetectedExam, examFocus: ExamFocus) {
  const prelude = `You are generating exam-ready study material for ${detectedExam.toUpperCase()} preparation. Exam focus is ${examFocus}. Return ONLY valid JSON.`;
  if (outputType === 'summary') {
    return `${prelude}
Schema:
{
  "quickSummary": ["point1", "point2", "point3", "point4", "point5"],
  "coreConcepts": [
    {
      "title": "Concept name",
      "explanation": "Clear explanation",
      "topicTags": ["tag1", "tag2"],
      "examRelevance": "high|medium|low"
    }
  ],
  "examTips": ["tip1", "tip2", "tip3"]
}`;
  }
  if (outputType === 'flashcards') {
    return `${prelude}
Schema:
{
  "cards": [
    {
      "id": "card-1",
      "front": "Question",
      "back": "Answer",
      "topicTags": ["tag1"],
      "examRelevance": "high|medium|low"
    }
  ]
}
Generate 8-12 cards.`;
  }
  return `${prelude}
Schema:
{
  "meta": {
    "questionCount": 6,
    "distribution": { "conceptual": 2, "application": 2, "tricky": 2 }
  },
  "questions": [
    {
      "id": "quiz-1",
      "type": "conceptual|application|tricky",
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "Explanation",
      "topicTags": ["tag1"],
      "examRelevance": "high|medium|low"
    }
  ]
}
Enforce exactly 2 conceptual, 2 application, and 2 tricky questions.`;
}

function buildUserContent(text: string) {
  return chunkText(text)
    .map((chunk, index) => `Chunk ${index + 1}:\n${chunk}`)
    .join('\n\n');
}

function fallbackSummary(text: string): SummaryResult {
  const lines = text.split(/\n+/).filter(Boolean).slice(0, 8);
  return {
    quickSummary: lines.slice(0, 5),
    coreConcepts: lines.slice(0, 3).map((line, index) => ({
      title: `Concept ${index + 1}`,
      explanation: line,
      topicTags: line.toLowerCase().split(/\W+/).filter((token) => token.length > 4).slice(0, 2),
      examRelevance: 'medium',
    })),
    examTips: [
      'Revise the quick summary once before solving questions.',
      'Convert core concepts into self-test prompts.',
      'Use the quiz to check weak points immediately.',
    ],
  };
}

function fallbackFlashcards(text: string): FlashcardResult {
  const lines = text.split(/\n+/).filter(Boolean).slice(0, 8);
  return {
    cards: lines.map((line, index) => ({
      id: `card-${index + 1}`,
      front: `What is the key idea in point ${index + 1}?`,
      back: line,
      topicTags: line.toLowerCase().split(/\W+/).filter((token) => token.length > 4).slice(0, 2),
      examRelevance: 'medium',
    })),
  };
}

function fallbackQuiz(text: string): QuizResult {
  const keywords = text.toLowerCase().split(/\W+/).filter((token) => token.length > 4).slice(0, 3);
  const types: QuizResult['questions'][number]['type'][] = ['conceptual', 'conceptual', 'application', 'application', 'tricky', 'tricky'];
  return {
    meta: {
      questionCount: 6,
      distribution: { conceptual: 2, application: 2, tricky: 2 },
    },
    questions: types.map((type, index) => ({
      id: `quiz-${index + 1}`,
      type,
      question: `Which statement best matches the ${type} idea from these notes?`,
      options: [
        `Option about ${keywords[0] || 'the topic'}`,
        `Option about ${keywords[1] || 'the topic'}`,
        `Option about ${keywords[2] || 'the topic'}`,
        'Unrelated option',
      ],
      correctIndex: 0,
      explanation: 'Fallback quiz item because structured generation was unavailable.',
      topicTags: keywords,
      examRelevance: 'medium',
    })),
  };
}

export async function generateStudyOutput(outputType: ConversionType, normalizedText: string, detectedExam: DetectedExam, examFocus: ExamFocus): Promise<OutputMap[ConversionType]> {
  try {
    const content = await callFeatherlessChat([
      { role: 'system', content: buildPrompt(outputType, detectedExam, examFocus) },
      { role: 'user', content: buildUserContent(normalizedText) },
    ], {
      model: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
      temperature: 0.2,
      max_tokens: 3000,
    });

    const parsed = extractJsonBlock(content);
    if (outputType === 'summary') {
      return summarySchema.parse(parsed);
    }
    if (outputType === 'flashcards') {
      return flashcardsSchema.parse(parsed);
    }
    return quizSchema.parse(parsed);
  } catch (error) {
    console.error(`Falling back for ${outputType}:`, error);
    if (outputType === 'summary') return fallbackSummary(normalizedText);
    if (outputType === 'flashcards') return fallbackFlashcards(normalizedText);
    return fallbackQuiz(normalizedText);
  }
}
