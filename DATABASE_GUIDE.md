# Cognify Database Guide

> **⚠️ AI RULE**: The single source of truth for the database is `db/schema.sql` (1046 lines).
> Never invent tables. Never query tables that do not exist in this file.

---

## 1 — Database Overview

| Property | Value |
|----------|-------|
| **Provider** | Supabase (hosted PostgreSQL) |
| **Schema file** | `db/schema.sql` |
| **Total tables** | 22 |
| **Extensions** | `uuid-ossp`, `pgcrypto` |
| **Row Level Security** | Enabled on ALL tables |
| **Auth** | Supabase Auth (`auth.users`) |

---

## 2 — Table Reference

### Core Tables (6)

#### `profiles`
- **Purpose**: User profiles, XP, streaks, preferences
- **PK**: `id` (uuid → `auth.users`)
- **Key fields**: `full_name`, `email`, `class`, `stream`, `courses` (text[]), `bio`, `avatar_url`, `preferences` (jsonb), `is_admin`, `target_exam`, `study_hours_goal`, `streak`, `longest_streak`, `total_xp`, `last_study_date`

#### `study_sessions`
- **Purpose**: Study session tracking
- **PK**: `id` (uuid)
- **Key fields**: `user_id` (→ auth.users), `start_time`, `end_time`, `duration_seconds`

#### `streaks`
- **Purpose**: Daily study streaks (auto-created on user signup via trigger)
- **PK**: `user_id` (uuid → `auth.users`)
- **Key fields**: `current_streak`, `longest_streak`, `last_study_date`, `updated_at`

#### `notes`
- **Purpose**: User notes
- **PK**: `id` (uuid)
- **Key fields**: `owner` (→ auth.users), `title`, `class`, `subject`, `stream`, `type`, `status`, `content`, `attachments` (jsonb)

#### `leaderboard`
- **Purpose**: Global rankings
- **PK**: `id` (uuid)
- **Key fields**: `user_id` (→ auth.users), `rank`, `score`

#### `uploads`
- **Purpose**: File uploads metadata
- **PK**: `id` (uuid)
- **Key fields**: `owner` (→ auth.users), `bucket`, `path`, `public_url`, `metadata` (jsonb)

---

### Tests Module Tables (7)

#### `exams`
- **Purpose**: Competitive exam definitions (JEE Main, NEET, JEE Advanced, BITSAT)
- **PK**: `id` (uuid)
- **Key fields**: `name` (unique), `total_marks`, `negative_marking`, `duration_minutes`, `description`

#### `subjects`
- **Purpose**: Subjects per exam (Physics, Chemistry, Mathematics, Botany, Zoology)
- **PK**: `id` (uuid)
- **Key fields**: `exam_id` (→ exams), `name`, `grade`
- **Unique**: `(name, grade, exam_id)`

#### `chapters`
- **Purpose**: Chapters per subject
- **PK**: `id` (uuid)
- **Key fields**: `subject_id` (→ subjects), `name`
- **Unique**: `(subject_id, name)`

#### `topics`
- **Purpose**: Topics per chapter
- **PK**: `id` (uuid)
- **Key fields**: `chapter_id` (→ chapters), `name`
- **Unique**: `(chapter_id, name)`

#### `questions`
- **Purpose**: Question bank for tests
- **PK**: `id` (uuid)
- **Key fields**: `topic_id` (→ topics), `exam_id` (→ exams), `question_text`, `options` (jsonb), `correct_option`, `question_type`, `difficulty`, `explanation`, `is_pyq`, `year`, `shift`, `marks`, `negative_marks`
- **Constraints**:
  - `question_type` IN (`'single_correct'`, `'multi_correct'`, `'integer'`, `'numerical'`)
  - `difficulty` IN (`'Easy'`, `'Medium'`, `'Hard'`)

