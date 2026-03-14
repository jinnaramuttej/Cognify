/**
 * Cogni Core - Adaptive Session API
 * 
 * POST /api/adaptive/session
 * Creates a new adaptive session or retrieves existing one
 * 
 * GET /api/adaptive/session?sessionId=xxx
 * Retrieves session state and history
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { KnowledgeTracingEngine } from '@/lib/knowledge-tracing/engine';

// ============================================================
// Types
// ============================================================

interface CreateSessionRequest {
  userId: string;
  subject: string;
  topic?: string;
  teacherOverride?: {
    forceTopic?: string;
    forceDifficulty?: 'easy' | 'medium' | 'hard';
    skipItems?: string[];
    allowedTopics?: string[];
    blockedItems?: string[];
  };
  biometricOptIn?: boolean;
}

interface SessionResponse {
  success: boolean;
  session?: {
    id: string;
    userId: string;
    subject: string;
    topic: string | null;
    theta: number;
    thetaSE: number;
    status: string;
    totalItems: number;
    correctItems: number;
    startedAt: string;
    skillStates: Array<{
      skillId: string;
      mastery: number;
      level: string;
      attemptCount: number;
    }>;
  };
  error?: string;
}

// ============================================================
// POST - Create/Resume Session
// ============================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body: CreateSessionRequest = await request.json();
    const { userId, subject, topic, teacherOverride, biometricOptIn = false } = body;
    
    // Validate required fields
    if (!userId || !subject) {
      return NextResponse.json({
        success: false,
        error: 'userId and subject are required',
      }, { status: 400 });
    }
    
    // Check for existing active session
    const existingSession = await db.adaptiveSession.findFirst({
      where: {
        userId,
        subject,
        status: 'active',
      },
      include: {
        skillStates: true,
      },
    });
    
    if (existingSession) {
      // Resume existing session
      const skillStates = existingSession.skillStates.map(s => ({
        skillId: s.skillId,
        mastery: s.pKnow,
        level: KnowledgeTracingEngine.getMasteryLevel(s.pKnow),
        attemptCount: s.attemptCount,
      }));
      
      return NextResponse.json({
        success: true,
        session: {
          id: existingSession.id,
          userId: existingSession.userId,
          subject: existingSession.subject,
          topic: existingSession.topic,
          theta: existingSession.thetaCurrent,
          thetaSE: existingSession.thetaSE,
          status: existingSession.status,
          totalItems: existingSession.totalItems,
          correctItems: existingSession.correctItems,
          startedAt: existingSession.startedAt.toISOString(),
          skillStates,
        },
      });
    }
    
    // Create new session
    const newSession = await db.adaptiveSession.create({
      data: {
        userId,
        subject,
        topic: topic || null,
        thetaCurrent: 0.0,
        thetaSE: 1.0,
        thetaHistory: JSON.stringify([]),
        selectedItems: JSON.stringify([]),
        responses: JSON.stringify([]),
        teacherOverride: teacherOverride ? JSON.stringify(teacherOverride) : null,
        biometricOptIn,
        status: 'active',
        totalItems: 0,
        correctItems: 0,
        avgResponseTime: 0,
      },
    });
    
    const responseTime = Date.now() - startTime;
    console.log(`[Adaptive Session] Created session ${newSession.id} in ${responseTime}ms`);
    
    return NextResponse.json({
      success: true,
      session: {
        id: newSession.id,
        userId: newSession.userId,
        subject: newSession.subject,
        topic: newSession.topic,
        theta: newSession.thetaCurrent,
        thetaSE: newSession.thetaSE,
        status: newSession.status,
        totalItems: newSession.totalItems,
        correctItems: newSession.correctItems,
        startedAt: newSession.startedAt.toISOString(),
        skillStates: [],
      },
    });
    
  } catch (error) {
    console.error('[Adaptive Session] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create session',
    }, { status: 500 });
  }
}

// ============================================================
// GET - Retrieve Session State
// ============================================================

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');
    
    if (!sessionId && !userId) {
      return NextResponse.json({
        success: false,
        error: 'sessionId or userId is required',
      }, { status: 400 });
    }
    
    let session;
    
    if (sessionId) {
      session = await db.adaptiveSession.findUnique({
        where: { id: sessionId },
        include: { skillStates: true },
      });
    } else if (userId) {
      session = await db.adaptiveSession.findFirst({
        where: { userId, status: 'active' },
        include: { skillStates: true },
        orderBy: { startedAt: 'desc' },
      });
    }
    
    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'Session not found',
      }, { status: 404 });
    }
    
    const thetaHistory = JSON.parse(session.thetaHistory);
    const responses = JSON.parse(session.responses);
    
    const skillStates = session.skillStates.map(s => ({
      skillId: s.skillId,
      mastery: s.pKnow,
      level: KnowledgeTracingEngine.getMasteryLevel(s.pKnow),
      attemptCount: s.attemptCount,
      correctCount: s.correctCount,
    }));
    
    const responseTime = Date.now() - startTime;
    console.log(`[Adaptive Session] Retrieved session ${session.id} in ${responseTime}ms`);
    
    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        userId: session.userId,
        subject: session.subject,
        topic: session.topic,
        theta: session.thetaCurrent,
        thetaSE: session.thetaSE,
        thetaHistory,
        responses,
        status: session.status,
        totalItems: session.totalItems,
        correctItems: session.correctItems,
        avgResponseTime: session.avgResponseTime,
        startedAt: session.startedAt.toISOString(),
        completedAt: session.completedAt?.toISOString(),
        skillStates,
      },
    });
    
  } catch (error) {
    console.error('[Adaptive Session] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve session',
    }, { status: 500 });
  }
}

// ============================================================
// DELETE - End Session
// ============================================================

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json({
        success: false,
        error: 'sessionId is required',
      }, { status: 400 });
    }
    
    const session = await db.adaptiveSession.update({
      where: { id: sessionId },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    });
    
    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        status: session.status,
        completedAt: session.completedAt?.toISOString(),
      },
    });
    
  } catch (error) {
    console.error('[Adaptive Session] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to end session',
    }, { status: 500 });
  }
}
