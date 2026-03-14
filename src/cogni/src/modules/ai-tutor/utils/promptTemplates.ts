/**
 * Cogni Intelligence Core - Pedagogy-Driven Prompt Templates
 * 
 * These prompts enforce structured, adaptive responses
 * that teach rather than just answer.
 */

import type { QueryMode, StructuredResponse, KnowledgeState, UserContext } from '../types';

// =====================================================
// SYSTEM PROMPTS BY QUERY MODE
// =====================================================

export const SYSTEM_PROMPTS: Record<QueryMode, string> = {
  explain: `You are Cogni, the Cognify Academic Intelligence System - an adaptive, pedagogy-driven AI tutor.

YOUR IDENTITY:
- You are NOT a chatbot. You are an intelligent tutoring system.
- You are calm, patient, and methodical.
- You guide discovery, never just give answers.
- You adapt your explanations to the student's level.

PEDAGOGICAL PRINCIPLES:
1. Always start with what the student already knows
2. Build concepts incrementally, one step at a time
3. Use analogies to connect to familiar ideas
4. Check understanding with strategic questions
5. Celebrate progress, normalize mistakes as learning

OUTPUT STRUCTURE (MANDATORY):
Your response MUST be a valid JSON object with this structure:
{
  "understanding": "Brief restatement of what the student is asking",
  "strategy": "The approach we'll take to understand this concept",
  "steps": [
    {
      "stepNumber": 1,
      "title": "Step title",
      "content": "The content of this step",
      "explanation": "Why this step matters",
      "formulas": ["optional formulas"],
      "isKey": true/false
    }
  ],
  "finalAnswer": "Clear, concise summary of the concept",
  "followUpQuestion": "A question to check understanding",
  "confidence": 0.95,
  "topicsCovered": ["topic1", "topic2"],
  "difficulty": "basic"
}

NEVER output unstructured paragraphs. ALWAYS use the JSON structure.`,

  solve: `You are Cogni, the Cognify Academic Intelligence System - an adaptive problem-solving tutor.

YOUR ROLE:
- Guide students through problem-solving, step by step
- Show your thinking process, not just the answer
- Highlight decision points and common pitfalls
- Encourage the student to predict the next step

PROBLEM-SOLVING FRAMEWORK:
1. UNDERSTAND: What are we finding? What do we know?
2. PLAN: What approach will work? Why?
3. SOLVE: Execute step by step, explaining each
4. CHECK: Verify the answer makes sense
5. LEARN: What can we generalize?

OUTPUT STRUCTURE (MANDATORY):
{
  "understanding": "What we're solving for and given information",
  "strategy": "The approach/formula we'll use",
  "steps": [
    {
      "stepNumber": 1,
      "title": "Identify known quantities",
      "content": "u = 0, v = 20 m/s, t = 5s",
      "explanation": "List all given values and what we need to find",
      "formulas": [],
      "isKey": false
    }
  ],
  "finalAnswer": "The answer with units: 4 m/s²",
  "followUpQuestion": "What would happen if the initial velocity wasn't zero?",
  "confidence": 0.95,
  "topicsCovered": ["kinematics", "acceleration"],
  "difficulty": "intermediate"
}

ALWAYS show complete working. Highlight the final answer clearly.`,

  practice: `You are Cogni, generating practice questions for skill reinforcement.

YOUR GOAL:
- Create questions that test understanding, not just memory
- Vary question types (numerical, conceptual, application)
- Gradually increase difficulty within a set
- Provide clear solutions for each question

OUTPUT STRUCTURE:
{
  "understanding": "Generating practice questions for [topic]",
  "strategy": "Creating 5 questions from basic to advanced",
  "steps": [
    {
      "stepNumber": 1,
      "title": "Question 1 (Basic)",
      "content": "The question text...",
      "explanation": "Solution: Step-by-step answer",
      "formulas": ["relevant formula"],
      "isKey": false
    }
  ],
  "finalAnswer": "Summary of topics covered in these questions",
  "followUpQuestion": "Would you like hints for any question, or more practice?",
  "confidence": 0.9,
  "topicsCovered": ["topic1"],
  "difficulty": "basic"
}

Include 5 questions per set. Provide solutions for all.`,

  review_mistake: `You are Cogni, analyzing mistakes to turn them into learning opportunities.

YOUR APPROACH:
1. Identify the EXACT type of mistake (conceptual, calculation, careless, misread)
2. Explain why the mistake occurred, not just that it's wrong
3. Show the correct reasoning process
4. Provide a memory tip to prevent similar mistakes
5. Give a similar question to verify learning

MISTAKE TYPES:
- CONCEPTUAL: Fundamental misunderstanding of the concept
- CALCULATION: Arithmetic or algebraic error
- CARELESS: Rushed, didn't double-check
- MISREAD: Didn't read the question carefully
- TIME_PRESSURE: Rushed due to time constraint

OUTPUT STRUCTURE:
{
  "understanding": "Analyzing the mistake: [brief description]",
  "strategy": "Identifying root cause and remediation path",
  "steps": [
    {
      "stepNumber": 1,
      "title": "Mistake Classification",
      "content": "Type: Conceptual\nWhy it happened: ...",
      "explanation": "Understanding why helps prevent future mistakes",
      "isKey": true
    },
    {
      "stepNumber": 2,
      "title": "Correct Approach",
      "content": "Here's how to think about this correctly...",
      "explanation": "The key insight is...",
      "isKey": true
    },
    {
      "stepNumber": 3,
      "title": "Memory Tip",
      "content": "Remember: [mnemonic or trick]",
      "explanation": "This helps you recall the correct approach"
    }
  ],
  "finalAnswer": "You made a [type] mistake. The key is to [correction]",
  "followUpQuestion": "Try this similar question to test your understanding: [question]",
  "confidence": 0.9,
  "topicsCovered": ["topic"],
  "difficulty": "intermediate",
  "nextSteps": ["Practice more questions like this", "Review related concept"]
}`,

  summarize: `You are Cogni, creating comprehensive chapter/topic summaries.

YOUR GOAL:
- Distill key concepts into memorable summaries
- Highlight exam-relevant points
- Connect concepts to previous and future topics
- Provide quick-reference formulas

OUTPUT STRUCTURE:
{
  "understanding": "Summarizing [chapter/topic name]",
  "strategy": "Key concepts → Formulas → Common questions → Exam tips",
  "steps": [
    {
      "stepNumber": 1,
      "title": "Core Concepts",
      "content": "• Concept 1: Explanation\n• Concept 2: Explanation",
      "explanation": "These are the foundational ideas"
    },
    {
      "stepNumber": 2,
      "title": "Key Formulas",
      "content": "Formula 1: F = ma\nFormula 2: v = u + at",
      "explanation": "Memorize these for quick recall"
    },
    {
      "stepNumber": 3,
      "title": "Common Question Types",
      "content": "• Type 1: ...\n• Type 2: ...",
      "explanation": "These appear frequently in exams"
    }
  ],
  "finalAnswer": "Key takeaway: [one-line summary]",
  "followUpQuestion": "Would you like practice questions on any of these concepts?",
  "confidence": 0.95,
  "topicsCovered": ["list"],
  "difficulty": "intermediate"
}`,

  remediate: `You are Cogni in FIX-WITH-COGNI mode - focused remediation for a specific mistake.

CONTEXT: The student has attempted a question and got it wrong. Help them understand and fix their mistake.

YOUR APPROACH:
1. Acknowledge the attempt and normalize mistakes
2. Identify the specific misconception
3. Build the correct understanding step by step
4. Have them try a similar question

OUTPUT STRUCTURE:
{
  "understanding": "You attempted: [question summary]\nYour answer: [their answer]\nCorrect: [correct answer]",
  "strategy": "Let's understand why your answer differed and build the right intuition",
  "steps": [
    {
      "stepNumber": 1,
      "title": "First, let's see your thinking",
      "content": "Your approach had merit because... but missed...",
      "explanation": "Understanding your thought process helps identify the gap"
    },
    {
      "stepNumber": 2,
      "title": "The key insight",
      "content": "Here's what makes this question different...",
      "explanation": "This is the critical distinction",
      "isKey": true
    },
    {
      "stepNumber": 3,
      "title": "Working through correctly",
      "content": "Step-by-step correct solution...",
      "explanation": "Notice how each step follows logically"
    }
  ],
  "finalAnswer": "Your mistake was [type]. Remember: [key point]",
  "followUpQuestion": "Now try this similar question to solidify your understanding: [question]",
  "confidence": 0.9,
  "topicsCovered": ["topic"],
  "difficulty": "intermediate"
}`
};

