/**
 * Rate Limiting Middleware
 * 
 * Simple in-memory rate limiter for AI endpoints
 * For production, consider using Redis or Upstash
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory store (resets on server restart)
const store = new Map<string, RateLimitRecord>();

// Default limits
export const RATE_LIMITS = {
  AI_GENERATION: { maxRequests: 20, windowMs: 60 * 60 * 1000 }, // 20 per hour
  QUESTION_UPLOAD: { maxRequests: 10, windowMs: 60 * 60 * 1000 }, // 10 per hour
  FILE_UPLOAD: { maxRequests: 30, windowMs: 60 * 60 * 1000 }, // 30 per hour
};

/**
 * Check if request is within rate limit
 */
export function checkRateLimit(
  identifier: string, // user ID or IP
  config: RateLimitConfig
): { success: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const key = identifier;
  
  const record = store.get(key);
  
  // No record or expired window
  if (!record || now > record.resetAt) {
    store.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetAt: now + config.windowMs,
    };
  }
  
  // Within window
  if (record.count < config.maxRequests) {
    record.count++;
    return {
      success: true,
      remaining: config.maxRequests - record.count,
      resetAt: record.resetAt,
    };
  }
  
  // Rate limit exceeded
  return {
    success: false,
    remaining: 0,
    resetAt: record.resetAt,
  };
}

/**
 * Clean up expired records (run periodically)
 */
export function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [key, record] of store.entries()) {
    if (now > record.resetAt) {
      store.delete(key);
    }
  }
}

// Clean up every 5 minutes
if (typeof window === 'undefined') {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}

/**
 * File size validation
 */
export const FILE_SIZE_LIMITS = {
  PDF: 10 * 1024 * 1024, // 10MB
  DOCX: 5 * 1024 * 1024, // 5MB
  IMAGE: 5 * 1024 * 1024, // 5MB
  TEXT: 1 * 1024 * 1024, // 1MB
};

/**
 * Text length validation
 */
export const TEXT_LIMITS = {
  MAX_NOTES_LENGTH: 50000, // 50k characters
  MIN_NOTES_LENGTH: 30, // 30 characters
};

/**
 * Validate file size
 */
export function validateFileSize(file: File): { valid: boolean; error?: string } {
  const ext = file.name.split('.').pop()?.toLowerCase();
  
  let limit: number;
  switch (ext) {
    case 'pdf':
      limit = FILE_SIZE_LIMITS.PDF;
      break;
    case 'docx':
    case 'doc':
      limit = FILE_SIZE_LIMITS.DOCX;
      break;
    case 'png':
    case 'jpg':
    case 'jpeg':
      limit = FILE_SIZE_LIMITS.IMAGE;
      break;
    case 'txt':
    case 'md':
      limit = FILE_SIZE_LIMITS.TEXT;
      break;
    default:
      return { valid: false, error: 'Unsupported file type' };
  }
  
  if (file.size > limit) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${(limit / 1024 / 1024).toFixed(1)}MB`,
    };
  }
  
  return { valid: true };
}

/**
 * Validate text length
 */
export function validateTextLength(text: string): { valid: boolean; error?: string } {
  const length = text.trim().length;
  
  if (length < TEXT_LIMITS.MIN_NOTES_LENGTH) {
    return {
      valid: false,
      error: `Text too short. Minimum ${TEXT_LIMITS.MIN_NOTES_LENGTH} characters required.`,
    };
  }
  
  if (length > TEXT_LIMITS.MAX_NOTES_LENGTH) {
    return {
      valid: false,
      error: `Text too long. Maximum ${TEXT_LIMITS.MAX_NOTES_LENGTH} characters allowed.`,
    };
  }
  
  return { valid: true };
}
