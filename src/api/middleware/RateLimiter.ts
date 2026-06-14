import { Request, Response, NextFunction } from 'express';

interface RateEntry {
  tokens: number;
  lastRefill: number;
}

const windowMs = 60 * 1000; // 1 minute
const maxRequests = 100;     // per window
const refillRate = maxRequests / windowMs; // tokens per ms

const cache = new Map<string, RateEntry>();

// Clean up old entries every 2 minutes, but don't block Jest exit
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (now - entry.lastRefill > windowMs * 2) cache.delete(key);
  }
}, 120000);
cleanupInterval.unref();

export function RateLimiter(req: Request, res: Response, next: NextFunction): void {
  const key = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  let entry = cache.get(key);

  if (!entry) {
    entry = { tokens: maxRequests, lastRefill: now };
    cache.set(key, entry);
  }

  const elapsed = now - entry.lastRefill;
  const newTokens = elapsed * refillRate;
  entry.tokens = Math.min(maxRequests, entry.tokens + newTokens);
  entry.lastRefill = now;

  if (entry.tokens < 1) {
    res.status(429).json({ error: 'Too many requests, please slow down' });
    return;
  }

  entry.tokens -= 1;
  next();
}