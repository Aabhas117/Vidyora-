import { getVideos } from "./videoService";

/**
 * Real backend search service.
 * Performs MongoDB text search ($text) via GET /api/v1/videos?search=query
 */
export async function searchVideos(query, page = 1, limit = 10) {
  const term = typeof query === "string" ? query.trim() : "";
  if (!term) {
    return { videos: [], totalPages: 0, currentPage: 1, totalCount: 0 };
  }

  return await getVideos({ search: term, page, limit });
}