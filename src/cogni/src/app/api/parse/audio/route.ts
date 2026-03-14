/**
 * POST /api/parse/audio
 * 
 * Transcribes audio using ASR with mathematical punctuation
 */

import { NextRequest, NextResponse } from 'next/server';
import { AudioParser } from '@/lib/multimodal/audio-parser';

// ============================================================
// Types
// ============================================================

interface ParseAudioRequest {
  audioBase64: string;
  userId: string;
  fileName?: string;
}

interface ParseAudioResponse {
  success: boolean;
  result?: {
    id: string;
    transcript: string;
    cleanedTranscript: string;
    mathematicalText: string;
    confidence: number;
    detectedCommands: Array<{
      command: string;
      text: string;
      position: number;
    }>;
    detectedMath: Array<{
      text: string;
      latex: string;
      position: { start: number; end: number };
    }>;
    needsManualReview: boolean;
    duration: number;
  };
  error?: string;
  latency: number;
}

// ============================================================
// POST Handler
// ============================================================

export async function POST(
  request: NextRequest
): Promise<NextResponse<ParseAudioResponse>> {
  const startTime = Date.now();
  
  try {
    const body: ParseAudioRequest = await request.json();
    const { audioBase64, userId, fileName } = body;
    
    // Validate required fields
    if (!audioBase64) {
      return NextResponse.json({
        success: false,
        error: 'audioBase64 is required',
        latency: Date.now() - startTime,
      }, { status: 400 });
    }
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'userId is required',
        latency: Date.now() - startTime,
      }, { status: 400 });
    }
    
    // Transcribe audio using ASR
    const result = await AudioParser.transcribe(audioBase64);
    
    // Store in database
    const stored = await AudioParser.store(userId, result, fileName);
    
    const latency = Date.now() - startTime;
    console.log(`[Parse Audio] Transcribed in ${latency}ms (${result.duration}ms ASR), confidence: ${result.confidence.toFixed(2)}`);
    
    return NextResponse.json({
      success: true,
      result: {
        id: stored.id,
        transcript: result.transcript,
        cleanedTranscript: result.cleanedTranscript,
        mathematicalText: result.mathematicalText,
        confidence: result.confidence,
        detectedCommands: result.detectedCommands.map(c => ({
          command: c.command,
          text: c.text,
          position: c.position,
        })),
        detectedMath: result.detectedMath,
        needsManualReview: result.needsManualReview,
        duration: result.duration,
      },
      latency,
    });
    
  } catch (error) {
    console.error('[Parse Audio] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to transcribe audio',
      latency: Date.now() - startTime,
    }, { status: 500 });
  }
}
