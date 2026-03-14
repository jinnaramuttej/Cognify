/**
 * POST /api/socratic/escalate
 * 
 * Generates escalation content (ELI5 or worked example)
 * when student repeatedly uses Level 4 hints
 */

import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { db } from '@/lib/db';
import { buildEscalationPrompt } from '@/lib/socratic/prompt-templates';
import type { HintContext } from '@/lib/socratic/types';

// Singleton ZAI instance
let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

// ============================================================
// Types
// ============================================================

type EscalationType = 'eli5' | 'worked_example' | 'video' | 'teacher_help';

interface EscalateRequest {
  userId: string;
  type: EscalationType;
  context: HintContext;
}

interface EscalateResponse {
  success: boolean;
  content?: {
    type: EscalationType;
    title: string;
    content: string;
  };
  error?: string;
}

// ============================================================
// POST Handler
// ============================================================

export async function POST(
  request: NextRequest
): Promise<NextResponse<EscalateResponse>> {
  try {
    const body: EscalateRequest = await request.json();
    const { userId, type, context } = body;
    
    if (!userId || !type || !context?.questionText) {
      return NextResponse.json({
        success: false,
        error: 'userId, type, and questionText are required',
      }, { status: 400 });
    }
    
    // Handle different escalation types
    let content = '';
    let title = '';
    
    if (type === 'eli5' || type === 'worked_example') {
      const { systemPrompt, userPrompt } = buildEscalationPrompt(type, context);
      
      try {
        const zai = await getZAI();
        
        const completion = await zai.chat.completions.create({
          messages: [
            { role: 'assistant', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          thinking: { type: 'disabled' }
        });
        
        content = completion.choices[0]?.message?.content || '';
      } catch (error) {
        console.error('[Escalation] LLM error:', error);
        content = type === 'eli5' 
          ? "Let's break this down very simply. Think of it like..."
          : "Here's how a similar problem would be solved...";
      }
      
      title = type === 'eli5' 
        ? 'Explain Like I\'m 5' 
        : 'Worked Example';
    } else if (type === 'video') {
      title = 'Video Explanation';
      content = `**Video Resources for: ${context.topic || context.subject || 'This Topic'}**

While we don't have a specific video for this problem, here are some helpful resources:

1. **Khan Academy** - Search for "${context.topic || 'this topic'}"
2. **YouTube Educational Channels** - Look for step-by-step tutorials
3. **Your Textbook** - Check the relevant chapter for worked examples

*Tip: Try breaking down the problem into smaller parts first!*`;
    } else if (type === 'teacher_help') {
      title = 'Teacher Help Request';
      content = `**Request Sent to Your Teacher**

Your teacher has been notified that you need help with:
- Subject: ${context.subject || 'General'}
- Topic: ${context.topic || 'This problem'}

A teacher or tutor will reach out to you soon.

In the meantime:
1. Review your notes on this topic
2. Try similar, simpler problems
3. Write down specific questions you have`;
    }
    
    // Log escalation
    try {
      const hintSession = await db.hintSession.findFirst({
        where: { userId, endedAt: null },
      });
      
      if (hintSession) {
        await db.hintSession.update({
          where: { id: hintSession.id },
          data: {
            escalationTriggered: true,
            escalationType: type,
          },
        });
      }
    } catch (dbError) {
      console.error('[Escalation] DB error:', dbError);
    }
    
    return NextResponse.json({
      success: true,
      content: {
        type,
        title,
        content,
      },
    });
    
  } catch (error) {
    console.error('[Socratic Escalate] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate escalation',
    }, { status: 500 });
  }
}
