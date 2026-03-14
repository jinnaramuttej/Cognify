import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import type { 
  ChatRequest, 
  StructuredResponse, 
  QueryMode,
  Message 
} from "@/modules/ai-tutor/types";
import { 
  buildCogniPrompt, 
  validateStructuredResponse, 
  generateFallbackResponse 
} from "@/modules/ai-tutor/utils/promptTemplates";

// Initialize ZAI instance (singleton pattern)
let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

// Rate limiting (simple in-memory, replace with Redis for production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 20; // 20 requests per minute

function checkRateLimit(userId: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(userId);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }
  
  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - record.count };
}

// Prompt injection detection
const INJECTION_PATTERNS = [
  /ignore (all )?(previous|above) instructions/i,
  /disregard (all )?(previous|above)/i,
  /you are now/i,
  /act as if/i,
  /pretend (that )?you are/i,
  /system:\s*/i,
  /\[system\]/i,
  /\<\|system\|\>/i,
  /override (your )?programming/i,
  /forget (your )?instructions/i,
];

function detectPromptInjection(input: string): { detected: boolean; patterns: string[] } {
  const detected: string[] = [];
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      detected.push(pattern.source);
    }
  }
  return { detected: detected.length > 0, patterns: detected };
}

// Detect query mode from message
function detectQueryMode(message: string, capability?: string): QueryMode {
  if (capability === 'fix_with_cogni') return 'remediate';
  if (capability === 'solve_mistakes') return 'review_mistake';
  if (capability === 'summarize_chapter') return 'summarize';
  if (capability === 'generate_practice') return 'practice';
  
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('mistake') || lowerMessage.includes('wrong answer') || lowerMessage.includes('why did i get')) {
    return 'review_mistake';
  }
  if (lowerMessage.includes('solve') || lowerMessage.includes('calculate') || lowerMessage.includes('find the')) {
    return 'solve';
  }
  if (lowerMessage.includes('practice') || lowerMessage.includes('questions on') || lowerMessage.includes('give me questions')) {
    return 'practice';
  }
  if (lowerMessage.includes('summarize') || lowerMessage.includes('summary of') || lowerMessage.includes('overview')) {
    return 'summarize';
  }
  if (lowerMessage.includes('explain') || lowerMessage.includes('what is') || lowerMessage.includes('how does')) {
    return 'explain';
  }
  
  return 'explain'; // default
}

