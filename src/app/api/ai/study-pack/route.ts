import { NextResponse } from 'next/server';
import { callFeatherlessChat, getFeatherlessApiKey, getFeatherlessModel } from '@/lib/featherless';

const CONVERSION_TYPES = ['summary', 'flashcards', 'questions', 'mindmap', 'formulas', 'keypoints'] as const;

const PROMPTS: Record<(typeof CONVERSION_TYPES)[number], string> = {
  flashcards: 'Convert the notes into exam-ready flashcards. Return ONLY valid JSON array items with "front" and "back". Generate 8-15 cards.',
  questions: 'Generate 10 practice questions from the notes. Return ONLY valid JSON array items with "question", "options", "correctIndex", and "explanation".',
  summary: 'Create a structured summary from the notes. Return ONLY valid JSON array items with "heading" and "content".',
  mindmap: 'Create a concept hierarchy from the notes. Return ONLY a valid JSON object with "id", "label", and "children".',
  formulas: 'Extract formulas and key definitions. Return ONLY valid JSON array items with "name", "formula", "explanation", and optional "example".',
  keypoints: 'Extract the most important key points. Return ONLY valid JSON array items with "point" and "importance".',
};

function extractJSON(text: string) {
  const arrayMatch = text.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    return JSON.parse(arrayMatch[0]);
  }

  const objectMatch = text.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    return JSON.parse(objectMatch[0]);
  }

  return JSON.parse(text);
}

function getDemoResult(type: (typeof CONVERSION_TYPES)[number]) {
  switch (type) {
    case 'flashcards':
      return [
        { front: 'What is Newton\'s First Law?', back: 'An object maintains rest or uniform motion unless acted on by an external force.' },
        { front: 'What is momentum?', back: 'Momentum is mass multiplied by velocity.' },
      ];
    case 'questions':
      return [
        {
          question: 'Which law explains inertia?',
          options: ['First Law', 'Second Law', 'Third Law', 'Gravitation'],
          correctIndex: 0,
          explanation: 'Inertia is explained by Newton\'s First Law.',
        },
      ];
    case 'summary':
      return [
        { heading: 'Overview', content: 'The notes cover core ideas in mechanics.' },
        { heading: 'Key Ideas', content: 'Force, motion, and energy are the primary themes.' },
      ];
    case 'mindmap':
      return { id: 'root', label: 'Mechanics', children: [{ id: 'laws', label: 'Newton\'s Laws', children: [] }] };
    case 'formulas':
      return [{ name: 'Newton\'s Second Law', formula: 'F = ma', explanation: 'Force equals mass times acceleration.' }];
    case 'keypoints':
      return [{ point: 'Newton\'s laws are foundational for mechanics.', importance: 'high' }];
  }
}

async function generateConversion(type: (typeof CONVERSION_TYPES)[number], inputText: string) {
  const apiKey = getFeatherlessApiKey();
  if (!apiKey) {
    return { result: getDemoResult(type), demo: true };
  }

  const truncatedInput = inputText.length > 6000
    ? `${inputText.slice(0, 6000)}\n[...truncated]`
    : inputText;

  const content = await callFeatherlessChat([
    { role: 'system', content: PROMPTS[type] },
    { role: 'user', content: truncatedInput },
  ], {
    model: getFeatherlessModel('meta-llama/Meta-Llama-3.1-8B-Instruct'),
    temperature: 0.3,
    max_tokens: 4000,
  });

  return {
    result: extractJSON(content),
    demo: false,
  };
}

export async function POST(request: Request) {
  try {
    const { input_text } = await request.json();

    if (!input_text || input_text.trim().length < 30) {
      return NextResponse.json({ error: 'Input too short' }, { status: 400 });
    }

    const results = await Promise.allSettled(
      CONVERSION_TYPES.map(async (type) => ({
        type,
        ...(await generateConversion(type, input_text)),
      }))
    );

    const studyPack: Record<string, unknown> = {};
    let isDemo = false;

    for (const result of results) {
      if (result.status !== 'fulfilled') {
        continue;
      }

      studyPack[result.value.type] = result.value.result;
      if (result.value.demo) {
        isDemo = true;
      }
    }

    return NextResponse.json({
      studyPack,
      demo: isDemo,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('/api/ai/study-pack error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
