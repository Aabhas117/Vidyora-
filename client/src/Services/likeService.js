/**
 * MOCK like persistence — localStorage only, no backend yet.
 *
 * Later this becomes:
 *   export async function loadLikes() {
 *     const res = await axios.get("/api/v1/likes");
 *     return res.data.likedVideos;
 *   }
 *   export async function likeVideo(videoId) {
 *     await axios.post(`/api/v1/likes/${videoId}`);
 *   }
 *   export async function unlikeVideo(videoId) {
 *     await axios.delete(`/api/v1/likes/${videoId}`);
 *   }
 *
 * LikeContext.jsx never needs to change when that happens — it only calls
 * these functions and updates its own state with the result.
 */
const STORAGE_PREFIX = "vidyora_liked_";

function getKey(userId) {
  return `${STORAGE_PREFIX}${userId}`;
}

export function loadLikes(userId) {
  if (!userId) return [];
  try {
    return JSON.parse(localStorage.getItem(getKey(userId))) || [];
  } catch {
    return [];
  }
}

export function saveLikes(userId, likedVideos) {
  if (!userId) return;
  localStorage.setItem(getKey(userId), JSON.stringify(likedVideos));
}