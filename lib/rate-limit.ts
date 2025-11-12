import { RATE_LIMIT } from './constants';
import { kv } from '@vercel/kv';

/**
 * Rate limiter using Vercel KV for distributed rate limiting
 * Falls back to in-memory store for local development when KV is not configured
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory fallback for local development
const rateLimitMap = new Map<string, RateLimitEntry>();

// Check if Vercel KV is configured
const isKvAvailable = (): boolean => {
  return !!(
    process.env.KV_URL ||
    process.env.KV_REST_API_URL ||
    process.env.KV_REST_API_TOKEN
  );
};

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Check if request is within rate limit using Vercel KV (or in-memory fallback)
 * @param identifier Usually IP address
 * @param limit Max requests per window
 * @param windowMs Time window in milliseconds
 */
export async function checkRateLimit(
  identifier: string,
  limit: number = RATE_LIMIT.MAX_REQUESTS,
  windowMs: number = RATE_LIMIT.WINDOW_MS
): Promise<RateLimitResult> {
  const now = Date.now();
  const key = `ratelimit:${identifier}`;

  // Use Vercel KV if available (production), otherwise use in-memory (local dev)
  if (isKvAvailable()) {
    try {
      return await checkRateLimitWithKv(key, limit, windowMs, now);
    } catch (error) {
      console.error('Vercel KV rate limit error, falling back to in-memory:', error);
      // Fall through to in-memory fallback
    }
  }

  // In-memory fallback for local development
  return checkRateLimitInMemory(identifier, limit, windowMs, now);
}

/**
 * Rate limiting using Vercel KV (distributed, works across serverless instances)
 */
async function checkRateLimitWithKv(
  key: string,
  limit: number,
  windowMs: number,
  now: number
): Promise<RateLimitResult> {
  try {
    // Get current count and reset time
    const entry = await kv.get<RateLimitEntry>(key);

    if (!entry || now > entry.resetTime) {
      // New window, create/reset entry
      const resetTime = now + windowMs;
      await kv.set(key, { count: 1, resetTime }, { ex: Math.ceil(windowMs / 1000) });

      return {
        allowed: true,
        limit,
        remaining: limit - 1,
        reset: resetTime,
      };
    }

    // Within existing window
    const newCount = entry.count + 1;
    await kv.set(key, { count: newCount, resetTime: entry.resetTime }, { ex: Math.ceil((entry.resetTime - now) / 1000) });

    if (newCount > limit) {
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
      remaining: limit - newCount,
      reset: entry.resetTime,
    };
  } catch (error) {
    // If KV fails, allow the request but log the error
    console.error('KV rate limit check failed:', error);
    return {
      allowed: true,
      limit,
      remaining: limit - 1,
      reset: now + windowMs,
    };
  }
}

/**
 * Rate limiting using in-memory store (local development fallback)
 */
function checkRateLimitInMemory(
  identifier: string,
  limit: number,
  windowMs: number,
  now: number
): RateLimitResult {
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

