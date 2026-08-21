import { createContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "../Hooks/useAuth";
import { loadUserVideos, saveUserVideos } from "../Services/userVideoService";

export const UserVideoContext = createContext(null);

export function UserVideoProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [userVideos, setUserVideos] = useState([]);

  useEffect(() => {
    if (isAuthenticated && user) {
      setUserVideos(loadUserVideos(user._id));
    } else {
      setUserVideos([]);
    }
  }, [isAuthenticated, user]);

  const addUserVideo = useCallback(
    (video) => {
      if (!user) return;
      setUserVideos((prev) => {
        const next = [video, ...prev];
        saveUserVideos(user._id, next);
        return next;
      });
    },
    [user]
  );

  const updateUserVideo = useCallback(
    (videoId, patch) => {
      if (!user) return;
      setUserVideos((prev) => {
        const next = prev.map((v) => (v.id === videoId ? { ...v, ...patch } : v));
        saveUserVideos(user._id, next);
        return next;
      });
    },
    [user]
  );

  const deleteUserVideo = useCallback(
    (videoId) => {
      if (!user) return;
      setUserVideos((prev) => {
        const next = prev.filter((v) => v.id !== videoId);
        saveUserVideos(user._id, next);
        return next;
      });
    },
    [user]
  );

  const value = { userVideos, addUserVideo, updateUserVideo, deleteUserVideo };

  return <UserVideoContext.Provider value={value}>{children}</UserVideoContext.Provider>;
}