# VIDYORA — Testing, Docker, CI/CD & Swagger/OpenAPI Plan

This implementation plan details the setup for comprehensive automated testing (Backend & Frontend), Docker containerization, GitHub Actions CI/CD workflows, and Swagger/OpenAPI interactive documentation.

## User Review Required

> [!IMPORTANT]
> - **Backend Testing**: Jest + Supertest + `mongodb-memory-server` for isolated, zero-dependency database integration testing.
> - **Frontend Testing**: Vitest + React Testing Library + `@testing-library/jest-dom` + `jsdom` for testing AuthContext, ProtectedRoute, and core UI components.
> - **Docker & Compose**: Production multi-stage Dockerfiles for client and server, backed by `docker-compose.yml` with persistent MongoDB storage.
> - **GitHub Actions CI**: Automated pipeline running linting, backend tests, frontend tests, and production builds on `push` and `pull_request`.
> - **Swagger API Docs**: Mounted at `/api/docs` exposing interactive OpenAPI 3.0 documentation.

---

## Proposed Changes

### 1. Backend Testing Infrastructure (`server`)

#### [NEW] [`server/jest.config.js`](file:///c:/Users/aabha/Backend/vidyora/server/jest.config.js)
- Jest configuration for Node environment, setup files, and coverage reporting.

#### [NEW] [`server/tests/setup.js`](file:///c:/Users/aabha/Backend/vidyora/server/tests/setup.js)
- Manages `MongoMemoryServer` lifecycle (`beforeAll`, `afterEach`, `afterAll`).

#### [NEW] [`server/tests/auth.test.js`](file:///c:/Users/aabha/Backend/vidyora/server/tests/auth.test.js)
- Integration tests for registration, login, logout, `/me`, credential validation, and duplicate handling.

#### [NEW] [`server/tests/video.test.js`](file:///c:/Users/aabha/Backend/vidyora/server/tests/video.test.js)
- CRUD operations, invalid ID handling, and strict owner authorization (403 for non-owners).

#### [NEW] [`server/tests/likes.test.js`](file:///c:/Users/aabha/Backend/vidyora/server/tests/likes.test.js)
- Like/unlike flows, duplicate prevention, and count consistency.

#### [NEW] [`server/tests/comments.test.js`](file:///c:/Users/aabha/Backend/vidyora/server/tests/comments.test.js)
- Comment creation, reading, deletion ownership checks, and validation.

#### [NEW] [`server/tests/history.test.js`](file:///c:/Users/aabha/Backend/vidyora/server/tests/history.test.js)
- Adding/retrieving history items, user isolation, and guest restriction.

#### [NEW] [`server/tests/playlists.test.js`](file:///c:/Users/aabha/Backend/vidyora/server/tests/playlists.test.js)
- Playlist creation, reading, updating, deleting, and video management with ownership checks.

#### [NEW] [`server/tests/subscriptions.test.js`](file:///c:/Users/aabha/Backend/vidyora/server/tests/subscriptions.test.js)
- Subscription and unsubscription logic, duplicate prevention, and channel subscriber count integrity.

---

### 2. Frontend Testing Infrastructure (`client`)

#### [NEW] [`client/vitest.config.js`](file:///c:/Users/aabha/Backend/vidyora/client/vitest.config.js)
- Vitest configuration with `jsdom` environment and test setup.

#### [NEW] [`client/src/test/setup.js`](file:///c:/Users/aabha/Backend/vidyora/client/src/test/setup.js)
- `@testing-library/jest-dom` import and automatic cleanup.

#### [NEW] [`client/src/__tests__/AuthContext.test.jsx`](file:///c:/Users/aabha/Backend/vidyora/client/src/__tests__/AuthContext.test.jsx)
- Tests authentication state, login/logout functions, and user restoration.

#### [NEW] [`client/src/__tests__/ProtectedRoute.test.jsx`](file:///c:/Users/aabha/Backend/vidyora/client/src/__tests__/ProtectedRoute.test.jsx)
- Tests routing access, loading states, and login redirects.

#### [NEW] [`client/src/__tests__/LikeButton.test.jsx`](file:///c:/Users/aabha/Backend/vidyora/client/src/__tests__/LikeButton.test.jsx)
- Tests like toggle UI, counts, and API triggers.

#### [NEW] [`client/src/__tests__/CommentList.test.jsx`](file:///c:/Users/aabha/Backend/vidyora/client/src/__tests__/CommentList.test.jsx)
- Tests comment item rendering, empty states, and author attributes.

#### [NEW] [`client/src/__tests__/VideoCard.test.jsx`](file:///c:/Users/aabha/Backend/vidyora/client/src/__tests__/VideoCard.test.jsx)
- Tests video metadata, thumbnail rendering, and link targets.

---

### 3. Docker & Infrastructure

#### [NEW] [`server/Dockerfile`](file:///c:/Users/aabha/Backend/vidyora/server/Dockerfile)
- Node 20 LTS production container for backend API server.

#### [NEW] [`client/Dockerfile`](file:///c:/Users/aabha/Backend/vidyora/client/Dockerfile)
- Multi-stage build for client Vite React SPA.

#### [NEW] [`docker-compose.yml`](file:///c:/Users/aabha/Backend/vidyora/docker-compose.yml)
- Services for `client`, `server`, and `mongodb` with volume persistence.

#### [NEW] [`.dockerignore`](file:///c:/Users/aabha/Backend/vidyora/.dockerignore)
- Excludes development artifacts from Docker contexts.

#### [NEW] [`.env.example`](file:///c:/Users/aabha/Backend/vidyora/.env.example)
- Production & development environment variable key templates.

---

### 4. GitHub Actions CI/CD Pipeline

#### [NEW] [`.github/workflows/ci.yml`](file:///c:/Users/aabha/Backend/vidyora/.github/workflows/ci.yml)
- Workflow running on push/PR for backend tests, frontend tests, linting, and build verification.

---

### 5. Swagger / OpenAPI Documentation

#### [NEW] [`server/config/swagger.js`](file:///c:/Users/aabha/Backend/vidyora/server/config/swagger.js) & [`server/swagger.json`](file:///c:/Users/aabha/Backend/vidyora/server/swagger.json)
- Interactive Swagger UI specification mounted at `/api/docs`.

---

## Verification Plan

### Automated Tests Execution
1. Run backend tests: `npm test` inside `server/`.
2. Run frontend tests: `npm test` inside `client/`.

### Documentation Verification
1. Open `http://localhost:8000/api/docs` and verify Swagger UI loads cleanly.

