import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

// Initialize ZAI instance
let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

/**
 * POST /api/ai-tutor/voice
 * Transcribe voice input to text using ASR
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { audioBase64 } = body;

    if (!audioBase64) {
      return NextResponse.json(
        { success: false, error: "Audio data is required" },
        { status: 400 }
      );
    }

    const zai = await getZAI();

    // Transcribe audio using ASR
    const response = await zai.audio.asr.create({
      file_base64: audioBase64,
    });

    const transcription = response.text;

    if (!transcription || transcription.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: "Could not transcribe audio. Please try again.",
        transcription: "",
      });
    }

    return NextResponse.json({
      success: true,
      transcription,
      wordCount: transcription.split(/\s+/).length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[ASR ERROR]", error);
    
    return NextResponse.json({
      success: false,
      error: "Failed to transcribe audio. Please try typing your question instead.",
      transcription: "",
    });
  }
}
