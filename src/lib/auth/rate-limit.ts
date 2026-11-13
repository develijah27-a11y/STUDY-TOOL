import { NextRequest, NextResponse } from "next/server";

interface RateLimitTracker {
  count: number;
  resetAt: number;
}

const ipMap = new Map<string, RateLimitTracker>();

// Clean up stale entries every 5 minutes to avoid memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of ipMap.entries()) {
    if (val.resetAt <= now) {
      ipMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * In-memory sliding window rate-limiter for sensitive auth and financial endpoints.
 * 
 * @param request NextRequest
 * @param maxRequests Maximum requests allowed in window (e.g. 5 for login/PIN, 30 for catalogue)
 * @param windowMs Window in milliseconds (e.g. 60,000 for 1 minute)
 */
export function checkRateLimit(
  request: NextRequest,
  maxRequests: number = 5,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetInMs: number } {
  // Extract client IP (standard proxy headers for Vercel/Cloudflare)
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";

  const path = request.nextUrl.pathname;
  const key = `${ip}:${path}`;
  const now = Date.now();

  const record = ipMap.get(key);

  if (!record || record.resetAt <= now) {
    ipMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetInMs: windowMs };
  }

  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetInMs: Math.max(0, record.resetAt - now),
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetInMs: Math.max(0, record.resetAt - now),
  };
}

