# Cognify Platform Upgrade - Deployment Guide

## 📋 Overview

This document outlines the major architecture and feature upgrades implemented for the Cognify learning platform.

**Date:** March 9, 2026  
**Version:** 2.0.0

---

## 🎯 What Was Implemented

### 1. **Role-Based Access Control (RBAC)**

#### Database Changes
- Added `role` field to `profiles` table with values: `student`, `teacher`, `admin`
- Default role is `student`
- Admins automatically set via `is_admin` boolean

#### Frontend Changes
- Updated `Navbar` component to show different navigation items based on role:
  - **Students**: Dashboard, Tests, Library, Cogni AI, Notes Converter, Arena, Leaderboard
  - **Teachers**: Teacher Panel, Tests, Library
  - **Admins**: All student items + Teacher Panel + Admin panel
- Updated `Sidebar` component with role-based menu filtering
- Created `RoleProtectedRoute` component for route guards
- Created `role-utils.ts` with centralized role checking logic

#### Key Files
- `src/lib/role-utils.ts` - Role checking utilities
- `src/components/RoleProtectedRoute.tsx` - Route protection wrapper
- `src/components/Navbar.tsx` - Updated with role-based rendering
- `src/components/cognify/Sidebar.tsx` - Already had role logic

---

### 2. **Study Pack Generations (Notes Converter Storage)**

#### Database Changes
- Created new table: `study_pack_generations`
- Stores all AI-generated study materials:
  - Summary
  - Flashcards
  - Questions
  - Quiz
  - Mind Map
  - Formula Sheet
  - Key Points
- Includes metadata: processing time, character count, status, timestamps
- Full RLS policies for user privacy

#### API Routes
- `POST /api/notes-converter/generate` - Generate study pack
- `GET /api/notes-converter/history` - Retrieve past conversions

#### Features
- Students can view past conversions
- Automatic storage of all generated content
- Tracks processing time and character count
- Status tracking: `processing`, `completed`, `failed`

---

### 3. **Question Ingestion Pipeline API**

#### API Routes
- `POST /api/teacher/questions/ingest` - Upload PDFs for question extraction
- `GET /api/teacher/questions/ingest` - View upload history

#### Features
- Teachers/admins only
- Accepts PDF and image uploads (max 10MB)
- Stores upload metadata in `uploads` table
- **Note:** AI extraction pipeline uses existing scripts in `scripts/question-ingestion/`
- Ready for OCR + AI parsing integration

#### Supported Formats
- PDF (10MB max)
- PNG, JPG, JPEG (5MB max)

---

### 4. **Security & Rate Limiting**

#### Middleware Created
- `src/middleware/rate-limit.ts`

#### Limits Applied
| Endpoint | Limit |
|----------|-------|
| AI Generation | 20 requests/hour |
| Question Upload | 10 uploads/hour |
| File Upload | 30 files/hour |

#### File Validation
- PDF: 10MB max
- DOCX: 5MB max
- Images: 5MB max
- Text: 50,000 characters max, 30 min

---

### 5. **System Configuration Page**

#### Location
- `/admin/config` - System configuration dashboard

#### Features
- Displays environment variable status (without exposing keys)
- Shows which features are enabled/disabled
- Setup instructions for:
  - GROQ_API_KEY
  - GEMINI_API_KEY
  - SUPABASE_URL
  - SUPABASE_ANON_KEY
- Database migration instructions
- Feature availability matrix

#### API Endpoint
- `GET /api/system/config-status` - Check configuration status

---

### 6. **Navigation Updates**

#### Changes
- **Practice Quizzes** → **Practice Tests** (redirects to `/tests?mode=practice`)
- Created `/practice-tests` route that redirects to tests module
- Arena page completely redesigned with leaderboard, squads, and challenges
- Sidebar navigation already had role filtering (enhanced)

#### Removed/Updated
- Arena page updated with competitive features
- Practice quizzes page now redirects to tests

---

### 7. **Enhanced Arena Page**

