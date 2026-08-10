import { useSearchParams } from "react-router-dom";
import { SearchX } from "lucide-react";
import VideoGrid from "../Components/VideoGrid";
import { searchVideos } from "../Services/searchService";

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  // No query at all — e.g. someone navigated to bare /search
  if (!query.trim()) {
    return (
      <EmptyState
        title="Search Vidyora"
        message="Type something into the search bar above to find videos."
      />
    );
  }

  const results = searchVideos(query);

  return (
    <div>
      <h1 className="text-lg font-semibold text-zinc-100 mb-6">
        Search results for <span className="text-violet-400">"{query}"</span>
      </h1>

      {results.length > 0 ? (
        <VideoGrid videos={results} />
      ) : (
        <EmptyState
          title="No videos found"
          message="Try a different search term."
        />
      )}
    </div>
  );
}

function EmptyState({ title, message }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <SearchX size={36} className="text-zinc-600 mb-3" />
      <p className="text-zinc-200 font-medium">{title}</p>
      <p className="text-sm text-zinc-500 mt-1">{message}</p>
    </div>
  );
}