import { NextResponse } from 'next/server';
import { callFeatherlessChat, getFeatherlessModel } from '@/lib/featherless';
import type { FeatherlessMessage } from '@/lib/featherless';

interface GeneratedQuestion {
  id: string;
  question_text: string;
  options: { label: string; text: string }[];
  correct_option: string;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
}

function parseMCQFromText(text: string, topic: string, difficulty: string): GeneratedQuestion[] {
  // Simple heuristic parser — extracts numbered questions with A/B/C/D options
  const questions: GeneratedQuestion[] = [];
  const questionBlocks = text.split(/\n\s*\n/).filter(Boolean);

  let qIdx = 0;
  for (const block of questionBlocks) {
    if (qIdx >= 5) break;
    const lines = block.split('\n').filter((l) => l.trim());
    if (lines.length < 5) continue;

    const questionLine = lines[0]?.replace(/^\d+\.\s*/, '').trim();
    const options: { label: string; text: string }[] = [];
    let correctIdx = -1;

    for (let i = 1; i < lines.length; i++) {
      const m = lines[i].match(/^([A-D])[.)]\s*(.+)/);
      if (m) {
        options.push({ label: m[1], text: m[2].trim() });
      }
      const answerMatch = lines[i].match(/Answer:\s*([A-D])/i);
      if (answerMatch) correctIdx = ['A', 'B', 'C', 'D'].indexOf(answerMatch[1]);
    }

    if (questionLine && options.length >= 2) {
      const correct = options[correctIdx >= 0 ? correctIdx : 0]?.label || 'A';
      questions.push({
        id: `gen_${Date.now()}_${qIdx}`,
        question_text: questionLine,
        options,
        correct_option: correct,
        explanation: 'See solution for step-by-step breakdown.',
        difficulty: difficulty as 'Easy' | 'Medium' | 'Hard',
        topic,
      });
      qIdx++;
    }
  }

  return questions;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      topic = 'General',
      difficulty = 'Medium',
      count = 3,
      examType = 'JEE',
      focusArea,
    } = body;

    const systemPrompt = `You are an expert ${examType} question setter.
Generate exactly ${count} multiple-choice questions (MCQs) on the topic: "${topic}".
Difficulty: ${difficulty}.
${focusArea ? `Focus specifically on: ${focusArea}` : ''}

Format EACH question EXACTLY like this:
1. [Question text]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
Answer: [A/B/C/D]

Separate questions with a blank line. Be precise, use real formulas if applicable.`;

    const messages: FeatherlessMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Generate ${count} ${difficulty} MCQs on ${topic} for ${examType}.` },
    ];

    const aiResponse = await callFeatherlessChat(messages, {
      model: getFeatherlessModel('phi3'),
      temperature: 0.7,
      max_tokens: 1500,
    });

    const responseText = String(aiResponse);
    const questions = parseMCQFromText(responseText, topic, difficulty);

    // If parsing fails, return a structured fallback
    if (questions.length === 0) {
      return NextResponse.json({
        success: true,
        questions: [
          {
            id: `gen_fallback_1`,
            question_text: `${topic}: What is the primary concept being tested in ${difficulty.toLowerCase()} level problems?`,
            options: [
              { label: 'A', text: 'Understanding core definitions' },
              { label: 'B', text: 'Applying formulas directly' },
              { label: 'C', text: 'Combining multiple concepts' },
              { label: 'D', text: 'Interpreting graphical data' },
            ],
            correct_option: 'C',
            explanation: 'Generated question — AI response could not be parsed. Try regenerating.',
            difficulty,
            topic,
          },
        ],
        rawResponse: responseText,
        parsed: false,
      });
    }

    return NextResponse.json({ success: true, questions, parsed: true });

  } catch (error) {
    console.error('/api/ai/generate error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate questions';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
