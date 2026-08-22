import api from "./api";
import { mapVideo } from "../Utils/videoMapper";

/**
 * Real backend-backed like persistence.
 *
 * LikeContext.jsx calls these exactly as it did the mock versions —
 * loadLikes(userId), saveLikes(userId, likedVideos) — so nothing above
 * this file needs to change. The `userId` parameter is now unused (the
 * backend identifies the user via the auth cookie, not a client-passed
 * ID), but kept in the signature so the call sites don't need editing.
 */

export async function loadLikes(_userId) {
  try {
    const res = await api.get("/likes");
    // Backend returns join-records: { _id, video: {...}, createdAt }.
    // Flatten to the flat video-shaped objects LikeContext/LikedVideos expect.
    return res.data.likes.map((entry) => ({
      ...mapVideo(entry.video),
      likedAt: entry.createdAt,
    }));
  } catch {
    return [];
  }
}

export async function saveLikes(_userId, _likedVideos) {
  // No-op: the backend is now the source of truth, updated directly by
  // likeVideoOnServer/unlikeVideoOnServer below, not by re-saving a full
  // list. Kept as a no-op so LikeContext's existing calls don't error.
}

export async function likeVideoOnServer(videoId) {
  await api.post(`/likes/${videoId}`);
}

export async function unlikeVideoOnServer(videoId) {
  await api.delete(`/likes/${videoId}`);
}