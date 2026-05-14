import { Request, Response, NextFunction } from "express";
import { logger } from "./logger.js";

// Simple in-memory rate limiter (replace with Redis in production at scale)
const attempts = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(options: { windowMs: number; max: number; message?: string }) {
  const { windowMs, max, message = "Too many requests, please try again later" } = options;

  // Cleanup old entries every minute
  setInterval(() => {
    const now = Date.now();
    for (const [key, val] of attempts) {
      if (val.resetAt < now) attempts.delete(key);
    }
  }, 60000);

  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();
    const record = attempts.get(key);

    if (!record || record.resetAt < now) {
      attempts.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    record.count++;
    if (record.count > max) {
      logger.warn({ ip: req.ip, path: req.path, count: record.count }, "Rate limit exceeded");
      res.setHeader("Retry-After", Math.ceil((record.resetAt - now) / 1000));
      return res.status(429).json({ error: message });
    }

    next();
  };
}

// Specific limiter for auth endpoints: 5 attempts per 15 minutes per IP
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many login attempts. Please wait 15 minutes.",
});

// General API rate limit: 100 requests per minute
export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: "Rate limit exceeded. Please slow down.",
});
