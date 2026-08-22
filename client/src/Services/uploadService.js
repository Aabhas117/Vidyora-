import api from "./api";
import { mapVideo } from "../Utils/videoMapper";

/**
 * Uploads a video to the real backend.
 *
 * POST /api/v1/videos (multipart/form-data)
 * Fields: title, description, category (text) + video, thumbnail (files)
 *
 * Do NOT set Content-Type manually — the browser generates the correct
 * multipart boundary automatically when FormData is passed as the body.
 */
export async function uploadVideo(
  { videoFile, thumbnailFile, title, description, category },
  onProgress,
) {
  if (!videoFile || !thumbnailFile) {
    throw new Error("Video and thumbnail are required.");
  }

  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", description || "");
  formData.append("category", category);
  formData.append("video", videoFile);
  formData.append("thumbnail", thumbnailFile);

  const res = await api.post("/videos", formData, {
    headers: { "Content-Type": undefined },
    onUploadProgress: (event) => {
      if (event.total && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    },
  });

  return mapVideo(res.data.video);
}
