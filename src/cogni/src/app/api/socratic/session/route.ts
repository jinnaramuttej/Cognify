/**
 * Socratic Session API
 * 
 * GET /api/socratic/session - Get session status
 * POST /api/socratic/session - Create new session
 * PATCH /api/socratic/session - Update session (e.g., end session)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { HintBudget, HintBudgetConfig } from '@/lib/socratic/types';
import { DEFAULT_BUDGET_CONFIG, HINT_LEVELS } from '@/lib/socratic/types';
import { createInitialBudget } from '@/lib/socratic/budget-logic';

// ============================================================
// GET Handler - Get Session Status
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
    
    // Find active session
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
    
    // Calculate budget status
    const budget: HintBudget = {
      total: 20.0,
      remaining: hintSession.budgetRemaining,
      used: hintSession.hintsUsed,
      level4Used: hintSession.level4Used,
      maxLevel4PerSession: DEFAULT_BUDGET_CONFIG.maxLevel4PerSession,
      escalationThreshold: DEFAULT_BUDGET_CONFIG.escalationThreshold,
      isEscalationTriggered: hintSession.escalationTriggered,
    };
    
    // Calculate statistics
    const feedbackStats = {
      total: hintSession.hintUsages.filter(h => h.feedback).length,
      helpful: hintSession.hintUsages.filter(h => h.feedback?.wasHelpful).length,
      avgRating: 0,
    };
    
    const ratings = hintSession.hintUsages
      .filter(h => h.feedback?.rating)
      .map(h => h.feedback!.rating!);
    
    if (ratings.length > 0) {
      feedbackStats.avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    }
    
    // Level distribution
    const levelDistribution: Record<number, number> = {};
    for (let i = 1; i <= 4; i++) {
      levelDistribution[i] = hintSession.hintUsages.filter(h => h.hintLevel === i).length;
    }
    
    return NextResponse.json({
      success: true,
      session: {
        id: hintSession.id,
        startedAt: hintSession.startedAt,
        hintsUsed: hintSession.hintsUsed,
        escalationTriggered: hintSession.escalationTriggered,
        escalationType: hintSession.escalationType,
      },
      budget,
      stats: {
        totalHints: hintSession.hintsUsed,
        levelDistribution,
        feedback: feedbackStats,
      },
      recentHints: hintSession.hintUsages.slice(0, 5).map(h => ({
        id: h.id,
        level: h.hintLevel,
        content: h.hintContent.substring(0, 100) + (h.hintContent.length > 100 ? '...' : ''),
        wasHelpful: h.feedback?.wasHelpful,
        feedbackRating: h.feedback?.rating,
      })),
    });
    
  } catch (error) {
    console.error('[Socratic Session GET] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get session',
    }, { status: 500 });
  }
}

// ============================================================
// POST Handler - Create New Session
// ============================================================

export async function POST(
  request: NextRequest
): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { userId, sessionId, customConfig } = body;
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'userId is required',
      }, { status: 400 });
    }
    
    // Check for existing active session
    const existingSession = await db.hintSession.findFirst({
      where: {
        userId,
        sessionId: sessionId || null,
        endedAt: null,
      },
    });
    
    if (existingSession) {
      return NextResponse.json({
        success: true,
        session: existingSession,
        message: 'Active session already exists',
      });
    }
    
    // Get or create budget config
    let budgetConfig = DEFAULT_BUDGET_CONFIG;
    
    if (customConfig?.classId) {
      const teacherConfig = await db.hintBudgetConfig.findFirst({
        where: {
          OR: [
            { classId: customConfig.classId },
            { userId },
          ],
          isActive: true,
        },
      });
      
      if (teacherConfig) {
        budgetConfig = {
          maxHintsPerItem: teacherConfig.maxHintsPerItem,
          maxHintsPerSession: teacherConfig.maxHintsPerSession,
          maxLevel4PerSession: teacherConfig.maxLevel4PerSession,
          escalationThreshold: teacherConfig.escalationThreshold,
          levelWeights: {
            1: teacherConfig.level1Weight,
            2: teacherConfig.level2Weight,
            3: teacherConfig.level3Weight,
            4: teacherConfig.level4Weight,
          },
          reduceOnCorrect: teacherConfig.reduceOnCorrect,
          increaseOnStruggle: teacherConfig.increaseOnStruggle,
        };
      }
    }
    
    // Create new session
    const hintSession = await db.hintSession.create({
      data: {
        userId,
        sessionId: sessionId || null,
        budgetRemaining: budgetConfig.maxHintsPerSession * budgetConfig.levelWeights[1] * 2,
        hintsUsed: 0,
        level4Used: 0,
      },
    });
    
    const budget = createInitialBudget(budgetConfig);
    
    return NextResponse.json({
      success: true,
      session: hintSession,
      budget,
      config: budgetConfig,
    });
    
  } catch (error) {
    console.error('[Socratic Session POST] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create session',
    }, { status: 500 });
  }
}

// ============================================================
// PATCH Handler - Update Session
// ============================================================

export async function PATCH(
  request: NextRequest
): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { hintSessionId, action, userId } = body;
    
    if (!hintSessionId) {
      return NextResponse.json({
        success: false,
        error: 'hintSessionId is required',
      }, { status: 400 });
    }
    
    switch (action) {
      case 'end': {
        const session = await db.hintSession.update({
          where: { id: hintSessionId },
          data: { endedAt: new Date() },
        });
        
        return NextResponse.json({
          success: true,
          session,
          message: 'Session ended successfully',
        });
      }
      
      case 'escalate': {
        const { escalationType } = body;
        
        const session = await db.hintSession.update({
          where: { id: hintSessionId },
          data: {
            escalationTriggered: true,
            escalationType,
          },
        });
        
        return NextResponse.json({
          success: true,
          session,
          escalationType,
        });
      }
      
      case 'reset_budget': {
        const session = await db.hintSession.update({
          where: { id: hintSessionId },
          data: {
            budgetRemaining: 20.0,
          },
        });
        
        return NextResponse.json({
          success: true,
          session,
          message: 'Budget reset successfully',
        });
      }
      
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action',
        }, { status: 400 });
    }
    
  } catch (error) {
    console.error('[Socratic Session PATCH] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update session',
    }, { status: 500 });
  }
}