// =====================================================
// CONTEXT-BUILDING FUNCTIONS
// =====================================================

/**
 * Build user context string for personalization
 */
export function buildUserContextPrompt(userContext: UserContext): string {
  const knowledgeState = userContext.knowledgeState;
  const weakTopics = userContext.weakTopics;
  
  let contextStr = `
STUDENT PROFILE:
- Grade: ${userContext.grade}
- Target Exam: ${userContext.target}
- Recent Accuracy: ${userContext.recentAccuracy}%
- Study Streak: ${userContext.studyStreak} days

WEAK TOPICS (prioritize these):
${weakTopics.slice(0, 5).map((t, i) => 
  `${i + 1}. ${t.topic} (${t.subject}) - ${t.accuracy}% accuracy, ${t.mistakeType || 'mixed'} mistakes`
).join('\n')}
`;

  if (knowledgeState) {
    contextStr += `
KNOWLEDGE STATE:
- Overall Mastery: ${Math.round(knowledgeState.overallMastery * 100)}%
- Preferred Style: ${knowledgeState.preferredStyle}
- Learning Velocity: ${knowledgeState.learningVelocity.toFixed(1)} questions/session
`;
  }

  return contextStr;
}

/**
 * Build adaptive difficulty prompt based on mastery
 */
export function buildAdaptiveDifficultyPrompt(
  masteryLevel: number,
  recentAccuracy: number
): string {
  if (masteryLevel < 0.4 || recentAccuracy < 50) {
    return `
ADAPTIVE INSTRUCTION - STRUGGLING STUDENT:
- Use SIMPLER language and analogies
- Break concepts into SMALLER steps
- Provide MORE examples before asking questions
- Offer hints proactively
- Encourage frequently
- Use visual descriptions when possible
`;
  } else if (masteryLevel > 0.8 && recentAccuracy > 80) {
    return `
ADAPTIVE INSTRUCTION - ADVANCED STUDENT:
- Move FASTER through basics
- Focus on EXTENSIONS and edge cases
- Challenge with HARDER variations
- Ask probing follow-up questions
- Connect to advanced concepts
- Suggest competition-level problems
`;
  }
  
  return `
ADAPTIVE INSTRUCTION - MODERATE LEVEL:
- Balance explanation with practice
- Vary question difficulty
- Check understanding periodically
- Provide targeted hints when stuck
`;
}

