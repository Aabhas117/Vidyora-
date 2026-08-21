import api from "./api";
import { mapVideo, mapVideos } from "../Utils/videoMapper";

// Get all videos
export const getVideos = async () => {
  const res = await api.get("/videos");

  return mapVideos(res.data.videos || res.data);
};

// Get videos uploaded by the authenticated user
export const getMyVideos = async () => {
  const res = await api.get("/videos/my");

  return mapVideos(res.data.videos || res.data);
};

// Get one video
export const getVideoById = async (id) => {
  const res = await api.get(`/videos/${id}`);

  return mapVideo(res.data.video || res.data);
};
