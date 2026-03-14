# TEACHER Module Contract

## MODULE NAME
Teacher Module

## MODULE PURPOSE
Comprehensive teacher panel for managing student batches, assigning tests, ingesting question PDFs, tracking student progress, and creating custom tests. Enables educators to administer learning and monitor performance.

## ROUTES

### Main Routes
- `/teacher` — Teacher dashboard
- `/teacher/tests` — Test management
- `/teacher/students` — Student management
- `/teacher/batches` — Batch management
- `/teacher/analytics` — Class analytics

### Feature Routes
- `/teacher/question-upload` — PDF upload interface
- `/teacher/test-create` — Test creation
- `/teacher/[batchId]/students` — Batch students
- `/teacher/[studentId]/progress` — Student progress

## DATABASE TABLES

**Core Tables (Read/Write):**
- `batches` — Class/section definitions (teachers create)
- `batch_students` — Batch membership
- `batch_tests` — Tests assigned to batches
- `uploads` — PDF uploads for OCR processing

**Reference Tables (Read-Only):**
- `profiles` — Student/teacher data
- `tests` — Test attempts
- `test_attempt_questions` — Student responses

## API ENDPOINTS

- `POST /api/teacher/batches` — Create batch
- `GET /api/teacher/batches` — List batches
- `POST /api/teacher/[batchId]/add-students` — Add students to batch
- `POST /api/teacher/questions/ingest` — Upload PDF for OCR
- `GET /api/teacher/uploads` — List uploads
- `POST /api/teacher/tests/create` — Create custom test
- `POST /api/teacher/tests/assign` — Assign test to batch
- `GET /api/teacher/[batchId]/analytics` — Batch performance
- `GET /api/teacher/[studentId]/progress` — Student progress detail
- `POST /api/teacher/tests/[testId]/review` — Review/comment on test

## UI COMPONENTS

**Container Components:**
- `TeacherDashboard` — Main teacher view
- `BatchManagement` — Batch creation & management
- `StudentList` — Student roster
- `QuestionUploadInterface` — PDF upload UI
- `TestCreator` — Custom test builder
- `ProgressAnalytics` — Student progress dashboard

**Presentational Components:**
- `BatchCard` — Batch summary card
- `StudentRow` — Student entry in table
- `ProgressChart` — Student performance chart
- `QuestionImportPreview` — Imported questions preview
- `TestAssignmentForm` — Deadline & settings form
- `AnalyticsPanel` — Performance metrics display

## DEPENDENCIES

**Shared Services:**
- `@/lib/supabase` — Database
- `@/contexts/AuthContext` — User session + role verification
- `@/lib/utils` — Utilities
- OCR/Vision API (via shared services)

**Shared UI:**
- `@/components/ui/*` — UI components
- `@/lib/theme-store` — Theme

**External Libraries:**
- `zustand` — State management
- `framer-motion` — Animations
- `lucide-react` — Icons
- `recharts` — Charts
- `xlsx` — Excel export

## ALLOWED IMPORTS

```typescript
// Shared services
@/lib/supabase
@/lib/teacher-service
@/contexts/AuthContext
@/lib/utils
@/lib/app-store
@/lib/theme-store

// Shared UI
@/components/ui
@/components/cognify

// Own module
src/modules/teacher/*
src/app/teacher/*

// External
zustand
framer-motion
lucide-react
recharts
xlsx
next
```

## FORBIDDEN IMPORTS

```typescript
// ❌ Cannot import from other feature modules
@/modules/tests/*
@/modules/library/*
@/modules/cogni/*
@/modules/analytics/*
@/modules/notes-converter/*

// ❌ Cannot modify test engine internals
@/app/tests/components/*
@/lib/test-service (write operations)

// ❌ Cannot access student-only features
@/lib/dashboard-store
```

## VALIDATION RULES

- ✅ Only users with role='teacher' or role='admin' can access
- ✅ Teachers can only manage their own batches
- ✅ All tests assigned must have valid duration
- ✅ PDF uploads must be < 10MB
- ✅ Question imports stored in questions table
- ✅ Rate limit: 10 uploads per hour
- ❌ Cannot modify existing questions (OCR creates new)
- ❌ Cannot delete student records

## NOTES

- Teachers are role-locked: role='teacher' or role='admin'
- Students assigned via batch membership, not direct API
- OCR processing is async (processes PDF in background)
- Question imports go to questions table via validation pipeline
- Batch privacy: teachers can only see their batches
- Analytics computed from test_attempt_questions
