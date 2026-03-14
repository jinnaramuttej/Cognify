import type { MistakeType, MistakeAnalysis } from "../types";

interface MistakeClassificationResult {
  type: MistakeType;
  confidence: number;
  reasoning: string;
}

export function classifyMistake(
  question: string,
  userAnswer: string,
  correctAnswer: string,
  timeSpent?: number,
  averageTimeForQuestion?: number
): MistakeClassificationResult {
  // Time pressure detection
  if (timeSpent && averageTimeForQuestion) {
    const timeRatio = timeSpent / averageTimeForQuestion;
    if (timeRatio < 0.5 && userAnswer !== correctAnswer) {
      return {
        type: "time_pressure",
        confidence: 0.8,
        reasoning: "Answer was given in significantly less time than average, suggesting rushed decision.",
      };
    }
  }

  // Silly mistake detection (correct concept, wrong execution)
  const userAnswerClean = userAnswer.trim().toLowerCase();
  const correctAnswerClean = correctAnswer.trim().toLowerCase();

  // Check for numerical closeness
  const userNum = parseFloat(userAnswerClean);
  const correctNum = parseFloat(correctAnswerClean);

  if (!isNaN(userNum) && !isNaN(correctNum)) {
    const percentDiff = Math.abs(userNum - correctNum) / Math.abs(correctNum);
    if (percentDiff < 0.1 && percentDiff > 0) {
      return {
        type: "silly",
        confidence: 0.7,
        reasoning: "Answer is numerically close to correct answer, suggesting calculation error.",
      };
    }
  }

  // Check for sign errors
  if (userNum === -correctNum) {
    return {
      type: "calculation",
      confidence: 0.85,
      reasoning: "Answer has opposite sign, suggesting sign error in calculation.",
    };
  }

  // Check for unit errors (common in physics)
  const unitPatterns = ["m", "cm", "mm", "km", "s", "ms", "kg", "g", "n", "N"];
  for (const unit of unitPatterns) {
    const userHasUnit = userAnswerClean.includes(unit);
    const correctHasUnit = correctAnswerClean.includes(unit);
    if (userHasUnit && correctHasUnit) {
      // Both have units but different values
      return {
        type: "calculation",
        confidence: 0.6,
        reasoning: "Units present but numerical value differs, suggesting calculation error.",
      };
    }
  }

  // Default to conceptual error
  return {
    type: "conceptual",
    confidence: 0.7,
    reasoning: "Answer indicates misunderstanding of the underlying concept.",
  };
}

export function analyzeMistakePatterns(
  mistakes: Array<{
    topic: string;
    mistakeType: MistakeType;
  }>
): {
  mostCommonType: MistakeType;
  topicWeaknessMap: Record<string, MistakeType>;
  suggestions: string[];
} {
  const typeCounts: Record<MistakeType, number> = {
    conceptual: 0,
    calculation: 0,
    time_pressure: 0,
    silly: 0,
  };

  const topicWeaknessMap: Record<string, MistakeType> = {};

  mistakes.forEach((m) => {
    typeCounts[m.mistakeType]++;
    if (!topicWeaknessMap[m.topic]) {
      topicWeaknessMap[m.topic] = m.mistakeType;
    }
  });

  const mostCommonType = (Object.entries(typeCounts) as [MistakeType, number][])
    .sort((a, b) => b[1] - a[1])[0][0];

  const suggestions: string[] = [];

  if (typeCounts.conceptual > typeCounts.calculation) {
    suggestions.push("Focus on understanding core concepts before practicing problems");
    suggestions.push("Review textbook explanations and ask Cogni for concept clarity");
  }

  if (typeCounts.calculation > 0) {
    suggestions.push("Practice more calculation-heavy problems");
    suggestions.push("Double-check your arithmetic and unit conversions");
  }

  if (typeCounts.time_pressure > 0) {
    suggestions.push("Work on time management during tests");
    suggestions.push("Practice timed mock tests to build speed");
  }

  if (typeCounts.silly > 0) {
    suggestions.push("Read questions carefully before answering");
    suggestions.push("Allocate time to review answers before submission");
  }

  return {
    mostCommonType,
    topicWeaknessMap,
    suggestions,
  };
}
