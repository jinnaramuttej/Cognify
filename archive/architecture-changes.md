# Architecture Changes Summary

## Overview

This document provides a technical overview of the architecture changes made to the Cognify platform during the March 2026 upgrade.

---

## 1. Database Architecture

### Schema Changes

#### New Table: `study_pack_generations`
```sql
CREATE TABLE public.study_pack_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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
  status text CHECK (status IN ('processing', 'completed', 'failed')),
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Purpose:** Store AI-generated study materials from notes/lecture uploads.

**Indexes:**
- `idx_study_packs_user` on `(user_id, created_at DESC)` for fast user queries

**RLS Policies:**
- Users can only view/create/update/delete their own study packs
- Full CRUD policies implemented

#### Updated Table: `profiles`
```sql
ALTER TABLE public.profiles 
ADD COLUMN role text 
CHECK (role IN ('student', 'teacher', 'admin')) 
DEFAULT 'student';
```

**Purpose:** Enable role-based access control

**Migration Logic:**
```sql
UPDATE profiles SET role = 'admin' WHERE is_admin = true;
-- Others default to 'student'
```

---

## 2. Application Architecture

### Layered Architecture

```
┌─────────────────────────────────────────────────┐
│                 Presentation Layer               │
│   (Next.js Pages, React Components, UI)          │
├─────────────────────────────────────────────────┤
│              Business Logic Layer                │
│    (Role Checking, Validation, Services)         │
├─────────────────────────────────────────────────┤
│                  API Layer                       │
│   (Next.js Route Handlers, Middleware)           │
├─────────────────────────────────────────────────┤
│                 Data Access Layer                │
│        (Supabase Client, RLS Policies)           │
├─────────────────────────────────────────────────┤
│                 Database Layer                   │
│       (PostgreSQL, Row Level Security)           │
└─────────────────────────────────────────────────┘
```

### Role-Based Access Control (RBAC)

#### Architecture Pattern

```
User Request → AuthContext → Role Check → Route Access Decision
                    ↓                           ↓
              User Profile                   Allow/Redirect
                (role field)
```

#### Implementation Files

1. **Utility Layer** (`src/lib/role-utils.ts`)
   - `hasRouteAccess()` - Check if user can access route
   - `getRedirectForRole()` - Get proper redirect URL
   - `getNavItemsForRole()` - Filter navigation items
   - `isTeacherOrAdmin()`, `isAdmin()`, `isStudent()` - Role checkers

2. **Component Layer** (`src/components/RoleProtectedRoute.tsx`)
   - Wrapper component for protected pages
   - Automatic redirect on unauthorized access
   - Loading state management

3. **Navigation Layer**
   - `Navbar.tsx` - Dynamic rendering based on role
   - `Sidebar.tsx` - Role-based menu filtering

#### Route Access Matrix

| Route | Student | Teacher | Admin |
|-------|---------|---------|-------|
| `/dashboard` | ✅ | ❌ | ✅ |
| `/tests` | ✅ | ✅ | ✅ |
| `/library` | ✅ | ✅ | ✅ |
| `/cogni` | ✅ | ❌ | ✅ |
| `/notes-converter` | ✅ | ❌ | ✅ |
| `/arena` | ✅ | ❌ | ✅ |
| `/leaderboard` | ✅ | ❌ | ✅ |
| `/teacher` | ❌ | ✅ | ✅ |
| `/admin` | ❌ | ❌ | ✅ |

---

## 3. API Architecture

### Endpoint Structure

```
/api/
├── notes-converter/
│   └── generate/          # POST: Generate study pack
│       └── route.ts       # GET: Get history
├── teacher/
│   └── questions/
│       └── ingest/        # POST: Upload question PDF
│           └── route.ts   # GET: Upload history
└── system/
    └── config-status/     # GET: Environment config check
        └── route.ts
```

### Security Middleware

**Rate Limiting Middleware** (`src/middleware/rate-limit.ts`)

```typescript
interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

