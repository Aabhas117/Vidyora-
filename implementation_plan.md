# Implementation Plan - Fix Slow Initial Page Load in Vidyora

## Diagnostic Report (Pre-Implementation Analysis)

### 1. Which component causes "Loading videos..."
- [`Home.jsx`](file:///c:/Users/aabha/Backend/vidyora/client/src/pages/Home.jsx#L31-L33) displays `<p className="text-sm text-zinc-500 text-center py-16">Loading videos...</p>` during initial load while awaiting `getVideos()`. `Trending.jsx` and `Search.jsx` also display this message.

### 2. Which API request is slow
- `GET /api/v1/videos`: Fetches the entire video collection from MongoDB without limit/skip pagination and performs an unindexed in-memory sort.
- `GET /api/v1/auth/me`: Triggered on app mount by `AuthProvider`.
- Requests hang indefinitely when the Render backend is sleeping because Axios has no request timeout configured.

### 3. Whether `/auth/me` blocks video loading
- `Home.jsx` fires `getVideos()` on mount independently without waiting for `AuthContext.loading`.
- However, both `GET /auth/me` and `GET /videos` execute concurrently at app startup. When Render is asleep (cold start), both requests queue up simultaneously on the backend.
- Once `/auth/me` finishes for authenticated users, 4 secondary providers (`SubscriptionContext`, `HistoryContext`, `LikeContext`, `PlaylistContext`) trigger additional GET requests in parallel.

### 4. Whether `/videos` fetches all videos
- **Yes.** In [`video.controller.js`](file:///c:/Users/aabha/Backend/vidyora/server/controllers/video.controller.js#L23-L36), `getAllVideos()` performs `Video.find().sort({ createdAt: -1 }).populate("owner", ...)` with no pagination parameters or document limit.

### 5. Whether duplicate requests occur
- **Yes**, in development due to `React.StrictMode` mounting components twice.
- Additionally, state changes in `AuthContext` cause downstream context providers to trigger multiple background requests simultaneously upon auth completion.

### 6. Whether Render cold start is involved
- **Yes.** `vidyora.onrender.com` is hosted on Render's free tier, which spins down after 15 minutes of inactivity. Cold starts take 30–50+ seconds. Without Axios request timeouts or retry mechanisms on the frontend, the UI stays stuck on "Loading videos...".

### 7. Which exact files need modification
1. [`server/controllers/video.controller.js`](file:///c:/Users/aabha/Backend/vidyora/server/controllers/video.controller.js)
2. [`server/models/Video.js`](file:///c:/Users/aabha/Backend/vidyora/server/models/Video.js)
3. [`client/src/Services/api.js`](file:///c:/Users/aabha/Backend/vidyora/client/src/Services/api.js)
4. [`client/src/Services/videoService.js`](file:///c:/Users/aabha/Backend/vidyora/client/src/Services/videoService.js)
5. [`client/src/pages/Home.jsx`](file:///c:/Users/aabha/Backend/vidyora/client/src/pages/Home.jsx)
6. [`client/src/pages/Trending.jsx`](file:///c:/Users/aabha/Backend/vidyora/client/src/pages/Trending.jsx)
7. [`client/src/pages/Search.jsx`](file:///c:/Users/aabha/Backend/vidyora/client/src/pages/Search.jsx)
8. [`client/src/pages/WatchVideo.jsx`](file:///c:/Users/aabha/Backend/vidyora/client/src/pages/WatchVideo.jsx)

---

## User Review Required

> [!IMPORTANT]
> - **Cookie-based Auth Preserved**: `withCredentials: true` is strictly retained in Axios configuration.
> - **No Feature Degradation**: All public routes remain accessible immediately while protected routes remain guarded.
> - **Backend Backward Compatibility**: `GET /api/v1/videos` will accept `page` (default: 1) and `limit` (default: 12) query parameters and return structured pagination metadata while remaining safe for older or array-expecting callers.

---

## Proposed Changes

### Backend Component (`server`)

#### [MODIFY] [`Video.js`](file:///c:/Users/aabha/Backend/vidyora/server/models/Video.js)
- Add compound/field indexes:
  - `videoSchema.index({ createdAt: -1 });` for fast reverse chronological sorting.
  - `videoSchema.index({ owner: 1 });` for fast per-user/channel video queries.

#### [MODIFY] [`video.controller.js`](file:///c:/Users/aabha/Backend/vidyora/server/controllers/video.controller.js)
- Update `getAllVideos`:
  - Extract `page` (default 1) and `limit` (default 12) from `req.query`.
  - Apply `.skip(skip).limit(limit)` and `.lean()` for performance.
  - Return pagination payload `{ videos, page, limit, total, hasNextPage }`.
- Update `getMyVideos`:
  - Apply `.lean()` for lightweight JSON output.

---

### Frontend Component (`client`)

#### [MODIFY] [`api.js`](file:///c:/Users/aabha/Backend/vidyora/client/src/Services/api.js)
- Set Axios request timeout to `20000` (20 seconds) so hanging requests fail gracefully instead of spinning infinitely.
- Maintain `withCredentials: true`.

#### [MODIFY] [`videoService.js`](file:///c:/Users/aabha/Backend/vidyora/client/src/Services/videoService.js)
- Update `getVideos(page = 1, limit = 12)` to pass `page` and `limit` params to `GET /videos`.
- Return object `{ videos, page, limit, total, hasNextPage }`.

#### [MODIFY] [`Home.jsx`](file:///c:/Users/aabha/Backend/vidyora/client/src/pages/Home.jsx)
- Implement distinct 3-state UX:
  - **LOADING**: Clean loading state.
  - **SUCCESS**: Video grid rendering only the requested page of videos.
  - **ERROR**: Server error / timeout state with clear explanation and a "Retry" button.

#### [MODIFY] [`Trending.jsx`](file:///c:/Users/aabha/Backend/vidyora/client/src/pages/Trending.jsx), [`Search.jsx`](file:///c:/Users/aabha/Backend/vidyora/client/src/pages/Search.jsx), [`WatchVideo.jsx`](file:///c:/Users/aabha/Backend/vidyora/client/src/pages/WatchVideo.jsx)
- Adapt `getVideos` calls to handle `{ videos: [...] }` paginated responses safely.

---

## Verification Plan

### Automated Tests / Lint
- Verify syntax and backend/frontend stability.

### Manual Verification
1. Verify `GET /api/v1/videos?page=1&limit=12` returns only 12 videos with pagination metadata.
2. Verify homepage loads immediately without waiting for auth state resolution.
3. Test backend failure/timeout simulation to verify the Error state with Retry button in `Home.jsx`.
4. Verify authentication (login, logout, protected routes like `/profile` and `/upload`) remains 100% functional with HTTP-only cookies.
