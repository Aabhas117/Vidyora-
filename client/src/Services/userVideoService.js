/**
 * MOCK uploaded-video persistence — localStorage only, no backend yet.
 *
 * Later this becomes:
 *   GET    /api/v1/users/me/videos
 *   POST   /api/v1/videos          (Multer + Cloudinary handle the file)
 *   PATCH  /api/v1/videos/:id
 *   DELETE /api/v1/videos/:id
 *
 * UserVideoContext.jsx never needs to change when that happens.
 */
const STORAGE_PREFIX = "vidyora_uploads_";

function getKey(userId) {
  return `${STORAGE_PREFIX}${userId}`;
}

export function loadUserVideos(userId) {
  if (!userId) return [];
  try {
    return JSON.parse(localStorage.getItem(getKey(userId))) || [];
  } catch {
    return [];
  }
}

export function saveUserVideos(userId, videos) {
  if (!userId) return;
  localStorage.setItem(getKey(userId), JSON.stringify(videos));
}