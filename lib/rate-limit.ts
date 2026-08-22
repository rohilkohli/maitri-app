/**
 * Rate limiting utilities for API protection
 * Uses in-memory store (for serverless, consider Redis)
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  /** Maximum requests allowed */
  limit: number;
  /** Time window in milliseconds */
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * Check if request should be rate limited
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    cleanupExpiredEntries();
  }

  if (!entry || now > entry.resetAt) {
    // Create new entry
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + config.windowMs,
    };
    store.set(key, newEntry);

    return {
      success: true,
      remaining: config.limit - 1,
      resetAt: new Date(newEntry.resetAt),
    };
  }

  // Check if limit exceeded
  if (entry.count >= config.limit) {
    return {
      success: false,
      remaining: 0,
      resetAt: new Date(entry.resetAt),
    };
  }

  // Increment count
  entry.count++;
  store.set(key, entry);

  return {
    success: true,
    remaining: config.limit - entry.count,
    resetAt: new Date(entry.resetAt),
  };
}

/**
 * Clean up expired rate limit entries
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];

  store.forEach((entry, key) => {
    if (now > entry.resetAt) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach(key => store.delete(key));
}

/**
 * Reset rate limit for a key (for testing)
 */
export function resetRateLimit(key: string): void {
  store.delete(key);
}

/**
 * Clear all rate limits (for testing)
 */
export function clearAllRateLimits(): void {
  store.clear();
}

/** Default rate limit configs */
export const RATE_LIMITS = {
  /** Standard API rate limit: 100 requests per minute */
  standard: { limit: 100, windowMs: 60 * 1000 },
  /** AI API rate limit: 20 requests per minute */
  ai: { limit: 20, windowMs: 60 * 1000 },
  /** Auth rate limit: 5 attempts per 15 minutes */
  auth: { limit: 5, windowMs: 15 * 60 * 1000 },
} as const;
