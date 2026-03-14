/**
 * Cogni Multimodal - Solution Generator
 * 
 * Generates step-by-step worked solutions with:
 * - Step difficulty annotation
 * - Estimated time to solve
 * - Concept explanations
 */

import ZAI from 'z-ai-web-dev-sdk';
import { db } from '@/lib/db';

// ============================================================
// Types
// ============================================================

export interface SolutionStep {
  stepNumber: number;
  title: string;
  description: string;
  latexExpression?: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number; // seconds
  concepts: string[];
  hints: string[];
}

export interface GeneratedSolution {
  problemText: string;
  solutionType: 'step_by_step' | 'proof' | 'numerical' | 'derivation';
  steps: SolutionStep[];
  finalAnswer?: string;
  summary: string;
  totalEstimatedTime: number;
  overallDifficulty: 'easy' | 'medium' | 'hard';
  concepts: string[];
  alternatives?: string[];
}

// ============================================================
// Solution Generation
// ============================================================

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

/**
 * Generate a step-by-step solution for a problem
 */
export async function generateSolution(
  problemText: string,
  context?: {
    problemType?: string;
    subject?: string;
    variables?: string[];
    concepts?: string[];
  }
): Promise<GeneratedSolution> {
  const zai = await getZAI();
  const startTime = Date.now();
  
  const systemPrompt = `You are an expert mathematics and science tutor. Generate detailed, educational step-by-step solutions.

Guidelines:
1. Break down each step clearly with explanations
2. Show all intermediate work
3. Explain the reasoning behind each step
4. Identify the difficulty level of each step
5. Estimate time needed for each step
6. List relevant concepts being applied
7. Provide helpful hints for students who might get stuck

Respond ONLY with valid JSON in this exact format:
{
  "solutionType": "step_by_step|proof|numerical|derivation",
  "steps": [
    {
      "stepNumber": 1,
      "title": "Step title",
      "description": "What we're doing in this step",
      "latexExpression": "LaTeX representation if applicable",
      "explanation": "Detailed explanation of the step",
      "difficulty": "easy|medium|hard",
      "estimatedTime": 60,
      "concepts": ["concept1", "concept2"],
      "hints": ["Hint for stuck students"]
    }
  ],
  "finalAnswer": "The final answer",
  "summary": "Brief summary of the solution approach",
  "concepts": ["All concepts used"],
  "alternatives": ["Alternative approaches if any"]
}`;

  const userPrompt = `Solve this problem with detailed step-by-step explanation:

Problem: ${problemText}

${context ? `
Context:
- Subject: ${context.subject || 'Unknown'}
- Problem Type: ${context.problemType || 'Unknown'}
- Variables: ${context.variables?.join(', ') || 'None specified'}
- Known Concepts: ${context.concepts?.join(', ') || 'None specified'}
` : ''}

Provide a comprehensive solution that teaches the student how to approach similar problems.`;

  try {
    const response = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      return createFallbackSolution(problemText);
    }

    // Parse JSON response
    try {
      let jsonStr = content;
      if (content.includes('```json')) {
        jsonStr = content.split('```json')[1].split('```')[0].trim();
      } else if (content.includes('```')) {
        jsonStr = content.split('```')[1].split('```')[0].trim();
      }
      
      const parsed = JSON.parse(jsonStr);
      
      // Calculate total time
      const totalEstimatedTime = (parsed.steps || []).reduce(
        (sum: number, step: SolutionStep) => sum + (step.estimatedTime || 60),
        0
      );
      
      // Determine overall difficulty
      const difficulties = (parsed.steps || []).map((s: SolutionStep) => s.difficulty);
      const overallDifficulty = determineOverallDifficulty(difficulties);
      
      return {
        problemText,
        solutionType: parsed.solutionType || 'step_by_step',
        steps: parsed.steps || [],
        finalAnswer: parsed.finalAnswer,
        summary: parsed.summary || '',
        totalEstimatedTime,
        overallDifficulty,
        concepts: parsed.concepts || [],
        alternatives: parsed.alternatives,
      };
    } catch (parseError) {
      console.error('[Solution] JSON parse error:', parseError);
      return createFallbackSolution(problemText, content);
    }
  } catch (error) {
    console.error('[Solution] Generation error:', error);
    return createFallbackSolution(problemText);
  }
}

