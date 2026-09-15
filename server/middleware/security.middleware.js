/**
 * Security Headers & NoSQL Input Sanitization Middleware
 */

/**
 * Helmet-equivalent security headers middleware.
 * Configured specifically to avoid breaking CORS, HTTP-only cookies, Cloudinary asset loading, or video streaming.
 */
function securityHeaders(req, res, next) {
  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Clickjacking protection
  res.setHeader("X-Frame-Options", "SAMEORIGIN");

  // Disable browser XSS auditor to avoid security side-channel leaks (modern standard)
  res.setHeader("X-XSS-Protection", "0");

  // Referrer policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Cross-Origin Resource Policy — set to cross-origin to allow media streaming & cross-site asset loads
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

  // HTTP Strict Transport Security (HSTS) in production
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=15552000; includeSubDomains");
  }

  next();
}

/**
 * NoSQL Injection Protection Middleware (express-mongo-sanitize equivalent).
 * Recursively cleans request body, query parameters, and route parameters
 * by deleting any key starting with '$' or containing '.'.
 */
function sanitizeValue(value) {
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      if (typeof value[i] === "object" && value[i] !== null) {
        sanitizeValue(value[i]);
      }
    }
  } else if (typeof value === "object" && value !== null) {
    for (const key of Object.keys(value)) {
      if (key.startsWith("$") || key.includes(".")) {
        delete value[key];
      } else {
        sanitizeValue(value[key]);
      }
    }
  }
}

function mongoSanitize(req, res, next) {
  if (req.body) sanitizeValue(req.body);
  if (req.query) sanitizeValue(req.query);
  if (req.params) sanitizeValue(req.params);
  next();
}

module.exports = { securityHeaders, mongoSanitize };
