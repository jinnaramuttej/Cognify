/**
 * Mistake Pattern Detector
 * 
 * Analyzes student test attempts to identify recurring mistake patterns.
 * Generates actionable insights for the Cogni AI tutor.
 * 
 * Uses: tests, test_attempt_questions, questions, topics, chapters tables
 */

import { supabase } from '@/lib/supabaseClient';

export type MistakePattern =
    | 'calculation_errors'
    | 'concept_misunderstanding'
    | 'time_pressure'
    | 'careless_mistakes'
    | 'topic_weakness'
    | 'difficulty_mismatch';

export interface MistakeInsight {
    pattern: MistakePattern;
    severity: 'low' | 'medium' | 'high';
    description: string;
    affected_topics: string[];
    recommendation: string;
    data: Record<string, number>;
}

export interface StudentMistakeReport {
    user_id: string;
    total_tests_analyzed: number;
    total_questions_analyzed: number;
    overall_accuracy: number;
    insights: MistakeInsight[];
}

/**
 * Analyze a student's test history for mistake patterns.
 */
export async function analyzeStudentMistakes(userId: string): Promise<StudentMistakeReport> {
    // Fetch all completed test attempts with question details
    const { data: tests } = await supabase
        .from('tests')
        .select('id, score, total_questions, time_spent_seconds, config')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(50);

    if (!tests || tests.length === 0) {
        return {
            user_id: userId,
            total_tests_analyzed: 0,
            total_questions_analyzed: 0,
            overall_accuracy: 0,
            insights: [],
        };
    }

    const testIds = tests.map(t => t.id);

    // Fetch all attempt questions for these tests
    const { data: attempts } = await supabase
        .from('test_attempt_questions')
        .select(`
      question_id,
      user_answer,
      is_correct,
      time_spent_seconds,
      test_id,
      question:questions(
        difficulty,
        question_type,
        topic_id
      )
    `)
        .in('test_id', testIds);

    if (!attempts || attempts.length === 0) {
        return {
            user_id: userId,
            total_tests_analyzed: tests.length,
            total_questions_analyzed: 0,
            overall_accuracy: 0,
            insights: [],
        };
    }

    // Get topic names for readable insights
    const topicIds = [...new Set(attempts.map(a => (a.question as any)?.topic_id).filter(Boolean))];
    const { data: topicData } = await supabase
        .from('topics')
        .select('id, name, chapter:chapters(name)')
        .in('id', topicIds);

    const topicNames = new Map(topicData?.map(t => [t.id, t.name]) || []);
    const chapterNames = new Map(topicData?.map(t => [t.id, (t.chapter as any)?.name]) || []);

    const insights: MistakeInsight[] = [];
    const totalCorrect = attempts.filter(a => a.is_correct).length;
    const overallAccuracy = totalCorrect / attempts.length;

    // ── Pattern 1: Time Pressure Mistakes ─────────────────────
    const fastWrong = attempts.filter(a =>
        !a.is_correct && a.user_answer && a.time_spent_seconds < 30
    );
    const fastWrongRate = attempts.length > 0 ? fastWrong.length / attempts.length : 0;

    if (fastWrongRate > 0.15) {
        const affectedTopicIds = [...new Set(fastWrong.map(a => (a.question as any)?.topic_id).filter(Boolean))];
        insights.push({
            pattern: 'time_pressure',
            severity: fastWrongRate > 0.25 ? 'high' : 'medium',
            description: `You answer ${Math.round(fastWrongRate * 100)}% of questions too quickly and get them wrong.`,
            affected_topics: affectedTopicIds.map(id => topicNames.get(id) || 'Unknown').slice(0, 5),
            recommendation: 'Slow down and re-read questions carefully. Spend at least 60 seconds on each MCQ.',
            data: { fast_wrong_count: fastWrong.length, fast_wrong_rate: Math.round(fastWrongRate * 100) },
        });
    }

    // ── Pattern 2: Careless Mistakes (correct concept, wrong answer) ──
    // Detected when student gets Easy questions wrong
    const easyWrong = attempts.filter(a =>
        !a.is_correct && a.user_answer && (a.question as any)?.difficulty === 'Easy'
    );
    const easyTotal = attempts.filter(a => (a.question as any)?.difficulty === 'Easy').length;
    const easyErrorRate = easyTotal > 0 ? easyWrong.length / easyTotal : 0;

    if (easyErrorRate > 0.2 && easyTotal >= 5) {
        insights.push({
            pattern: 'careless_mistakes',
            severity: easyErrorRate > 0.35 ? 'high' : 'medium',
            description: `You get ${Math.round(easyErrorRate * 100)}% of Easy questions wrong — likely careless mistakes.`,
            affected_topics: [],
            recommendation: 'Double-check your calculations on easy questions. These are free marks you\'re losing.',
            data: { easy_wrong: easyWrong.length, easy_total: easyTotal, error_rate: Math.round(easyErrorRate * 100) },
        });
    }

    // ── Pattern 3: Topic Weakness ─────────────────────────────
    // Group by topic and find consistently weak areas
    const topicStats = new Map<string, { correct: number; total: number }>();
    for (const a of attempts) {
        const tid = (a.question as any)?.topic_id;
        if (!tid) continue;
        const stat = topicStats.get(tid) || { correct: 0, total: 0 };
        stat.total++;
        if (a.is_correct) stat.correct++;
        topicStats.set(tid, stat);
    }

    const weakTopics: string[] = [];
    for (const [topicId, stat] of topicStats) {
        if (stat.total >= 3 && (stat.correct / stat.total) < 0.4) {
            weakTopics.push(topicNames.get(topicId) || chapterNames.get(topicId) || 'Unknown');
        }
    }

    if (weakTopics.length > 0) {
        insights.push({
            pattern: 'topic_weakness',
            severity: weakTopics.length > 3 ? 'high' : 'medium',
            description: `You have consistently low accuracy in ${weakTopics.length} topic(s).`,
            affected_topics: weakTopics.slice(0, 5),
            recommendation: `Focus your revision on: ${weakTopics.slice(0, 3).join(', ')}. Review concepts before attempting more questions.`,
            data: { weak_topic_count: weakTopics.length },
        });
    }

    // ── Pattern 4: Concept Misunderstanding ───────────────────
    // Detected when student consistently picks the same wrong option for similar questions
    const hardWrong = attempts.filter(a =>
        !a.is_correct && a.user_answer && (a.question as any)?.difficulty === 'Hard'
    );
    const hardTotal = attempts.filter(a => (a.question as any)?.difficulty === 'Hard').length;
    const hardErrorRate = hardTotal > 0 ? hardWrong.length / hardTotal : 0;

    if (hardErrorRate > 0.7 && hardTotal >= 5) {
        const hardTopics = [...new Set(hardWrong.map(a => (a.question as any)?.topic_id).filter(Boolean))]
            .map(id => topicNames.get(id) || 'Unknown')
            .slice(0, 5);

        insights.push({
            pattern: 'concept_misunderstanding',
            severity: 'high',
            description: `You struggle with Hard questions (${Math.round(hardErrorRate * 100)}% error rate). This suggests gaps in conceptual understanding.`,
            affected_topics: hardTopics,
            recommendation: 'Go back to basics for these topics. Watch concept videos and solve example problems before attempting hard questions.',
            data: { hard_wrong: hardWrong.length, hard_total: hardTotal },
        });
    }

    // ── Pattern 5: Calculation Errors ─────────────────────────
    // Detected via integer/numerical type questions with wrong answers but long time spent
    const calcQuestions = attempts.filter(a =>
        ['integer', 'numerical'].includes((a.question as any)?.question_type)
    );
    const calcWrong = calcQuestions.filter(a => !a.is_correct && a.user_answer && a.time_spent_seconds > 60);

    if (calcWrong.length >= 3 && calcQuestions.length >= 5) {
        const calcErrorRate = calcWrong.length / calcQuestions.length;
        if (calcErrorRate > 0.3) {
            insights.push({
                pattern: 'calculation_errors',
                severity: calcErrorRate > 0.5 ? 'high' : 'medium',
                description: `You frequently get numerical/integer questions wrong despite spending time — likely calculation errors.`,
                affected_topics: [],
                recommendation: 'Practice mental math and verify calculations by plugging values back. Write down intermediate steps.',
                data: { calc_wrong: calcWrong.length, calc_total: calcQuestions.length },
            });
        }
    }

    // Sort insights by severity
    const severityOrder = { high: 0, medium: 1, low: 2 };
    insights.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return {
        user_id: userId,
        total_tests_analyzed: tests.length,
        total_questions_analyzed: attempts.length,
        overall_accuracy: Math.round(overallAccuracy * 100),
        insights,
    };
}

/**
 * Generate a human-readable summary of mistake patterns for Cogni AI tutor.
 */
export function generateInsightSummary(report: StudentMistakeReport): string {
    if (report.insights.length === 0) {
        return `Based on ${report.total_tests_analyzed} tests, your accuracy is ${report.overall_accuracy}%. No significant mistake patterns detected. Keep up the good work!`;
    }

    const lines = [
        `📊 Analysis of ${report.total_tests_analyzed} tests (${report.total_questions_analyzed} questions):`,
        `Overall accuracy: ${report.overall_accuracy}%`,
        '',
        '🔍 Key findings:',
    ];

    for (const insight of report.insights) {
        const icon = insight.severity === 'high' ? '🔴' : insight.severity === 'medium' ? '🟡' : '🟢';
        lines.push(`${icon} ${insight.description}`);
        if (insight.affected_topics.length > 0) {
            lines.push(`   Topics: ${insight.affected_topics.join(', ')}`);
        }
        lines.push(`   💡 ${insight.recommendation}`);
        lines.push('');
    }

    return lines.join('\n');
}
