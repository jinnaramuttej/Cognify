/**
 * Rate Limiter — In-memory rate limiting for AI endpoints
 * 
 * Limits: 20 requests per user per hour
 */

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 20;

/**
 * Check if a user has exceeded the rate limit.
 * Returns { allowed, remaining, resetIn } 
 */
export function checkRateLimit(userId: string): {
    allowed: boolean;
    remaining: number;
    resetIn: number;
} {
    const now = Date.now();
    const entry = store.get(userId);

    // Clean up expired entries periodically
    if (store.size > 1000) {
        for (const [key, val] of store) {
            if (val.resetAt < now) store.delete(key);
        }
    }

    if (!entry || entry.resetAt < now) {
        store.set(userId, { count: 1, resetAt: now + WINDOW_MS });
        return { allowed: true, remaining: MAX_REQUESTS - 1, resetIn: WINDOW_MS };
    }

    if (entry.count >= MAX_REQUESTS) {
        return { allowed: false, remaining: 0, resetIn: entry.resetAt - now };
    }

    entry.count++;
    return { allowed: true, remaining: MAX_REQUESTS - entry.count, resetIn: entry.resetAt - now };
}

/** Input validation limits */
export const LIMITS = {
    MAX_INPUT_LENGTH: 50_000,      // 50K characters
    MAX_PDF_SIZE: 10 * 1024 * 1024,  // 10MB
    MAX_DOC_SIZE: 5 * 1024 * 1024,   // 5MB
    MAX_IMG_SIZE: 5 * 1024 * 1024,   // 5MB
    MIN_INPUT_LENGTH: 30,
} as const;

/**
 * Validate input text length.
 * Returns error message or null if valid.
 */
export function validateInput(text: string): string | null {
    if (!text || text.trim().length < LIMITS.MIN_INPUT_LENGTH) {
        return `Input too short. Minimum ${LIMITS.MIN_INPUT_LENGTH} characters required.`;
    }
    if (text.length > LIMITS.MAX_INPUT_LENGTH) {
        return `Input too long. Maximum ${LIMITS.MAX_INPUT_LENGTH.toLocaleString()} characters allowed.`;
    }
    return null;
}

/**
 * Check if required env vars are configured.
 * Returns list of missing items.
 */
export function checkEnvConfig(): { missing: string[]; configured: string[] } {
    const missing: string[] = [];
    const configured: string[] = [];

    const featherlessConfigured = Boolean(
        process.env.FEATHERLESS_API_KEY || process.env.STITCH_API_KEY || process.env.AI_API_KEY
    );

    if (featherlessConfigured) {
        configured.push('Featherless API Key');
    } else {
        missing.push('Featherless API Key');
    }

    const checks = [
        { key: 'NEXT_PUBLIC_SUPABASE_URL', label: 'Supabase URL' },
        { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', label: 'Supabase Anon Key' },
    ];

    for (const check of checks) {
        if (process.env[check.key]) {
            configured.push(check.label);
        } else {
            missing.push(check.label);
        }
    }

    return { missing, configured };
}
