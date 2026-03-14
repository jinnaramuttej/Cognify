/**
 * POST /api/socratic/hint
 * 
 * Generates a Socratic hint at the requested level
 * Uses LLM to generate pedagogically sound hints
 */

import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { db } from '@/lib/db';
import { buildHintPrompt, buildEscalationPrompt } from '@/lib/socratic/prompt-templates';
import type { HintLevel, GeneratedHint, HintContext, HintBudget } from '@/lib/socratic/types';
import { HINT_LEVELS } from '@/lib/socratic/types';
import { 
  canAffordHint, 
  deductHintCost, 
  createInitialBudget, 
  checkEscalation 
} from '@/lib/socratic/budget-logic';

// ============================================================
// LLM Hint Generation (using z-ai-web-dev-sdk)
// ============================================================

// Singleton ZAI instance
let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

async function generateHintWithLLM(
  level: HintLevel,
  context: HintContext,
  previousHints: string[]
): Promise<string> {
  // Build prompts
  const { systemPrompt, userPrompt } = buildHintPrompt(level, context, previousHints);
  
  try {
    const zai = await getZAI();
    
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      thinking: { type: 'disabled' }
    });
    
    const hintContent = completion.choices[0]?.message?.content;
    
    if (hintContent && hintContent.trim().length > 0) {
      return hintContent.trim();
    }
    
    // Fallback if empty response
    return generateFallbackHint(level, context);
  } catch (error) {
    console.error('[Hint Generation] LLM error:', error);
    return generateFallbackHint(level, context);
  }
}

/**
 * Generate escalation content (ELI5 or worked example)
 */
async function generateEscalationContent(
  type: 'eli5' | 'worked_example',
  context: HintContext
): Promise<string> {
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
    
    const content = completion.choices[0]?.message?.content;
    
    if (content && content.trim().length > 0) {
      return content.trim();
    }
    
    return type === 'eli5' 
      ? "Let's break this down into the simplest terms possible..."
      : "Here's a similar problem worked out step-by-step...";
  } catch (error) {
    console.error('[Escalation] LLM error:', error);
    return type === 'eli5' 
      ? "Let's break this down into the simplest terms possible..."
      : "Here's a similar problem worked out step-by-step...";
  }
}

/**
 * Fallback hint generation when LLM is unavailable
 */
function generateFallbackHint(level: HintLevel, context: HintContext): string {
  const templates: Record<HintLevel, string[]> = {
    1: [
      "Consider what information you have and what you're trying to find. What relationship connects them?",
      "Think about the fundamental principle at play here. What concept does this problem relate to?",
      "Take a step back - what is this problem really asking you to understand?",
      "What do you know about this type of problem? What approaches might work?",
    ],
    2: [
      "What assumptions are you making? Are they all valid?",
      "If you were explaining this to someone else, what would be your first step? Why?",
      "What would happen if one of the values was different? How would that change your approach?",
      "Can you think of a simpler version of this problem? What stays the same?",
      "What's the relationship between the given information and what you need to find?",
    ],
    3: [
      "Start by identifying the known quantities. Now, what equation or principle relates these to the unknown?",
      "The first step is to recognize the type of problem. The key relationship here will help you proceed.",
      "Begin by organizing what you know. A diagram or table might help visualize the connections.",
      "Let's focus on just the first step: identify the relevant formula or principle to apply.",
    ],
    4: [
      `**Complete Solution:**\n\nLet me work through this step-by-step:\n\n**Given:** ${context.subject || 'Problem'} involving ${context.topic || 'this concept'}\n\n**Approach:**\n1. Identify what we're looking for\n2. List the given information\n3. Apply the relevant formula/principle\n4. Solve systematically\n5. Verify the answer\n\nUse this structure to guide your thinking!`,
    ],
  };
  
  const levelTemplates = templates[level];
  return levelTemplates[Math.floor(Math.random() * levelTemplates.length)];
}

// ============================================================
// Types
// ============================================================

interface GenerateHintRequest {
  userId: string;
  sessionId?: string;
  context: HintContext;
  requestedLevel?: HintLevel;
}

interface GenerateHintResponse {
  success: boolean;
  hint?: GeneratedHint;
  budget?: HintBudget;
  escalation?: {
    isTriggered: boolean;
    availableOptions: string[];
  };
  error?: string;
}

// ============================================================
// POST Handler
// ============================================================

