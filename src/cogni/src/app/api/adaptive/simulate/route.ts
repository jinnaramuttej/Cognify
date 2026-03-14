/**
 * POST /api/adaptive/simulate
 * Runs the test harness simulation for validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { TestHarness, generateSampleItems } from '@/lib/adaptive/test-harness';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json().catch(() => ({}));
    const {
      numStudents = 100, // Reduced for API timeout
      maxItems = 30,
      targetSE = 0.3,
      minItems = 5,
    } = body;
    
    // Generate sample items
    const items = generateSampleItems(100);
    
    // Run simulation
    const { results, summary } = await TestHarness.runSimulationStudy({
      numStudents,
      thetaRange: [-3, 3],
      items,
      maxItems,
      targetSE,
      minItems,
    });
    
    const latency = Date.now() - startTime;
    
    return NextResponse.json({
      success: true,
      summary: {
        ...summary,
        totalLatency: latency,
      },
      sampleResults: results.slice(0, 10), // Return first 10 for review
      thetaDistribution: results.map(r => ({
        trueTheta: r.trueTheta,
        estimatedTheta: r.estimatedTheta,
        bias: r.bias,
      })),
    });
    
  } catch (error) {
    console.error('[Simulation] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Simulation failed',
    }, { status: 500 });
  }
}
