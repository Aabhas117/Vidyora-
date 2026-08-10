import videos from "../Data/videos";

/**
 * MOCK search service.
 *
 * Later this becomes:
 *   export async function searchVideos(query) {
 *     const res = await axios.get("/api/v1/videos", { params: { search: query } });
 *     return res.data.videos;
 *   }
 *
 * Search.jsx never needs to change when that happens — it only calls
 * searchVideos(query) and renders whatever array comes back, exactly
 * like it does now.
 */
export function searchVideos(query) {
  const term = query.trim().toLowerCase();
  if (!term) return [];

  return videos.filter((video) => {
    return (
      video.title.toLowerCase().includes(term) ||
      video.channel.toLowerCase().includes(term) ||
      video.description.toLowerCase().includes(term) ||
      video.category.toLowerCase().includes(term)
    );
  });
}