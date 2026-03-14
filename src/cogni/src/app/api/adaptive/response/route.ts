/**
 * Cogni Core - Response Submission API
 * 
 * POST /api/adaptive/response
 * Records response, updates IRT ability estimate and KT skill mastery
 * 
 * Latency target: < 200ms
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { IRTEngine, type IRTItem, type ResponseRecord } from '@/lib/irt/engine';
import { KnowledgeTracingEngine } from '@/lib/knowledge-tracing/engine';

// ============================================================
// Types
// ============================================================

interface SubmitResponseRequest {
  sessionId: string;
  userId: string;
  itemId: string;
  userResponse: string;
  responseTime: number; // seconds
  deviceType?: 'desktop' | 'mobile' | 'tablet';
}

interface SubmitResponseResponse {
  success: boolean;
  result?: {
    isCorrect: boolean;
    correctAnswer: string;
    explanation?: string;
    thetaUpdate: {
      before: number;
      after: number;
      se: number;
      change: number;
    };
    skillUpdates: Array<{
      skillId: string;
      masteryBefore: number;
      masteryAfter: number;
      level: string;
    }>;
    progress: {
      totalItems: number;
      correctItems: number;
      accuracy: number;
      precisionProgress: number;
    };
    recommendation?: {
      message: string;
      focusTopic?: string;
    };
  };
  error?: string;
  latency: number;
}

// ============================================================
// POST - Submit Response
// ============================================================

export async function POST(request: NextRequest): Promise<NextResponse<SubmitResponseResponse>> {
  const startTime = Date.now();
  
  try {
    const body: SubmitResponseRequest = await request.json();
    const { sessionId, userId, itemId, userResponse, responseTime, deviceType } = body;
    
    // Validate required fields
    if (!sessionId || !userId || !itemId || userResponse === undefined) {
      return NextResponse.json({
        success: false,
        error: 'sessionId, userId, itemId, and userResponse are required',
        latency: Date.now() - startTime,
      }, { status: 400 });
    }
    
    // Fetch session
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
    
    // Fetch item
    const item = await db.adaptiveItem.findUnique({
      where: { id: itemId },
    });
    
    if (!item) {
      return NextResponse.json({
        success: false,
        error: 'Item not found',
        latency: Date.now() - startTime,
      }, { status: 404 });
    }
    
    // Check correctness
    const isCorrect = userResponse.trim().toLowerCase() === item.correctAnswer.trim().toLowerCase();
    
    // Parse existing responses
    const responses = JSON.parse(session.responses || '[]');
    const thetaHistory = JSON.parse(session.thetaHistory || '[]');
    
    // ============================================================
    // Update IRT Ability Estimate
    // ============================================================
    
    // Build response history for MLE/EAP estimation
    const responseRecords: ResponseRecord[] = responses.map((r: { itemId: string; correct: boolean; theta: number }) => ({
      itemId: r.itemId,
      theta: r.theta,
      response: r.correct,
    }));
    
    // Add current response
    responseRecords.push({
      itemId,
      theta: session.thetaCurrent,
      response: isCorrect,
      responseTime,
    });
    
    // Create items map for estimation
    const itemsMap = new Map<string, IRTItem>();
    
    // Fetch all items that have been administered
    const administeredItems = await db.adaptiveItem.findMany({
      where: {
        id: { in: responseRecords.map(r => r.itemId) },
      },
    });
    
    for (const i of administeredItems) {
      itemsMap.set(i.id, {
        id: i.id,
        a: i.discrimination,
        b: i.difficultyParam,
        c: i.guessing,
        topic: i.topic,
        skillId: i.skillId || undefined,
      });
    }
    
    // Estimate new theta using EAP (more stable for adaptive testing)
    const newEstimate = IRTEngine.estimateEAP(responseRecords, itemsMap, {
      priorMean: session.thetaCurrent, // Use current as prior
      priorSD: session.thetaSE,
    });
    
    // ============================================================
    // Update Knowledge Tracing Skill Mastery
    // ============================================================
    
    const skillUpdates: Array<{
      skillId: string;
      masteryBefore: number;
      masteryAfter: number;
      level: string;
    }> = [];
    
    // Calculate time elapsed for forgetting curve
    const now = Date.now();
    
    // Update skill state if item has associated skill
    if (item.skillId) {
      const existingState = session.skillStates.find(s => s.skillId === item.skillId);
      
      let timeElapsedHours = 0;
      if (existingState?.lastAttemptAt) {
        timeElapsedHours = (now - existingState.lastAttemptAt.getTime()) / (1000 * 60 * 60);
      }
      
      const skillState = existingState 
        ? {
            skillId: existingState.skillId,
            bkt: {
              pLearn: existingState.pTransfer,
              pGuess: existingState.pGuess,
              pSlip: existingState.pSlip,
              pKnow: existingState.pKnow,
            },
            deepKT: {
              shortTerm: existingState.shortTermState,
              longTerm: existingState.longTermState,
              decayRate: existingState.decayRate,
              lastUpdate: existingState.lastAttemptAt?.getTime() || now,
            },
            history: [],
            mastery: existingState.pKnow,
            attemptCount: existingState.attemptCount,
            correctCount: existingState.correctCount,
            lastAttemptAt: existingState.lastAttemptAt,
          }
        : KnowledgeTracingEngine.initializeSkillState(item.skillId, item.subject);
      
      const masteryBefore = skillState.mastery;
      const updatedState = KnowledgeTracingEngine.updateSkillState(skillState, isCorrect, {
        responseTime,
        itemId,
        timeElapsedHours,
      });
      
      // Update or create skill mastery record
      await db.skillMastery.upsert({
        where: {
          sessionId_skillId: {
            sessionId,
            skillId: item.skillId,
          },
        },
        create: {
          sessionId,
          skillId: item.skillId,
          pKnow: updatedState.bkt.pKnow,
          pGuess: updatedState.bkt.pGuess,
          pSlip: updatedState.bkt.pSlip,
          pTransfer: updatedState.bkt.pLearn,
          shortTermState: updatedState.deepKT.shortTerm,
          longTermState: updatedState.deepKT.longTerm,
          decayRate: updatedState.deepKT.decayRate,
          attemptCount: updatedState.attemptCount,
          correctCount: updatedState.correctCount,
          lastAttemptAt: new Date(),
        },
        update: {
          pKnow: updatedState.bkt.pKnow,
          shortTermState: updatedState.deepKT.shortTerm,
          longTermState: updatedState.deepKT.longTerm,
          attemptCount: updatedState.attemptCount,
          correctCount: updatedState.correctCount,
          lastAttemptAt: new Date(),
        },
      });
      
      skillUpdates.push({
        skillId: item.skillId,
        masteryBefore,
        masteryAfter: updatedState.mastery,
        level: KnowledgeTracingEngine.getMasteryLevel(updatedState.mastery),
      });
    }
    
    // ============================================================
    // Record Response
    // ============================================================
    
    const responseRecord = {
      itemId,
      response: userResponse,
      correct: isCorrect,
      time: responseTime,
      thetaBefore: session.thetaCurrent,
      thetaAfter: newEstimate.theta,
      timestamp: now,
    };
    
    responses.push(responseRecord);
    
    // Add to theta history
    thetaHistory.push({
      theta: newEstimate.theta,
      se: newEstimate.se,
      timestamp: now,
      itemId,
      correct: isCorrect,
    });
    
    // Calculate running stats
    const totalItems = responses.length;
    const correctItems = responses.filter((r: { correct: boolean }) => r.correct).length;
    const avgResponseTime = responses.reduce((sum: number, r: { time: number }) => sum + r.time, 0) / responses.length;
    
    // ============================================================
    // Update Session
    // ============================================================
    
    await db.adaptiveSession.update({
      where: { id: sessionId },
      data: {
        thetaCurrent: newEstimate.theta,
        thetaSE: newEstimate.se,
        thetaHistory: JSON.stringify(thetaHistory),
        responses: JSON.stringify(responses),
        totalItems,
        correctItems,
        avgResponseTime,
      },
    });
    
    // ============================================================
    // Record Individual Response for Calibration
    // ============================================================
    
    await db.itemResponse.create({
      data: {
        itemId,
        userId,
        sessionId,
        userResponse,
        isCorrect,
        responseTime,
        thetaBefore: session.thetaCurrent,
        thetaAfter: newEstimate.theta,
        deviceType,
      },
    });
    
    // ============================================================
    // Generate Recommendation
    // ============================================================
    
    let recommendation: { message: string; focusTopic?: string } | undefined;
    
    if (!isCorrect && item.topic) {
      recommendation = {
        message: `Consider reviewing ${item.topic} concepts`,
        focusTopic: item.topic,
      };
    } else if (newEstimate.se < 0.3) {
      recommendation = {
        message: 'Great progress! Your ability estimate is now precise.',
      };
    }
    
    const responseTime = Date.now() - startTime;
    console.log(`[Adaptive Response] Recorded response in ${responseTime}ms, θ: ${session.thetaCurrent.toFixed(2)} → ${newEstimate.theta.toFixed(2)}`);
    
    // ============================================================
    // Build Response
    // ============================================================
    
    return NextResponse.json({
      success: true,
      result: {
        isCorrect,
        correctAnswer: item.correctAnswer,
        explanation: item.explanation || undefined,
        thetaUpdate: {
          before: session.thetaCurrent,
          after: newEstimate.theta,
          se: newEstimate.se,
          change: newEstimate.theta - session.thetaCurrent,
        },
        skillUpdates,
        progress: {
          totalItems,
          correctItems,
          accuracy: correctItems / totalItems,
          precisionProgress: Math.min(1, (1 - session.thetaSE) / (1 - newEstimate.se)),
        },
        recommendation,
      },
      latency: responseTime,
    });
    
  } catch (error) {
    console.error('[Adaptive Response] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to submit response',
      latency: Date.now() - startTime,
    }, { status: 500 });
  }
}
