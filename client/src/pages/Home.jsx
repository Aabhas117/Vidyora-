import { usePaginatedVideos } from "../Hooks/usePaginatedVideos";
import VideoGrid from "../Components/VideoGrid";

export default function Home() {
  const { videos, loading, loadingMore, error, hasMore, loadMore } = usePaginatedVideos({ limit: 12 });

  if (loading) {
    return <p className="text-sm text-zinc-500 text-center py-16">Loading videos...</p>;
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-zinc-300 font-medium">Couldn't load videos</p>
        <p className="text-sm text-zinc-500 mt-1">Check that the backend is running and try again.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-zinc-100 mb-6">Recommended Videos</h1>
      {videos.length === 0 ? (
        <p className="text-sm text-zinc-500 text-center py-16">No videos yet.</p>
      ) : (
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
      )}
    </div>
  );
}