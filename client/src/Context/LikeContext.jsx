import { createContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "../Hooks/useAuth";
import { loadLikes, likeVideoOnServer, unlikeVideoOnServer } from "../Services/likeService";

export const LikeContext = createContext(null);

export function LikeProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [likedVideos, setLikedVideos] = useState([]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadLikes(user._id).then(setLikedVideos);
    } else {
      setLikedVideos([]);
    }
  }, [isAuthenticated, user]);

  const isLiked = useCallback(
    (videoId) => likedVideos.some((v) => v.id === videoId),
    [likedVideos]
  );

  const toggleLike = useCallback(
    (video) => {
      if (!isAuthenticated || !user) return false;

      const alreadyLiked = likedVideos.some((v) => v.id === video.id);

      // Optimistic update — reflect the change immediately, then sync
      // with the server; roll back only if the request actually fails.
      setLikedVideos((prev) =>
        alreadyLiked
          ? prev.filter((v) => v.id !== video.id)
          : [{ ...video, likedAt: new Date().toISOString() }, ...prev]
      );

      const request = alreadyLiked
        ? unlikeVideoOnServer(video.id)
        : likeVideoOnServer(video.id);

      request.catch(() => {
        // Roll back on failure.
        setLikedVideos((prev) =>
          alreadyLiked
            ? [{ ...video, likedAt: new Date().toISOString() }, ...prev]
            : prev.filter((v) => v.id !== video.id)
        );
      });

      return true;
    },
    [isAuthenticated, user, likedVideos]
  );

  const removeLike = useCallback(
    (videoId) => {
      if (!user) return;
      setLikedVideos((prev) => prev.filter((v) => v.id !== videoId));
      unlikeVideoOnServer(videoId).catch(() => {
        // If this fails, a refresh will re-sync from the server anyway.
      });
    },
    [user]
  );

  const clearLikedVideos = useCallback(() => {
    if (!user) return;
    const previous = likedVideos;
    setLikedVideos([]);
    Promise.all(previous.map((v) => unlikeVideoOnServer(v.id))).catch(() => {
      // Best effort — a refresh will re-sync from the server if some calls failed.
    });
  }, [user, likedVideos]);

  const value = { likedVideos, isLiked, toggleLike, removeLike, clearLikedVideos };

  return <LikeContext.Provider value={value}>{children}</LikeContext.Provider>;
}