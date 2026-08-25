import api from "./api";
import { mapVideo } from "../Utils/videoMapper";

function mapPlaylist(backendPlaylist) {
  return {
    id: backendPlaylist._id,
    name: backendPlaylist.name,
    description: backendPlaylist.description || "",
    ownerId: backendPlaylist.owner,
    videos: (backendPlaylist.videos || []).map((v) =>
      // videos may arrive populated (objects) or as raw IDs, depending on endpoint
      typeof v === "object" ? mapVideo(v) : { id: v }
    ),
    createdAt: backendPlaylist.createdAt,
    updatedAt: backendPlaylist.updatedAt,
  };
}

export async function getPlaylists() {
  const res = await api.get("/playlists");
  return res.data.playlists.map(mapPlaylist);
}

export async function getPlaylistById(playlistId) {
  const res = await api.get(`/playlists/${playlistId}`);
  return mapPlaylist(res.data.playlist);
}

export async function createPlaylistOnServer(name, description) {
  const res = await api.post("/playlists", { name, description });
  return mapPlaylist(res.data.playlist);
}

export async function renamePlaylistOnServer(playlistId, name, description) {
  const res = await api.patch(`/playlists/${playlistId}`, { name, description });
  return mapPlaylist(res.data.playlist);
}

export async function deletePlaylistOnServer(playlistId) {
  await api.delete(`/playlists/${playlistId}`);
}

export async function addVideoToPlaylistOnServer(playlistId, videoId) {
  const res = await api.post(`/playlists/${playlistId}/videos/${videoId}`);
  return mapPlaylist(res.data.playlist);
}

export async function removeVideoFromPlaylistOnServer(playlistId, videoId) {
  const res = await api.delete(`/playlists/${playlistId}/videos/${videoId}`);
  return mapPlaylist(res.data.playlist);
}