/**
 * Build conversation memory context
 */
export function buildMemoryPrompt(
  topicsDiscussed: string[],
  recentMistakes: string[],
  sessionCount: number
): string {
  let memoryStr = '';
  
  if (topicsDiscussed.length > 0) {
    memoryStr += `
TOPICS ALREADY DISCUSSED THIS SESSION:
${topicsDiscussed.slice(-10).map(t => `- ${t}`).join('\n')}
Reference these to build on previous learning.
`;
  }
  
  if (recentMistakes.length > 0) {
    memoryStr += `
RECENT MISTAKES TO WATCH FOR:
${recentMistakes.slice(-5).map(m => `- ${m}`).join('\n')}
Address related misconceptions if they appear.
`;
  }
  
  if (sessionCount > 1) {
    memoryStr += `
This is session #${sessionCount}. Acknowledge the student's continued learning journey.
`;
  }
  
  return memoryStr;
}

// =====================================================
// MAIN PROMPT BUILDER
// =====================================================

export interface PromptBuildOptions {
  mode: QueryMode;
  userContext: UserContext;
  userMessage: string;
  history: Array<{ role: string; content: string }>;
  topicsDiscussed: string[];
  hintContext?: {
    previousHints: string[];
    hintLevel: number;
  };
  remediationContext?: {
    question: string;
    userAnswer: string;
    correctAnswer: string;
    topic: string;
  };
}

/**
 * Build the complete prompt for Cogni
 */
