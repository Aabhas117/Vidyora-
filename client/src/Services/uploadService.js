/**
 * MOCK upload service — no backend yet.
 *
 * Later this becomes:
 *   const formData = new FormData();
 *   formData.append("video", videoFile);
 *   formData.append("thumbnail", thumbnailFile);
 *   formData.append("title", title);
 *   ...
 *   const res = await axios.post("/api/v1/videos", formData, {
 *     headers: { "Content-Type": "multipart/form-data" },
 *     onUploadProgress: (e) => onProgress(Math.round((e.loaded / e.total) * 100)),
 *   });
 *   return res.data.video;
 *
 * UpLoadVideo.jsx never needs to change when that happens — it only calls
 * uploadVideo(payload, onProgress) and reacts to success/failure.
 */
export function uploadVideo({ videoFile, thumbnailFile, title, description, category, visibility }, onProgress) {
  return new Promise((resolve, reject) => {
    if (!videoFile || !thumbnailFile) {
      reject(new Error("Video and thumbnail are required."));
      return;
    }

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20 + 10;
      if (progress >= 100) {
        progress = 100;
        onProgress(progress);
        clearInterval(interval);

        setTimeout(() => {
          resolve({
            id: Date.now(),
            title,
            description,
            category,
            visibility,
            thumbnail: URL.createObjectURL(thumbnailFile),
            videoUrl: URL.createObjectURL(videoFile),
          });
        }, 400);
      } else {
        onProgress(Math.round(progress));
      }
    }, 300);
  });
}