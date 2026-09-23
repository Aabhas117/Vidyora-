# Vidyora — Full-Stack Video Sharing & Streaming Platform

[![Build & Test Status](https://img.shields.io/badge/Tests-122%20Passed-brightgreen)](file:///c:/Users/aabha/Backend/vidyora/server/tests)
[![Node.js Version](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-blue)](https://nodejs.org)
[![Express Version](https://img.shields.io/badge/Express-v5.2-lightgrey)](https://expressjs.com)
[![React Version](https://img.shields.io/badge/React-v19.0-blue)](https://react.dev)
[![License](https://img.shields.io/badge/License-ISC-green)](#license)

Vidyora is a production-grade, full-stack video-sharing and streaming web application built using **React 19**, **Express 5**, **MongoDB**, and **Cloudinary**. Designed with security, performance, and scalability in mind, Vidyora provides a seamless video consumption interface alongside a comprehensive **Creator Analytics Dashboard** powered by MongoDB aggregation pipelines.

---

## Live Demo & Endpoints

- **Frontend Application:** [https://vidyora-amber.vercel.app](https://vidyora-amber.vercel.app)
- **Backend API Base:** `https://vidyora-amber.vercel.app/api/v1`
- **Health Check Endpoint:** `https://vidyora-amber.vercel.app/api/health`

---

## Features

### User Authentication & Security
- **HTTP-Only Cookie Authentication:** JWT tokens stored in secure, `httpOnly` cookies to protect against Cross-Site Scripting (XSS) attacks.
- **Password Security:** Multi-round password hashing with `bcryptjs`.
- **NoSQL Injection Sanitization:** Custom recursive middleware that strips `$` and `.` characters from incoming request payloads.
- **Global & Auth Rate Limiting:** Strict request window limiters (`express-rate-limit`) on sensitive endpoints (login, registration, API routes) to prevent brute-force attacks.

### Video Operations & Media Processing
- **Cloudinary Integration:** Direct server-side streaming upload for high-definition video files and custom thumbnail images via `multer`.
- **Atomic View Counter:** Non-blocking view tracking utilizing atomic MongoDB `$inc` updates paired with asynchronous `ViewEvent` time-series logs.
- **Pagination & Text Search:** High-performance pagination with page/limit parameters and full-text search across video titles, descriptions, and categories via MongoDB `$text` indexes.

### Social & Interaction Ecosystem
- **Likes & Unlikes:** Unique compound indexes (`[user, video]`) enforcing single-like constraints at the database level.
- **Nested Comments & Cascade Deletion:** One-level nested comment replies with automatic cascade deletion of child replies when a parent comment is deleted.
- **Watch History:** Automatic watch history tracking with upsert handling on video re-watches, sorted chronologically with full clear/remove capabilities.
- **Playlist Management:** User-owned custom playlists supporting video addition, removal, and ownership isolation.
- **Channel Subscriptions:** Channel subscription tracking with real-time subscriber counts and subscription state checks.

### Creator Analytics & UI Controls
- **Creator Analytics Dashboard:** Real-time data visualization showing total views, engagement, top videos, and 30-day views-over-time trends.
- **Dark & Light Theme:** Context-driven theme manager with `localStorage` persistence defaulting to a dark mode aesthetic.

---

## Tech Stack

| Domain | Technologies / Libraries |
|---|---|
| **Frontend Framework** | React 19, Vite 8, React Router 7 |
| **Styling & Icons** | Tailwind CSS v4, Lucide React |
| **Data Visualization** | Recharts v3 |
| **Backend Runtime** | Node.js (>=18), Express 5 |
| **Database & ODM** | MongoDB Atlas, Mongoose 8 |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`), `cookie-parser`, `bcryptjs` |
| **Media & File Handling** | Cloudinary SDK, Multer |
| **Security & Utilities** | `express-rate-limit`, `dotenv`, Custom NoSQL Sanitizer & Security Headers |
| **Testing** | Jest 30, MongoMemoryServer, Supertest (Backend); Vitest 4, Testing Library (Frontend) |
| **Deployment & Hosting** | Vercel Serverless Functions (`vercel.json`) |

---

## Architecture & Data Flow

Vidyora adheres to a strict layered design pattern to ensure clear separation of concerns, testability, and security:

```
[ UI Component ] ──► [ React Context / Custom Hook ] ──► [ Axios Service ]
                                                               │ (HTTP-Only Cookie)
                                                               ▼
[ MongoDB Atlas ] ◄── [ Mongoose Model ] ◄── [ Express Controller ] ◄── [ Auth Middleware / Router ]
```

### Layer Responsibilities
1. **Context & Custom Hooks (`client/src/Context`, `client/src/Hooks`):** Manages application state (Auth, Theme, Playlists, Likes, Subscriptions) and exposes clean interfaces to React components.
2. **Services (`client/src/Services`):** Centralized Axios configuration (`api.js`) with `withCredentials: true` handling API calls.
3. **Middleware (`server/middleware`):** Validates authentication cookies, enforces rate limits, handles file uploads, and sanitizes input data.
4. **Controllers (`server/controllers`):** Executes business logic, authorizes resource ownership, and structures response objects.
5. **Models (`server/models`):** Defines Mongoose schemas, field validations, and compound database indexes.

---

## Project Structure

```text
vidyora/
├── api/
│   └── index.js                 # Vercel Serverless entry point
├── client/
│   ├── public/                  # Static assets and icons
│   ├── src/
│   │   ├── assets/              # SVGs and images
│   │   ├── Components/          # Reusable UI components (Navbar, VideoPlayer, Analytics, etc.)
│   │   ├── Context/             # AuthContext, ThemeContext, etc.
│   │   ├── Data/                # Helper utilities
│   │   ├── Hooks/               # Custom React hooks (useAuth, usePaginatedVideos, etc.)
│   │   ├── Services/            # Axios API services (api.js, analyticsService.js, etc.)
│   │   ├── Utils/               # Data mappers
│   │   ├── pages/               # Route screens (Home, WatchVideo, Dashboard, Profile, etc.)
│   │   ├── __tests__/           # Vitest frontend unit tests
│   │   ├── App.jsx              # Main React router container
│   │   └── main.jsx             # React DOM entry point
│   ├── package.json
│   ├── tailwind.config.js / Vite
│   └── vercel.json              # Client SPA rewrite rules
├── server/
│   ├── config/                  # Database (db.js) and Cloudinary setup
│   ├── controllers/             # Express handlers (auth, video, analytics, etc.)
│   ├── middleware/              # Auth, upload, rateLimit, security middleware
│   ├── models/                  # Mongoose models (User, Video, ViewEvent, Like, etc.)
│   ├── routes/                  # Express router definitions
│   ├── seed/                    # Database seeding scripts
│   ├── tests/                   # Jest integration & unit test suites (122 tests)
│   ├── jest.config.js
│   ├── package.json
│   └── server.js                # Express app configuration & server entry point
├── README.md
└── vercel.json                  # Root Vercel deployment routing
```

---

## Environment Variables

### Server (`server/.env`)

Create a `.env` file inside the `server/` directory:

```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_jwt_secret_key_at_least_32_chars
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
NODE_ENV=development

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Client (`client/.env`)

Create a `.env` file inside the `client/` directory:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

---

## Local Setup & Installation

### Prerequisites
- **Node.js:** v18.0.0 or higher
- **MongoDB:** Local MongoDB instance or MongoDB Atlas URI
- **Cloudinary Account:** For video and thumbnail media storage

### 1. Clone the Repository
```bash
git clone https://github.com/Aabhas117/Vidyora-.git
cd Vidyora-
```

### 2. Install Server Dependencies & Start Backend
```bash
cd server
npm install
# Configure server/.env before starting
npm run dev
```
The server will start on `http://localhost:8000`.

### 3. Install Client Dependencies & Start Frontend
In a new terminal window:
```bash
cd client
npm install
# Configure client/.env before starting
npm run dev
```
The client will start on `http://localhost:5173`.

---

## Testing

Vidyora maintains high code quality with automated test suites verifying API security, data isolation, and business logic.

### Backend Test Suite (Jest + MongoMemoryServer)
The backend test suite runs against an **isolated in-memory MongoDB instance** (`mongodb-memory-server`), ensuring zero impact on production data.

- **Verified Test Status:** 8 Test Suites Passed | **122 Tests Passed**
- **Test Coverage:** Authentication, Video CRUD, Comments, Playlists, History, Likes, Subscriptions, Pagination/Search, and DB Integrity.

To execute backend tests:
```bash
cd server
npm test
```

### Frontend Test Suite (Vitest + React Testing Library)
To execute frontend tests:
```bash
cd client
npm test
```

---

## Creator Analytics Architecture

The Creator Analytics Dashboard provides creators with actionable channel metrics computed via optimized MongoDB aggregation pipelines:

```
                  ┌────────────────────────┐
                  │ ViewEvent (Time-Series) │
                  └───────────┬────────────┘
                              │ $match & $group
                              ▼
┌──────────────────┐    ┌──────────────────────────┐    ┌───────────────────┐
│ Overview Metrics │ ◄──┤ Aggregation Controller  ├──► │ Views Over Time   │
└──────────────────┘    └───────────┬──────────────┘    └───────────────────┘
                                    │
                                    ▼
                        ┌──────────────────────────┐
                        │ Top 10 Videos by Metric  │
                        └──────────────────────────└
```

1. **Overview Metrics (`GET /api/v1/analytics/overview`):** Calculates total views by summing denormalized `Video.views`, alongside total likes, total comments, and total subscribers for the authenticated creator.
2. **Views Over Time (`GET /api/v1/analytics/views-over-time?days=30`):** Groups `ViewEvent` records by day (`$dateToString`) over a bounded 30-day window and pads missing dates with `0` for consistent charting.
3. **Top Videos (`GET /api/v1/analytics/top-videos?sort=views`):** Performs parallel aggregation across `Like` and `Comment` collections to compute per-video engagement metrics and ranks the creator's top 10 videos.
4. **Subscriber Growth (`GET /api/v1/analytics/subscriber-growth`):** Aggregates subscriber acquisitions over time to display channel growth.

---

## API Overview

All backend API endpoints are versioned under `/api/v1`:

### Auth (`/api/v1/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/register` | Register a new user account | No |
| `POST` | `/login` | Authenticate user & set HTTP-only cookie | No |
| `POST` | `/logout` | Clear authentication cookie | Yes |
| `GET` | `/me` | Fetch current user profile | Optional |
| `PATCH` | `/me` | Update avatar & user profile details | Yes |

### Videos (`/api/v1/videos`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/` | Get paginated & searchable videos list | No |
| `GET` | `/my` | Get videos uploaded by authenticated user | Yes |
| `GET` | `/:id` | Get single video details | Optional |
| `POST` | `/` | Upload new video & thumbnail to Cloudinary | Yes |
| `POST` | `/:id/view` | Register atomic video view & ViewEvent log | Optional |
| `PATCH` | `/:id` | Update video details or thumbnail | Yes |
| `DELETE` | `/:id` | Delete video & remove document | Yes |

### Likes (`/api/v1/likes`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/` | Fetch user's liked videos | Yes |
| `GET` | `/:videoId` | Check like status for a video | Yes |
| `POST` | `/:videoId` | Like a video | Yes |
| `DELETE` | `/:videoId` | Unlike a video | Yes |

### Comments (`/api/v1/comments`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/:videoId` | Get top-level & nested comments for video | No |
| `POST` | `/:videoId` | Post comment or reply to parent comment | Yes |
| `PATCH` | `/:commentId` | Edit comment content | Yes |
| `DELETE` | `/:commentId` | Delete comment & cascade delete child replies | Yes |

### History (`/api/v1/history`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/` | Fetch watch history (sorted newest-first) | Yes |
| `POST` | `/:videoId` | Add/upsert video into watch history | Yes |
| `DELETE` | `/:videoId` | Remove single video from history | Yes |
| `DELETE` | `/` | Clear entire watch history | Yes |

### Playlists (`/api/v1/playlists`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/` | Create a new playlist | Yes |
| `GET` | `/` | Fetch user's playlists | Yes |
| `GET` | `/:playlistId` | Get playlist details & video list | Yes |
| `PATCH` | `/:playlistId` | Update playlist title/description | Yes |
| `DELETE` | `/:playlistId` | Delete playlist | Yes |
| `POST` | `/:playlistId/videos/:videoId` | Add video to playlist | Yes |
| `DELETE` | `/:playlistId/videos/:videoId` | Remove video from playlist | Yes |

### Subscriptions (`/api/v1/subscriptions`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/` | Get subscribed channels list | Yes |
| `GET` | `/:channelId/status` | Check subscription status for channel | Yes |
| `GET` | `/channel/:channelId/count` | Get total subscriber count for channel | Yes |
| `POST` | `/:channelId` | Subscribe to channel | Yes |
| `DELETE` | `/:channelId` | Unsubscribe from channel | Yes |

### Analytics (`/api/v1/analytics`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/overview` | Fetch total views, likes, comments, subscribers | Yes |
| `GET` | `/views-over-time` | Fetch 30-day time-series views data | Yes |
| `GET` | `/top-videos` | Fetch top 10 creator videos ranked by metric | Yes |
| `GET` | `/subscriber-growth` | Fetch 30-day new subscriber growth data | Yes |

---

## Engineering Challenges Solved

1. **Serverless Mongoose Connection Reuse & DNS Resolution:**
   - *Problem:* In serverless environments like Vercel, traditional database connection logic opens new database connections per request, causing pool exhaustion and connection timeouts. Additionally, custom DNS resolution failures occur in restricted runtime containers.
   - *Solution:* Implemented global connection promise caching in `server/config/db.js` (`cached.conn`) and added safe fallback DNS resolver handling (`dns.setServers(["1.1.1.1", "8.8.8.8"])`) guarded by `!process.env.VERCEL`.

2. **Data Integrity & Double-Submission Prevention:**
   - *Problem:* Concurrent client requests could create duplicate likes, subscriptions, or history records for the same user-resource pair.
   - *Solution:* Enforced compound unique indexes in Mongoose schemas (`{ user: 1, video: 1 }` for Likes/History and `{ user: 1, channel: 1 }` for Subscriptions). API controllers catch index conflict errors (`E11000`) and return clean HTTP `409 Conflict` status codes.

3. **Asynchronous Non-Blocking View Analytics:**
   - *Problem:* Writing time-series analytics events synchronously during video retrieval increases API response latency.
   - *Solution:* Combined fast atomic counter updates (`$inc: { views: 1 }`) with non-blocking, detached `ViewEvent.create()` promises. View events log asynchronously without delaying client HTTP responses.

4. **Recursive NoSQL Injection Defense:**
   - *Problem:* Attackers can bypass authentication or query filters by passing MongoDB operator objects (`{ "$gt": "" }`) inside JSON payloads.
   - *Solution:* Engineered a custom NoSQL sanitization middleware (`server/middleware/security.middleware.js`) that recursively scans and strips keys containing `$` or `.` from `req.body`, `req.query`, and `req.params`.

---

## Portfolio Highlights

Unlike simple tutorial CRUD projects, Vidyora demonstrates production-ready full-stack software engineering principles:

- **Security-First Architecture:** Implements HTTP-only authentication cookies, rate limiting, and NoSQL query sanitization.
- **Data Isolation & Multi-Tenancy:** 100% of user data operations (history, likes, playlists, analytics) are strictly authorized and isolated by `req.user._id`.
- **Advanced Aggregation Pipelines:** Uses MongoDB aggregation (`$match`, `$group`, `$sort`, `$dateToString`) for performant analytics queries.
- **Comprehensive Test Suite:** Includes 122 passing integration and unit tests covering edge cases, authorization checks, and data integrity constraints.

---

## Future Improvements

- [ ] **Real-Time Notifications:** Push notifications for new video uploads, comments, and subscriber milestones via WebSockets / Server-Sent Events.
- [ ] **Adaptive Bitrate Streaming (HLS):** Automatic video transcoding into HLS / DASH formats for adaptive resolution playback.
- [ ] **Search Autocomplete:** Real-time search suggestions powered by MongoDB Atlas Search index.
- [ ] **Drag-and-Drop Playlist Reordering:** Interactive playlist video reordering on the client.

---

## License

This project is open-source and available under the [ISC License](LICENSE).