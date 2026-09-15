# Implementation Plan - Vidyora Security Hardening Phase

Implement comprehensive application security hardening across 8 core operational areas: Rate Limiting, Security Headers, Input Sanitization, Password Policy, JWT Hardening, File Upload Security, Authorization Auditing, and Secrets Management.

## User Review Required

> [!IMPORTANT]
> - **Zero Breaking Changes**: Existing CORS, cookie authentication (`withCredentials: true`), media streaming, and API contracts remain 100% functional.
> - **Password Policy Update**: Registration will now enforce strong passwords (min 8 chars, uppercase, lowercase, digit, special character).
> - **Database Security**: User password hashes are shielded at the Mongoose schema level using `select: false`.

---

## Proposed Changes

### Middleware & Server Core (`server`)

#### [NEW] [`rateLimit.middleware.js`](file:///c:/Users/aabha/Backend/vidyora/server/middleware/rateLimit.middleware.js)
- Implement sliding-window rate limiters:
  - `authLimiter`: 5 attempts per 15 minutes per IP for `/api/v1/auth/login` and `/api/v1/auth/register`.
  - `apiLimiter`: 200 requests per 15 minutes per IP for all `/api/v1` routes.
- Returns HTTP 429 with `{ message: "Too many requests. Please try again later." }` and rate limit headers.

#### [NEW] [`security.middleware.js`](file:///c:/Users/aabha/Backend/vidyora/server/middleware/security.middleware.js)
- Implement security headers middleware (Helmet equivalent):
  - Sets `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `X-XSS-Protection: 0`, `Strict-Transport-Security`, `Referrer-Policy: strict-origin-when-cross-origin`.
  - Sets `Cross-Origin-Resource-Policy: cross-origin` so Cloudinary/video streams load smoothly across origins.
- Implement `mongoSanitize` middleware:
  - Recursively strips keys starting with `$` or containing `.` from `req.body`, `req.query`, and `req.params` to neutralize NoSQL injection.

#### [MODIFY] [`server.js`](file:///c:/Users/aabha/Backend/vidyora/server/server.js)
- Mount `securityHeaders`, `mongoSanitize`, `apiLimiter`, and `authLimiter`.
- Add startup assertion verifying `JWT_SECRET` is present and at least 32 characters long.

---

### Authentication & Authorization (`server`)

#### [MODIFY] [`User.js`](file:///c:/Users/aabha/Backend/vidyora/server/models/User.js)
- Set `select: false` on `password` field so user queries never accidentally expose the hashed password in responses.

#### [MODIFY] [`auth.controller.js`](file:///c:/Users/aabha/Backend/vidyora/server/controllers/auth.controller.js)
- Update `registerUser` password validation:
  - Enforce minimum length of 8 characters.
  - Enforce presence of uppercase, lowercase, number, and special character.
- Ensure `loginUser` explicitly selects `+password` for bcrypt comparison while keeping user responses safe via `toSafeUser`.

---

### File Upload Security (`server`)

#### [MODIFY] [`upload.middleware.js`](file:///c:/Users/aabha/Backend/vidyora/server/middleware/upload.middleware.js)
- Implement separate file size limits:
  - 100MB for video files (`video`).
  - 5MB for thumbnails (`thumbnail`) and avatar images (`avatar`).
- Enforce strict MIME-type and extension validation for images (`jpeg`, `jpg`, `png`, `webp`) and videos (`mp4`, `webm`, `mov`).
- Add buffer magic number / signature validation to verify genuine image/video file content.

#### [MODIFY] [`video.controller.js`](file:///c:/Users/aabha/Backend/vidyora/server/controllers/video.controller.js) & [`auth.controller.js`](file:///c:/Users/aabha/Backend/vidyora/server/controllers/auth.controller.js)
- Wrap all upload handling in `try...finally` blocks to guarantee temporary files on disk are deleted regardless of success or failure.

---

### Frontend UI (`client`)

#### [MODIFY] [`Register.jsx`](file:///c:/Users/aabha/Backend/vidyora/client/src/pages/Register.jsx)
- Add password policy hint/tooltip under password input field.
- Ensure inline error message displays complexity requirements if registration fails.

---

## Verification Plan

### Manual Verification Checklist
1. **Rate Limiting Test**: Send 6 consecutive POST requests to `/api/v1/auth/login`. Verify request #6 returns `429 Too Many Requests`.
2. **Security Headers Test**: Inspect HTTP response headers for `X-Content-Type-Options: nosniff`, `X-Frame-Options`, and `Cross-Origin-Resource-Policy`.
3. **NoSQL Injection Test**: Post `{ "email": { "$ne": "" }, "password": { "$ne": "" } }` to `/api/v1/auth/login`. Verify `$` keys are stripped and request is safely rejected.
4. **Password Policy Test**: Attempt registering with `simple123`. Verify rejection with password complexity error message. Register with `Vidyora@2026!` and verify success.
5. **File Upload Security Test**: Upload a `.txt` file renamed to `.png` or a 10MB thumbnail. Verify file validation and size limit rejection, and verify temp files are deleted from OS temp dir.
6. **Authorization Audit Test**: Test modifying or deleting another user's video/comment/playlist/like via API. Verify `403 Forbidden` response.
7. **Secrets Test**: Verify `.env` is listed in `.gitignore` and no API secrets are exposed in client-side bundles or response payloads.
