-- Notes Conversions Table
-- Stores generated AI outputs from the Notes Converter module
-- Allows users to revisit past conversions

CREATE TABLE IF NOT EXISTS notes_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  input_text TEXT NOT NULL,
  conversion_type TEXT NOT NULL CHECK (conversion_type IN ('flashcards', 'questions', 'quiz', 'summary', 'mindmap', 'formulas', 'keypoints', 'study_pack')),
  generated_output JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Study Pack Generations Table
-- Stores complete study packs (all formats generated at once)

CREATE TABLE IF NOT EXISTS study_pack_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  input_text TEXT NOT NULL,
  file_url TEXT,
  generated_summary JSONB,
  generated_flashcards JSONB,
  generated_quiz JSONB,
  generated_mindmap JSONB,
  generated_formula_sheet JSONB,
  generated_test JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notes_conversions_user ON notes_conversions(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_conversions_type ON notes_conversions(conversion_type);
CREATE INDEX IF NOT EXISTS idx_study_packs_user ON study_pack_generations(user_id);

-- RLS Policies
ALTER TABLE notes_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_pack_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversions" ON notes_conversions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversions" ON notes_conversions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own study packs" ON study_pack_generations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own study packs" ON study_pack_generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
