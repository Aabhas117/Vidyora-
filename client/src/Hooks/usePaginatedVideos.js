import { useState, useEffect, useCallback, useRef } from "react";
import { getVideos } from "../Services/videoService";

export function usePaginatedVideos({ search = "", sort = "", limit = 10 } = {}) {
  const [videos, setVideos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);

  // Keep track of search/sort/limit to handle effect cleanups cleanly
  const prevParamsRef = useRef({ search, sort, limit });

  const fetchPage1 = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await getVideos({ page: 1, limit, search, sort });
      setVideos(res.videos || []);
      setCurrentPage(res.currentPage || 1);
      setTotalPages(res.totalPages ?? 1);
      setTotalCount(res.totalCount ?? (res.videos?.length || 0));
    } catch (err) {
      console.error("Failed to load videos:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [search, sort, limit]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    getVideos({ page: 1, limit, search, sort })
      .then((res) => {
        if (!cancelled) {
          setVideos(res.videos || []);
          setCurrentPage(res.currentPage || 1);
          setTotalPages(res.totalPages ?? 1);
          setTotalCount(res.totalCount ?? (res.videos?.length || 0));
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("usePaginatedVideos error:", err);
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [search, sort, limit]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || currentPage >= totalPages) return;

    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const res = await getVideos({ page: nextPage, limit, search, sort });

      setVideos((prev) => {
        const existingIds = new Set(prev.map((v) => v.id));
        const newUnique = (res.videos || []).filter((v) => !existingIds.has(v.id));
        return [...prev, ...newUnique];
      });
      setCurrentPage(res.currentPage || nextPage);
      setTotalPages(res.totalPages ?? totalPages);
      setTotalCount(res.totalCount ?? totalCount);
    } catch (err) {
      console.error("Failed to load more videos:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [loading, loadingMore, currentPage, totalPages, limit, search, sort, totalCount]);

  const hasMore = currentPage < totalPages;

  return {
    videos,
    currentPage,
    totalPages,
    totalCount,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refresh: fetchPage1,
  };
}
