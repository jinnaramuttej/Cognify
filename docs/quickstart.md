# Quick Start Guide - Cognify Platform Upgrade

## 🚀 Immediate Next Steps

### 1. Run Database Migration (REQUIRED)

Open your Supabase SQL Editor and run:
```sql
-- File: db/migrations/001_add_role_and_study_packs.sql
```

Or alternatively, drop and recreate tables using:
```sql
-- File: db/schema.sql (already updated)
```

### 2. Set Environment Variables

Create/update `.env.local`:
```env
# Database (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Services (At least one required)
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Assign User Roles

Run in Supabase SQL Editor:
```sql
-- Set admins
UPDATE profiles SET role = 'admin' WHERE is_admin = true;

-- Set teachers (customize condition)
-- UPDATE profiles SET role = 'teacher' WHERE email LIKE '%@school.com';

-- All others default to student
UPDATE profiles SET role = 'student' WHERE role IS NULL;
```

### 4. Start Development Server

```bash
npm install  # if new dependencies were added
npm run dev
```

### 5. Verify Installation

Visit these pages:
- `/admin/config` - Check configuration status
- `/dashboard` - Test student dashboard
- `/teacher` - Test teacher panel (as teacher)

---

## 📁 Key Files to Review

### Database
- `db/migrations/001_add_role_and_study_packs.sql` - Migration file
- `db/schema.sql` - Updated main schema

### Core Logic
- `src/lib/role-utils.ts` - Role checking utilities
- `src/middleware/rate-limit.ts` - Security middleware
- `src/components/RoleProtectedRoute.tsx` - Route protection

### API Routes
- `src/app/api/notes-converter/generate/route.ts` - Study pack generation
- `src/app/api/teacher/questions/ingest/route.ts` - Question upload
- `src/app/api/system/config-status/route.ts` - Config check

### UI Components
- `src/components/Navbar.tsx` - Updated navigation
- `src/app/admin/config/page.tsx` - Config dashboard
- `src/app/arena/page.tsx` - Redesigned arena

### Documentation
- `docs/deployment.md` - Full deployment instructions
- `archive/architecture-changes.md` - Technical architecture
- `docs/implementation.md` - Feature completion status

---

## ⚡ Quick Tests

### Test Role-Based Access

1. **As Student:**
   - Should access: /dashboard, /tests, /library, /cogni, /notes-converter
   - Should NOT access: /teacher

2. **As Teacher:**
   - Should access: /teacher, /tests, /library
   - Should NOT access: /dashboard, /cogni, /notes-converter

3. **As Admin:**
   - Should access: Everything

### Test API Endpoints

```bash
# Check config status (no auth needed)
curl http://localhost:3000/api/system/config-status

# Test rate limiting (with auth token)
# Make 21 requests to trigger limit
for i in {1..21}; do
  curl -H "Authorization: Bearer YOUR_TOKEN" \
    http://localhost:3000/api/notes-converter/generate
done
```

---

## 🎯 Feature Overview

| Feature | Status | Location |
|---------|--------|----------|
| Role-based access | ✅ Complete | src/lib/role-utils.ts |
| Study pack storage | ✅ Complete | study_pack_generations table |
| Question ingestion | ✅ API Ready | /api/teacher/questions/ingest |
| Rate limiting | ✅ Complete | src/middleware/rate-limit.ts |
| Config dashboard | ✅ Complete | /admin/config |
| Arena redesign | ✅ Complete | /arena |
| Practice tests | ✅ Complete | Redirects to /tests |

---

## 🔧 Common Issues & Fixes

### Issue: "Unauthorized" on API calls
**Fix:** Ensure user is logged in and has correct role

### Issue: Rate limit errors
**Fix:** Wait 1 hour or restart dev server

### Issue: Missing role field error
**Fix:** Run database migration

### Issue: AI features not working
**Fix:** Set GROQ_API_KEY or GEMINI_API_KEY in .env.local

---

## 📊 Database Schema Quick Reference

### New Table: study_pack_generations
Stores all AI-generated study materials

### Updated Table: profiles
Added `role` column (student/teacher/admin)

### Indexes Added
- idx_study_packs_user (performance)

---

## 🎓 Usage Examples

### For Students
1. Go to `/notes-converter`
2. Paste notes or upload file
3. Click conversion type (flashcards, quiz, etc.)
4. View generated content
5. Access past conversions via history API

### For Teachers
1. Go to `/teacher/questions`
2. Upload question bank PDF
3. System extracts and validates questions
4. Preview before inserting to database

### For Admins
1. Go to `/admin/config`
2. Check environment configuration
3. Verify all services are configured
4. View feature availability

---

## 📞 Need Help?

1. Check `docs/deployment.md` for detailed instructions
2. Review `archive/architecture-changes.md` for technical details
3. Read `docs/implementation.md` for feature status
4. Verify environment variables at `/admin/config`

---

## ✅ Deployment Checklist

Before going to production:

- [ ] Database migration completed
- [ ] Environment variables set
- [ ] User roles assigned
- [ ] Configuration page accessible
- [ ] Role-based routing working
- [ ] API rate limiting tested
- [ ] File upload working
- [ ] All documentation reviewed

---

**Ready to deploy! 🚀**

After completing the checklist above, your Cognify platform is production-ready with all new features active.
