import api from "./api";
import { mapVideo } from "../Utils/videoMapper";

/**
 * Real backend-backed history persistence.
 *
 * HistoryContext.jsx calls these with the same names/signatures as the
 * mock versions, so this is the only file that needed to change to move
 * off localStorage.
 */

export async function loadHistory(_userId) {
  try {
    const res = await api.get("/history");
    // Backend returns join-records: { _id, video: {...}, watchedAt }.
    // Flatten to the flat video-shaped objects History.jsx expects.
    return res.data.history.map((entry) => ({
      ...mapVideo(entry.video),
      watchedAt: entry.watchedAt,
    }));
  } catch {
    return [];
  }
}

export async function pushToHistory(videoId) {
  await api.post(`/history/${videoId}`);
}

export async function removeHistoryEntry(videoId) {
  await api.delete(`/history/${videoId}`);
}

export async function clearAllHistory() {
  await api.delete("/history");
}