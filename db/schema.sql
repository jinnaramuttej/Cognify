-- tests_full_schema.sql
-- MASTER SQL SCHEMA FOR COGNIFY (Consolidated)
-- This file is the single source of truth for the entire database schema.

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. CORE TABLES (Base Infrastructure)
-- Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  email text,
  class text,
  stream text,
  courses text[],
  bio text,
  avatar_url text,
  preferences jsonb default '{}'::jsonb,
  is_admin boolean default false,
  role text check (role in ('student', 'teacher', 'admin')) default 'student',
  target_exam text,
  study_hours_goal int default 4,
  streak int default 0,
  longest_streak int default 0,
  total_xp int default 0,
  last_study_date date,
  created_at timestamptz default now()
);

-- Study Sessions Table
create table if not exists public.study_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  start_time timestamptz default now(),
  end_time timestamptz,
  duration_seconds int default 0,
  created_at timestamptz default now()
);

-- Streaks Table
create table if not exists public.streaks (
  user_id uuid references auth.users primary key,
  current_streak int default 0,
  longest_streak int default 0,
  last_study_date date,
  updated_at timestamptz default now()
);

-- Notes Table
create table if not exists public.notes (
  id uuid default gen_random_uuid() primary key,
  owner uuid references auth.users,
  title text not null,
  class text,
  subject text,
  stream text,
  type text,
  status text default 'draft',
  content text,
  attachments jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Leaderboard Table
create table if not exists public.leaderboard (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users,
  rank int,
  score numeric,
  updated_at timestamptz default now()
);

-- Uploads Table
create table if not exists public.uploads (
  id uuid default gen_random_uuid() primary key,
  owner uuid references auth.users,
  bucket text,
  path text,
  public_url text,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Study Pack Generations Table
create table if not exists public.study_pack_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  input_text text,
  file_url text,
  file_name text,
  file_type text,
  generated_summary jsonb,
  generated_flashcards jsonb,
  generated_questions jsonb,
  generated_quiz jsonb,
  generated_mindmap jsonb,
  generated_formulas jsonb,
  generated_keypoints jsonb,
  processing_time_ms integer,
  character_count integer,
  status text check (status in ('processing', 'completed', 'failed')) default 'processing',
  error_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. TESTS MODULE TABLES (Dependency Order)

-- Exams Table: JEE Main, NEET, etc.
create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  total_marks integer,
  negative_marking numeric default 1,
  duration_minutes integer default 180,
  description text,
  created_at timestamptz default now()
);

-- Subjects Table: Physics, Chemistry, etc.
create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid references public.exams(id) on delete set null,
  name text not null,
  grade integer not null,
  unique(name, grade, exam_id)
);

-- Chapters Table
create table if not exists public.chapters (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid references public.subjects(id) on delete cascade,
  name text not null,
  unique(subject_id, name)
);

-- Topics Table
create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid references public.chapters(id) on delete cascade,
  name text not null,
  unique(chapter_id, name)
);

-- Questions Table (Competitive & Standard)
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references public.topics(id) on delete cascade,
  exam_id uuid references public.exams(id) on delete set null,
  question_text text not null,
  options jsonb not null, -- [{label: "A", text: "..."}, ...]
  correct_option text not null,
  question_type text check (question_type in ('single_correct', 'multi_correct', 'integer', 'numerical')) default 'single_correct',
  difficulty text check (difficulty in ('Easy', 'Medium', 'Hard')),
  explanation text,
  is_pyq boolean default false,
  year integer,
  shift text,
  marks integer default 4,
  negative_marks numeric default 1,
  created_at timestamptz default now()
);

-- Tests Session Table
create table if not exists public.tests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade, -- Session owner
  created_by uuid references auth.users(id) on delete set null, -- Teacher if applicable
  title text not null,
  type text check (type in ('practice', 'assigned')) default 'practice',
  config jsonb not null, -- { grade, subject_id, exam_id, mode, question_count, time_limit_minutes, difficulty, negative_marking }
  status text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  score integer default 0,
  total_questions integer default 0,
  time_spent_seconds integer default 0,
  duration_minutes integer default 30,
  due_date timestamptz,
  is_active boolean default true,
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- Test Attempt Questions Table
create table if not exists public.test_attempt_questions (
  id uuid primary key default gen_random_uuid(),
  test_id uuid references public.tests(id) on delete cascade,
  question_id uuid references public.questions(id) on delete cascade,
  user_answer text,
  is_correct boolean,
  is_marked_for_review boolean default false,
  time_spent_seconds integer default 0,
  order_index integer not null,
  unique (test_id, question_id)
);

-- 3.5 SOCIAL & COMPETITIVE MODULE TABLES

-- Squads (Study Groups)
create table if not exists public.squads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_by uuid references auth.users(id) on delete set null,
  invite_code text unique not null,
  avatar_url text,
  created_at timestamptz default now()
);

-- Squad Members
create table if not exists public.squad_members (
  squad_id uuid references public.squads(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text check (role in ('admin', 'member')) default 'member',
  joined_at timestamptz default now(),
  primary key (squad_id, user_id)
);

-- Challenges (Weekly Global or Custom Squad)
create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text check (type in ('weekly_global', 'squad_custom', 'daily')),
  squad_id uuid references public.squads(id) on delete cascade, -- null if global
  start_date timestamptz not null default now(),
  end_date timestamptz not null,
  config jsonb default '{}'::jsonb, -- e.g., target_subject, duration, question_count
  created_at timestamptz default now()
);