#### Features
- Global leaderboard display
- Study streak counter
- Squad management
- Weekly challenges (UI ready)
- Stats cards (rank, streak, challenges)
- Coming soon section (1v1 battles, tournaments, badges)

---

## 🚀 Deployment Instructions

### Step 1: Database Migration

Run the migration file in your Supabase SQL Editor:

```sql
-- File: db/migrations/001_add_role_and_study_packs.sql
```

Or update the main schema:
```sql
-- File: db/schema.sql (already updated)
```

**Key Changes:**
1. Adds `role` column to `profiles` table
2. Creates `study_pack_generations` table
3. Adds RLS policies
4. Creates indexes

### Step 2: Environment Variables

Add these to your `.env.local` file:

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Services (at least one required)
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key

# Optional (for production)
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Step 3: Update Existing User Roles

Run this SQL in Supabase to set roles for existing users:

```sql
-- Set admins
UPDATE profiles SET role = 'admin' WHERE is_admin = true;

-- Set teachers (update based on your criteria)
-- UPDATE profiles SET role = 'teacher' WHERE email LIKE '%@teacher.example.com';

-- All others default to 'student'
UPDATE profiles SET role = 'student' WHERE role IS NULL;
```

### Step 4: Verify Installation

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Visit `/admin/config` to check configuration status

3. Test role-based access:
   - Login as student → should see Dashboard, Tests, Library, etc.
   - Login as teacher → should see Teacher Panel, Tests, Library only
   - Try accessing `/dashboard` as teacher → should redirect to `/teacher`

### Step 5: Deploy to Production

1. Push code to your repository
2. Ensure environment variables are set in production
3. Verify database migrations ran successfully
4. Test authentication and role-based routing

---

## 📁 File Structure Changes

### New Files Created

```
src/
├── lib/
│   └── role-utils.ts ✨ NEW
├── middleware/
│   └── rate-limit.ts ✨ NEW
├── components/
│   └── RoleProtectedRoute.tsx ✨ NEW
├── app/
│   ├── admin/
│   │   └── config/
│   │       └── page.tsx ✨ NEW
│   ├── practice-tests/
│   │   └── page.tsx ✨ NEW
│   └── api/
│       ├── notes-converter/
│       │   └── generate/
│       │       └── route.ts ✨ NEW
│       ├── teacher/
│       │   └── questions/
│       │       └── ingest/
│       │           └── route.ts ✨ NEW
│       └── system/
│           └── config-status/
│               └── route.ts ✨ NEW
db/
└── migrations/
    └── 001_add_role_and_study_packs.sql ✨ NEW
```

### Modified Files

```
src/
├── components/
│   ├── Navbar.tsx ✏️ UPDATED (role-based rendering)
│   └── cognify/
│       └── Sidebar.tsx ✏️ UPDATED (enhanced role filtering)
├── app/
│   ├── arena/
│   │   └── page.tsx ✏️ UPDATED (complete redesign)
│   └── practice-quizzes/
│       └── page.tsx ✏️ UPDATED (redirects to tests)
db/
└── schema.sql ✏️ UPDATED (added role field & study_pack_generations table)
```

---

## 🔐 Security Features

### 1. Role-Based Access
- Routes automatically check user role
- Unauthorized users redirected to appropriate dashboard
- Server-side role verification on API routes

### 2. Rate Limiting
- Prevents abuse of AI endpoints
- In-memory storage (resets on server restart)
- For production: consider Redis/Upstash

### 3. File Upload Validation
- File size limits enforced
- MIME type checking
- Only authorized roles can upload

### 4. API Key Detection
- System warns if AI keys missing
- Graceful degradation of features
- Clear error messages to users

---

## 🧪 Testing Checklist

### Authentication & Roles
- [ ] Student can access /dashboard
- [ ] Student cannot access /teacher
- [ ] Teacher can access /teacher
- [ ] Teacher cannot access /dashboard
- [ ] Admin can access everything
- [ ] Navbar shows correct items per role
- [ ] Sidebar shows correct items per role

