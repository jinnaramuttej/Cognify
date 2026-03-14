# COGNI Module Contract

## MODULE NAME
Cogni Module

## MODULE PURPOSE
AI tutor interface providing step-by-step explanations, hint systems, and interactive learning guidance powered by LLM services (Groq, Gemini). Assists students with question understanding and problem-solving approaches.

## ROUTES

### Main Routes
- `/cogni` — Cogni landing page
- `/cogni/chat` — Chat interface with AI tutor
- `/cogni/[questionId]` — Tutor session for specific question
- `/cogni/explain` — Explanation interface

### Feature Routes
- `/cogni/history` — Chat history
- `/cogni/settings` — Cogni preferences

## DATABASE TABLES

**Read Tables:**
- `profiles` — User preferences for tutor personality
- `questions` — Question content for context
- `test_attempt_questions` — User's attempt for context

**Write Tables:**
- `cogni_chat_sessions` — Chat history storage
- `cogni_messages` — Individual messages
- `cogni_preferences` — AI personality preferences per user

## API ENDPOINTS

- `POST /api/cogni/chat` — Send message to AI tutor
- `POST /api/cogni/explain` — Request explanation
- `POST /api/cogni/hint` — Get hint for question
- `GET /api/cogni/history` — Get chat history
- `POST /api/cogni/preferences` — Update AI preferences
- `POST /api/cogni/translate` — Translate question/explanation
- `POST /api/cogni/clarify` — Ask clarification questions

## UI COMPONENTS

**Container Components:**
- `CogniPage` — Main Cogni interface
- `ChatInterface` — Chat window
- `ExplanationPanel` — Explanation renderer

**Presentational Components:**
- `MessageBubble` — Chat message display
- `ThinkingIndicator` — AI thinking animation
- `CodeBlock` — Display code in explanations
- `FormulaRenderer` — LaTeX formula display
- `HintButton` — Hint trigger
- `StepByStepGuide` — Multi-step explanation

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
- `ai` — Vercel AI SDK (for streaming)

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
src/modules/cogni/*
src/app/cogni/*

// External
zustand
framer-motion
lucide-react
ai
next
```

## FORBIDDEN IMPORTS

```typescript
// ❌ Cannot import from other feature modules
@/modules/tests/*
@/modules/library/*
@/modules/teacher/*
@/modules/analytics/*
@/modules/notes-converter/*

// ❌ Cannot modify test or learning data
@/lib/test-service
@/lib/teacher-service

// ❌ Cannot access other module stores
@/lib/library-store
```

## VALIDATION RULES

- ✅ All responses must use configured AI service (Groq or Gemini)
- ✅ API keys must exist (GROQ_API_KEY or GEMINI_API_KEY)
- ✅ Chat history stored in cogni_chat_sessions table
- ✅ No modification of question content
- ✅ Responses must respect user's AI personality preference
- ❌ Cannot modify questions or test data

## NOTES

- Uses streaming responses for real-time feedback
- Respects theme for response formatting
- Supports multi-language explanations
- Chat history persisted server-side
- Personality preferences: Socratic, Direct, Cheerleader
