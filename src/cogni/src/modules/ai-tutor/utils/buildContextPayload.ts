import type { UserContext, ContextPayload } from "../types";

export function buildContextPayload(userContext: UserContext): ContextPayload {
  const weakTopics = userContext.weakTopics.map((t) => t.topic);

  const lastTestChapter = userContext.recentTestAttempts?.[0]?.subject || undefined;

  return {
    user_id: userContext.userId,
    grade: userContext.grade,
    target_exam: userContext.target,
    weak_topics: weakTopics,
    recent_accuracy: userContext.recentAccuracy,
    last_test_chapter: lastTestChapter,
    study_streak: userContext.studyStreak,
  };
}

export function buildContextPrompt(context: ContextPayload): string {
  return `You are Cogni, the Cognify Academic Intelligence System. You are an intelligent, calm, and mentor-like academic tutor.

Student Context:
- User ID: ${context.user_id}
- Grade: ${context.grade}
- Target Exam: ${context.target_exam}
- Weak Topics: ${context.weak_topics.length > 0 ? context.weak_topics.join(", ") : "None identified yet"}
- Recent Accuracy: ${context.recent_accuracy}%
- Study Streak: ${context.study_streak} days
${context.last_test_chapter ? `- Last Test Subject: ${context.last_test_chapter}` : ""}

Guidelines:
1. Be concise and structured in your responses
2. Use academic tone without being overly formal
3. Provide step-by-step explanations when solving problems
4. Ask follow-up questions to ensure understanding
5. Focus on conceptual clarity over rote memorization
6. Reference relevant formulas and concepts clearly
7. When explaining weak topics, connect them to foundational concepts
8. Never say "I'm just an AI" - you are the Cognify Academic Intelligence System
9. Use headings, bullet points, and numbered lists for better readability
10. Do not use emojis or excessive punctuation
11. Highlight important keywords and concepts in **bold**

Remember: You are a mentor, guide students toward understanding, not just answers.`;
}

export function buildMistakeReviewPrompt(
  mistakes: Array<{
    question: string;
    userAnswer: string;
    correctAnswer: string;
    topic: string;
  }>
): string {
  const mistakeList = mistakes
    .map(
      (m, i) => `
Question ${i + 1}: ${m.question}
User's Answer: ${m.userAnswer}
Correct Answer: ${m.correctAnswer}
Topic: ${m.topic}
`
    )
    .join("\n");

  return `Please review the following mistakes and provide detailed explanations:

${mistakeList}

For each mistake, please:
1. Explain why the user's answer was incorrect
2. Provide the correct concept explanation
3. Suggest a similar practice question
4. Give a memory tip for retaining the concept

Format your response clearly with headings for each question.`;
}
