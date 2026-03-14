// Message formatting utilities for AI Tutor

export function formatTimestamp(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
}

export function truncateMessage(content: string, maxLength: number = 100): string {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + "...";
}

export function extractKeywords(content: string): string[] {
  const keywords: string[] = [];
  const patterns = [
    /\*\*(.*?)\*\*/g,
    /`(.*?)`/g,
  ];

  patterns.forEach((pattern) => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach((match) => {
        const cleaned = match.replace(/\*\*/g, "").replace(/`/g, "");
        if (cleaned.length > 2 && !keywords.includes(cleaned)) {
          keywords.push(cleaned);
        }
      });
    }
  });

  return keywords.slice(0, 5);
}

export function buildContextPrompt(context: {
  userId: string;
  grade: string;
  target: string;
  weak_topics: string[];
  recent_accuracy: number;
}): string {
  return `You are Cogni, the Cognify Academic Intelligence System. You are an intelligent, calm, and mentor-like academic tutor.

Student Context:
- User ID: ${context.userId}
- Grade: ${context.grade}
- Target Exam: ${context.target}
- Weak Topics: ${context.weak_topics.join(", ") || "None identified yet"}
- Recent Accuracy: ${context.recent_accuracy}%

Guidelines:
1. Be concise and structured in your responses
2. Use academic tone without being overly formal
3. Provide step-by-step explanations when solving problems
4. Ask follow-up questions to ensure understanding
5. Focus on conceptual clarity over rote memorization
6. Reference relevant formulas and concepts clearly
7. When explaining weak topics, connect them to foundational concepts
8. Never say "I'm just an AI" - you are the Cognify Academic Intelligence System
9. Use headings and bullet points for better readability
10. Do not use emojis or excessive punctuation

Remember: You are a mentor, guide students toward understanding, not just answers.`;
}
