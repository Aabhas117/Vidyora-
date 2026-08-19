# Vidyora

Vidyora is a full-stack video streaming and social platform built with React, Express, MongoDB, and Cloudinary.

## Features

- User registration, login, logout, and cookie-based authentication
- Browse, search, and watch videos
- Upload videos and thumbnails to Cloudinary
- Like and unlike videos
- Comments and one-level replies
- Watch history
- Playlists
- Channel subscriptions
- User profiles and uploaded-video management
- Responsive video browsing interface

## Technology Stack

### Client

- React 19
- Vite
- React Router
- Axios
- Tailwind CSS
- Lucide React icons

### Server

- Node.js
- Express 5
- MongoDB with Mongoose
- JSON Web Tokens stored in HTTP-only cookies
- Multer for temporary file uploads
- Cloudinary for video and image storage
- bcryptjs for password hashing

## Project Structure

```text
client/
client/src/Components/   Reusable UI components
client/src/Context/      Application state providers
client/src/Hooks/        Context hooks
client/src/pages/        Route-level screens
client/src/Services/     API and feature services
client/src/Utils/        Data mapping and helper functions
server/
server/config/           Database and Cloudinary configuration
server/controllers/      Request handlers
server/middleware/       Authentication and upload middleware
server/models/           Mongoose models
server/routes/           Express route definitions
server/seed/             Database seed scripts
server/server.js         Express application entry point
```

## Requirements

- Node.js 18 or newer
- A MongoDB database or MongoDB Atlas cluster
- A Cloudinary account for video uploads

## Installation

Clone the repository and install dependencies in both applications:

```bash
cd client
npm install

cd ../server
npm install
```

## Environment Variables

Create `server/.env`:

```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

Never commit real credentials or `.env` files.

## Running Locally

Start the backend from the `server` directory:

```bash
cd server
node server.js
```

Start the frontend in a second terminal:

```bash
cd client
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

The backend health endpoint is:

```text
http://localhost:8000/api/health
```

## Useful Client Commands

Run these commands from `client/`:

```bash
npm run dev       # Start the development server
npm run build     # Create a production build
npm run lint      # Run ESLint
npm run preview   # Preview the production build
```

## API Groups

The backend API is mounted under `/api/v1`:

| Group | Purpose |
| --- | --- |
| `/auth` | Register, login, logout, and current user |
| `/videos` | List, view, upload, edit, and delete videos |
| `/likes` | Like, unlike, list, and check video likes |
| `/comments` | Read, create, edit, and delete comments |
| `/history` | Add, list, remove, and clear watch history |
| `/playlists` | Create and manage playlists |
| `/subscriptions` | Subscribe, unsubscribe, and list subscriptions |

## Authentication

Authentication uses an HTTP-only `accessToken` cookie. The client Axios instance sends credentials with requests, and protected routes use the server authentication middleware.

## Troubleshooting

- If the client cannot load videos, confirm the backend is running on port `8000`.
- If login fails, check `MONGO_URI`, `JWT_SECRET`, and the browser cookie settings.
- If uploads fail, verify all Cloudinary variables and confirm the selected files meet the upload limits.
- If CORS errors appear, make sure `CLIENT_URL` matches the frontend URL exactly.

## License

This project is currently for learning and development purposes.
