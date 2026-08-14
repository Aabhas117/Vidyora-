import { useEffect, useState } from "react";
import { getVideos } from "../Services/videoService";
import VideoGrid from "../Components/VideoGrid";

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    getVideos()
      .then((data) => {
        if (!cancelled) setVideos(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

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
        <VideoGrid videos={videos} />
      )}
    </div>
  );
}