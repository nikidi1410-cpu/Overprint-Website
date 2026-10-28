import "server-only";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * Fixed-window limiter kept in process memory. Good enough for a single
 * Node instance; swap for Redis or similar when running more than one.
 */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryInMs: 0 };
  }

  if (bucket.count >= limit) {
    return { ok: false, retryInMs: bucket.resetAt - now };
  }

  bucket.count += 1;
  return { ok: true, retryInMs: 0 };
}
