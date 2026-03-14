/**
 * POST /api/parse/explain
 * 
 * Generates step-by-step solution with explainability
 */

import { NextRequest, NextResponse } from 'next/server';
import { SolutionGenerator } from '@/lib/multimodal/solution-generator';

// ============================================================
// Types
// ============================================================

interface ExplainRequest {
  problemText: string;
  parsedProblemId?: string;
  userId: string;
  context?: {
    problemType?: string;
    subject?: string;
    variables?: string[];
    concepts?: string[];
  };
}

interface ExplainResponse {
  success: boolean;
  solution?: {
    id?: string;
    problemText: string;
    solutionType: string;
    steps: Array<{
      stepNumber: number;
      title: string;
      description: string;
      latexExpression?: string;
      explanation: string;
      difficulty: string;
      estimatedTime: number;
      concepts: string[];
      hints: string[];
    }>;
    finalAnswer?: string;
    summary: string;
    totalEstimatedTime: number;
    overallDifficulty: string;
    concepts: string[];
    alternatives?: string[];
  };
  error?: string;
  latency: number;
}

// ============================================================
// POST Handler
// ============================================================

export async function POST(
  request: NextRequest
): Promise<NextResponse<ExplainResponse>> {
  const startTime = Date.now();
  
  try {
    const body: ExplainRequest = await request.json();
    const { problemText, parsedProblemId, userId, context } = body;
    
    // Validate required fields
    if (!problemText) {
      return NextResponse.json({
        success: false,
        error: 'problemText is required',
        latency: Date.now() - startTime,
      }, { status: 400 });
    }
    
    // Generate solution
    const solution = await SolutionGenerator.generate(problemText, context);
    
    // Store in database if parsedProblemId provided
    let solutionId: string | undefined;
    if (parsedProblemId && userId) {
      const stored = await SolutionGenerator.store(
        parsedProblemId,
        solution,
        'z-ai-llm'
      );
      solutionId = stored.id;
    }
    
    const latency = Date.now() - startTime;
    console.log(`[Explain] Generated solution in ${latency}ms, ${solution.steps.length} steps, difficulty: ${solution.overallDifficulty}`);
    
    return NextResponse.json({
      success: true,
      solution: {
        id: solutionId,
        problemText: solution.problemText,
        solutionType: solution.solutionType,
        steps: solution.steps,
        finalAnswer: solution.finalAnswer,
        summary: solution.summary,
        totalEstimatedTime: solution.totalEstimatedTime,
        overallDifficulty: solution.overallDifficulty,
        concepts: solution.concepts,
        alternatives: solution.alternatives,
      },
      latency,
    });
    
  } catch (error) {
    console.error('[Explain] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate solution',
      latency: Date.now() - startTime,
    }, { status: 500 });
  }
}

// ============================================================
// PATCH Handler - Get Hint for Step
// ============================================================

export async function PATCH(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { step, studentProgress } = body;
    
    if (!step) {
      return NextResponse.json({
        success: false,
        error: 'step is required',
        latency: Date.now() - startTime,
      }, { status: 400 });
    }
    
    const hint = await SolutionGenerator.generateHint(step, studentProgress);
    
    return NextResponse.json({
      success: true,
      hint,
      latency: Date.now() - startTime,
    });
    
  } catch (error) {
    console.error('[Explain] Hint error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate hint',
      latency: Date.now() - startTime,
    }, { status: 500 });
  }
}
