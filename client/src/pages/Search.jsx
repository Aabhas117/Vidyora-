import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getVideos } from "../Services/videoService";
import VideoGrid from "../Components/VideoGrid";

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [allVideos, setAllVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getVideos()
      .then(setAllVideos)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (!query.trim()) {
    return (
      <div className="text-center py-16">
        <p className="text-zinc-300 font-medium">Search Vidyora</p>
        <p className="text-sm text-zinc-500 mt-1">Type something into the search bar above.</p>
      </div>
    );
  }

  if (loading) return <p className="text-sm text-zinc-500 text-center py-16">Loading videos...</p>;
  if (error) return <p className="text-sm text-zinc-500 text-center py-16">Couldn't load videos.</p>;

  const term = query.trim().toLowerCase();
  const results = allVideos.filter(
    (v) =>
      v.title.toLowerCase().includes(term) ||
      v.channel.toLowerCase().includes(term) ||
      v.description.toLowerCase().includes(term) ||
      v.category.toLowerCase().includes(term)
  );

  return (
    <div>
      <h1 className="text-lg font-semibold text-zinc-100 mb-6">
        Search results for <span className="text-violet-400">"{query}"</span>
      </h1>
      {results.length > 0 ? (
        <VideoGrid videos={results} />
      ) : (
        <div className="text-center py-16">
          <p className="text-zinc-300 font-medium">No videos found</p>
          <p className="text-sm text-zinc-500 mt-1">Try a different search term.</p>
        </div>
      )}
    </div>
  );
}