import api from "./api";
import { mapVideo, mapVideos } from "../Utils/videoMapper";

export async function getVideos() {
  const res = await api.get("/videos");
  return mapVideos(res.data.videos);
}

export async function getVideoById(id) {
  const res = await api.get(`/videos/${id}`);
  return mapVideo(res.data.video);
}