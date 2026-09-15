/**
 * Custom Rate Limiting Middleware
 *
 * Implements sliding-window IP rate limiting for authentication and general API routes.
 * Handles reverse proxy IP resolution (Vercel, Render, Nginx) gracefully and returns HTTP 429.
 */

function createRateLimiter({ windowMs = 15 * 60 * 1000, max = 100, message = "Too many requests. Please try again later." }) {
  const requests = new Map();

  // Periodic cleanup of expired entries
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of requests.entries()) {
      if (now > entry.resetTime) {
        requests.delete(ip);
      }
    }
  }, Math.min(windowMs, 60000));

  // Allow cleanup interval to unref so it doesn't block node process shutdown
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return (req, res, next) => {
    // Get IP address considering proxy headers if trust proxy is enabled
    const ip = req.ip || req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "127.0.0.1";
    const now = Date.now();
    let entry = requests.get(ip);

    if (!entry || now > entry.resetTime) {
      entry = { count: 1, resetTime: now + windowMs };
      requests.set(ip, entry);
      res.setHeader("X-RateLimit-Limit", max);
      res.setHeader("X-RateLimit-Remaining", max - 1);
      return next();
    }

    entry.count += 1;
    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, max - entry.count));

    if (entry.count > max) {
      return res.status(429).json({ message });
    }

    next();
  };
}

// Strict rate limiter for Auth endpoints (Login & Register): 5 attempts per 15 mins per IP
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many attempts. Please try again later.",
});

// Global rate limiter for general API routes: 200 requests per 15 mins per IP
const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: "Too many requests to the Vidyora API. Please slow down and try again later.",
});

module.exports = { authLimiter, apiLimiter, createRateLimiter };
