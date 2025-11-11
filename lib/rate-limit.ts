import { RATE_LIMIT } from './constants';

/**
 * Simple in-memory rate limiter
 * Note: This is for development/MVP only. In production with multiple serverless instances,
 * use a distributed solution like Vercel's rate limiting or Redis.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap.entries()) {
      if (now > entry.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Check if request is within rate limit
 * @param identifier Usually IP address
 * @param limit Max requests per window
 * @param windowMs Time window in milliseconds
 */
export function checkRateLimit(
  identifier: string,
  limit: number = RATE_LIMIT.MAX_REQUESTS,
  windowMs: number = RATE_LIMIT.WINDOW_MS
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetTime) {
    // New window, create/reset entry
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });

    return {
      allowed: true,
      limit,
      remaining: limit - 1,
      reset: now + windowMs,
    };
  }

  // Within existing window
  entry.count++;

  if (entry.count > limit) {
    return {
      allowed: false,
      limit,
      remaining: 0,
      reset: entry.resetTime,
    };
  }

  return {
    allowed: true,
    limit,
    remaining: limit - entry.count,
    reset: entry.resetTime,
  };
}

/**
 * Get client IP from request headers
 */
export function getClientIp(request: Request): string {
  // Try to get real IP from common headers
  const headers = request.headers;
  
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to a default
  return 'unknown';
}

