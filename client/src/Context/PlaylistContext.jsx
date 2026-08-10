import { createContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "../Hooks/useAuth";
import { loadPlaylists, savePlaylists } from "../Services/playlistService";

export const PlaylistContext = createContext(null);

const NAME_LIMIT = 60;
const DESCRIPTION_LIMIT = 200;

export function PlaylistProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    if (isAuthenticated && user) {
      setPlaylists(loadPlaylists(user.id));
    } else {
      setPlaylists([]);
    }
  }, [isAuthenticated, user]);

  const createPlaylist = useCallback(
    (name, description = "") => {
      if (!user || !name?.trim()) return null;
      const newPlaylist = {
        id: Date.now(),
        name: name.trim().slice(0, NAME_LIMIT),
        description: description.trim().slice(0, DESCRIPTION_LIMIT),
        ownerId: user.id,
        videos: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setPlaylists((prev) => {
        const next = [newPlaylist, ...prev];
        savePlaylists(user.id, next);
        return next;
      });
      return newPlaylist;
    },
    [user]
  );

  const deletePlaylist = useCallback(
    (playlistId) => {
      if (!user) return;
      setPlaylists((prev) => {
        const next = prev.filter((p) => p.id !== playlistId);
        savePlaylists(user.id, next);
        return next;
      });
    },
    [user]
  );

  const renamePlaylist = useCallback(
    (playlistId, name, description) => {
      if (!user || !name?.trim()) return;
      setPlaylists((prev) => {
        const next = prev.map((p) =>
          p.id === playlistId
            ? {
                ...p,
                name: name.trim().slice(0, NAME_LIMIT),
                description:
                  description !== undefined
                    ? description.trim().slice(0, DESCRIPTION_LIMIT)
                    : p.description,
                updatedAt: new Date().toISOString(),
              }
            : p
        );
        savePlaylists(user.id, next);
        return next;
      });
    },
    [user]
  );

  const addVideoToPlaylist = useCallback(
    (playlistId, video) => {
      if (!user) return;
      setPlaylists((prev) => {
        const next = prev.map((p) => {
          if (p.id !== playlistId) return p;
          const alreadyIn = p.videos.some((v) => v.id === video.id);
          if (alreadyIn) return p; // no duplicates
          return { ...p, videos: [video, ...p.videos], updatedAt: new Date().toISOString() };
        });
        savePlaylists(user.id, next);
        return next;
      });
    },
    [user]
  );

  const removeVideoFromPlaylist = useCallback(
    (playlistId, videoId) => {
      if (!user) return;
      setPlaylists((prev) => {
        const next = prev.map((p) =>
          p.id === playlistId
            ? { ...p, videos: p.videos.filter((v) => v.id !== videoId), updatedAt: new Date().toISOString() }
            : p
        );
        savePlaylists(user.id, next);
        return next;
      });
    },
    [user]
  );

  const isVideoInPlaylist = useCallback(
    (playlistId, videoId) => {
      const playlist = playlists.find((p) => p.id === playlistId);
      return playlist ? playlist.videos.some((v) => v.id === videoId) : false;
    },
    [playlists]
  );

  const getPlaylistById = useCallback(
    (playlistId) => playlists.find((p) => p.id === Number(playlistId)) || null,
    [playlists]
  );

  const value = {
    playlists,
    createPlaylist,
    deletePlaylist,
    renamePlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    isVideoInPlaylist,
    getPlaylistById,
  };

  return <PlaylistContext.Provider value={value}>{children}</PlaylistContext.Provider>;
}