/**
 * Determine overall difficulty from step difficulties
 */
function determineOverallDifficulty(
  difficulties: ('easy' | 'medium' | 'hard')[]
): 'easy' | 'medium' | 'hard' {
  if (difficulties.length === 0) return 'medium';
  
  const counts = { easy: 0, medium: 0, hard: 0 };
  for (const d of difficulties) {
    counts[d]++;
  }
  
  // If any step is hard and majority isn't easy, it's hard
  if (counts.hard > 0 && counts.easy < counts.hard + counts.medium) {
    return 'hard';
  }
  
  // If majority is easy, it's easy
  if (counts.easy > counts.medium + counts.hard) {
    return 'easy';
  }
  
  return 'medium';
}

/**
 * Create fallback solution when generation fails
 */
function createFallbackSolution(problemText: string, rawResponse?: string): GeneratedSolution {
  return {
    problemText,
    solutionType: 'step_by_step',
    steps: [
      {
        stepNumber: 1,
        title: 'Understanding the Problem',
        description: 'Identify what is being asked',
        explanation: rawResponse || 'Unable to generate detailed solution. Please try again or provide more context.',
        difficulty: 'easy',
        estimatedTime: 60,
        concepts: [],
        hints: ['Read the problem carefully', 'Identify the unknown variable'],
      },
    ],
    summary: 'Solution generation was interrupted. Please try again.',
    totalEstimatedTime: 60,
    overallDifficulty: 'medium',
    concepts: [],
  };
}

/**
 * Store generated solution in database
 */
export async function storeSolution(
  parsedProblemId: string,
  solution: GeneratedSolution,
  modelUsed?: string
) {
  const stored = await db.problemSolution.create({
    data: {
      parsedProblemId,
      problemText: solution.problemText,
      solutionSteps: JSON.stringify(solution.steps),
      finalAnswer: solution.finalAnswer,
      solutionType: solution.solutionType,
      difficulty: solution.overallDifficulty,
      estimatedTime: Math.ceil(solution.totalEstimatedTime / 60), // Convert to minutes
      modelUsed,
    },
  });
  
  // Update parsed problem with solution reference
  await db.parsedProblem.update({
    where: { id: parsedProblemId },
    data: { solutionId: stored.id },
  });
  
  return stored;
}

/**
 * Generate a hint for a specific step
 */
export async function generateStepHint(
  step: SolutionStep,
  studentProgress?: string
): Promise<string> {
  const zai = await getZAI();
  
  const prompt = `You are a helpful tutor. Generate a hint for this math step without giving away the answer.

Step: ${step.title}
Description: ${step.description}
Current hints: ${step.hints.join(', ') || 'None'}
${studentProgress ? `Student's attempt: ${studentProgress}` : ''}

Provide a single, helpful hint that guides the student without revealing the solution directly.`;

  try {
    const response = await zai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
    });
    
    return response.choices[0]?.message?.content || step.hints[0] || 'Try breaking down the problem into smaller parts.';
  } catch {
    return step.hints[0] || 'Try breaking down the problem into smaller parts.';
  }
}

/**
 * Explain a specific concept in the solution
 */
export async function explainConcept(
  concept: string,
  context?: string
): Promise<string> {
  const zai = await getZAI();
  
  const prompt = `Explain the mathematical concept "${concept}" clearly and concisely for a student.
${context ? `Context: This concept is used in the following problem context: ${context}` : ''}

Provide:
1. A clear definition
2. Why it's useful
3. A simple example
4. Common mistakes to avoid`;

  try {
    const response = await zai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
    });
    
    return response.choices[0]?.message?.content || `${concept} is a fundamental mathematical concept. Consult your textbook or ask your teacher for more details.`;
  } catch {
    return `${concept} is a fundamental mathematical concept. Consult your textbook or ask your teacher for more details.`;
  }
}

// ============================================================
// Export
// ============================================================

export const SolutionGenerator = {
  generate: generateSolution,
  store: storeSolution,
  generateHint: generateStepHint,
  explainConcept,
};

export default SolutionGenerator;