-- Challenge Participants / Leaderboard Entries
create table if not exists public.challenge_participants (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid references public.challenges(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  highest_score numeric default 0,
  tests_completed int default 0,
  percentile numeric, -- Calculated via trigger/function
  last_activity timestamptz default now(),
  unique (challenge_id, user_id)
);

-- 4. INDEXES
create index if not exists idx_questions_exam on public.questions(exam_id);
create index if not exists idx_questions_topic on public.questions(topic_id);
create index if not exists idx_tests_user on public.tests(user_id);
create index if not exists idx_tests_status on public.tests(status);
create index if not exists idx_test_attempt_questions_test on public.test_attempt_questions(test_id);
create index if not exists idx_study_packs_user on public.study_pack_generations(user_id, created_at desc);

-- Social Indexes
create index if not exists idx_squad_members_user on public.squad_members(user_id);
create index if not exists idx_challenge_participants_challenge on public.challenge_participants(challenge_id);
create index if not exists idx_challenge_participants_score on public.challenge_participants(challenge_id, highest_score desc);

-- 5. ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.study_sessions enable row level security;
alter table public.streaks enable row level security;
alter table public.notes enable row level security;
alter table public.study_pack_generations enable row level security;
alter table public.exams enable row level security;
alter table public.subjects enable row level security;
alter table public.chapters enable row level security;
alter table public.topics enable row level security;
alter table public.questions enable row level security;
alter table public.tests enable row level security;
alter table public.test_attempt_questions enable row level security;
alter table public.squads enable row level security;
alter table public.squad_members enable row level security;
alter table public.challenges enable row level security;
alter table public.challenge_participants enable row level security;

-- Base Policies
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

drop policy if exists "Allow profile insertion during signup" on public.profiles;
create policy "Allow profile insertion during signup" on public.profiles for insert with check (true);

drop policy if exists "Users can manage own study sessions" on public.study_sessions;
create policy "Users can manage own study sessions" on public.study_sessions 
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can manage own streak" on public.streaks;
create policy "Users can manage own streak" on public.streaks 
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can manage own notes" on public.notes;
create policy "Users can manage own notes" on public.notes 
  using (auth.uid() = owner) with check (auth.uid() = owner);

-- Study Pack Policies
drop policy if exists "Users can view their own study packs" on public.study_pack_generations;
create policy "Users can view their own study packs" on public.study_pack_generations
  for select using (auth.uid() = user_id);

drop policy if exists "Users can create their own study packs" on public.study_pack_generations;
create policy "Users can create their own study packs" on public.study_pack_generations
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own study packs" on public.study_pack_generations;
create policy "Users can update their own study packs" on public.study_pack_generations
  for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own study packs" on public.study_pack_generations;
create policy "Users can delete their own study packs" on public.study_pack_generations
  for delete using (auth.uid() = user_id);

-- Test Module Policies
drop policy if exists "Public view exams" on public.exams;
create policy "Public view exams" on public.exams for select using (true);

drop policy if exists "Public view subjects" on public.subjects;
create policy "Public view subjects" on public.subjects for select using (true);

drop policy if exists "Public view chapters" on public.chapters;
create policy "Public view chapters" on public.chapters for select using (true);

drop policy if exists "Public view topics" on public.topics;
create policy "Public view topics" on public.topics for select using (true);

drop policy if exists "Public view questions" on public.questions;
create policy "Public view questions" on public.questions for select using (true);

drop policy if exists "Users can manage their own tests" on public.tests;
create policy "Users can manage their own tests" on public.tests
  using (auth.uid() = user_id or created_by = auth.uid())
  with check (auth.uid() = user_id or created_by = auth.uid());

drop policy if exists "Users can manage their own test attempt questions" on public.test_attempt_questions;
create policy "Users can manage their own test attempt questions" on public.test_attempt_questions
  using (exists (select 1 from public.tests where id = test_id and (user_id = auth.uid() or created_by = auth.uid())))
  with check (exists (select 1 from public.tests where id = test_id and (user_id = auth.uid() or created_by = auth.uid())));

-- Social Policies
drop policy if exists "Users can view squads they are in" on public.squads;
create policy "Users can view squads they are in" on public.squads
  for select using (
    exists (select 1 from public.squad_members sm where sm.squad_id = id and sm.user_id = auth.uid())
  );

drop policy if exists "Users can view squad members of their squads" on public.squad_members;
create policy "Users can view squad members of their squads" on public.squad_members
  for select using (
    exists (select 1 from public.squad_members sm where sm.squad_id = squad_id and sm.user_id = auth.uid())
  );

drop policy if exists "Anyone can view global challenges" on public.challenges;
create policy "Anyone can view global challenges" on public.challenges
  for select using (type = 'weekly_global' or exists (select 1 from public.squad_members sm where sm.squad_id = challenges.squad_id and sm.user_id = auth.uid()));

drop policy if exists "Public view challenge participants" on public.challenge_participants;
create policy "Public view challenge participants" on public.challenge_participants
  for select using (true);

drop policy if exists "Users can update their own participant scores" on public.challenge_participants;
create policy "Users can update their own participant scores" on public.challenge_participants
  for update using (user_id = auth.uid());
create policy "Users can insert their own participant entry" on public.challenge_participants
  for insert with check (user_id = auth.uid());

-- 6. AUTOMATION (Triggers & Functions)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, class, stream)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.email,
    new.raw_user_meta_data->>'class',
    new.raw_user_meta_data->>'stream'
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    email = excluded.email,
    class = excluded.class,
    stream = excluded.stream;
  
  insert into public.streaks (user_id, last_study_date) values (new.id, current_date - interval '1 day') on conflict do nothing;
  
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Streaks Update Logistics
create or replace function public.update_streak()
returns void as $$
declare
  _uid uuid := auth.uid();
  _streak record;
  _today date := current_date;
begin
  if _uid is null then return; end if;
  
  select * into _streak from public.streaks where user_id = _uid;
  
  if not found then
    insert into public.streaks (user_id, current_streak, longest_streak, last_study_date)
    values (_uid, 1, 1, _today);
  elsif _streak.last_study_date = _today - interval '1 day' then
    update public.streaks 
    set current_streak = current_streak + 1,
        longest_streak = greatest(longest_streak, current_streak + 1),
        last_study_date = _today,
        updated_at = now()
    where user_id = _uid;
  elsif _streak.last_study_date < _today - interval '1 day' then
    update public.streaks
    set current_streak = 1,
        last_study_date = _today,
        updated_at = now()
    where user_id = _uid;
  end if;
end;
$$ language plpgsql security definer;

-- Percentile Calculation Setup
-- Calculates the percentile for a given user in a given challenge based on `highest_score`
create or replace function public.calculate_percentiles_for_challenge(v_challenge_id uuid)
returns void as $$
begin
  -- Updates everyone's percentile in a single pass
  with ranked as (
    select id, 
           percent_rank() over(order by highest_score) * 100 as pct
    from public.challenge_participants
    where challenge_id = v_challenge_id
  )
  update public.challenge_participants cp
  set percentile = r.pct
  from ranked r
  where cp.id = r.id;
end;
$$ language plpgsql security definer;

-- 7. SEED DATA
do $$
declare
  jee_id uuid;
  neet_id uuid;
  physics_id uuid;
  ch1_id uuid;
begin
  -- Seed Exams
  insert into public.exams (name, total_marks, negative_marking, duration_minutes, description)
  values 
  ('JEE Main', 300, 1, 180, 'Joint Entrance Examination for engineering aspirants.'),
  ('NEET', 720, 1, 200, 'National Eligibility cum Entrance Test for medical aspirants.'),
  ('JEE Advanced', 360, 1, 180, 'Advanced screening for IIT aspirants.')
  on conflict (name) do update set duration_minutes = excluded.duration_minutes;

  select id into jee_id from public.exams where name = 'JEE Main';
  select id into neet_id from public.exams where name = 'NEET';

  -- Seed Subjects
  insert into public.subjects (name, grade, exam_id) values ('Physics', 11, jee_id)
  on conflict (name, grade, exam_id) do update set grade = excluded.grade
  returning id into physics_id;

  -- Seed Chapters
  insert into public.chapters (subject_id, name) values (physics_id, 'Units and Measurements')
  on conflict (subject_id, name) do update set name = excluded.name
  returning id into ch1_id;

  -- Seed Topics
  insert into public.topics (chapter_id, name) values (ch1_id, 'Dimensional Analysis') on conflict do nothing;

  -- Seed Sample JEE PYQ
  insert into public.questions (topic_id, exam_id, question_text, options, correct_option, difficulty, explanation, is_pyq, year, shift)
  values (
    (select id from public.topics where name = 'Dimensional Analysis' limit 1),
    jee_id,
    'The dimension of Surface Tension is:',
    '[{"label": "A", "text": "[MT^-2]"}, {"label": "B", "text": "[MLT^-2]"}, {"label": "C", "text": "[ML^-1T^-2]"}, {"label": "D", "text": "[ML^2T^-2]"}]',
    'A',
    'Easy',
    'Surface Tension = Force / Length = [MLT^-2] / [L] = [MT^-2]',
    true,
    2024,
    'Shift 1'
  ) on conflict do nothing;

