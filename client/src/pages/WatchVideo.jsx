import { useParams, Link } from "react-router-dom";
import { Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useHistory } from "../Hooks/useHistory";
import { getVideoById, getVideos } from "../Services/videoService";
import VideoPlayer from "../Components/VideoPlayer";
import LikeButton from "../Components/LikeButton";
import SubscriptionButton from "../Components/SubscriptionButton";
import CommentList from "../Components/CommentList";
import AddToPlaylistButton from "../Components/AddToPlaylistButton";
import Avatar from "../Components/Avatar";

export default function WatchVideo() {
  const { videoId } = useParams();
  const { addToHistory } = useHistory();

  const [video, setVideo] = useState(null);
  const [upNext, setUpNext] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    getVideoById(videoId)
      .then((data) => {
        if (cancelled) return;
        setVideo(data);
        addToHistory(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    getVideos()
      .then((all) => {
        if (!cancelled) setUpNext(all.filter((v) => v.id !== videoId));
      })
      .catch(() => {
        // Up Next failing silently is acceptable — it's a secondary feature;
        // the main video/page shouldn't error out just because this did.
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  if (loading) {
    return (
      <p className="text-sm text-zinc-500 text-center py-16">
        Loading video...
      </p>
    );
  }

  if (error || !video) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-400">Video not found.</p>
        <Link
          to="/"
          className="text-violet-400 text-sm hover:underline mt-2 inline-block"
        >
          ← Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8">
      <div className="order-1 xl:order-none xl:col-start-1 xl:row-start-1">
        <VideoPlayer src={video.videoUrl} poster={video.thumbnail} />

        <h1 className="text-lg font-semibold text-zinc-100 mt-4">
          {video.title}
        </h1>

        <div className="flex flex-wrap items-center justify-between gap-4 mt-3">
          <div className="flex items-center gap-3">
            <Link to={`/channel/${video.ownerId}`}>
              <Avatar
                src={video.avatar}
                name={video.channel}
                className="h-11 w-11"
              />
            </Link>
            <div>
              <Link
                to={`/channel/${video.ownerId}`}
                className="text-sm font-medium text-zinc-100 hover:text-violet-400 transition-colors"
              >
                {video.channel}
              </Link>
              <p className="text-xs text-zinc-500">
                {video.views} · {video.uploaded}
              </p>
            </div>
            <SubscriptionButton
              channel={{
                id: video.ownerId,
                name: video.channel,
                avatar: video.avatar,
              }}
            />
          </div>

          <div className="flex items-center gap-3">
            <LikeButton video={video} />
            <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-700 text-zinc-300 hover:border-zinc-500 transition-colors">
              <Share2 size={16} /> Share
            </button>
            <AddToPlaylistButton video={video} />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mt-4">
          <p className="text-sm text-zinc-300 whitespace-pre-line">
            {video.description}
          </p>
        </div>
      </div>

      <div className="order-2 xl:order-none xl:col-start-2 xl:row-start-1 xl:row-span-2">
        <h2 className="text-sm font-semibold text-zinc-400 mb-4">Up Next</h2>
        <div className="flex flex-col gap-4">
          {upNext.map((v) => (
            <Link key={v.id} to={`/watch/${v.id}`} className="flex gap-3 group">
              <div className="w-40 aspect-video shrink-0 rounded-lg overflow-hidden bg-zinc-800">
                <img
                  src={v.thumbnail}
                  alt={v.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-zinc-100 line-clamp-2 group-hover:text-violet-400 transition-colors">
                  {v.title}
                </p>
                <p className="text-xs text-zinc-500 mt-1">{v.channel}</p>
                <p className="text-xs text-zinc-500">{v.views}</p>
              </div>
            </Link>
          ))}
          {upNext.length === 0 && (
            <p className="text-xs text-zinc-600">Nothing to suggest yet.</p>
          )}
        </div>
      </div>

      <div className="order-3 xl:order-none xl:col-start-1 xl:row-start-2 border-t border-zinc-800 pt-6 mt-2">
        <CommentList />
      </div>
    </div>
  );
}