/**
 * MOCK history persistence — localStorage only, no backend yet.
 *
 * Later this becomes:
 *   export async function loadHistory() {
 *     const res = await axios.get("/api/v1/history");
 *     return res.data.history;
 *   }
 *   export async function pushToHistory(video) {
 *     await axios.post("/api/v1/history", { videoId: video.id });
 *   }
 *   export async function removeHistoryEntry(videoId) {
 *     await axios.delete(`/api/v1/history/${videoId}`);
 *   }
 *   export async function clearAllHistory() {
 *     await axios.delete("/api/v1/history");
 *   }
 *
 * HistoryContext.jsx never needs to change when that happens — it only
 * calls these four functions and updates its own state with the result.
 */
const STORAGE_PREFIX = "vidyora_history_";

function getKey(userId) {
  return `${STORAGE_PREFIX}${userId}`;
}

export function loadHistory(userId) {
  if (!userId) return [];
  try {
    return JSON.parse(localStorage.getItem(getKey(userId))) || [];
  } catch {
    return [];
  }
}

export function saveHistory(userId, history) {
  if (!userId) return;
  localStorage.setItem(getKey(userId), JSON.stringify(history));
}