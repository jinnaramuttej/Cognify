import { supabase } from './supabaseClient';

export interface Exam {
    id: string;
    name: string;
    total_marks: number;
    negative_marking: number;
    duration_minutes: number;
    description?: string;
}

export interface Subject {
    id: string;
    name: string;
    grade: number;
    exam_id?: string;
}

export interface Chapter {
    id: string;
    subject_id: string;
    name: string;
}

export interface Topic {
    id: string;
    chapter_id: string;
    name: string;
}

export interface Question {
    id: string;
    topic_id: string;
    exam_id: string;
    question_text: string;
    options: { label: string; text: string }[];
    correct_option: string;
    question_type: 'single_correct' | 'multi_correct' | 'integer' | 'numerical';
    is_pyq: boolean;
    year?: number;
    shift?: string;
    marks: number;
    negative_marks: number;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    explanation?: string;
}

export interface TestAttempt {
    id: string;
    user_id: string;
    title: string;
    config: {
        grade: number;
        exam_id?: string;
        subject_id: string;
        mode: 'Full Exam Simulation' | 'Full Syllabus' | 'Chapter-wise' | 'PYQs Only' | 'Custom';
        question_count: number;
        time_limit_minutes: number;
        difficulty: string;
        negative_marking: boolean;
        chapter_ids?: string[];
        years?: number[];
    };
    status: 'in_progress' | 'completed';
    score: number;
    total_questions: number;
    time_spent_seconds: number;
    created_at: string;
    completed_at?: string;
}

export interface TestQuestion extends Question {
    user_answer?: string;
    is_correct?: boolean;
    is_marked_for_review: boolean;
    time_spent_seconds: number;
    order_index: number;
}

export const TestService = {
    async getExams(): Promise<Exam[]> {
        const { data, error } = await supabase.from('exams').select('*').order('name');
        if (error) throw error;
        return data || [];
    },

    async getSubjectsByExam(examId: string): Promise<Subject[]> {
        const { data, error } = await supabase.from('subjects').select('*').eq('exam_id', examId);
        if (error) throw error;
        return data || [];
    },

    async getGrade11Physics() {
        // Updated for JEE Main context
        const { data: exam } = await supabase.from('exams').select('id').eq('name', 'JEE Main').single();
        const { data: subject } = await supabase
            .from('subjects')
            .select('*')
            .eq('name', 'Physics')
            .eq('exam_id', exam?.id)
            .single();

        if (!subject) return { subject: null, chapters: [] };

        const { data: chapters } = await supabase
            .from('chapters')
            .select('*')
            .eq('subject_id', subject.id);

        return { subject, chapters: chapters || [] };
    },

    async getChapters(subjectId: string): Promise<Chapter[]> {
        const { data, error } = await supabase
            .from('chapters')
            .select('*')
            .eq('subject_id', subjectId);
        if (error) throw error;
        return data || [];
    },

    async createTest(userId: string, title: string, config: TestAttempt['config']): Promise<string> {
        // 1. Create the test session
        const { data: test, error: testError } = await supabase
            .from('tests')
            .insert({
                user_id: userId,
                title,
                config,
                status: 'in_progress',
                total_questions: config.question_count
            })
            .select()
            .single();

        if (testError) throw testError;

        // 2. Fetch questions based on config
        let query = supabase.from('questions').select('id');

        if (config.exam_id) {
            query = query.eq('exam_id', config.exam_id);
        }

        if (config.mode === 'PYQs Only') {
            query = query.eq('is_pyq', true);
            if (config.years && config.years.length > 0) {
                query = query.in('year', config.years);
            }
        }

        if (config.mode === 'Chapter-wise' && config.chapter_ids && config.chapter_ids.length > 0) {
            const { data: topics } = await supabase
                .from('topics')
                .select('id')
                .in('chapter_id', config.chapter_ids);

            const topicIds = topics?.map(t => t.id) || [];
            query = query.in('topic_id', topicIds);
        } else if (config.subject_id) {
            // Get all topics for this subject
            const { data: chapters } = await supabase.from('chapters').select('id').eq('subject_id', config.subject_id);
            const chapterIds = chapters?.map(c => c.id) || [];
            const { data: topics } = await supabase.from('topics').select('id').in('chapter_id', chapterIds);
            const topicIds = topics?.map(t => t.id) || [];
            query = query.in('topic_id', topicIds);
        }

        if (config.difficulty && config.difficulty !== 'Mixed') {
            query = query.eq('difficulty', config.difficulty);
        }

        // Use RPC or raw SQL for better randomization if possible, 
        // but for now, we'll fetch more and randomize in memory or rely on limit if seed is big.
        const { data: questions, error: qError } = await query;
        if (qError) throw qError;

        // Shuffle questions in memory
        const shuffled = (questions || []).sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, config.question_count);

        // 3. Link questions to the test
        const testQuestions = questions.map((q, index) => ({
            test_id: test.id,
            question_id: q.id,
            order_index: index
        }));

        const { error: linkError } = await supabase
            .from('test_attempt_questions')
            .insert(testQuestions);

        if (linkError) throw linkError;

        return test.id;
    },

    async getTestWithQuestions(testId: string) {
        const { data: test, error: testError } = await supabase
            .from('tests')
            .select('*')
            .eq('id', testId)
            .single();

        if (testError) throw testError;

        const { data: questions, error: qError } = await supabase
            .from('test_attempt_questions')
            .select(`
        *,
        question:questions(*)
      `)
            .eq('test_id', testId)
            .order('order_index', { ascending: true });

        if (qError) throw qError;

        return {
            test,
            questions: questions.map(q => ({
                ...q.question,
                user_answer: q.user_answer,
                is_correct: q.is_correct,
                is_marked_for_review: q.is_marked_for_review,
                time_spent_seconds: q.time_spent_seconds,
                order_index: q.order_index
            })) as TestQuestion[]
        };
    },

    async updateAnswer(testId: string, questionId: string, answer: string, timeSpent: number) {
        const { error } = await supabase
            .from('test_attempt_questions')
            .update({
                user_answer: answer,
                time_spent_seconds: timeSpent
            })
            .eq('test_id', testId)
            .eq('question_id', questionId);

        if (error) throw error;
    },

    async toggleMarkForReview(testId: string, questionId: string, isMarked: boolean) {
        const { error } = await supabase
            .from('test_attempt_questions')
            .update({ is_marked_for_review: isMarked })
            .eq('test_id', testId)
            .eq('question_id', questionId);

        if (error) throw error;
    },

    async submitTest(testId: string, totalTimeSeconds: number) {
        const { data: questions } = await supabase
            .from('test_attempt_questions')
            .select(`
        *,
        question:questions(correct_option, marks, negative_marks)
      `)
            .eq('test_id', testId);

        if (!questions) throw new Error('No questions found for this test');

        let score = 0;
        const updates = questions.map(q => {
            const isCorrect = q.user_answer === q.question.correct_option;
            const isAttempted = !!q.user_answer;

            if (isCorrect) {
                score += q.question.marks;
            } else if (isAttempted) {
                score -= q.question.negative_marks;
            }

            return supabase
                .from('test_attempt_questions')
                .update({ is_correct: isCorrect })
                .eq('id', q.id);
        });

        await Promise.all(updates);

        const { error } = await supabase
            .from('tests')
            .update({
                status: 'completed',
                score,
                time_spent_seconds: totalTimeSeconds,
                completed_at: new Date().toISOString()
            })
            .eq('id', testId);

        if (error) throw error;
    },

    async getRecentAttempts(userId: string) {
        const { data, error } = await supabase
            .from('tests')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }
};
