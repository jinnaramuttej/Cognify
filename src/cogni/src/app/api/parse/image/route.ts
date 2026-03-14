/**
 * POST /api/parse/image
 * 
 * Parses an image (handwritten problem, screenshot, textbook photo)
 * using VLM for OCR and LaTeX extraction
 */

import { NextRequest, NextResponse } from 'next/server';
import { ImageParser } from '@/lib/multimodal/image-parser';

// ============================================================
// Types
// ============================================================

interface ParseImageRequest {
  imageBase64: string;
  mimeType?: string;
  userId: string;
  fileName?: string;
  sourceType?: 'image' | 'camera' | 'screenshot';
}

interface ParseImageResponse {
  success: boolean;
  result?: {
    id: string;
    rawText: string;
    latexExpressions: string[];
    normalizedText: string;
    confidence: number;
    regions: Array<{
      id: string;
      x: number;
      y: number;
      width: number;
      height: number;
      label: string;
      text: string;
      confidence: number;
    }>;
    context: {
      problemType: string;
      subject: string;
      variables: string[];
      concepts: string[];
      difficulty: string;
    };
    needsManualReview: boolean;
  };
  error?: string;
  latency: number;
}

// ============================================================
// POST Handler
// ============================================================

export async function POST(
  request: NextRequest
): Promise<NextResponse<ParseImageResponse>> {
  const startTime = Date.now();
  
  try {
    const body: ParseImageRequest = await request.json();
    const {
      imageBase64,
      mimeType = 'image/png',
      userId,
      fileName,
      sourceType = 'image',
    } = body;
    
    // Validate required fields
    if (!imageBase64) {
      return NextResponse.json({
        success: false,
        error: 'imageBase64 is required',
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
    
    // Parse image using VLM
    const parseResult = await ImageParser.parse(imageBase64, mimeType);
    
    // Store in database
    const stored = await ImageParser.store(
      userId,
      sourceType,
      parseResult,
      fileName,
      mimeType
    );
    
    const latency = Date.now() - startTime;
    console.log(`[Parse Image] Processed image in ${latency}ms, confidence: ${parseResult.confidence.toFixed(2)}`);
    
    return NextResponse.json({
      success: true,
      result: {
        id: stored.id,
        rawText: parseResult.rawText,
        latexExpressions: parseResult.latexExpressions,
        normalizedText: parseResult.normalizedText,
        confidence: parseResult.confidence,
        regions: parseResult.regions,
        context: parseResult.context,
        needsManualReview: parseResult.needsManualReview,
      },
      latency,
    });
    
  } catch (error) {
    console.error('[Parse Image] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse image',
      latency: Date.now() - startTime,
    }, { status: 500 });
  }
}

// ============================================================
// PATCH Handler - Save Corrections
// ============================================================

export async function PATCH(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const {
      parsedProblemId,
      originalText,
      correctedText,
      originalLatex,
      correctedLatex,
      correctionSource = 'user',
    } = body;
    
    if (!parsedProblemId || !correctedText) {
      return NextResponse.json({
        success: false,
        error: 'parsedProblemId and correctedText are required',
        latency: Date.now() - startTime,
      }, { status: 400 });
    }
    
    const correction = await ImageParser.saveCorrection(
      parsedProblemId,
      originalText || '',
      correctedText,
      originalLatex,
      correctedLatex,
      correctionSource
    );
    
    return NextResponse.json({
      success: true,
      correction: {
        id: correction.id,
        correctedText: correction.correctedText,
        correctedLatex: correction.correctedLatex,
      },
      latency: Date.now() - startTime,
    });
    
  } catch (error) {
    console.error('[Parse Image] Correction error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save correction',
      latency: Date.now() - startTime,
    }, { status: 500 });
  }
}
