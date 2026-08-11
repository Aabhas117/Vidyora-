import { useParams, Link } from "react-router-dom";
import { Users } from "lucide-react";
import videos from "../Data/videos";
import { getChannelById, getChannelId } from "../Data/channelUtils";
import { useAuth } from "../Hooks/useAuth";
import { useUserVideos } from "../Hooks/useUserVideos";
import SubscriptionButton from "../Components/SubscriptionButton";
import VideoGrid from "../Components/VideoGrid";

export default function Channel() {
  const { channelId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { userVideos } = useUserVideos();

  const isOwnChannel = isAuthenticated && getChannelId(user.fullName) === channelId;
  const allVideos = isOwnChannel ? [...userVideos, ...videos] : videos;

  const channel = getChannelById(channelId, allVideos);

  if (!channel) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-400">Channel not found.</p>
        <Link to="/" className="text-violet-400 text-sm hover:underline mt-2 inline-block">
          ← Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-5 mb-6">
        <img
          src={channel.avatar}
          alt={channel.name}
          className="h-20 w-20 rounded-full bg-zinc-800 border border-zinc-700"
        />
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold text-zinc-100">{channel.name}</h1>
          <p className="flex items-center gap-1.5 text-sm text-zinc-500 mt-1">
            <Users size={14} /> {channel.videos.length * 137} subscribers
          </p>
        </div>
        {!isOwnChannel && <SubscriptionButton channel={channel} />}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-8">
        <p className="text-xs text-zinc-500 mb-1">About</p>
        <p className="text-sm text-zinc-300">{channel.description}</p>
      </div>

      <h2 className="text-sm font-semibold text-zinc-400 mb-4">
        {channel.videos.length} video{channel.videos.length === 1 ? "" : "s"}
      </h2>
      <VideoGrid videos={channel.videos} />
    </div>
  );
}