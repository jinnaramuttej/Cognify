# LIBRARY Module Contract

## MODULE NAME
Library Module

## MODULE PURPOSE
Provides searchable question library, study resources, difficulty filtering, and recommendations. Enables students to discover and practice specific topics with AI-powered intelligence recommendations.

## ROUTES

### Main Routes
- `/library` — Main library page with search
- `/library/search` — Advanced search interface
- `/library/[subjectId]/chapters` — Chapters for subject
- `/library/[subjectId]/[chapterId]/topics` — Topics in chapter

### Feature Routes
- `/library/weak-topics` — AI-recommended weak areas
- `/library/trending` — Trending questions
- `/library/my-attempts` — Past question attempts
- `/library/recommendations` — Personalized recommendations

## DATABASE TABLES

**Core Tables (Read):**
- `subjects` — Subject definitions
- `chapters` — Chapter definitions
- `topics` — Topic definitions
- `questions` — Full question bank

**Reference Tables (Read):**
- `profiles` — User data
- `test_attempt_questions` — Answer history for recommendations

**New Tables (Read/Write):**
- `library_weak_topics` — Track weak areas per user
- `library_search_history` — User search history

## API ENDPOINTS

- `GET /api/library/search` — Search questions
- `GET /api/library/subjects` — Get all subjects
- `GET /api/library/[subjectId]/chapters` — Get chapters
- `GET /api/library/[chapterId]/topics` — Get topics
- `GET /api/library/[topicId]/questions` — Get topic questions
- `GET /api/library/weak-topics` — Get weak areas
- `GET /api/library/recommendations` — Get recommendations
- `POST /api/library/track-view` — Track question view
- `POST /api/library/flag-question` — Report question issue

## UI COMPONENTS

**Container Components:**
- `LibraryPage` — Main library view
- `SearchInterface` — Search & filter UI
- `WeakTopicsPanel` — Weak areas dashboard
- `RecommendationsPanel` — Recommendations view

**Presentational Components:**
- `QuestionCard` — Question preview card
- `FilterPanel` — Filter options (subject, difficulty, etc.)
- `SearchBar` — Search input with suggestions
- `TopicGrid` — Topic selection grid
- `IntelligenceDashboard` — Weak/strong indicators

## DEPENDENCIES

**Shared Services:**
- `@/lib/supabase` — Database queries
- `@/contexts/AuthContext` — User session
- `@/lib/utils` — Utilities

**Shared UI:**
- `@/components/ui/*` — UI primitives
- `@/lib/theme-store` — Theme management

**External Libraries:**
- `zustand` — State management
- `framer-motion` — Animations
- `lucide-react` — Icons

## ALLOWED IMPORTS

```typescript
// Shared services
@/lib/supabase
@/lib/library-service
@/contexts/AuthContext
@/lib/utils
@/lib/theme-store
@/lib/app-store

// Shared UI
@/components/ui
@/components/cognify

// Own module
src/modules/library/*
src/app/library/*

// External
zustand
framer-motion
lucide-react
next
```

## FORBIDDEN IMPORTS

```typescript
// ❌ Cannot import from other modules
@/modules/tests/*
@/modules/teacher/*
@/modules/cogni/*
@/modules/analytics/*
@/modules/notes-converter/*

// ❌ Cannot import test-specific logic
@/app/tests/*
@/app/teacher/*

// ❌ Cannot access test or teacher stores
@/lib/test-service
@/lib/teacher-service
```

## VALIDATION RULES

- ✅ Search must be read-only on questions
- ✅ No modification of question content
- ✅ Track views through dedicated API
- ✅ Weak topics computed from test attempts, not library views
- ✅ Recommendations use shared analytics data
- ❌ Cannot write to questions table directly

## NOTES

- Integrates with test module for attempt history (read-only)
- Performance recommendations computed server-side
- Search results cached for 1 hour
- Library data is reference-only — no modifications
