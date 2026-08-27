import api from "./api";
import { mapVideo } from "../Utils/videoMapper";

export async function getVideos() {
  const res = await api.get("/videos");

  const videos = Array.isArray(res.data) ? res.data : res.data.videos || [];

  return videos.map(mapVideo);
}

export async function getMyVideos() {
  const res = await api.get("/videos/my");

  const videos = Array.isArray(res.data) ? res.data : res.data.videos || [];

  return videos.map(mapVideo);
}

export async function getVideoById(id) {
  const res = await api.get(`/videos/${id}`);

  const video = res.data.video || res.data;

  return mapVideo(video);
}

export async function registerView(id) {
  await api.post(`/videos/${id}/view`);
}

export async function updateVideoOnServer(id, updates) {
  const formData = new FormData();

  if (updates.title !== undefined) {
    formData.append("title", updates.title);
  }

  if (updates.description !== undefined) {
    formData.append("description", updates.description);
  }

  if (updates.category !== undefined) {
    formData.append("category", updates.category);
  }

  if (updates.thumbnailFile) {
    formData.append("thumbnail", updates.thumbnailFile);
  }

  const res = await api.patch(`/videos/${id}`, formData, {
    headers: {
      "Content-Type": undefined,
    },
  });

  return mapVideo(res.data.video);
}

export async function deleteVideoOnServer(id) {
  await api.delete(`/videos/${id}`);
}
