/**
 * Simple in-memory rate limiter for server actions.
 * For production at scale, replace with Redis-backed rate limiting (e.g., @upstash/ratelimit).
 * 
 * This provides protection against brute-force attacks on login,
 * password reset, and other sensitive endpoints.
 */

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupStaleEntries() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}

type RateLimitConfig = {
  /** Maximum number of requests allowed in the window */
  maxAttempts: number;
  /** Time window in milliseconds */
  windowMs: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
};

/**
 * Check rate limit for a given identifier (e.g., IP or email).
 * Returns whether the request is allowed.
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig,
): RateLimitResult {
  cleanupStaleEntries();

  const now = Date.now();
  const entry = store.get(identifier);

  // No previous attempts or window expired
  if (!entry || now > entry.resetAt) {
    store.set(identifier, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.maxAttempts - 1, retryAfterMs: 0 };
  }

  // Within window — check count
  if (entry.count >= config.maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: entry.resetAt - now,
    };
  }

  // Increment and allow
  entry.count++;
  return {
    allowed: true,
    remaining: config.maxAttempts - entry.count,
    retryAfterMs: 0,
  };
}

/** 
 * Pre-configured rate limits for common operations.
 */
export const RATE_LIMITS = {
  /** Login: 5 attempts per 15 minutes per email */
  LOGIN: { maxAttempts: 5, windowMs: 15 * 60 * 1000 } as RateLimitConfig,
  /** Password reset: 3 attempts per 15 minutes per email */
  PASSWORD_RESET: { maxAttempts: 3, windowMs: 15 * 60 * 1000 } as RateLimitConfig,
  /** API: 100 requests per minute per user */
  API: { maxAttempts: 100, windowMs: 60 * 1000 } as RateLimitConfig,
} as const;