end $$;

-- 1️⃣ Create exams table (if not exists)
create table if not exists syllabus_exams (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  category text check (category in ('Engineering','Medical')),
  pattern_type text,
  total_marks integer,
  duration_minutes integer,
  negative_marking boolean default true,
  created_at timestamptz default now()
);

create index if not exists idx_syllabus_exams_name_new on syllabus_exams(name);

-- 2️⃣ Create subjects table
create table if not exists syllabus_subjects (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid references syllabus_exams(id) on delete cascade,
  name text not null,
  created_at timestamptz default now(),
  unique (exam_id, name)
);

create index if not exists idx_syllabus_subjects_exam_id_new on syllabus_subjects(exam_id);

-- 3️⃣ Create units table
create table if not exists syllabus_units (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid references syllabus_subjects(id) on delete cascade,
  name text not null,
  created_at timestamptz default now(),
  unique (subject_id, name)
);

create index if not exists idx_syllabus_units_subject_id on syllabus_units(subject_id);

-- 4️⃣ Create chapters table
create table if not exists syllabus_chapters (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid references syllabus_units(id) on delete cascade,
  name text not null,
  class_level text check (class_level in ('11','12','Both')),
  weightage numeric default 1.0,
  created_at timestamptz default now(),
  unique (unit_id, name)
);

create index if not exists idx_syllabus_chapters_unit_id_new on syllabus_chapters(unit_id);
create index if not exists idx_syllabus_chapters_class_level on syllabus_chapters(class_level);

-- 5️⃣ Create concepts table (future-proof)
create table if not exists syllabus_concepts (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid references syllabus_chapters(id) on delete cascade,
  name text not null,
  difficulty_level integer check (difficulty_level between 1 and 5),
  created_at timestamptz default now()
);

create index if not exists idx_syllabus_concepts_chapter_id on syllabus_concepts(chapter_id);

-- 🔐 RLS
alter table syllabus_exams enable row level security;
alter table syllabus_subjects enable row level security;
alter table syllabus_units enable row level security;
alter table syllabus_chapters enable row level security;
alter table syllabus_concepts enable row level security;

drop policy if exists "Allow public select syllabus_exams" on syllabus_exams;
create policy "Allow public select syllabus_exams" on syllabus_exams for select using (true);

drop policy if exists "Allow public select syllabus_subjects" on syllabus_subjects;
create policy "Allow public select syllabus_subjects" on syllabus_subjects for select using (true);

drop policy if exists "Allow public select syllabus_units" on syllabus_units;
create policy "Allow public select syllabus_units" on syllabus_units for select using (true);

drop policy if exists "Allow public select syllabus_chapters" on syllabus_chapters;
create policy "Allow public select syllabus_chapters" on syllabus_chapters for select using (true);

drop policy if exists "Allow public select syllabus_concepts" on syllabus_concepts;
create policy "Allow public select syllabus_concepts" on syllabus_concepts for select using (true);

-- 📌 Insert Exams (Seed Basic Rows)
insert into syllabus_exams (name, category, total_marks, duration_minutes, negative_marking)
values 
  ('JEE Main', 'Engineering', 300, 180, true),
  ('JEE Advanced', 'Engineering', 360, 180, true),
  ('NEET', 'Medical', 720, 200, true),
  ('BITSAT', 'Engineering', 390, 180, true)
on conflict do nothing;

-- 📌 Seed Complete Syllabus Architecture (Physics, Chemistry, Math, Botany, Zoology)
DO $$
DECLARE
  v_exam_id uuid;
  v_subj_id uuid;
  v_unit_id uuid;
