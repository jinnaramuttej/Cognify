-- Migration: Add role field to profiles and create study_pack_generations table
-- Date: 2026-03-09
-- Description: Support role-based access and notes conversion storage

-- 1. Add role field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role text 
CHECK (role IN ('student', 'teacher', 'admin')) 
DEFAULT 'student';

-- 2. Update existing users to have proper roles
-- Admin users keep admin role
UPDATE public.profiles 
SET role = 'admin' 
WHERE is_admin = true;

-- 3. Create study_pack_generations table
CREATE TABLE IF NOT EXISTS public.study_pack_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Input
  input_text text,
  file_url text,
  file_name text,
  file_type text,
  
  -- Generated Outputs (JSONB for flexibility)
  generated_summary jsonb,
  generated_flashcards jsonb,
  generated_questions jsonb,
  generated_quiz jsonb,
  generated_mindmap jsonb,
  generated_formulas jsonb,
  generated_keypoints jsonb,
  
  -- Metadata
  processing_time_ms integer,
  character_count integer,
  status text CHECK (status IN ('processing', 'completed', 'failed')) DEFAULT 'processing',
  error_message text,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Create index for faster user queries
CREATE INDEX IF NOT EXISTS idx_study_packs_user 
ON public.study_pack_generations(user_id, created_at DESC);

-- 5. Enable RLS
ALTER TABLE public.study_pack_generations ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
DROP POLICY IF EXISTS "Users can view their own study packs" ON public.study_pack_generations;
CREATE POLICY "Users can view their own study packs" 
ON public.study_pack_generations 
FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own study packs" ON public.study_pack_generations;
CREATE POLICY "Users can create their own study packs" 
ON public.study_pack_generations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own study packs" ON public.study_pack_generations;
CREATE POLICY "Users can update their own study packs" 
ON public.study_pack_generations 
FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own study packs" ON public.study_pack_generations;
CREATE POLICY "Users can delete their own study packs" 
ON public.study_pack_generations 
FOR DELETE 
USING (auth.uid() = user_id);

-- 7. Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_study_pack_generations_updated_at ON public.study_pack_generations;
CREATE TRIGGER update_study_pack_generations_updated_at 
BEFORE UPDATE ON public.study_pack_generations 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- 8. Add comment for documentation
COMMENT ON TABLE public.study_pack_generations IS 'Stores AI-generated study materials from notes/lectures uploaded by students';
COMMENT ON COLUMN public.study_pack_generations.role IS 'User role: student, teacher, or admin';
