/**
 * MOCK playlist persistence — localStorage only, no backend yet.
 *
 * Later this becomes:
 *   GET    /api/v1/playlists
 *   POST   /api/v1/playlists
 *   DELETE /api/v1/playlists/:id
 *   POST   /api/v1/playlists/:id/videos
 *   DELETE /api/v1/playlists/:id/videos/:videoId
 *
 * PlaylistContext.jsx never needs to change when that happens — it only
 * calls loadPlaylists/savePlaylists and updates its own state.
 */
const STORAGE_PREFIX = "vidyora_playlists_";

function getKey(userId) {
  return `${STORAGE_PREFIX}${userId}`;
}

export function loadPlaylists(userId) {
  if (!userId) return [];
  try {
    return JSON.parse(localStorage.getItem(getKey(userId))) || [];
  } catch {
    return [];
  }
}

export function savePlaylists(userId, playlists) {
  if (!userId) return;
  localStorage.setItem(getKey(userId), JSON.stringify(playlists));
}