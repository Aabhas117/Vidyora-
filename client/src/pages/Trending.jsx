import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { getVideos } from "../Services/videoService";
import VideoGrid from "../Components/VideoGrid";

function parseViews(viewsString) {
  const match = viewsString.match(/([\d.]+)([KM]?)/i);
  if (!match) return 0;
  const [, num, suffix] = match;
  const value = parseFloat(num);
  if (suffix.toUpperCase() === "M") return value * 1_000_000;
  if (suffix.toUpperCase() === "K") return value * 1_000;
  return value;
}

export default function Trending() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getVideos()
      .then((data) => {
        if (!cancelled) {
          const sorted = [...data].sort((a, b) => parseViews(b.views) - parseViews(a.views));
          setVideos(sorted);
        }
      })
      .catch(() => !cancelled && setError(true))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <p className="text-sm text-zinc-500 text-center py-16">Loading videos...</p>;
  if (error) return <p className="text-sm text-zinc-500 text-center py-16">Couldn't load trending videos.</p>;

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp size={20} className="text-violet-400" />
        <h1 className="text-xl font-semibold text-zinc-100">Trending</h1>
      </div>
      {videos.length === 0 ? (
        <p className="text-sm text-zinc-500 text-center py-16">No videos yet.</p>
      ) : (
        <VideoGrid videos={videos} />
      )}
    </div>
  );
}