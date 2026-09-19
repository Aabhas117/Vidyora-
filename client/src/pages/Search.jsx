import { useSearchParams } from "react-router-dom";
import { usePaginatedVideos } from "../Hooks/usePaginatedVideos";
import VideoGrid from "../Components/VideoGrid";

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const trimmedQuery = query.trim();

  const { videos, loading, loadingMore, error, hasMore, loadMore } = usePaginatedVideos({
    search: trimmedQuery,
    limit: 12,
  });

  if (!trimmedQuery) {
    return (
      <div className="text-center py-16">
        <p className="text-zinc-300 font-medium">Search Vidyora</p>
        <p className="text-sm text-zinc-500 mt-1">Type something into the search bar above.</p>
      </div>
    );
  }

  if (loading) return <p className="text-sm text-zinc-500 text-center py-16">Loading videos...</p>;
  if (error) return <p className="text-sm text-zinc-500 text-center py-16">Couldn't load videos.</p>;

  return (
    <div>
      <h1 className="text-lg font-semibold text-zinc-100 mb-6">
        Search results for <span className="text-violet-400">"{query}"</span>
      </h1>
      {videos.length > 0 ? (
        <>
          <VideoGrid videos={videos} />
          {hasMore && (
            <div className="flex justify-center mt-10">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-6 py-2.5 rounded-full bg-zinc-800 border border-zinc-700 text-sm font-medium text-zinc-200 hover:bg-zinc-700 hover:border-zinc-600 transition-colors disabled:opacity-50"
              >
                {loadingMore ? "Loading more..." : "Load more"}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <p className="text-zinc-300 font-medium">No videos found</p>
          <p className="text-sm text-zinc-500 mt-1">Try a different search term.</p>
        </div>
      )}
    </div>
  );
}