RATE_LIMITS = {
  AI_GENERATION: { maxRequests: 20, windowMs: 3600000 },
  QUESTION_UPLOAD: { maxRequests: 10, windowMs: 3600000 },
  FILE_UPLOAD: { maxRequests: 30, windowMs: 3600000 },
}
```

**Implementation:**
- In-memory store (Map)
- Sliding window algorithm
- Automatic cleanup every 5 minutes

### API Request Flow

```
Client Request
    ↓
Auth Check (Supabase Session)
    ↓
Role Verification (profiles.role)
    ↓
Rate Limit Check
    ↓
Input Validation
    ↓
Business Logic
    ↓
Database Operation
    ↓
Response
```

---

## 4. Component Architecture

### Navigation Components

#### Navbar (Updated)
```
Navbar
├── Logo
├── Home Link
├── Dashboard Link (Student/Admin only)
├── Teacher Panel Link (Teacher/Admin only)
├── Streak Display (Student only)
├── Theme Toggle
└── Profile Dropdown
    ├── Profile Link
    ├── Settings Link
    └── Logout
```

**Role-Based Rendering Logic:**
```typescript
const userRole = user?.role || 'student';
const showDashboard = isAuthenticated && (userRole === 'student' || userRole === 'admin');
const showTeacherPanel = isAuthenticated && (userRole === 'teacher' || userRole === 'admin');
```

#### Sidebar (Enhanced)
```
Sidebar
├── Student Items (if role === 'student')
│   ├── Dashboard
│   ├── Tests
│   ├── Library
│   ├── Cogni AI
│   ├── Notes Converter
│   ├── Arena
│   └── Leaderboard
├── Teacher Items (if role === 'teacher')
│   ├── Teacher Panel
│   ├── Tests
│   └── Library
└── Admin Items (if role === 'admin')
    ├── All Student Items
    ├── Teacher Panel
    └── Admin Panel
```

### Page Components

#### System Configuration Page (`/admin/config`)

**Architecture:**
```
ConfigPage
├── Environment Status Cards
│   ├── GROQ_API_KEY
│   ├── GEMINI_API_KEY
│   ├── SUPABASE_URL
│   └── SUPABASE_ANON_KEY
├── Database Migration Instructions
└── Feature Availability Matrix
```

**Data Flow:**
```
Component Mount
    ↓
Fetch /api/system/config-status
    ↓
Check Environment Variables (server-side)
    ↓
Return Status (without exposing keys)
    ↓
Render UI with status indicators
```

---

## 5. State Management

### Authentication State (AuthContext)

```typescript
interface User {
  id: string;
  email: string;
  role?: 'student' | 'teacher' | 'admin';
  full_name?: string;
  avatar_url?: string;
  isAdmin?: boolean;
  // ... other fields
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
}
```

**Storage:** LocalStorage + Supabase Session

### Role State Flow

```
User Logs In
    ↓
Fetch Profile from Database
    ↓
Extract role field
    ↓
Store in AuthContext
    ↓
Components Read role from Context
    ↓
Render Appropriate UI
```

---

## 6. File Upload Architecture

### Question Ingestion Flow

```
Teacher Uploads PDF
    ↓
POST /api/teacher/questions/ingest
    ↓
Validate:
  - File Type (PDF/Image)
  - File Size (<10MB)
  - User Role (teacher/admin)
    ↓
Store Metadata in uploads table
    ↓
(Future) Trigger OCR Pipeline
    ↓
Return Upload ID
```

### File Validation Rules

```typescript
FILE_SIZE_LIMITS = {
  PDF: 10 * 1024 * 1024,    // 10MB
  DOCX: 5 * 1024 * 1024,     // 5MB
  IMAGE: 5 * 1024 * 1024,    // 5MB
  TEXT: 1 * 1024 * 1024,     // 1MB
}