### API Routes
- [ ] POST /api/notes-converter/generate works with auth
- [ ] GET /api/notes-converter/history returns user's packs
- [ ] POST /api/teacher/questions/ingest requires teacher role
- [ ] Rate limiting triggers after threshold
- [ ] File upload validates size and type

### UI/UX
- [ ] Arena page displays leaderboard
- [ ] Practice quizzes redirects to tests
- [ ] /admin/config shows environment status
- [ ] Navbar updates based on current role
- [ ] Theme toggle works (dark/light mode)

---

## 📊 Database Schema Summary

### New Table: `study_pack_generations`

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `user_id` | uuid | Foreign key to auth.users |
| `input_text` | text | Original notes (truncated) |
| `file_url` | text | Optional uploaded file URL |
| `generated_summary` | jsonb | AI summary output |
| `generated_flashcards` | jsonb | Flashcards array |
| `generated_questions` | jsonb | Questions array |
| `generated_quiz` | jsonb | Quiz data |
| `generated_mindmap` | jsonb | Mind map structure |
| `generated_formulas` | jsonb | Formula sheet |
| `generated_keypoints` | jsonb | Key points |
| `processing_time_ms` | integer | Time taken |
| `character_count` | integer | Input length |
| `status` | text | processing/completed/failed |
| `created_at` | timestamptz | Creation timestamp |

### Updated Table: `profiles`

**New Column:**
- `role` text CHECK (role IN ('student', 'teacher', 'admin')) DEFAULT 'student'

---

## 🔄 Migration Path

### From Existing Cognify Installation

1. **Backup database** before running migrations
2. **Run migration file** to add new columns/tables
3. **Update environment variables**
4. **Assign roles to existing users**
5. **Test in staging** before production deploy

### For New Installations

1. Use updated `db/schema.sql` (already includes all changes)
2. Set up environment variables
3. Deploy application
4. First user with `is_admin = true` gets admin role automatically

---

## 🐛 Troubleshooting

### Issue: Users stuck on wrong dashboard

**Solution:** Check database role assignment:
```sql
SELECT id, email, role, is_admin FROM profiles WHERE email = 'user@example.com';
```

### Issue: AI features not working

**Solution:** 
1. Check `/admin/config` page for missing keys
2. Verify `.env.local` has GROQ_API_KEY or GEMINI_API_KEY
3. Restart dev server after adding env vars

### Issue: Rate limit errors

**Solution:** Rate limits reset after 1 hour or server restart. For testing, temporarily increase limits in `src/middleware/rate-limit.ts`.

### Issue: File upload fails

**Solution:** 
1. Check file size (max 10MB for PDFs)
2. Verify file type is supported
3. Ensure user has teacher/admin role

---

## 📝 Next Steps (Future Enhancements)

### Recommended Improvements

1. **Study Pack Processing**
   - Implement background job queue (Bull, Inngest)
   - Add webhook/polling for completion status
   - Store generated files in Supabase Storage

2. **Question Ingestion**
   - Connect API to existing OCR pipeline scripts
   - Add preview/approval flow for teachers
   - Batch processing for multiple PDFs

3. **Rate Limiting**
   - Move to Redis/Upstash for persistent storage
   - Add per-endpoint custom limits
   - Implement token bucket algorithm

4. **Role Management UI**
   - Admin panel to change user roles
   - Bulk role assignment
   - Role request system for teachers

5. **Leaderboard Enhancements**
   - Real-time updates with Supabase Realtime
   - Weekly/monthly/all-time tabs
   - Subject-specific leaderboards

---

## 📞 Support

For issues or questions:
1. Check this deployment guide
2. Review AI instruction files (AI_SKILLS.md, AI_WORKFLOW.md, etc.)
3. Verify database schema matches expected state
4. Check environment variables configuration

---

## ✅ Upgrade Complete

All features have been implemented according to the specifications. The platform now supports:
- ✅ Role-based access control
- ✅ Study pack storage
- ✅ Question ingestion API
- ✅ Rate limiting & security
- ✅ System configuration dashboard
- ✅ Updated navigation
- ✅ Enhanced arena & leaderboard

**Remember to run the database migration before deploying!**
