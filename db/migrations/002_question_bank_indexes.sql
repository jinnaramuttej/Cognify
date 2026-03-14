-- Migration: 002_question_bank_indexes
-- Performance indexes for question bank queries at scale.
-- Run this in the Supabase SQL editor.

-- ── questions table ─────────────────────────────────────────
-- Primary filter paths used by QuestionSelector and generate route
CREATE INDEX IF NOT EXISTS idx_questions_exam_id       ON public.questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_questions_topic_id      ON public.questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty    ON public.questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_is_pyq        ON public.questions(is_pyq);
CREATE INDEX IF NOT EXISTS idx_questions_year          ON public.questions(year) WHERE year IS NOT NULL;

-- Compound indexes for the most common filter combinations
CREATE INDEX IF NOT EXISTS idx_questions_exam_difficulty ON public.questions(exam_id, difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_topic_difficulty ON public.questions(topic_id, difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_exam_pyq        ON public.questions(exam_id, is_pyq) WHERE is_pyq = TRUE;

-- ── test_attempt_questions table ─────────────────────────────
CREATE INDEX IF NOT EXISTS idx_taq_test_id      ON public.test_attempt_questions(test_id);
CREATE INDEX IF NOT EXISTS idx_taq_question_id  ON public.test_attempt_questions(question_id);
CREATE INDEX IF NOT EXISTS idx_taq_test_order   ON public.test_attempt_questions(test_id, order_index);

-- ── tests table ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_tests_user_id    ON public.tests(user_id);
CREATE INDEX IF NOT EXISTS idx_tests_status     ON public.tests(user_id, status);

-- ── hierarchy resolution (used by generate route) ────────────
CREATE INDEX IF NOT EXISTS idx_topics_chapter_id   ON public.topics(chapter_id);
CREATE INDEX IF NOT EXISTS idx_chapters_subject_id ON public.chapters(subject_id);
CREATE INDEX IF NOT EXISTS idx_subjects_exam_id    ON public.subjects(exam_id);