TEXT_LIMITS = {
  MAX_NOTES_LENGTH: 50000,   // 50k chars
  MIN_NOTES_LENGTH: 30,      // 30 chars
}
```

---

## 7. Security Architecture

### Defense in Depth

```
┌─────────────────────────────────────┐
│    Client-Side Validation           │  ← File size, type checks
├─────────────────────────────────────┤
│    Authentication Layer              │  ← Supabase Auth
├─────────────────────────────────────┤
│    Role Authorization                │  ← profiles.role check
├─────────────────────────────────────┤
│    Rate Limiting                     │  ← Request throttling
├─────────────────────────────────────┤
│    Input Validation                  │  ← Schema validation
├─────────────────────────────────────┤
│    Row Level Security                │  ← Database policies
└─────────────────────────────────────┘
```

### RLS Policy Examples

**Study Packs:**
```sql
CREATE POLICY "Users can view their own study packs"
ON study_pack_generations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own study packs"
ON study_pack_generations FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

**Teacher Resources:**
```sql
CREATE POLICY "Teachers can upload questions"
ON uploads FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('teacher', 'admin')
  )
);
```

---

## 8. Performance Considerations

### Database Optimization

1. **Indexes Created:**
   - `idx_study_packs_user` - Fast user study pack queries
   - Composite index for sorting by creation date

2. **Query Optimization:**
   - Limit results to 20 by default
   - Use pagination for large datasets
   - Select only needed columns

3. **Caching Strategy:**
   - Rate limit store in-memory (fast access)
   - Consider Redis for production rate limiting

### API Performance

1. **Rate Limiting Benefits:**
   - Prevents API abuse
   - Reduces server load
   - Protects AI service quotas

2. **File Upload Optimization:**
   - Size validation before upload
   - Chunking for large files (future)
   - Background processing (future)

---

## 9. Scalability Considerations

### Current Architecture Limits

1. **In-Memory Rate Limiting:**
   - Resets on server restart
   - Not distributed (single server only)
   - **Solution:** Migrate to Redis/Upstash for production

2. **Study Pack Processing:**
   - Currently synchronous
   - **Solution:** Implement job queue (Bull, Inngest)

3. **File Storage:**
   - Metadata only (no file storage yet)
   - **Solution:** Integrate Supabase Storage

### Recommended Scaling Path

```
Phase 1 (Current) - Monolith
  ├── Next.js App Router
  ├── In-memory rate limiting
  └── Synchronous processing

Phase 2 (Production) - Enhanced
  ├── Next.js + Redis
  ├── Background job queue
  └── CDN for static assets

Phase 3 (Scale) - Distributed
  ├── Microservices
  ├── Message queue (RabbitMQ)
  └── Horizontal scaling
```

---

## 10. Code Organization

### Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (routes)/          # Page routes
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui primitives
│   ├── cognify/          # Core app components
│   └── [feature]/        # Feature-specific
├── lib/                   # Business logic
│   ├── role-utils.ts     # Role checking
│   ├── supabase.ts       # DB client
│   └── [feature]-service.ts
├── middleware/            # API middleware
│   └── rate-limit.ts     # Rate limiting
├── contexts/              # React Context
│   └── AuthContext.tsx   # Auth state
└── hooks/                 # Custom hooks
```

### Design Patterns Used

1. **Separation of Concerns:**
   - UI components separate from business logic
   - API routes separate from data access

2. **Single Responsibility:**
   - Each utility file has one purpose
   - Components focused on presentation

3. **Dependency Injection:**
   - Supabase client passed to services
   - Config passed to rate limiter

4. **Factory Pattern:**
   - Role-based navigation item generation
   - Dynamic component rendering

---

## 11. Testing Strategy (Recommended)

### Unit Tests
- `role-utils.ts` functions
- Rate limiting logic
- Validation functions

### Integration Tests
- API routes with auth
- Database operations
- File uploads

### E2E Tests
- User flows per role
- Navigation access
- Form submissions

### Test Coverage Goals
- 80%+ for business logic
- 100% for security functions
- 90%+ for API routes

---

## Conclusion

This architecture provides a solid foundation for:
- Secure, role-based access control
- Scalable API design with rate limiting
- Extensible study pack storage
- Clean separation of concerns
- Future-proof component structure

All implementations follow Next.js 14+ best practices and Cognify's established architectural patterns.