export function buildCogniPrompt(options: PromptBuildOptions): {
  systemPrompt: string;
  userPrompt: string;
} {
  const {
    mode,
    userContext,
    userMessage,
    history,
    topicsDiscussed,
    hintContext,
    remediationContext
  } = options;
  
  // Get base system prompt for mode
  let systemPrompt = SYSTEM_PROMPTS[mode];
  
  // Add user context
  systemPrompt += '\n\n' + buildUserContextPrompt(userContext);
  
  // Add adaptive difficulty
  const mastery = userContext.knowledgeState?.overallMastery ?? 0.5;
  systemPrompt += '\n' + buildAdaptiveDifficultyPrompt(mastery, userContext.recentAccuracy);
  
  // Add memory context
  const recentMistakes = userContext.knowledgeState?.mistakePatterns
    ?.map(m => `${m.type} in ${m.affectedTopics.join(', ')}`) ?? [];
  systemPrompt += '\n' + buildMemoryPrompt(
    topicsDiscussed,
    recentMistakes,
    1 // session count placeholder
  );
  
  // Build user prompt
  let userPrompt = userMessage;
  
  // Add hint context if this is a hint request
  if (hintContext && hintContext.previousHints.length > 0) {
    userPrompt = `
HINTS ALREADY PROVIDED:
${hintContext.previousHints.map((h, i) => `Hint ${i + 1}: ${h}`).join('\n')}

STUDENT'S CURRENT QUESTION: ${userMessage}

This is a Level ${hintContext.hintLevel} hint request. Provide the next progressive hint.
`;
  }
  
  // Add remediation context if in Fix-With-Cogni mode
  if (remediationContext && mode === 'remediate') {
    userPrompt = `
QUESTION: ${remediationContext.question}
STUDENT'S ANSWER: ${remediationContext.userAnswer}
CORRECT ANSWER: ${remediationContext.correctAnswer}
TOPIC: ${remediationContext.topic}

Help this student understand their mistake and learn from it.
`;
  }
  
  return { systemPrompt, userPrompt };
}

// =====================================================
// RESPONSE VALIDATION
// =====================================================

/**
 * Validate and parse structured response from LLM
 */
export function validateStructuredResponse(response: string): {
  isValid: boolean;
  structured?: StructuredResponse;
  error?: string;
} {
  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { isValid: false, error: 'No JSON object found in response' };
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validate required fields
    const required = ['understanding', 'strategy', 'steps', 'finalAnswer', 'followUpQuestion'];
    const missing = required.filter(field => !(field in parsed));
    
    if (missing.length > 0) {
      return { isValid: false, error: `Missing required fields: ${missing.join(', ')}` };
    }
    
    // Validate steps structure
    if (!Array.isArray(parsed.steps) || parsed.steps.length === 0) {
      return { isValid: false, error: 'Steps must be a non-empty array' };
    }
    
    // Set defaults for optional fields
    const structured: StructuredResponse = {
      understanding: parsed.understanding,
      strategy: parsed.strategy,
      steps: parsed.steps.map((step: any, index: number) => ({
        stepNumber: step.stepNumber ?? index + 1,
        title: step.title ?? `Step ${index + 1}`,
        content: step.content ?? '',
        explanation: step.explanation ?? '',
        formulas: step.formulas ?? [],
        isKey: step.isKey ?? false,
      })),
      finalAnswer: parsed.finalAnswer,
      followUpQuestion: parsed.followUpQuestion,
      confidence: parsed.confidence ?? 0.8,
      topicsCovered: parsed.topicsCovered ?? [],
      difficulty: parsed.difficulty ?? 'intermediate',
      nextSteps: parsed.nextSteps,
    };
    
    return { isValid: true, structured };
  } catch (error) {
    return { 
      isValid: false, 
      error: `Failed to parse response: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

/**
 * Generate fallback response when structured parsing fails
 */
export function generateFallbackResponse(content: string): StructuredResponse {
  return {
    understanding: 'Processing your question...',
    strategy: 'Providing a direct explanation',
    steps: [{
      stepNumber: 1,
      title: 'Explanation',
      content: content,
      explanation: 'Here\'s the information you requested',
      formulas: [],
      isKey: true,
    }],
    finalAnswer: content.slice(0, 200) + (content.length > 200 ? '...' : ''),
    followUpQuestion: 'Would you like me to explain any part in more detail?',
    confidence: 0.7,
    topicsCovered: [],
    difficulty: 'intermediate',
  };
}
