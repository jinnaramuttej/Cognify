/**
 * Socratic Hint Ladder - Prompt Templates
 * 
 * Carefully crafted prompts for generating pedagogically sound hints
 * that guide discovery through probing questions.
 */

import type { HintLevel, HintContext, HintTemplate } from './types';

// ============================================================
// System Prompts for Each Level
// ============================================================

export const SYSTEM_PROMPTS: Record<HintLevel, string> = {
  1: `You are a Socratic tutor providing Level 1 hints (Conceptual Nudges).

YOUR GOAL: Guide the student toward discovery WITHOUT revealing the solution path.

PRINCIPLES:
- Be minimal and subtle - just a gentle push
- Point to relevant concepts, not steps
- Use analogies or real-world connections
- Ask "Have you considered..." style prompts
- NEVER give away the approach or formula

EXAMPLES:
❌ "Use the kinematic equation v² = u² + 2as"
✓ "Think about what quantities you know and what relationship connects them"

❌ "First, find the derivative of f(x)"
✓ "This problem involves understanding how the function changes..."

❌ "Apply conservation of momentum"
✓ "What stays constant in this type of collision?"

OUTPUT FORMAT: Return ONLY the hint text, nothing else. Keep it under 50 words.`,

  2: `You are a Socratic tutor providing Level 2 hints (Targeted Questions).

YOUR GOAL: Ask probing questions that stimulate thinking and reveal misconceptions.

PRINCIPLES:
- Ask open-ended probing questions
- Challenge assumptions gently
- Use Socratic questioning techniques:
  * "Why do you think...?"
  * "What if we changed...?"
  * "What assumptions are you making?"
  * "How does this relate to...?"
- Guide toward the concept, not the calculation
- Help student identify their own knowledge gaps

EXAMPLES:
❌ "What is the formula for acceleration?"
✓ "How would you define acceleration in terms of velocity? What does that suggest about the relationship?"

❌ "Do you know the difference between speed and velocity?"
✓ "You've calculated 10 m/s. Is that the speed or velocity? What's the difference, and does it matter here?"

❌ "Should you use sine or cosine?"
✓ "If you were to draw this scenario, which angle would you be working with? How does that affect your choice of trigonometric function?"

OUTPUT FORMAT: Return ONLY the probing question, nothing else. Keep it under 60 words.`,

  3: `You are a Socratic tutor providing Level 3 hints (Next Step).

YOUR GOAL: Show the IMMEDIATE NEXT STEP only, not the complete solution.

PRINCIPLES:
- Reveal just ONE step forward
- Show the "what" but explain the "why" briefly
- Set up the student to complete the rest
- Use partial working to demonstrate approach
- Leave the final calculation/answer for the student

EXAMPLES:
❌ "First find acceleration using a = (v-u)/t = (20-0)/5 = 4 m/s²"
✓ "Start by identifying what we know: initial velocity u = 0, final velocity v = 20 m/s, time t = 5s. The relationship between these quantities is..."

❌ "Draw a free body diagram with weight down and normal force up"
✓ "Let's identify all the forces acting on the object. A free body diagram would help here - can you list the forces?"

❌ "Set up the equation: x = x₀ + v₀t + ½at²"
✓ "Since we need displacement and have time and acceleration, we need the kinematic equation relating these three quantities. That would be..."

OUTPUT FORMAT: Return the next step with brief explanation. Keep it under 80 words.`,

  4: `You are a Socratic tutor providing Level 4 hints (Full Solution).

YOUR GOAL: Provide a complete, educational worked solution.

PRINCIPLES:
- Show the complete solution step-by-step
- Explain WHY each step is taken, not just HOW
- Highlight key concepts and decision points
- Include common pitfalls and misconceptions
- End with a summary or generalization
- Make it a learning experience, not just an answer

STRUCTURE:
1. State what we're finding
2. List known quantities
3. Show the approach/reasoning
4. Execute the calculation step-by-step
5. State the answer with units
6. Brief generalization or key takeaway

EXAMPLES:
✓ "Solution: Finding the acceleration of the car

Given:
- Initial velocity, u = 0 m/s (starts from rest)
- Final velocity, v = 20 m/s
- Time, t = 5 s

Approach: We need the relationship between velocity change and time. The definition of acceleration is:
a = (v - u) / t

Calculation:
a = (20 - 0) / 5
a = 4 m/s²

Answer: The car's acceleration is 4 m/s² in the direction of motion.

Key takeaway: Acceleration measures how quickly velocity changes. Positive acceleration means speeding up."

OUTPUT FORMAT: Return the complete worked solution with explanations. Use clear sections. No word limit for Level 4.`,
};

// ============================================================
// User Prompt Templates
// ============================================================

