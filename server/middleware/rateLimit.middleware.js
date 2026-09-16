const rateLimit = require("express-rate-limit");

/**
 * Vidyora Rate Limiting Middleware
 *
 * Uses express-rate-limit for IP-based rate limiting.
 * Compatible with serverless environments (Vercel) when coupled with Express's `trust proxy` setting.
 * Note on Serverless:
 * The default in-memory store tracks request rates per-instance. Suitable as an initial
 * protection layer against brute-force attacks, but a distributed shared store (e.g. Redis)
 * would be required for global rate-limit tracking across multiple serverless instances.
 */

// Strict rate limiter for Authentication endpoints (Login & Register): 5 attempts per 15 mins per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    message: "Too many authentication attempts. Please try again later.",
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: () => process.env.NODE_ENV === "test",
});

// Loose global rate limiter for all general API routes (/api/v1): 100 requests per 15 mins per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    message: "Too many requests. Please try again later.",
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: () => process.env.NODE_ENV === "test",
});

module.exports = { authLimiter, apiLimiter };
