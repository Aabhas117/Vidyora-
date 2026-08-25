import { createContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "../Hooks/useAuth";
import {
  getPlaylists,
  createPlaylistOnServer,
  renamePlaylistOnServer,
  deletePlaylistOnServer,
  addVideoToPlaylistOnServer,
  removeVideoFromPlaylistOnServer,
} from "../Services/playlistService";

export const PlaylistContext = createContext(null);

export function PlaylistProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    if (isAuthenticated && user) {
      getPlaylists().then(setPlaylists).catch(() => setPlaylists([]));
    } else {
      setPlaylists([]);
    }
  }, [isAuthenticated, user]);

  const createPlaylist = useCallback(
    async (name, description = "") => {
      if (!user || !name?.trim()) return null;
      const newPlaylist = await createPlaylistOnServer(name.trim(), description.trim());
      setPlaylists((prev) => [newPlaylist, ...prev]);
      return newPlaylist;
    },
    [user]
  );

  const deletePlaylist = useCallback(
    async (playlistId) => {
      if (!user) return;
      const previous = playlists;
      setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
      try {
        await deletePlaylistOnServer(playlistId);
      } catch {
        setPlaylists(previous); // roll back on failure
      }
    },
    [user, playlists]
  );

  const renamePlaylist = useCallback(
    async (playlistId, name, description) => {
      if (!user || !name?.trim()) return;
      const updated = await renamePlaylistOnServer(playlistId, name.trim(), description);
      setPlaylists((prev) => prev.map((p) => (p.id === playlistId ? updated : p)));
    },
    [user]
  );

  const addVideoToPlaylist = useCallback(
    async (playlistId, video) => {
      if (!user) return;
      try {
        const updated = await addVideoToPlaylistOnServer(playlistId, video.id);
        setPlaylists((prev) => prev.map((p) => (p.id === playlistId ? updated : p)));
      } catch {
        // 409 (already in playlist) or other failure — leave state as-is,
        // caller (AddToPlaylistButton) can decide how to surface this.
      }
    },
    [user]
  );

  const removeVideoFromPlaylist = useCallback(
    async (playlistId, videoId) => {
      if (!user) return;
      const updated = await removeVideoFromPlaylistOnServer(playlistId, videoId);
      setPlaylists((prev) => prev.map((p) => (p.id === playlistId ? updated : p)));
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
    (playlistId) => playlists.find((p) => p.id === playlistId) || null,
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