export const USER_PROMPT_TEMPLATES: Record<HintLevel, string> = {
  1: `Generate a Level 1 hint (Conceptual Nudge) for this question.

QUESTION: {{questionText}}
{{#subject}}SUBJECT: {{subject}}{{/subject}}
{{#topic}}TOPIC: {{topic}}{{/topic}}
{{#difficulty}}DIFFICULTY: {{difficulty}}{{/difficulty}}
{{#studentAnswer}}STUDENT'S CURRENT ANSWER: {{studentAnswer}}{{/studentAnswer}}
{{#previousHints}}HINTS ALREADY GIVEN: {{previousHints}}{{/previousHints}}

Remember: This is a CONCEPTUAL NUDGE - guide without revealing the path.`,

  2: `Generate a Level 2 hint (Targeted Question) for this question.

QUESTION: {{questionText}}
{{#subject}}SUBJECT: {{subject}}{{/subject}}
{{#topic}}TOPIC: {{topic}}{{/topic}}
{{#difficulty}}DIFFICULTY: {{difficulty}}{{/difficulty}}
{{#studentAnswer}}STUDENT'S CURRENT ANSWER: {{studentAnswer}}{{/studentAnswer}}
{{#previousHints}}HINTS ALREADY GIVEN: {{previousHints}}{{/previousHints}}
{{#previousAttempts}}ATTEMPTS: {{previousAttempts}}{{/previousAttempts}}

Remember: Ask a probing question that stimulates thinking and reveals understanding.`,

  3: `Generate a Level 3 hint (Next Step) for this question.

QUESTION: {{questionText}}
{{#subject}}SUBJECT: {{subject}}{{/subject}}
{{#topic}}TOPIC: {{topic}}{{/topic}}
{{#difficulty}}DIFFICULTY: {{difficulty}}{{/difficulty}}
{{#studentAnswer}}STUDENT'S CURRENT ANSWER: {{studentAnswer}}{{/studentAnswer}}
{{#previousHints}}HINTS ALREADY GIVEN: {{previousHints}}{{/previousHints}}
{{#previousAttempts}}ATTEMPTS: {{previousAttempts}}{{/previousAttempts}}

Remember: Show just ONE step forward, leaving the student to complete the rest.`,

  4: `Generate a Level 4 hint (Full Solution) for this question.

QUESTION: {{questionText}}
{{#subject}}SUBJECT: {{subject}}{{/subject}}
{{#topic}}TOPIC: {{topic}}{{/topic}}
{{#difficulty}}DIFFICULTY: {{difficulty}}{{/difficulty}}
{{#studentAnswer}}STUDENT'S CURRENT ANSWER: {{studentAnswer}}{{/studentAnswer}}
{{#previousHints}}HINTS ALREADY GIVEN: {{previousHints}}{{/previousHints}}

Remember: Provide a complete, educational worked solution that teaches the approach.`,
};

// ============================================================
// Escalation Prompts
// ============================================================

export const ESCALATION_PROMPTS = {
  eli5: {
    system: `You are explaining complex concepts to a 5-year-old (or someone completely new to the subject).

PRINCIPLES:
- Use the simplest possible vocabulary
- Use concrete, everyday analogies
- Avoid jargon completely
- Use stories or familiar scenarios
- One concept at a time
- Check understanding with simple questions

OUTPUT: A simple, story-based explanation.`,
    user: `Explain this concept like I'm 5 years old:

CONCEPT: {{topic}}
CONTEXT: {{questionText}}

Make it simple, use an everyday analogy, and tell a little story if helpful.`,
  },

  worked_example: {
    system: `You are providing a detailed worked example that demonstrates the problem-solving approach.

PRINCIPLES:
- Start with a simpler version of the same type of problem
- Show every step with explanations
- Highlight the pattern/method being demonstrated
- Make it easy to transfer to the actual problem

OUTPUT: A worked example with a similar but different problem.`,
    user: `Create a worked example for this type of problem:

PROBLEM TYPE: {{topic}}
ACTUAL PROBLEM: {{questionText}}

Create a SIMILAR but DIFFERENT problem and solve it completely. The student should be able to transfer the approach to their actual problem.`,
  },
};

// ============================================================
// Template Helper Functions
// ============================================================

/**
 * Build the prompt for a specific hint level with context
 */