export async function POST(
  request: NextRequest
): Promise<NextResponse<GenerateHintResponse>> {
  try {
    const body: GenerateHintRequest = await request.json();
    const { userId, sessionId, context, requestedLevel } = body;
    
    if (!userId || !context?.questionText) {
      return NextResponse.json({
        success: false,
        error: 'userId and questionText are required',
      }, { status: 400 });
    }
    
    // Get or create hint session
    let hintSession = await db.hintSession.findFirst({
      where: {
        userId,
        sessionId: sessionId || null,
        endedAt: null,
      },
      include: {
        hintUsages: {
          orderBy: { requestedAt: 'desc' },
          take: 10,
        },
      },
    });
    
    if (!hintSession) {
      hintSession = await db.hintSession.create({
        data: {
          userId,
          sessionId: sessionId || null,
          budgetRemaining: 20.0,
          hintsUsed: 0,
          level4Used: 0,
        },
        include: { hintUsages: true },
      });
    }
    
    // Build current budget state
    const budget: HintBudget = {
      total: 20.0,
      remaining: hintSession.budgetRemaining,
      used: hintSession.hintsUsed,
      level4Used: hintSession.level4Used,
      maxLevel4PerSession: 3,
      escalationThreshold: 3,
      isEscalationTriggered: hintSession.escalationTriggered,
    };
    
    // Determine level (auto-recommend if not specified)
    const level: HintLevel = requestedLevel || 1;
    
    // Check if can afford
    const affordability = canAffordHint(level, budget);
    if (!affordability.canAfford) {
      return NextResponse.json({
        success: false,
        error: affordability.reason,
        budget,
      }, { status: 400 });
    }
    
    // Get previous hints for context
    const previousHints = hintSession.hintUsages
      .filter(h => h.itemId === context.questionId || h.questionText === context.questionText)
      .map(h => h.hintContent);
    
    // Generate hint
    const startTime = Date.now();
    const hintContent = await generateHintWithLLM(level, context, previousHints);
    const latency = Date.now() - startTime;
    
    // Create hint record
    const hintUsage = await db.hintUsage.create({
      data: {
        hintSessionId: hintSession.id,
        userId,
        itemId: context.questionId,
        questionText: context.questionText,
        subject: context.subject,
        topic: context.topic,
        hintLevel: level,
        hintContent,
        attemptsBefore: context.previousAttempts || 0,
      },
    });
    
    // Update session
    const newBudget = deductHintCost(level, budget);
    const newLevel4Used = level === 4 ? budget.level4Used + 1 : budget.level4Used;
    
    await db.hintSession.update({
      where: { id: hintSession.id },
      data: {
        budgetRemaining: newBudget.remaining,
        hintsUsed: hintSession.hintsUsed + 1,
        level4Used: newLevel4Used,
      },
    });
    
    // Check for escalation
    const escalationState = checkEscalation(newBudget, newLevel4Used);
    
    const generatedHint: GeneratedHint = {
      id: hintUsage.id,
      level,
      content: hintContent,
      generatedAt: new Date(),
      latency,
    };
    
    return NextResponse.json({
      success: true,
      hint: generatedHint,
      budget: {
        ...newBudget,
        level4Used: newLevel4Used,
      },
      escalation: escalationState.isTriggered ? {
        isTriggered: true,
        availableOptions: escalationState.availableOptions,
      } : undefined,
    });
    
  } catch (error) {
    console.error('[Socratic Hint] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate hint',
    }, { status: 500 });
  }
}

// ============================================================
// GET Handler - Get session status
// ============================================================

export async function GET(
  request: NextRequest
): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'userId is required',
      }, { status: 400 });
    }
    
    // Get active session
    const hintSession = await db.hintSession.findFirst({
      where: {
        userId,
        sessionId: sessionId || null,
        endedAt: null,
      },
      include: {
        hintUsages: {
          orderBy: { requestedAt: 'desc' },
          take: 20,
          include: { feedback: true },
        },
      },
    });
    
    if (!hintSession) {
      return NextResponse.json({
        success: true,
        session: null,
        budget: createInitialBudget(),
      });
    }
    
    // Calculate stats
    const totalFeedback = hintSession.hintUsages.filter(h => h.feedback).length;
    const helpfulCount = hintSession.hintUsages.filter(h => h.feedback?.wasHelpful).length;
    
    return NextResponse.json({
      success: true,
      session: {
        id: hintSession.id,
        hintsUsed: hintSession.hintsUsed,
        level4Used: hintSession.level4Used,
        avgHelpfulness: hintSession.avgHelpfulness,
        totalFeedback,
        helpfulCount,
      },
      budget: {
        total: 20.0,
        remaining: hintSession.budgetRemaining,
        used: hintSession.hintsUsed,
        level4Used: hintSession.level4Used,
        maxLevel4PerSession: 3,
        escalationThreshold: 3,
        isEscalationTriggered: hintSession.escalationTriggered,
      },
      hints: hintSession.hintUsages.map(h => ({
        id: h.id,
        level: h.hintLevel,
        content: h.hintContent,
        questionText: h.questionText,
        wasHelpful: h.feedback?.wasHelpful,
        requestedAt: h.requestedAt,
      })),
    });
    
  } catch (error) {
    console.error('[Socratic Hint GET] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get session',
    }, { status: 500 });
  }
}