#### `tests`
- **Purpose**: Test sessions (practice or teacher-assigned)
- **PK**: `id` (uuid)
- **Key fields**: `user_id` (→ auth.users), `created_by` (→ auth.users), `title`, `type`, `config` (jsonb), `status`, `score`, `total_questions`, `time_spent_seconds`, `duration_minutes`, `due_date`, `is_active`
- **Constraints**:
  - `type` IN (`'practice'`, `'assigned'`)
  - `status` IN (`'in_progress'`, `'completed'`)

#### `test_attempt_questions`
- **Purpose**: Individual question attempts within a test
- **PK**: `id` (uuid)
- **Key fields**: `test_id` (→ tests), `question_id` (→ questions), `user_answer`, `is_correct`, `is_marked_for_review`, `time_spent_seconds`, `order_index`
- **Unique**: `(test_id, question_id)`

---

### Social / Competitive Tables (4)

#### `squads`
- **Purpose**: Study groups
- **PK**: `id` (uuid)
- **Key fields**: `name`, `description`, `created_by` (→ auth.users), `invite_code` (unique), `avatar_url`

#### `squad_members`
- **Purpose**: Squad membership (join table)
- **PK**: `(squad_id, user_id)` (composite)
- **Key fields**: `role` (CHECK: `'admin'` or `'member'`), `joined_at`

#### `challenges`
- **Purpose**: Weekly, daily, and squad challenges
- **PK**: `id` (uuid)
- **Key fields**: `title`, `type`, `squad_id` (→ squads, null if global), `start_date`, `end_date`, `config` (jsonb)
- **Constraints**: `type` IN (`'weekly_global'`, `'squad_custom'`, `'daily'`)

#### `challenge_participants`
- **Purpose**: Challenge participation and scores
- **PK**: `id` (uuid)
- **Key fields**: `challenge_id` (→ challenges), `user_id` (→ auth.users), `highest_score`, `tests_completed`, `percentile`
- **Unique**: `(challenge_id, user_id)`

---

### Syllabus / Library Tables (5)

#### `syllabus_exams`
- **Purpose**: Exam catalog for syllabus browsing
- **PK**: `id` (uuid)
- **Key fields**: `name` (unique), `category` (CHECK: `'Engineering'` or `'Medical'`), `pattern_type`, `total_marks`, `duration_minutes`, `negative_marking`

#### `syllabus_subjects`
- **Purpose**: Subjects per exam in syllabus
- **PK**: `id` (uuid)
- **Key fields**: `exam_id` (→ syllabus_exams), `name`
- **Unique**: `(exam_id, name)`

#### `syllabus_units`
- **Purpose**: Units per subject
- **PK**: `id` (uuid)
- **Key fields**: `subject_id` (→ syllabus_subjects), `name`
- **Unique**: `(subject_id, name)`

#### `syllabus_chapters`
- **Purpose**: Chapters per unit (with class level and weightage)
- **PK**: `id` (uuid)
- **Key fields**: `unit_id` (→ syllabus_units), `name`, `class_level`, `weightage`
- **Constraints**: `class_level` IN (`'11'`, `'12'`, `'Both'`)
- **Unique**: `(unit_id, name)`

#### `syllabus_concepts`
- **Purpose**: Concepts per chapter (with difficulty)
- **PK**: `id` (uuid)
- **Key fields**: `chapter_id` (→ syllabus_chapters), `name`, `difficulty_level`
- **Constraints**: `difficulty_level` BETWEEN 1 AND 5

---

## 3 — Relationship Diagram

```
auth.users
  ├── profiles (1:1, auto-created via trigger)
  ├── study_sessions (1:N)
  ├── streaks (1:1, auto-created via trigger)
  ├── notes (1:N)
  ├── tests (1:N via user_id)
  ├── tests (1:N via created_by — teacher)
  ├── squad_members (M:N via join)
  └── challenge_participants (M:N via join)

exams (1:N) → subjects (1:N) → chapters (1:N) → topics (1:N) → questions
                                                                    ↓
tests (1:N) → test_attempt_questions ← questions

squads (1:N) → squad_members ← auth.users
squads (1:N) → challenges (1:N) → challenge_participants ← auth.users

syllabus_exams (1:N) → syllabus_subjects (1:N) → syllabus_units (1:N)
    → syllabus_chapters (1:N) → syllabus_concepts
```

