/**
 * POST /api/socratic/feedback
 * 
 * Submit feedback on hint helpfulness
 * Updates quality scores for future hint improvement
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { FeedbackRating, FeedbackType } from '@/lib/socratic/types';
import { calculateQualityScore } from '@/lib/socratic/budget-logic';

// ============================================================
// Types
// ============================================================

interface SubmitFeedbackRequest {
  hintUsageId: string;
  userId: string;
  wasHelpful: boolean;
  rating?: FeedbackRating;
  feedbackType?: FeedbackType;
  freeformFeedback?: string;
  helpedSolve?: boolean;
  timeToSolve?: number; // seconds
}

interface SubmitFeedbackResponse {
  success: boolean;
  updatedStats?: {
    avgHelpfulness: number;
    totalFeedback: number;
  };
  error?: string;
}

// ============================================================
// POST Handler
// ============================================================

export async function POST(
  request: NextRequest
): Promise<NextResponse<SubmitFeedbackResponse>> {
  try {
    const body: SubmitFeedbackRequest = await request.json();
    const {
      hintUsageId,
      userId,
      wasHelpful,
      rating,
      feedbackType,
      freeformFeedback,
      helpedSolve,
      timeToSolve,
    } = body;
    
    if (!hintUsageId || !userId) {
      return NextResponse.json({
        success: false,
        error: 'hintUsageId and userId are required',
      }, { status: 400 });
    }
    
    // Verify hint usage exists
    const hintUsage = await db.hintUsage.findUnique({
      where: { id: hintUsageId },
      include: { feedback: true },
    });
    
    if (!hintUsage) {
      return NextResponse.json({
        success: false,
        error: 'Hint usage not found',
      }, { status: 404 });
    }
    
    // Check if feedback already exists
    if (hintUsage.feedback) {
      // Update existing feedback
      await db.hintFeedback.update({
        where: { hintUsageId },
        data: {
          wasHelpful,
          rating,
          feedbackType,
          freeformFeedback,
          helpedSolve,
          timeToSolve,
        },
      });
    } else {
      // Create new feedback
      await db.hintFeedback.create({
        data: {
          hintUsageId,
          rating,
          wasHelpful,
          feedbackType,
          freeformFeedback,
          helpedSolve,
          timeToSolve,
        },
      });
    }
    
    // Update hint session statistics
    const session = await db.hintSession.findUnique({
      where: { id: hintUsage.hintSessionId },
      include: {
        hintUsages: {
          include: { feedback: true },
        },
      },
    });
    
    if (session) {
      const allFeedback = session.hintUsages
        .filter(h => h.feedback)
        .map(h => h.feedback!);
      
      const helpfulCount = allFeedback.filter(f => f.wasHelpful).length;
      const unhelpfulCount = allFeedback.filter(f => !f.wasHelpful).length;
      const avgRating = allFeedback
        .filter(f => f.rating)
        .reduce((sum, f) => sum + (f.rating || 0), 0) / allFeedback.length || 0;
      
      const avgHelpfulness = calculateQualityScore(helpfulCount, unhelpfulCount, avgRating);
      
      await db.hintSession.update({
        where: { id: session.id },
        data: {
          avgHelpfulness,
          totalFeedback: allFeedback.length,
        },
      });
    }
    
    // Update wasCorrectAfter on hint usage if helpedSolve is provided
    if (helpedSolve !== undefined) {
      await db.hintUsage.update({
        where: { id: hintUsageId },
        data: { wasCorrectAfter: helpedSolve },
      });
    }
    
    return NextResponse.json({
      success: true,
      updatedStats: {
        avgHelpfulness: session?.avgHelpfulness || 0,
        totalFeedback: session?.totalFeedback || 0,
      },
    });
    
  } catch (error) {
    console.error('[Socratic Feedback] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit feedback',
    }, { status: 500 });
  }
}

// ============================================================
// GET Handler - Get feedback stats
// ============================================================

export async function GET(
  request: NextRequest
): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const hintUsageId = searchParams.get('hintUsageId');
    
    if (hintUsageId) {
      // Get feedback for specific hint
      const feedback = await db.hintFeedback.findUnique({
        where: { hintUsageId },
      });
      
      return NextResponse.json({
        success: true,
        feedback,
      });
    }
    
    if (userId) {
      // Get overall feedback stats for user
      const hintUsages = await db.hintUsage.findMany({
        where: { userId },
        include: { feedback: true },
      });
      
      const allFeedback = hintUsages
        .filter(h => h.feedback)
        .map(h => h.feedback!);
      
      const stats = {
        totalHints: hintUsages.length,
        totalFeedback: allFeedback.length,
        helpfulCount: allFeedback.filter(f => f.wasHelpful).length,
        unhelpfulCount: allFeedback.filter(f => !f.wasHelpful).length,
        avgRating: allFeedback
          .filter(f => f.rating)
          .reduce((sum, f) => sum + (f.rating || 0), 0) / allFeedback.length || 0,
      };
      
      return NextResponse.json({
        success: true,
        stats,
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'userId or hintUsageId is required',
    }, { status: 400 });
    
  } catch (error) {
    console.error('[Socratic Feedback GET] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get feedback',
    }, { status: 500 });
  }
}
