/**
 * Cogni Core - Next Item Selection API
 * 
 * POST /api/adaptive/next
 * Returns the next optimal item based on IRT + KT hybrid selection
 * 
 * Latency target: < 200ms for 95% of calls
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { IRTEngine, type IRTItem } from '@/lib/irt/engine';
import { KnowledgeTracingEngine, type SkillState } from '@/lib/knowledge-tracing/engine';
import { AdaptiveSelection, type TeacherOverrides, type PedagogicalConstraints } from '@/lib/adaptive/selection';

// ============================================================
// Types
// ============================================================

interface NextItemRequest {
  sessionId: string;
  userId: string;
  forceNew?: boolean; // Force selection even if item in progress
}

interface NextItemResponse {
  success: boolean;
  item?: {
    id: string;
    content: string;
    options?: string[];
    itemType: string;
    subject: string;
    topic: string;
    timeLimit?: number;
  };
  context?: {
    theta: number;
    thetaSE: number;
    expectedDifficulty: number;
    reason: string;
    alternateTopics: string[];
  };
  progress?: {
    totalItems: number;
    precisionProgress: number;
    reliability: number;
    shouldContinue: boolean;
    continueReason: string;
  };
  error?: string;
  latency: number;
}

// ============================================================
// POST - Select Next Item
// ============================================================

export async function POST(request: NextRequest): Promise<NextResponse<NextItemResponse>> {
  const startTime = Date.now();
  
  try {
    const body: NextItemRequest = await request.json();
    const { sessionId, userId, forceNew = false } = body;
    
    // Validate required fields
    if (!sessionId || !userId) {
      return NextResponse.json({
        success: false,
        error: 'sessionId and userId are required',
        latency: Date.now() - startTime,
      }, { status: 400 });
    }
    
    // Fetch session with skill states
    const session = await db.adaptiveSession.findUnique({
      where: { id: sessionId },
      include: { skillStates: true },
    });
    
    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'Session not found',
        latency: Date.now() - startTime,
      }, { status: 404 });
    }
    
    if (session.status !== 'active') {
      return NextResponse.json({
        success: false,
        error: `Session is ${session.status}`,
        latency: Date.now() - startTime,
      }, { status: 400 });
    }
    
    // Parse session data
    const selectedItems = new Set<string>(JSON.parse(session.selectedItems || '[]'));
    const teacherOverride: TeacherOverrides | undefined = session.teacherOverride 
      ? JSON.parse(session.teacherOverride) 
      : undefined;
    
    // Build skill states map
    const skillStates = new Map<string, SkillState>();
    for (const state of session.skillStates) {
      skillStates.set(state.skillId, {
        skillId: state.skillId,
        bkt: {
          pLearn: state.pTransfer,
          pGuess: state.pGuess,
          pSlip: state.pSlip,
          pKnow: state.pKnow,
        },
        deepKT: {
          shortTerm: state.shortTermState,
          longTerm: state.longTermState,
          decayRate: state.decayRate,
          lastUpdate: state.lastAttemptAt?.getTime() || Date.now(),
        },
        history: [],
        mastery: state.pKnow,
        attemptCount: state.attemptCount,
        correctCount: state.correctCount,
        lastAttemptAt: state.lastAttemptAt,
      });
    }
    
    // Get topic exposure
    const topicExposureRecords = await db.topicExposure.findMany({
      where: { userId },
    });
    const topicExposure = new Map<string, number>();
    for (const record of topicExposureRecords) {
      topicExposure.set(record.topic, record.exposureCount);
    }
    
    // Fetch available items
    const availableItems = await db.adaptiveItem.findMany({
      where: {
        isPublished: true,
        isEmbargoed: false,
        OR: [
          { embargoUntil: null },
          { embargoUntil: { lt: new Date() } },
        ],
        // Apply teacher topic constraints
        ...(teacherOverride?.allowedTopics ? {
          topic: { in: teacherOverride.allowedTopics },
        } : {}),
        // Apply subject filter
        subject: session.subject,
      },
      include: {
        stats: true,
      },
    });
    
    // Check if we have items
    if (availableItems.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No items available in the item bank for this subject/constraint',
        latency: Date.now() - startTime,
      }, { status: 503 });
    }
    
    // Convert to IRT items
    const irtItems: IRTItem[] = availableItems.map(item => ({
      id: item.id,
      a: item.discrimination,
      b: item.difficultyParam,
      c: item.guessing,
      topic: item.topic,
      skillId: item.skillId || undefined,
      exposureCount: item.exposureCount,
    }));
    
    // Current ability estimate
    const theta = {
      theta: session.thetaCurrent,
      se: session.thetaSE,
      method: 'EAP' as const,
      confidence: 1.96 * session.thetaSE,
    };
    
    // Pedagogical constraints
    const constraints: PedagogicalConstraints = {
      maxExposurePerItem: 3,
      maxExposurePerTopic: 10,
      minTopicCoverage: 0.8,
      targetDifficultyRange: [-1, 1],
      requireUnseenItems: !forceNew,
    };
    
    // Selection context
    const context = {
      userId,
      sessionId,
      theta,
      skillStates,
      selectedItems,
      topicExposure,
      teacherOverrides: teacherOverride,
    };
    
    // Select next item
    const selection = AdaptiveSelection.selectNextItem(irtItems, context, constraints);
    
    // Check if testing should continue
    const continueCheck = AdaptiveSelection.shouldContinueTesting(theta, irtItems, {
      maxItems: 50,
      targetSE: 0.3,
      minItems: 5,
      currentItemIndex: selectedItems.size,
    });
    
    // Handle no item selected
    if (!selection.item) {
      return NextResponse.json({
        success: false,
        error: selection.reason.secondary.join('; ') || 'No suitable item found',
        progress: {
          totalItems: selectedItems.size,
          precisionProgress: AdaptiveSelection.calculateProgress(theta).precisionProgress,
          reliability: AdaptiveSelection.calculateProgress(theta).reliability,
          shouldContinue: false,
          continueReason: 'Item selection failed',
        },
        latency: Date.now() - startTime,
      });
    }
    
    // Fetch full item details
    const selectedItem = availableItems.find(i => i.id === selection.item!.id);
    
    if (!selectedItem) {
      return NextResponse.json({
        success: false,
        error: 'Selected item not found',
        latency: Date.now() - startTime,
      }, { status: 500 });
    }
    
    // Update session with selected item
    const updatedSelectedItems = [...Array.from(selectedItems), selection.item.id];
    await db.adaptiveSession.update({
      where: { id: sessionId },
      data: {
        selectedItems: JSON.stringify(updatedSelectedItems),
      },
    });
    
    // Increment item exposure
    await db.adaptiveItem.update({
      where: { id: selection.item.id },
      data: {
        exposureCount: { increment: 1 },
      },
    });
    
    // Update topic exposure
    if (selectedItem.topic) {
      await db.topicExposure.upsert({
        where: {
          userId_topic: {
            userId,
            topic: selectedItem.topic,
          },
        },
        create: {
          userId,
          topic: selectedItem.topic,
          subject: selectedItem.subject,
          exposureCount: 1,
        },
        update: {
          exposureCount: { increment: 1 },
          lastExposureAt: new Date(),
        },
      });
    }
    
    const responseTime = Date.now() - startTime;
    console.log(`[Adaptive Next] Selected item ${selection.item.id} in ${responseTime}ms`);
    
    // Build response
    const response: NextItemResponse = {
      success: true,
      item: {
        id: selectedItem.id,
        content: selectedItem.content,
        options: selectedItem.options ? JSON.parse(selectedItem.options) : undefined,
        itemType: selectedItem.itemType,
        subject: selectedItem.subject,
        topic: selectedItem.topic,
        timeLimit: selectedItem.timeLimit || undefined,
      },
      context: {
        theta: session.thetaCurrent,
        thetaSE: session.thetaSE,
        expectedDifficulty: IRTEngine.probability3PL(theta.theta, selection.item),
        reason: `${selection.reason.primary}: ${selection.reason.secondary.join(', ')}`,
        alternateTopics: selection.alternateItems.map(i => i.topic || '').filter(Boolean),
      },
      progress: {
        totalItems: updatedSelectedItems.length,
        precisionProgress: AdaptiveSelection.calculateProgress(theta).precisionProgress,
        reliability: AdaptiveSelection.calculateProgress(theta).reliability,
        shouldContinue: continueCheck.continue,
        continueReason: continueCheck.reason,
      },
      latency: responseTime,
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('[Adaptive Next] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to select next item',
      latency: Date.now() - startTime,
    }, { status: 500 });
  }
}