BEGIN

  -- ==========================================
  -- EXAM: JEE Main
  -- ==========================================
  INSERT INTO syllabus_exams (name) VALUES ('JEE Main') ON CONFLICT (name) DO NOTHING;
  SELECT id INTO v_exam_id FROM syllabus_exams WHERE name = 'JEE Main';

  -- SUBJECT: Physics (JEE Main)
  INSERT INTO syllabus_subjects (exam_id, name) VALUES (v_exam_id, 'Physics') ON CONFLICT (exam_id, name) DO NOTHING;
  SELECT id INTO v_subj_id FROM syllabus_subjects WHERE exam_id = v_exam_id AND name = 'Physics';

  INSERT INTO syllabus_units (subject_id, name) VALUES (v_subj_id, 'Mechanics') ON CONFLICT (subject_id, name) DO NOTHING;
  SELECT id INTO v_unit_id FROM syllabus_units WHERE subject_id = v_subj_id AND name = 'Mechanics';
  INSERT INTO syllabus_chapters (unit_id, name, class_level) VALUES
    (v_unit_id, 'Units and Measurements', '11'),
    (v_unit_id, 'Kinematics', '11'),
    (v_unit_id, 'Laws of Motion', '11'),
    (v_unit_id, 'Work Energy Power', '11'),
    (v_unit_id, 'Rotational Motion', '11'),
    (v_unit_id, 'Gravitation', '11'),
    (v_unit_id, 'Mechanical Properties of Solids', '11'),
    (v_unit_id, 'Mechanical Properties of Fluids', '11'),
    (v_unit_id, 'Thermal Properties of Matter', '11')
  ON CONFLICT (unit_id, name) DO NOTHING;

  INSERT INTO syllabus_units (subject_id, name) VALUES (v_subj_id, 'Oscillations & Waves') ON CONFLICT (subject_id, name) DO NOTHING;
  SELECT id INTO v_unit_id FROM syllabus_units WHERE subject_id = v_subj_id AND name = 'Oscillations & Waves';
  INSERT INTO syllabus_chapters (unit_id, name, class_level) VALUES
    (v_unit_id, 'Oscillations', '11'),
    (v_unit_id, 'Waves', '11'),
    (v_unit_id, 'Sound Waves', '11')
  ON CONFLICT (unit_id, name) DO NOTHING;

  INSERT INTO syllabus_units (subject_id, name) VALUES (v_subj_id, 'Thermodynamics') ON CONFLICT (subject_id, name) DO NOTHING;
  SELECT id INTO v_unit_id FROM syllabus_units WHERE subject_id = v_subj_id AND name = 'Thermodynamics';
  INSERT INTO syllabus_chapters (unit_id, name, class_level) VALUES
    (v_unit_id, 'Thermodynamics', '11'),
    (v_unit_id, 'Kinetic Theory of Gases', '11')
  ON CONFLICT (unit_id, name) DO NOTHING;

  INSERT INTO syllabus_units (subject_id, name) VALUES (v_subj_id, 'Electrostatics & Current Electricity') ON CONFLICT (subject_id, name) DO NOTHING;
  SELECT id INTO v_unit_id FROM syllabus_units WHERE subject_id = v_subj_id AND name = 'Electrostatics & Current Electricity';
  INSERT INTO syllabus_chapters (unit_id, name, class_level) VALUES
    (v_unit_id, 'Electric Charges and Fields', '12'),
    (v_unit_id, 'Electrostatic Potential and Capacitance', '12'),
    (v_unit_id, 'Current Electricity', '12')
  ON CONFLICT (unit_id, name) DO NOTHING;

  INSERT INTO syllabus_units (subject_id, name) VALUES (v_subj_id, 'Magnetism & Electromagnetic Induction') ON CONFLICT (subject_id, name) DO NOTHING;
  SELECT id INTO v_unit_id FROM syllabus_units WHERE subject_id = v_subj_id AND name = 'Magnetism & Electromagnetic Induction';
  INSERT INTO syllabus_chapters (unit_id, name, class_level) VALUES
    (v_unit_id, 'Moving Charges and Magnetism', '12'),
    (v_unit_id, 'Magnetism and Matter', '12'),
    (v_unit_id, 'Electromagnetic Induction', '12'),
    (v_unit_id, 'Alternating Current', '12')
  ON CONFLICT (unit_id, name) DO NOTHING;

  INSERT INTO syllabus_units (subject_id, name) VALUES (v_subj_id, 'Optics') ON CONFLICT (subject_id, name) DO NOTHING;
  SELECT id INTO v_unit_id FROM syllabus_units WHERE subject_id = v_subj_id AND name = 'Optics';
  INSERT INTO syllabus_chapters (unit_id, name, class_level) VALUES
    (v_unit_id, 'Ray Optics', '12'),
    (v_unit_id, 'Wave Optics', '12')
  ON CONFLICT (unit_id, name) DO NOTHING;

  INSERT INTO syllabus_units (subject_id, name) VALUES (v_subj_id, 'Modern Physics') ON CONFLICT (subject_id, name) DO NOTHING;
  SELECT id INTO v_unit_id FROM syllabus_units WHERE subject_id = v_subj_id AND name = 'Modern Physics';
  INSERT INTO syllabus_chapters (unit_id, name, class_level) VALUES
    (v_unit_id, 'Dual Nature of Matter', '12'),
    (v_unit_id, 'Atoms and Nuclei', '12'),
    (v_unit_id, 'Semiconductor Electronics', '12'),
    (v_unit_id, 'Communication Systems', '12')
  ON CONFLICT (unit_id, name) DO NOTHING;

  -- SUBJECT: Chemistry (JEE Main)
  INSERT INTO syllabus_subjects (exam_id, name) VALUES (v_exam_id, 'Chemistry') ON CONFLICT (exam_id, name) DO NOTHING;
  SELECT id INTO v_subj_id FROM syllabus_subjects WHERE exam_id = v_exam_id AND name = 'Chemistry';

  INSERT INTO syllabus_units (subject_id, name) VALUES (v_subj_id, 'Physical Chemistry') ON CONFLICT (subject_id, name) DO NOTHING;
  SELECT id INTO v_unit_id FROM syllabus_units WHERE subject_id = v_subj_id AND name = 'Physical Chemistry';
  INSERT INTO syllabus_chapters (unit_id, name, class_level) VALUES
    (v_unit_id, 'Some Basic Concepts of Chemistry', '11'),
    (v_unit_id, 'Atomic Structure', '11'),
    (v_unit_id, 'States of Matter', '11'),
    (v_unit_id, 'Thermodynamics', '11'),
    (v_unit_id, 'Equilibrium', '11'),
    (v_unit_id, 'Redox Reactions', '11'),
    (v_unit_id, 'Solid State', '12'),
    (v_unit_id, 'Solutions', '12'),
    (v_unit_id, 'Electrochemistry', '12'),
    (v_unit_id, 'Chemical Kinetics', '12'),
    (v_unit_id, 'Surface Chemistry', '12')
  ON CONFLICT (unit_id, name) DO NOTHING;

  INSERT INTO syllabus_units (subject_id, name) VALUES (v_subj_id, 'Inorganic Chemistry') ON CONFLICT (subject_id, name) DO NOTHING;
  SELECT id INTO v_unit_id FROM syllabus_units WHERE subject_id = v_subj_id AND name = 'Inorganic Chemistry';
  INSERT INTO syllabus_chapters (unit_id, name, class_level) VALUES
    (v_unit_id, 'Periodic Table', '11'),
    (v_unit_id, 'Chemical Bonding', '11'),
    (v_unit_id, 'Hydrogen', '11'),
    (v_unit_id, 's-Block Elements', '11'),
    (v_unit_id, 'p-Block Elements (11)', '11'),
    (v_unit_id, 'd and f Block Elements', '12'),
    (v_unit_id, 'Coordination Compounds', '12'),
    (v_unit_id, 'p-Block Elements (12)', '12'),
    (v_unit_id, 'Metallurgy', '12')
  ON CONFLICT (unit_id, name) DO NOTHING;

  INSERT INTO syllabus_units (subject_id, name) VALUES (v_subj_id, 'Organic Chemistry') ON CONFLICT (subject_id, name) DO NOTHING;
  SELECT id INTO v_unit_id FROM syllabus_units WHERE subject_id = v_subj_id AND name = 'Organic Chemistry';
  INSERT INTO syllabus_chapters (unit_id, name, class_level) VALUES
    (v_unit_id, 'Basic Principles of Organic Chemistry', '11'),
    (v_unit_id, 'Hydrocarbons', '11'),
    (v_unit_id, 'Haloalkanes and Haloarenes', '12'),
    (v_unit_id, 'Alcohols Phenols Ethers', '12'),
    (v_unit_id, 'Aldehydes Ketones Carboxylic Acids', '12'),
    (v_unit_id, 'Amines', '12'),
    (v_unit_id, 'Biomolecules', '12'),
    (v_unit_id, 'Polymers', '12'),
    (v_unit_id, 'Chemistry in Everyday Life', '12')
  ON CONFLICT (unit_id, name) DO NOTHING;

  -- SUBJECT: Mathematics (JEE Main)
  INSERT INTO syllabus_subjects (exam_id, name) VALUES (v_exam_id, 'Mathematics') ON CONFLICT (exam_id, name) DO NOTHING;
  SELECT id INTO v_subj_id FROM syllabus_subjects WHERE exam_id = v_exam_id AND name = 'Mathematics';

  INSERT INTO syllabus_units (subject_id, name) VALUES (v_subj_id, 'Algebra') ON CONFLICT (subject_id, name) DO NOTHING;
  SELECT id INTO v_unit_id FROM syllabus_units WHERE subject_id = v_subj_id AND name = 'Algebra';
  INSERT INTO syllabus_chapters (unit_id, name, class_level) VALUES
    (v_unit_id, 'Sets Relations Functions', '11'),
    (v_unit_id, 'Complex Numbers', '11'),
    (v_unit_id, 'Quadratic Equations', '11'),
    (v_unit_id, 'Sequences and Series', '11'),
    (v_unit_id, 'Binomial Theorem', '11'),
    (v_unit_id, 'Permutation Combination', '11'),
    (v_unit_id, 'Matrices', '12'),
    (v_unit_id, 'Determinants', '12'),
    (v_unit_id, 'Probability', '12'),
    (v_unit_id, 'Mathematical Reasoning', '12')
  ON CONFLICT (unit_id, name) DO NOTHING;

  INSERT INTO syllabus_units (subject_id, name) VALUES (v_subj_id, 'Calculus') ON CONFLICT (subject_id, name) DO NOTHING;
  SELECT id INTO v_unit_id FROM syllabus_units WHERE subject_id = v_subj_id AND name = 'Calculus';
  INSERT INTO syllabus_chapters (unit_id, name, class_level) VALUES
    (v_unit_id, 'Limits and Derivatives (Intro)', '11'),
    (v_unit_id, 'Continuity and Differentiability', '12'),
    (v_unit_id, 'Applications of Derivatives', '12'),
    (v_unit_id, 'Indefinite Integrals', '12'),
    (v_unit_id, 'Definite Integrals', '12'),
    (v_unit_id, 'Differential Equations', '12'),
    (v_unit_id, 'Area Under Curve', '12')
  ON CONFLICT (unit_id, name) DO NOTHING;

  INSERT INTO syllabus_units (subject_id, name) VALUES (v_subj_id, 'Coordinate Geometry') ON CONFLICT (subject_id, name) DO NOTHING;
  SELECT id INTO v_unit_id FROM syllabus_units WHERE subject_id = v_subj_id AND name = 'Coordinate Geometry';
  INSERT INTO syllabus_chapters (unit_id, name, class_level) VALUES
    (v_unit_id, 'Straight Lines', '11'),
    (v_unit_id, 'Circle', '11'),
    (v_unit_id, 'Conic Sections', '11'),
    (v_unit_id, '3D Geometry', '12'),
    (v_unit_id, 'Vectors', '12')
  ON CONFLICT (unit_id, name) DO NOTHING;

  INSERT INTO syllabus_units (subject_id, name) VALUES (v_subj_id, 'Trigonometry') ON CONFLICT (subject_id, name) DO NOTHING;
  SELECT id INTO v_unit_id FROM syllabus_units WHERE subject_id = v_subj_id AND name = 'Trigonometry';
  INSERT INTO syllabus_chapters (unit_id, name, class_level) VALUES
    (v_unit_id, 'Trigonometric Functions', '11'),
    (v_unit_id, 'Identities', '11'),
    (v_unit_id, 'Inverse Trigonometric Functions', '11')
  ON CONFLICT (unit_id, name) DO NOTHING;

  -- ==========================================
  -- EXAM: BITSAT
  -- ==========================================
  INSERT INTO syllabus_exams (name) VALUES ('BITSAT') ON CONFLICT (name) DO NOTHING;
  SELECT id INTO v_exam_id FROM syllabus_exams WHERE name = 'BITSAT';

  -- SUBJECT: Physics (BITSAT)
  INSERT INTO syllabus_subjects (exam_id, name) VALUES (v_exam_id, 'Physics') ON CONFLICT (exam_id, name) DO NOTHING;
  SELECT id INTO v_subj_id FROM syllabus_subjects WHERE exam_id = v_exam_id AND name = 'Physics';

  INSERT INTO syllabus_units (subject_id, name) VALUES (v_subj_id, 'Mechanics') ON CONFLICT (subject_id, name) DO NOTHING;
  SELECT id INTO v_unit_id FROM syllabus_units WHERE subject_id = v_subj_id AND name = 'Mechanics';
  INSERT INTO syllabus_chapters (unit_id, name, class_level) VALUES
    (v_unit_id, 'Units and Measurements', '11'),
    (v_unit_id, 'Kinematics', '11'),
    (v_unit_id, 'Laws of Motion', '11'),
    (v_unit_id, 'Work Energy Power', '11'),
    (v_unit_id, 'Rotational Motion', '11'),
    (v_unit_id, 'Gravitation', '11'),
    (v_unit_id, 'Mechanical Properties of Solids', '11'),
    (v_unit_id, 'Mechanical Properties of Fluids', '11'),
    (v_unit_id, 'Thermal Properties of Matter', '11')
  ON CONFLICT (unit_id, name) DO NOTHING;

  INSERT INTO syllabus_units (subject_id, name) VALUES (v_subj_id, 'Oscillations & Waves') ON CONFLICT (subject_id, name) DO NOTHING;
  SELECT id INTO v_unit_id FROM syllabus_units WHERE subject_id = v_subj_id AND name = 'Oscillations & Waves';
  INSERT INTO syllabus_chapters (unit_id, name, class_level) VALUES
    (v_unit_id, 'Oscillations', '11'),
    (v_unit_id, 'Waves', '11'),
    (v_unit_id, 'Sound Waves', '11')
  ON CONFLICT (unit_id, name) DO NOTHING;

  INSERT INTO syllabus_units (subject_id, name) VALUES (v_subj_id, 'Thermodynamics') ON CONFLICT (subject_id, name) DO NOTHING;
  SELECT id INTO v_unit_id FROM syllabus_units WHERE subject_id = v_subj_id AND name = 'Thermodynamics';
  INSERT INTO syllabus_chapters (unit_id, name, class_level) VALUES
    (v_unit_id, 'Thermodynamics', '11'),
    (v_unit_id, 'Kinetic Theory of Gases', '11')
  ON CONFLICT (unit_id, name) DO NOTHING;

  INSERT INTO syllabus_units (subject_id, name) VALUES (v_subj_id, 'Electrostatics & Current Electricity') ON CONFLICT (subject_id, name) DO NOTHING;
  SELECT id INTO v_unit_id FROM syllabus_units WHERE subject_id = v_subj_id AND name = 'Electrostatics & Current Electricity';
  INSERT INTO syllabus_chapters (unit_id, name, class_level) VALUES
    (v_unit_id, 'Electric Charges and Fields', '12'),
    (v_unit_id, 'Electrostatic Potential and Capacitance', '12'),
    (v_unit_id, 'Current Electricity', '12')
  ON CONFLICT (unit_id, name) DO NOTHING;

  INSERT INTO syllabus_units (subject_id, name) VALUES (v_subj_id, 'Magnetism & Electromagnetic Induction') ON CONFLICT (subject_id, name) DO NOTHING;
  SELECT id INTO v_unit_id FROM syllabus_units WHERE subject_id = v_subj_id AND name = 'Magnetism & Electromagnetic Induction';
  INSERT INTO syllabus_chapters (unit_id, name, class_level) VALUES
    (v_unit_id, 'Moving Charges and Magnetism', '12'),
    (v_unit_id, 'Magnetism and Matter', '12'),
    (v_unit_id, 'Electromagnetic Induction', '12'),
    (v_unit_id, 'Alternating Current', '12')
  ON CONFLICT (unit_id, name) DO NOTHING;

  INSERT INTO syllabus_units (subject_id, name) VALUES (v_subj_id, 'Optics') ON CONFLICT (subject_id, name) DO NOTHING;
  SELECT id INTO v_unit_id FROM syllabus_units WHERE subject_id = v_subj_id AND name = 'Optics';
  INSERT INTO syllabus_chapters (unit_id, name, class_level) VALUES
    (v_unit_id, 'Ray Optics', '12'),
    (v_unit_id, 'Wave Optics', '12')
  ON CONFLICT (unit_id, name) DO NOTHING;

  INSERT INTO syllabus_units (subject_id, name) VALUES (v_subj_id, 'Modern Physics') ON CONFLICT (subject_id, name) DO NOTHING;
  SELECT id INTO v_unit_id FROM syllabus_units WHERE subject_id = v_subj_id AND name = 'Modern Physics';
  INSERT INTO syllabus_chapters (unit_id, name, class_level) VALUES
    (v_unit_id, 'Dual Nature of Matter', '12'),
    (v_unit_id, 'Atoms and Nuclei', '12'),
    (v_unit_id, 'Semiconductor Electronics', '12'),
    (v_unit_id, 'Communication Systems', '12')
  ON CONFLICT (unit_id, name) DO NOTHING;

  -- SUBJECT: Chemistry (BITSAT)
  INSERT INTO syllabus_subjects (exam_id, name) VALUES (v_exam_id, 'Chemistry') ON CONFLICT (exam_id, name) DO NOTHING;
  SELECT id INTO v_subj_id FROM syllabus_subjects WHERE exam_id = v_exam_id AND name = 'Chemistry';

  INSERT INTO syllabus_units (subject_id, name) VALUES (v_subj_id, 'Physical Chemistry') ON CONFLICT (subject_id, name) DO NOTHING;
  SELECT id INTO v_unit_id FROM syllabus_units WHERE subject_id = v_subj_id AND name = 'Physical Chemistry';
  INSERT INTO syllabus_chapters (unit_id, name, class_level) VALUES
    (v_unit_id, 'Some Basic Concepts of Chemistry', '11'),
    (v_unit_id, 'Atomic Structure', '11'),
    (v_unit_id, 'States of Matter', '11'),
    (v_unit_id, 'Thermodynamics', '11'),
    (v_unit_id, 'Equilibrium', '11'),
    (v_unit_id, 'Redox Reactions', '11'),
    (v_unit_id, 'Solid State', '12'),
    (v_unit_id, 'Solutions', '12'),
    (v_unit_id, 'Electrochemistry', '12'),
    (v_unit_id, 'Chemical Kinetics', '12'),
    (v_unit_id, 'Surface Chemistry', '12')
  ON CONFLICT (unit_id, name) DO NOTHING;

  INSERT INTO syllabus_units (subject_id, name) VALUES (v_subj_id, 'Inorganic Chemistry') ON CONFLICT (subject_id, name) DO NOTHING;
  SELECT id INTO v_unit_id FROM syllabus_units WHERE subject_id = v_subj_id AND name = 'Inorganic Chemistry';
  INSERT INTO syllabus_chapters (unit_id, name, class_level) VALUES
    (v_unit_id, 'Periodic Table', '11'),
    (v_unit_id, 'Chemical Bonding', '11'),
    (v_unit_id, 'Hydrogen', '11'),
    (v_unit_id, 's-Block Elements', '11'),
    (v_unit_id, 'p-Block Elements (11)', '11'),
    (v_unit_id, 'd and f Block Elements', '12'),
    (v_unit_id, 'Coordination Compounds', '12'),
    (v_unit_id, 'p-Block Elements (12)', '12'),
    (v_unit_id, 'Metallurgy', '12')
  ON CONFLICT (unit_id, name) DO NOTHING;

  INSERT INTO syllabus_units (subject_id, name) VALUES (v_subj_id, 'Organic Chemistry') ON CONFLICT (subject_id, name) DO NOTHING;
  SELECT id INTO v_unit_id FROM syllabus_units WHERE subject_id = v_subj_id AND name = 'Organic Chemistry';
  INSERT INTO syllabus_chapters (unit_id, name, class_level) VALUES
    (v_unit_id, 'Basic Principles of Organic Chemistry', '11'),
    (v_unit_id, 'Hydrocarbons', '11'),
    (v_unit_id, 'Haloalkanes and Haloarenes', '12'),
    (v_unit_id, 'Alcohols Phenols Ethers', '12'),
    (v_unit_id, 'Aldehydes Ketones Carboxylic Acids', '12'),
    (v_unit_id, 'Amines', '12'),
    (v_unit_id, 'Biomolecules', '12'),
    (v_unit_id, 'Polymers', '12'),
    (v_unit_id, 'Chemistry in Everyday Life', '12')
  ON CONFLICT (unit_id, name) DO NOTHING;

  -- SUBJECT: Mathematics (BITSAT)
  INSERT INTO syllabus_subjects (exam_id, name) VALUES (v_exam_id, 'Mathematics') ON CONFLICT (exam_id, name) DO NOTHING;
  SELECT id INTO v_subj_id FROM syllabus_subjects WHERE exam_id = v_exam_id AND name = 'Mathematics';

  INSERT INTO syllabus_units (subject_id, name) VALUES (v_subj_id, 'Algebra') ON CONFLICT (subject_id, name) DO NOTHING;
  SELECT id INTO v_unit_id FROM syllabus_units WHERE subject_id = v_subj_id AND name = 'Algebra';
  INSERT INTO syllabus_chapters (unit_id, name, class_level) VALUES
    (v_unit_id, 'Sets Relations Functions', '11'),
    (v_unit_id, 'Complex Numbers', '11'),
    (v_unit_id, 'Quadratic Equations', '11'),
    (v_unit_id, 'Sequences and Series', '11'),
    (v_unit_id, 'Binomial Theorem', '11'),
    (v_unit_id, 'Permutation Combination', '11'),
    (v_unit_id, 'Matrices', '12'),
    (v_unit_id, 'Determinants', '12'),
    (v_unit_id, 'Probability', '12'),
    (v_unit_id, 'Mathematical Reasoning', '12')
  ON CONFLICT (unit_id, name) DO NOTHING;

  INSERT INTO syllabus_units (subject_id, name) VALUES (v_subj_id, 'Calculus') ON CONFLICT (subject_id, name) DO NOTHING;
  SELECT id INTO v_unit_id FROM syllabus_units WHERE subject_id = v_subj_id AND name = 'Calculus';
  INSERT INTO syllabus_chapters (unit_id, name, class_level) VALUES
    (v_unit_id, 'Limits and Derivatives (Intro)', '11'),
    (v_unit_id, 'Continuity and Differentiability', '12'),
    (v_unit_id, 'Applications of Derivatives', '12'),
    (v_unit_id, 'Indefinite Integrals', '12'),
    (v_unit_id, 'Definite Integrals', '12'),
    (v_unit_id, 'Differential Equations', '12'),
    (v_unit_id, 'Area Under Curve', '12')
  ON CONFLICT (unit_id, name) DO NOTHING;

  INSERT INTO syllabus_units (subject_id, name) VALUES (v_subj_id, 'Coordinate Geometry') ON CONFLICT (subject_id, name) DO NOTHING;
  SELECT id INTO v_unit_id FROM syllabus_units WHERE subject_id = v_subj_id AND name = 'Coordinate Geometry';
  INSERT INTO syllabus_chapters (unit_id, name, class_level) VALUES
    (v_unit_id, 'Straight Lines', '11'),
    (v_unit_id, 'Circle', '11'),
    (v_unit_id, 'Conic Sections', '11'),
    (v_unit_id, '3D Geometry', '12'),
    (v_unit_id, 'Vectors', '12')
  ON CONFLICT (unit_id, name) DO NOTHING;

  INSERT INTO syllabus_units (subject_id, name) VALUES (v_subj_id, 'Trigonometry') ON CONFLICT (subject_id, name) DO NOTHING;
  SELECT id INTO v_unit_id FROM syllabus_units WHERE subject_id = v_subj_id AND name = 'Trigonometry';
  INSERT INTO syllabus_chapters (unit_id, name, class_level) VALUES
    (v_unit_id, 'Trigonometric Functions', '11'),
    (v_unit_id, 'Identities', '11'),
    (v_unit_id, 'Inverse Trigonometric Functions', '11')
  ON CONFLICT (unit_id, name) DO NOTHING;

  -- ==========================================
  -- EXAM: NEET
  -- ==========================================
  INSERT INTO syllabus_exams (name) VALUES ('NEET') ON CONFLICT (name) DO NOTHING;
  SELECT id INTO v_exam_id FROM syllabus_exams WHERE name = 'NEET';

  -- SUBJECT: Physics (NEET)
  INSERT INTO syllabus_subjects (exam_id, name) VALUES (v_exam_id, 'Physics') ON CONFLICT (exam_id, name) DO NOTHING;
  SELECT id INTO v_subj_id FROM syllabus_subjects WHERE exam_id = v_exam_id AND name = 'Physics';

  INSERT INTO syllabus_units (subject_id, name) VALUES (v_subj_id, 'Mechanics') ON CONFLICT (subject_id, name) DO NOTHING;
  SELECT id INTO v_unit_id FROM syllabus_units WHERE subject_id = v_subj_id AND name = 'Mechanics';
  INSERT INTO syllabus_chapters (unit_id, name, class_level) VALUES
    (v_unit_id, 'Units and Measurements', '11'),
    (v_unit_id, 'Kinematics', '11'),
    (v_unit_id, 'Laws of Motion', '11'),
    (v_unit_id, 'Work Energy Power', '11'),
    (v_unit_id, 'Rotational Motion', '11'),
    (v_unit_id, 'Gravitation', '11'),
    (v_unit_id, 'Mechanical Properties of Solids', '11'),
    (v_unit_id, 'Mechanical Properties of Fluids', '11'),
    (v_unit_id, 'Thermal Properties of Matter', '11')
  ON CONFLICT (unit_id, name) DO NOTHING;

  INSERT INTO syllabus_units (subject_id, name) VALUES (v_subj_id, 'Oscillations & Waves') ON CONFLICT (subject_id, name) DO NOTHING;
  SELECT id INTO v_unit_id FROM syllabus_units WHERE subject_id = v_subj_id AND name = 'Oscillations & Waves';
  INSERT INTO syllabus_chapters (unit_id, name, class_level) VALUES
    (v_unit_id, 'Oscillations', '11'),
    (v_unit_id, 'Waves', '11'),
    (v_unit_id, 'Sound Waves', '11')
  ON CONFLICT (unit_id, name) DO NOTHING;

  INSERT INTO syllabus_units (subject_id, name) VALUES (v_subj_id, 'Thermodynamics') ON CONFLICT (subject_id, name) DO NOTHING;
  SELECT id INTO v_unit_id FROM syllabus_units WHERE subject_id = v_subj_id AND name = 'Thermodynamics';
  INSERT INTO syllabus_chapters (unit_id, name, class_level) VALUES
    (v_unit_id, 'Thermodynamics', '11'),
    (v_unit_id, 'Kinetic Theory of Gases', '11')
  ON CONFLICT (unit_id, name) DO NOTHING;

  INSERT INTO syllabus_units (subject_id, name) VALUES (v_subj_id, 'Electrostatics & Current Electricity') ON CONFLICT (subject_id, name) DO NOTHING;
  SELECT id INTO v_unit_id FROM syllabus_units WHERE subject_id = v_subj_id AND name = 'Electrostatics & Current Electricity';
  INSERT INTO syllabus_chapters (unit_id, name, class_level) VALUES
    (v_unit_id, 'Electric Charges and Fields', '12'),
    (v_unit_id, 'Electrostatic Potential and Capacitance', '12'),
    (v_unit_id, 'Current Electricity', '12')
  ON CONFLICT (unit_id, name) DO NOTHING;

  INSERT INTO syllabus_units (subject_id, name) VALUES (v_subj_id, 'Magnetism & Electromagnetic Induction') ON CONFLICT (subject_id, name) DO NOTHING;
  SELECT id INTO v_unit_id FROM syllabus_units WHERE subject_id = v_subj_id AND name = 'Magnetism & Electromagnetic Induction';
  INSERT INTO syllabus_chapters (unit_id, name, class_level) VALUES
    (v_unit_id, 'Moving Charges and Magnetism', '12'),
    (v_unit_id, 'Magnetism and Matter', '12'),
    (v_unit_id, 'Electromagnetic Induction', '12'),
    (v_unit_id, 'Alternating Current', '12')
  ON CONFLICT (unit_id, name) DO NOTHING;

  INSERT INTO syllabus_units (subject_id, name) VALUES (v_subj_id, 'Optics') ON CONFLICT (subject_id, name) DO NOTHING;
  SELECT id INTO v_unit_id FROM syllabus_units WHERE subject_id = v_subj_id AND name = 'Optics';
  INSERT INTO syllabus_chapters (unit_id, name, class_level) VALUES
    (v_unit_id, 'Ray Optics', '12'),
    (v_unit_id, 'Wave Optics', '12')
  ON CONFLICT (unit_id, name) DO NOTHING;

  INSERT INTO syllabus_units (subject_id, name) VALUES (v_subj_id, 'Modern Physics') ON CONFLICT (subject_id, name) DO NOTHING;
  SELECT id INTO v_unit_id FROM syllabus_units WHERE subject_id = v_subj_id AND name = 'Modern Physics';
  INSERT INTO syllabus_chapters (unit_id, name, class_level) VALUES
    (v_unit_id, 'Dual Nature of Matter', '12'),
    (v_unit_id, 'Atoms and Nuclei', '12'),
    (v_unit_id, 'Semiconductor Electronics', '12'),
    (v_unit_id, 'Communication Systems', '12')
  ON CONFLICT (unit_id, name) DO NOTHING;

  -- SUBJECT: Chemistry (NEET)
  INSERT INTO syllabus_subjects (exam_id, name) VALUES (v_exam_id, 'Chemistry') ON CONFLICT (exam_id, name) DO NOTHING;
  SELECT id INTO v_subj_id FROM syllabus_subjects WHERE exam_id = v_exam_id AND name = 'Chemistry';

  INSERT INTO syllabus_units (subject_id, name) VALUES (v_subj_id, 'Physical Chemistry') ON CONFLICT (subject_id, name) DO NOTHING;
  SELECT id INTO v_unit_id FROM syllabus_units WHERE subject_id = v_subj_id AND name = 'Physical Chemistry';
  INSERT INTO syllabus_chapters (unit_id, name, class_level) VALUES
    (v_unit_id, 'Some Basic Concepts of Chemistry', '11'),
    (v_unit_id, 'Atomic Structure', '11'),
    (v_unit_id, 'States of Matter', '11'),
    (v_unit_id, 'Thermodynamics', '11'),
    (v_unit_id, 'Equilibrium', '11'),
    (v_unit_id, 'Redox Reactions', '11'),
    (v_unit_id, 'Solid State', '12'),
    (v_unit_id, 'Solutions', '12'),
    (v_unit_id, 'Electrochemistry', '12'),
    (v_unit_id, 'Chemical Kinetics', '12'),
    (v_unit_id, 'Surface Chemistry', '12')
  ON CONFLICT (unit_id, name) DO NOTHING;

  INSERT INTO syllabus_units (subject_id, name) VALUES (v_subj_id, 'Inorganic Chemistry') ON CONFLICT (subject_id, name) DO NOTHING;
  SELECT id INTO v_unit_id FROM syllabus_units WHERE subject_id = v_subj_id AND name = 'Inorganic Chemistry';
  INSERT INTO syllabus_chapters (unit_id, name, class_level) VALUES
    (v_unit_id, 'Periodic Table', '11'),
    (v_unit_id, 'Chemical Bonding', '11'),
    (v_unit_id, 'Hydrogen', '11'),
    (v_unit_id, 's-Block Elements', '11'),
    (v_unit_id, 'p-Block Elements (11)', '11'),
    (v_unit_id, 'd and f Block Elements', '12'),
    (v_unit_id, 'Coordination Compounds', '12'),
    (v_unit_id, 'p-Block Elements (12)', '12'),
    (v_unit_id, 'Metallurgy', '12')
  ON CONFLICT (unit_id, name) DO NOTHING;

  INSERT INTO syllabus_units (subject_id, name) VALUES (v_subj_id, 'Organic Chemistry') ON CONFLICT (subject_id, name) DO NOTHING;
  SELECT id INTO v_unit_id FROM syllabus_units WHERE subject_id = v_subj_id AND name = 'Organic Chemistry';
  INSERT INTO syllabus_chapters (unit_id, name, class_level) VALUES
    (v_unit_id, 'Basic Principles of Organic Chemistry', '11'),
    (v_unit_id, 'Hydrocarbons', '11'),
    (v_unit_id, 'Haloalkanes and Haloarenes', '12'),
    (v_unit_id, 'Alcohols Phenols Ethers', '12'),
    (v_unit_id, 'Aldehydes Ketones Carboxylic Acids', '12'),
    (v_unit_id, 'Amines', '12'),
    (v_unit_id, 'Biomolecules', '12'),
    (v_unit_id, 'Polymers', '12'),
    (v_unit_id, 'Chemistry in Everyday Life', '12')
  ON CONFLICT (unit_id, name) DO NOTHING;

  -- SUBJECT: Botany (NEET)
  INSERT INTO syllabus_subjects (exam_id, name) VALUES (v_exam_id, 'Botany') ON CONFLICT (exam_id, name) DO NOTHING;
  SELECT id INTO v_subj_id FROM syllabus_subjects WHERE exam_id = v_exam_id AND name = 'Botany';

  INSERT INTO syllabus_units (subject_id, name) VALUES (v_subj_id, 'Botany') ON CONFLICT (subject_id, name) DO NOTHING;
  SELECT id INTO v_unit_id FROM syllabus_units WHERE subject_id = v_subj_id AND name = 'Botany';
  INSERT INTO syllabus_chapters (unit_id, name, class_level) VALUES
    (v_unit_id, 'Diversity in Living World', '11'),
    (v_unit_id, 'Structural Organisation in Plants', '11'),
    (v_unit_id, 'Cell Structure and Function', '11'),
    (v_unit_id, 'Plant Physiology', '11'),
    (v_unit_id, 'Reproduction in Plants', '12'),
    (v_unit_id, 'Genetics and Evolution', '12'),
    (v_unit_id, 'Biology and Human Welfare', '12'),
    (v_unit_id, 'Biotechnology', '12'),
    (v_unit_id, 'Ecology', '12')
  ON CONFLICT (unit_id, name) DO NOTHING;

  -- SUBJECT: Zoology (NEET)
  INSERT INTO syllabus_subjects (exam_id, name) VALUES (v_exam_id, 'Zoology') ON CONFLICT (exam_id, name) DO NOTHING;
  SELECT id INTO v_subj_id FROM syllabus_subjects WHERE exam_id = v_exam_id AND name = 'Zoology';

  INSERT INTO syllabus_units (subject_id, name) VALUES (v_subj_id, 'Zoology') ON CONFLICT (subject_id, name) DO NOTHING;
  SELECT id INTO v_unit_id FROM syllabus_units WHERE subject_id = v_subj_id AND name = 'Zoology';
  INSERT INTO syllabus_chapters (unit_id, name, class_level) VALUES
    (v_unit_id, 'Structural Organisation in Animals', '11'),
    (v_unit_id, 'Human Physiology', '11'),
    (v_unit_id, 'Reproduction in Humans', '12'),
    (v_unit_id, 'Genetics', '12'),
    (v_unit_id, 'Human Health and Disease', '12'),
    (v_unit_id, 'Evolution', '12'),
    (v_unit_id, 'Ecology', '12')
  ON CONFLICT (unit_id, name) DO NOTHING;
END $$;
