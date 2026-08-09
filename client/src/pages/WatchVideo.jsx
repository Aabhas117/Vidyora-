import { useParams, Link } from "react-router-dom";
import { Share2, Bookmark } from "lucide-react";
import videos from "../data/videos";
import VideoPlayer from "../components/VideoPlayer";
import LikeButton from "../components/LikeButton";
import SubscriptionButton from "../components/SubscriptionButton";
import CommentList from "../components/CommentList";

export default function WatchVideo() {
  const { videoId } = useParams();
  const video = videos.find((v) => v.id === Number(videoId));
  const upNext = videos.filter((v) => v.id !== Number(videoId));

  if (!video) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-400">Video not found.</p>
        <Link to="/" className="text-violet-400 text-sm hover:underline mt-2 inline-block">
          ← Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8">
      {/* Player + info + description */}
      <div className="order-1 xl:order-none xl:col-start-1 xl:row-start-1">
        <VideoPlayer src={video.videoUrl} poster={video.thumbnail} />

        <h1 className="text-lg font-semibold text-zinc-100 mt-4">{video.title}</h1>

        <div className="flex flex-wrap items-center justify-between gap-4 mt-3">
          <div className="flex items-center gap-3">
            <img src={video.avatar} alt={video.channel} className="h-11 w-11 rounded-full bg-zinc-800" />
            <div>
              <p className="text-sm font-medium text-zinc-100">{video.channel}</p>
              <p className="text-xs text-zinc-500">{video.views} · {video.uploaded}</p>
            </div>
            <SubscriptionButton />
          </div>

          <div className="flex items-center gap-3">
            <LikeButton initialLikes={128} />
            <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-700 text-zinc-300 hover:border-zinc-500 transition-colors">
              <Share2 size={16} /> Share
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-700 text-zinc-300 hover:border-zinc-500 transition-colors">
              <Bookmark size={16} /> Save
            </button>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mt-4">
          <p className="text-sm text-zinc-300 whitespace-pre-line">{video.description}</p>
        </div>
      </div>

      {/* Up Next */}
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
        </div>
      </div>

      {/* Comments */}
      <div className="order-3 xl:order-none xl:col-start-1 xl:row-start-2 border-t border-zinc-800 pt-6 mt-2">
        <CommentList />
      </div>
    </div>
  );
}