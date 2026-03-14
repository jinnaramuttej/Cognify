# NOTES-CONVERTER Module Contract

## MODULE NAME
Notes-Converter Module

## MODULE PURPOSE
Converts lecture notes and written content into AI-generated study materials. Transforms documents/text into flashcards, summaries, quizzes, mindmaps, formulas, and key points. Powered by LLM services (Groq, Gemini).

## ROUTES

### Main Routes
- `/notes-converter` — Main notes converter page
- `/notes-converter/upload` — Document upload interface
- `/notes-converter/processing` — Processing status
- `/notes-converter/[generationId]` — View generated materials

### Feature Routes
- `/notes-converter/history` — Conversion history
- `/notes-converter/outputs` — Generated materials gallery

## DATABASE TABLES

**Core Tables (Write):**
- `study_pack_generations` — Conversion tasks & results
- `study_pack_outputs` — Individual output pieces

**Reference Tables (Read):**
- `profiles` — User data
- `uploads` — Stored files

## API ENDPOINTS

- `POST /api/notes-converter/generate` — Start conversion
- `GET /api/notes-converter/[generationId]` — Get results
- `GET /api/notes-converter/history` — User's conversions
- `POST /api/notes-converter/export` — Export as PDF/DOCX
- `DELETE /api/notes-converter/[generationId]` — Delete generation
- `POST /api/notes-converter/feedback` — Rate quality

## UI COMPONENTS

**Container Components:**
- `NotesConverterPage` — Main converter interface
- `UploadInterface` — Document upload UI
- `ProcessingScreen` — Loading/progress view
- `OutputGallery` — Generated materials view
- `HistoryPanel` — Past conversions

**Presentational Components:**
- `FileUploadZone` — Drag-and-drop upload
- `ProcessingProgress` — Progress bar with status
- `OutputTab` — Individual output viewer (flashcards, summary, etc.)
- `ExportButton` — Download options
- `GenerationCard` — Conversion result card
- `OutputPreview` — Preview of generated content

## DEPENDENCIES

**Shared Services:**
- `@/lib/supabase` — Data storage
- `@/contexts/AuthContext` — User session
- `@/lib/utils` — Utilities
- AI services (via shared API)

**Shared UI:**
- `@/components/ui/*` — UI components
- `@/lib/theme-store` — Theme

**External Libraries:**
- `zustand` — State management
- `framer-motion` — Animations
- `lucide-react` — Icons
- `react-dropzone` — File upload
- `pptx-gen` — PowerPoint generation
- `jspdf` — PDF generation

## ALLOWED IMPORTS

```typescript
// Shared services
@/lib/supabase
@/contexts/AuthContext
@/lib/utils
@/lib/app-store
@/lib/theme-store

// Shared UI
@/components/ui
@/components/cognify

// Own module
src/modules/notes-converter/*
src/app/notes-converter/*

// External
zustand
framer-motion
lucide-react
react-dropzone
pptx-gen
jspdf
next
```

## FORBIDDEN IMPORTS

```typescript
// ❌ Cannot import from other feature modules
@/modules/tests/*
@/modules/library/*
@/modules/teacher/*
@/modules/cogni/*
@/modules/analytics/*

// ❌ Cannot modify question or test data
@/lib/test-service
@/lib/teacher-service

// ❌ Cannot access other module stores
@/lib/analytics-store
```

## VALIDATION RULES

- ✅ Input text: 30-50k characters
- ✅ File uploads: PDF, DOCX, TXT (max 10MB)
- ✅ Required API key: GROQ_API_KEY or GEMINI_API_KEY
- ✅ Rate limit: 20 generations per hour per user
- ✅ Outputs stored in study_pack_generations table
- ✅ Processing status: processing → completed/failed
- ❌ Cannot modify input after generation started
- ❌ Cannot generate for other users

## NOTES

- Async processing: submit job → poll status
- Outputs include: summary, flashcards, quiz, mindmap, formulas, keypoints
- Each output as JSON for easy parsing/rendering
- Results cached for 30 days
- Users can regenerate with different prompt
- Privacy: only user's own generations visible
- Export available in: PDF, PowerPoint, JSON
