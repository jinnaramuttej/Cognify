# 🔐 Cognify Environment Audit & Setup Guide

This guide outlines the state of your environment variables and recommends a consolidated configuration.

---

## 🛠️ Current Status Matrix

| Variable | Location | Status | Action Required |
| :--- | :--- | :--- | :--- |
| **NEXT_PUBLIC_SUPABASE_URL** | Root `.env` | ✅ Good | None. |
| **NEXT_PUBLIC_SUPABASE_ANON_KEY**| Root `.env` | ✅ Good | None. |
| **SUPABASE_SERVICE_ROLE_KEY** | Root `.env` | ❌ **BAD** | Currently a "publishable" key. **Change to Secret JWT.** |
| **GROQ_API_KEY** | AI Backend `.env` | ⚠️ Fragmented | Move to Root `.env` for consistency. |
| **GOOGLE_API_KEY** | Notebook LLM `.env`| ⚠️ Fragmented | Move to Root `.env` for consistency. |
| **GEMINI_API_KEY** | None | ❌ **MISSING**| Required by `ai-service.ts`. |
| **DATABASE_URL** | None | ❌ **MISSING**| Optional: Raw PG connection for advanced scripts. |
| **NEXTAUTH_SECRET** | Root `.env` | ✅ Good | None. |
| **NEXTAUTH_URL** | Root `.env` | ✅ Good | None. |

---

## 🚀 Recommended Root `.env` (Master Template)

Copy and fill these into your root `.env` for a unified ecosystem:

```bash
# === SUPABASE ===
NEXT_PUBLIC_SUPABASE_URL=https://bvlsxjgeatsjbrioorxj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...your_anon_key...
# WARNING: This should be the SECRET Service Role Key (JWT), not a publishable one!
SUPABASE_SERVICE_ROLE_KEY=...your_secret_role_key...

# === NEXTAUTH ===
NEXTAUTH_SECRET=...generate_using_openssl_rand_base64_32...
NEXTAUTH_URL=http://localhost:3000

# === AI SERVICES ===
GROQ_API_KEY=...
GOOGLE_API_KEY=...
GEMINI_API_KEY=...
OPENROUTER_API_KEY=...
```

---

## 💡 Pro Tips
1. **Security**: Never commit your actual `.env` file! Always keep a `.env.example` in the repo.
2. **Next.js**: Variables starting with `NEXT_PUBLIC_` are accessible on the client-side. Keep secrets (like Service Role keys) WITHOUT this prefix.
3. **Consolidation**: By moving all keys to the root, you can manage your entire tech stack from one place.
