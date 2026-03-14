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
 * POST /api/ai-tutor/vision
 * Analyze an image (problem, diagram, etc.) using VLM
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageBase64, mimeType, question } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { success: false, error: "Image data is required" },
        { status: 400 }
      );
    }

    const zai = await getZAI();

    // Build the vision request
    const prompt = question || `
Analyze this image. If it contains:
1. A math/physics/chemistry problem: Extract the problem statement clearly
2. A diagram: Describe what the diagram shows
3. Text: Extract all visible text
4. An equation: Identify and write out the equation

Provide:
- Problem type (if applicable)
- Extracted text/content
- Key elements identified
- Suggested next steps for solving
`;

    const imageUrl = `data:${mimeType || 'image/jpeg'};base64,${imageBase64}`;

    const response = await zai.chat.completions.createVision({
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      thinking: { type: 'disabled' },
    });

    const analysis = response.choices[0]?.message?.content;

    if (!analysis) {
      return NextResponse.json({
        success: false,
        error: "Could not analyze the image. Please try again.",
      });
    }

    // Extract problem type from the analysis
    const problemType = detectProblemType(analysis);

    return NextResponse.json({
      success: true,
      analysis,
      problemType,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[VISION ERROR]", error);
    
    return NextResponse.json({
      success: false,
      error: "Failed to analyze the image. Please describe your question in text instead.",
    });
  }
}

/**
 * Detect the type of problem from the analysis
 */
function detectProblemType(analysis: string): string {
  const lowerAnalysis = analysis.toLowerCase();
  
  if (lowerAnalysis.includes('equation') || lowerAnalysis.includes('solve for') || lowerAnalysis.includes('= ')) {
    return 'equation';
  }
  if (lowerAnalysis.includes('physics') || lowerAnalysis.includes('force') || lowerAnalysis.includes('velocity') || lowerAnalysis.includes('acceleration')) {
    return 'physics';
  }
  if (lowerAnalysis.includes('chemistry') || lowerAnalysis.includes('molecule') || lowerAnalysis.includes('reaction')) {
    return 'chemistry';
  }
  if (lowerAnalysis.includes('integral') || lowerAnalysis.includes('derivative') || lowerAnalysis.includes('calculus')) {
    return 'calculus';
  }
  if (lowerAnalysis.includes('geometry') || lowerAnalysis.includes('triangle') || lowerAnalysis.includes('circle')) {
    return 'geometry';
  }
  
  return 'general';
}