// Extract topics from response
function extractTopics(response: string): string[] {
  const topics: string[] = [];
  
  // Extract capitalized terms that might be topics
  const topicPatterns = [
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g,
    /\b(physics|chemistry|mathematics|biology)\b/gi,
    /\b(mechanics|thermodynamics|electromagnetism|optics)\b/gi,
    /\b(calculus|algebra|geometry|trigonometry)\b/gi,
    /\b(organic|inorganic|physical)\s+chemistry\b/gi,
  ];
  
  const seen = new Set<string>();
  for (const pattern of topicPatterns) {
    const matches = response.match(pattern);
    if (matches) {
      for (const match of matches) {
        const normalized = match.trim();
        if (normalized.length > 3 && !seen.has(normalized.toLowerCase())) {
          seen.add(normalized.toLowerCase());
          topics.push(normalized);
        }
      }
    }
  }
  
  return topics.slice(0, 5);
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { 
      message, 
      userContext, 
      history, 
      capability,
      mode: providedMode,
      hintContext,
      remediationContext 
    } = body;

    // Validate input
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      );
    }

    // Check message length
    if (message.length > 2000) {
      return NextResponse.json(
        { success: false, error: "Message too long. Maximum 2000 characters." },
        { status: 400 }
      );
    }

    // Rate limiting
    const rateCheck = checkRateLimit(userContext?.userId || 'anonymous');
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Rate limit exceeded. Please wait a moment before sending another message.",
          retryAfter: 60
        },
        { status: 429 }
      );
    }

    // Prompt injection detection
    const injectionCheck = detectPromptInjection(message);
    if (injectionCheck.detected) {
      return NextResponse.json({
        success: false,
        error: "Your message contains patterns that may be trying to manipulate the AI. Please rephrase your question.",
        response: "I'd be happy to help with your academic questions. Could you please rephrase what you're asking?",
        timestamp: new Date().toISOString(),
      });
    }

    const zai = await getZAI();

    // Determine query mode
    const mode: QueryMode = providedMode || detectQueryMode(message, capability);

    // Get topics discussed from history
    const topicsDiscussed = history
      .filter(m => m.role === 'assistant')
      .flatMap(m => m.topicsDiscussed || [])
      .slice(-10);

    // Build prompts using the new template system
    const { systemPrompt, userPrompt } = buildCogniPrompt({
      mode,
      userContext: userContext || {
        userId: 'guest',
        grade: '12',
        target: 'JEE',
        weakTopics: [],
        recentAccuracy: 0,
        recentTestAttempts: [],
        studyStreak: 0,
        lastActiveDate: null,
      },
      userMessage: message,
      history: history.map(m => ({ role: m.role, content: m.content })),
      topicsDiscussed,
      hintContext: hintContext ? {
        previousHints: [],
        hintLevel: 1,
      } : undefined,
      remediationContext,
    });

    // Build messages array for the LLM
    const messages = [
      {
        role: "assistant" as const,
        content: systemPrompt,
      },
      // Include recent history (last 8 messages for context)
      ...history.slice(-8).map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      {
        role: "user" as const,
        content: userPrompt,
      },
    ];

    // Get completion from LLM
    const completion = await zai.chat.completions.create({
      messages,
      thinking: { type: "disabled" },
    });

    const responseContent = completion.choices[0]?.message?.content;

    if (!responseContent) {
      throw new Error("Empty response from AI");
    }

    // Try to parse structured response
    const validation = validateStructuredResponse(responseContent);
    let structured: StructuredResponse | undefined;
    let finalResponse = responseContent;

    if (validation.isValid && validation.structured) {
      structured = validation.structured;
      // Use the structured content for display
      finalResponse = formatStructuredResponse(validation.structured);
    } else {
      // Generate fallback structured response
      structured = generateFallbackResponse(responseContent);
    }

    // Extract topics from the response
    const topicsInResponse = extractTopics(responseContent);

    // Estimate tokens (rough estimate)
    const inputTokens = Math.ceil(message.length / 4);
    const outputTokens = Math.ceil(responseContent.length / 4);
    const totalTokens = inputTokens + outputTokens;

    // Generate follow-up suggestions based on mode and topics
    const followUpSuggestions = generateFollowUpSuggestions(mode, topicsInResponse, userContext);

    return NextResponse.json({
      success: true,
      response: finalResponse,
      structured,
      mode,
      topicsDiscussed: topicsInResponse,
      followUpSuggestions,
      timestamp: new Date().toISOString(),
      tokensUsed: totalTokens,
      rateLimitRemaining: rateCheck.remaining,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";

    console.error("[COGNI CHAT ERROR]", error);

    // Provide a helpful fallback response
    const fallbackResponse = `I apologize, but I encountered an issue processing your request. 

Here are some ways I can help:

• **Explain a concept**: "Explain Newton's laws of motion"
• **Solve a problem**: "How do I solve this integration problem?"
• **Practice questions**: "Give me practice questions on thermodynamics"
• **Review mistakes**: "Why is my answer wrong?"
• **Chapter summary**: "Summarize electrostatics"

How can I assist you today?`;

    return NextResponse.json({
      success: false,
      error: errorMessage,
      response: fallbackResponse,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Format structured response for display
 */
function formatStructuredResponse(structured: StructuredResponse): string {
  let output = `**Understanding:** ${structured.understanding}\n\n`;
  output += `**Approach:** ${structured.strategy}\n\n`;
  
  output += "**Step-by-Step Solution:**\n";
  for (const step of structured.steps) {
    output += `\n**${step.stepNumber}. ${step.title}**\n`;
    output += `${step.content}\n`;
    if (step.explanation) {
      output += `*Why: ${step.explanation}*\n`;
    }
    if (step.formulas && step.formulas.length > 0) {
      output += `Formulas: ${step.formulas.join(', ')}\n`;
    }
  }
  
  output += `\n---\n\n**✓ Final Answer:** ${structured.finalAnswer}\n\n`;
  output += `**Check Your Understanding:** ${structured.followUpQuestion}`;
  
  return output;
}

/**
 * Generate follow-up suggestions based on context
 */
function generateFollowUpSuggestions(
  mode: QueryMode, 
  topics: string[], 
  userContext?: any
): Array<{ id: string; label: string; type: string; context: string }> {
  const suggestions: Array<{ id: string; label: string; type: string; context: string }> = [];
  const topic = topics[0] || 'this topic';
  
  switch (mode) {
    case 'explain':
      suggestions.push({
        id: '1',
        label: 'Give me practice questions',
        type: 'practice',
        context: topic,
      });
      suggestions.push({
        id: '2',
        label: 'Show me a solved example',
        type: 'example',
        context: topic,
      });
      suggestions.push({
        id: '3',
        label: 'Make it harder',
        type: 'challenge',
        context: topic,
      });
      break;
      
    case 'solve':
      suggestions.push({
        id: '1',
        label: 'Explain the concept behind this',
        type: 'concept',
        context: topic,
      });
      suggestions.push({
        id: '2',
        label: 'Give me a similar problem',
        type: 'practice',
        context: topic,
      });
      suggestions.push({
        id: '3',
        label: 'What if we changed a value?',
        type: 'variation',
        context: topic,
      });
      break;
      
    case 'review_mistake':
      suggestions.push({
        id: '1',
        label: 'Practice more like this',
        type: 'practice',
        context: topic,
      });
      suggestions.push({
        id: '2',
        label: 'Explain the underlying concept',
        type: 'concept',
        context: topic,
      });
      break;
      
    default:
      suggestions.push({
        id: '1',
        label: 'Tell me more',
        type: 'detail',
        context: topic,
      });
      suggestions.push({
        id: '2',
        label: 'Give me practice',
        type: 'practice',
        context: topic,
      });
  }
  
  // Add weakness-based suggestion if applicable
  if (userContext?.weakTopics?.length > 0) {
    const weakest = userContext.weakTopics[0];
    suggestions.push({
      id: 'weakness',
      label: `Improve ${weakest.topic}`,
      type: 'weakness',
      context: weakest.topic,
    });
  }
  
  return suggestions.slice(0, 4);
}