---

## 4 — Test Engine Data Flow

```
1. Student selects exam, subject, chapter, difficulty, question count
       ↓
2. POST /api/tests/create → creates row in `tests` table
       ↓
3. POST /api/tests/generate → queries `questions` table with filters
       ↓
4. Questions returned → `test_attempt_questions` rows created (one per question)
       ↓
5. Student answers questions → `test_attempt_questions.user_answer` updated
       ↓
6. POST /api/tests/track-completion → `tests.status` set to 'completed'
       ↓
7. Results page reads `tests` + `test_attempt_questions` for score display
```

---

## 5 — Question System

| Field | Type | Description |
|-------|------|-------------|
| `question_type` | text | `'single_correct'`, `'multi_correct'`, `'integer'`, `'numerical'` |
| `difficulty` | text | `'Easy'`, `'Medium'`, `'Hard'` |
| `is_pyq` | boolean | True if Previous Year Question |
| `year` | integer | PYQ year (e.g., 2024) |
| `shift` | text | PYQ shift (e.g., 'Shift 1') |
| `marks` | integer | Points for correct answer (default: 4) |
| `negative_marks` | numeric | Points deducted for wrong answer (default: 1) |
| `options` | jsonb | `[{label: "A", text: "..."}, {label: "B", text: "..."}, ...]` |
| `correct_option` | text | Correct answer label (e.g., "A") |
| `explanation` | text | Solution explanation |

---

## 6 — Social System

### Squads
- Study groups with invite codes
- Members have roles: `admin` (creator) or `member`
- Squads can create custom challenges

### Challenges
- **weekly_global**: Available to all users
- **squad_custom**: Restricted to squad members
- **daily**: Daily challenges for all users
- Percentile calculated via `calculate_percentiles_for_challenge()` function

---

## 7 — RLS Overview

| Table Group | Policy |
|-------------|--------|
| **profiles** | Users can only view/update their own profile |
| **study_sessions, streaks, notes** | Users can manage their own records only |
| **exams, subjects, chapters, topics, questions** | Public read access (SELECT) |
| **tests** | Users can manage tests where `user_id` or `created_by` matches |
| **test_attempt_questions** | Access tied to parent test ownership |
| **squads** | Only visible to squad members |
| **squad_members** | Only visible to fellow squad members |
| **challenges** | Global challenges public; squad challenges restricted to members |
| **challenge_participants** | Public read; users can update/insert their own entries |
| **syllabus_*** | All public read access |

---

## 8 — Database Rules for AI

### Absolute Rules

1. **NEVER create new tables** without adding them to `db/schema.sql`
2. **NEVER query tables** that do not exist in `db/schema.sql`
3. **NEVER invent column names** — verify against the schema
4. **NEVER bypass RLS** — all queries must respect row-level security
5. **Use Supabase client** for all database operations — never raw SQL from the app
6. **Check constraints before inserting** — respect CHECK constraints on `question_type`, `difficulty`, `type`, `status`, `role`, `class_level`
7. **Respect unique constraints** — many tables have composite unique keys
8. **Use UUIDs** — all primary keys use `gen_random_uuid()`

### Automation (Do Not Duplicate)

| Function | Trigger | Purpose |
|----------|---------|---------|
| `handle_new_user()` | `on_auth_user_created` (INSERT on auth.users) | Auto-creates `profiles` + `streaks` rows |
| `update_streak()` | Called manually | Manages daily streak increment/reset |
| `calculate_percentiles_for_challenge()` | Called manually | Calculates percentile rankings |

---

*Last updated: 2026-03-08 | Generated from db/schema.sql analysis*
