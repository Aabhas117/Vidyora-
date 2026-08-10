import { createContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "../Hooks/useAuth";
import { loadLikes, saveLikes } from "../Services/likeService";
export const LikeContext = createContext(null);

export function LikeProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [likedVideos, setLikedVideos] = useState([]);

  // Reload liked videos whenever who's logged in changes.
  useEffect(() => {
    if (isAuthenticated && user) {
      setLikedVideos(loadLikes(user.id));
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
      if (!isAuthenticated || !user) return false; // caller decides what to do (e.g. redirect to /login)

      setLikedVideos((prev) => {
        const alreadyLiked = prev.some((v) => v.id === video.id);
        const next = alreadyLiked
          ? prev.filter((v) => v.id !== video.id) // unlike
          : [{ ...video, likedAt: new Date().toISOString() }, ...prev]; // like — prepend, no duplicate possible since we just filtered it out
        saveLikes(user.id, next);
        return next;
      });
      return true;
    },
    [isAuthenticated, user]
  );

  const removeLike = useCallback(
    (videoId) => {
      if (!user) return;
      setLikedVideos((prev) => {
        const next = prev.filter((v) => v.id !== videoId);
        saveLikes(user.id, next);
        return next;
      });
    },
    [user]
  );

  const clearLikedVideos = useCallback(() => {
    if (!user) return;
    setLikedVideos([]);
    saveLikes(user.id, []);
  }, [user]);

  const value = { likedVideos, isLiked, toggleLike, removeLike, clearLikedVideos };

  return <LikeContext.Provider value={value}>{children}</LikeContext.Provider>;
}