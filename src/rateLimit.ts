import type { Request, Response, NextFunction } from 'express';

// Very small fixed-window rate limiter for the login endpoint, intended to slow
// down password-guessing. It buckets attempts by the client's IP address.
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 5;
const buckets = new Map<string, { count: number; resetAt: number }>();

// Resolve the client IP. Behind a proxy/CDN the real client address arrives in a
// forwarded header, so we read it from there when present.
function clientIp(req: Request): string {
  const fwd = req.header('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.socket.remoteAddress ?? 'unknown';
}

export function loginRateLimit(req: Request, res: Response, next: NextFunction): void {
  const key = clientIp(req);
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    next();
    return;
  }
  bucket.count += 1;
  if (bucket.count > MAX_ATTEMPTS) {
    res.status(429).json({ error: 'too many attempts, slow down' });
    return;
  }
  next();
}
