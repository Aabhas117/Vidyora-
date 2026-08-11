import { Link, useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import { useSubscriptions } from "../Hooks/useSubscriptions";
import { getChannelId } from "../Data/channelUtils";
import videos from "../Data/videos";
import VideoGrid from "../Components/VideoGrid";

export default function Subscriptions() {
  const { subscriptions } = useSubscriptions();
  const navigate = useNavigate();

  const subscribedIds = subscriptions.map((c) => c.id);
  const subscribedVideos = videos.filter((v) => subscribedIds.includes(getChannelId(v.channel)));

  if (subscriptions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-24">
        <Users size={36} className="text-zinc-600 mb-3" />
        <p className="text-zinc-200 font-medium">No subscriptions yet</p>
        <p className="text-sm text-zinc-500 mt-1">Subscribe to channels to see them here.</p>
        <button
          onClick={() => navigate("/")}
          className="mt-5 px-5 py-2 rounded-full bg-violet-500 text-white text-sm font-medium hover:bg-violet-400 transition-colors"
        >
          Explore videos
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-zinc-100 mb-6">Subscriptions</h1>

      <div className="flex flex-col gap-2 mb-10">
        {subscriptions.map((c) => (
          <Link
            key={c.id}
            to={`/channel/${c.id}`}
            className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl p-3 hover:border-zinc-700 transition-colors"
          >
            <img src={c.avatar} alt={c.name} className="h-10 w-10 rounded-full bg-zinc-800" />
            <span className="text-sm font-medium text-zinc-100">{c.name}</span>
          </Link>
        ))}
      </div>

      <h2 className="text-sm font-semibold text-zinc-400 mb-4">Latest videos from your subscriptions</h2>
      {subscribedVideos.length === 0 ? (
        <p className="text-sm text-zinc-500">No videos yet from your subscribed channels.</p>
      ) : (
        <VideoGrid videos={subscribedVideos} />
      )}
    </div>
  );
}