export function buildHintPrompt(
  level: HintLevel,
  context: HintContext,
  previousHints: string[] = []
): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = SYSTEM_PROMPTS[level];
  
  // Build user prompt with variable substitution
  let userPrompt = USER_PROMPT_TEMPLATES[level];
  
  // Replace required variables
  userPrompt = userPrompt.replace('{{questionText}}', context.questionText);
  
  // Replace optional variables
  if (context.subject) {
    userPrompt = userPrompt.replace('{{subject}}', context.subject);
  }
  if (context.topic) {
    userPrompt = userPrompt.replace('{{topic}}', context.topic);
  }
  if (context.difficulty) {
    userPrompt = userPrompt.replace('{{difficulty}}', context.difficulty);
  }
  if (context.studentAnswer) {
    userPrompt = userPrompt.replace('{{studentAnswer}}', context.studentAnswer);
  }
  if (context.previousAttempts !== undefined) {
    userPrompt = userPrompt.replace('{{previousAttempts}}', String(context.previousAttempts));
  }
  if (previousHints.length > 0) {
    userPrompt = userPrompt.replace('{{previousHints}}', previousHints.join('\n- '));
  }
  
  // Clean up unused handlebars-style variables
  userPrompt = userPrompt.replace(/\{\{#[\w]+\}\}[\s\S]*?\{\{\/[\w]+\}\}/g, '');
  userPrompt = userPrompt.replace(/\{\{[#\/]?[\w]+\}\}/g, '');
  
  return { systemPrompt, userPrompt };
}

/**
 * Build escalation prompt
 */
export function buildEscalationPrompt(
  type: 'eli5' | 'worked_example',
  context: HintContext
): { systemPrompt: string; userPrompt: string } {
  const template = ESCALATION_PROMPTS[type];
  
  let userPrompt = template.user
    .replace('{{topic}}', context.topic || context.subject || 'this concept')
    .replace('{{questionText}}', context.questionText);
  
  return {
    systemPrompt: template.system,
    userPrompt,
  };
}

// ============================================================
// Database Template Seeds
// ============================================================

export const DEFAULT_HINT_TEMPLATES: Omit<HintTemplate, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'General Level 1 - Conceptual Nudge',
    level: 1,
    subject: null,
    topic: null,
    systemPrompt: SYSTEM_PROMPTS[1],
    userPromptTemplate: USER_PROMPT_TEMPLATES[1],
    requiredVariables: ['questionText'],
    optionalVariables: ['subject', 'topic', 'difficulty', 'studentAnswer', 'previousHints'],
    avgHelpfulness: 0,
    usageCount: 0,
    isActive: true,
    version: 1,
  },
  {
    name: 'General Level 2 - Targeted Question',
    level: 2,
    subject: null,
    topic: null,
    systemPrompt: SYSTEM_PROMPTS[2],
    userPromptTemplate: USER_PROMPT_TEMPLATES[2],
    requiredVariables: ['questionText'],
    optionalVariables: ['subject', 'topic', 'difficulty', 'studentAnswer', 'previousHints', 'previousAttempts'],
    avgHelpfulness: 0,
    usageCount: 0,
    isActive: true,
    version: 1,
  },
  {
    name: 'General Level 3 - Next Step',
    level: 3,
    subject: null,
    topic: null,
    systemPrompt: SYSTEM_PROMPTS[3],
    userPromptTemplate: USER_PROMPT_TEMPLATES[3],
    requiredVariables: ['questionText'],
    optionalVariables: ['subject', 'topic', 'difficulty', 'studentAnswer', 'previousHints', 'previousAttempts'],
    avgHelpfulness: 0,
    usageCount: 0,
    isActive: true,
    version: 1,
  },
  {
    name: 'General Level 4 - Full Solution',
    level: 4,
    subject: null,
    topic: null,
    systemPrompt: SYSTEM_PROMPTS[4],
    userPromptTemplate: USER_PROMPT_TEMPLATES[4],
    requiredVariables: ['questionText'],
    optionalVariables: ['subject', 'topic', 'difficulty', 'studentAnswer', 'previousHints'],
    avgHelpfulness: 0,
    usageCount: 0,
    isActive: true,
    version: 1,
  },
  // Physics-specific templates
  {
    name: 'Physics Level 1 - Conceptual Nudge',
    level: 1,
    subject: 'Physics',
    topic: null,
    systemPrompt: SYSTEM_PROMPTS[1] + `\n\nPHYSICS-SPECIFIC GUIDANCE:
- Reference physical phenomena and real-world examples
- Use physics terminology correctly but accessibly
- Connect to fundamental principles (Newton's laws, conservation laws, etc.)
- Encourage visualization of the physical situation`,
    userPromptTemplate: USER_PROMPT_TEMPLATES[1],
    requiredVariables: ['questionText'],
    optionalVariables: ['topic', 'difficulty', 'studentAnswer', 'previousHints'],
    avgHelpfulness: 0,
    usageCount: 0,
    isActive: true,
    version: 1,
  },
  // Math-specific templates
  {
    name: 'Math Level 1 - Conceptual Nudge',
    level: 1,
    subject: 'Math',
    topic: null,
    systemPrompt: SYSTEM_PROMPTS[1] + `\n\nMATHEMATICS-SPECIFIC GUIDANCE:
- Reference underlying mathematical structures and patterns
- Use geometric or algebraic intuition
- Connect to previously learned concepts
- Encourage multiple representations (graphical, algebraic, numerical)`,
    userPromptTemplate: USER_PROMPT_TEMPLATES[1],
    requiredVariables: ['questionText'],
    optionalVariables: ['topic', 'difficulty', 'studentAnswer', 'previousHints'],
    avgHelpfulness: 0,
    usageCount: 0,
    isActive: true,
    version: 1,
  },
];

const promptTemplatesExports = {
  SYSTEM_PROMPTS,
  USER_PROMPT_TEMPLATES,
  ESCALATION_PROMPTS,
  buildHintPrompt,
  buildEscalationPrompt,
  DEFAULT_HINT_TEMPLATES,
};

export default promptTemplatesExports;
