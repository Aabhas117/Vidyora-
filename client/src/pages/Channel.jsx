import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Users } from "lucide-react";
import { useAuth } from "../Hooks/useAuth";
import { useUserVideos } from "../Hooks/useUserVideos";
import { getVideos } from "../Services/videoService";
import SubscriptionButton from "../Components/SubscriptionButton";
import VideoGrid from "../Components/VideoGrid";

export default function Channel() {
  const { channelId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { userVideos } = useUserVideos();

  const [allVideos, setAllVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    getVideos()
      .then((data) => {
        if (!cancelled) setAllVideos(data);
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

  const isOwnChannel = isAuthenticated && user._id.toString()  === channelId;

  // Mock-uploaded videos (from the still-mock Upload flow) don't have a real
  // ownerId yet, so they're tagged with the current user's real ID here so
  // they line up correctly when viewing your own channel.
  const taggedUserVideos = userVideos.map((v) => ({ ...v, ownerId: user?._id }));

  const combinedVideos = isOwnChannel ? [...taggedUserVideos, ...allVideos] : allVideos;
  const channelVideos = combinedVideos.filter((v) => v.ownerId === channelId);

  if (loading) {
    return <p className="text-sm text-zinc-500 text-center py-16">Loading channel...</p>;
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-400">Couldn't load this channel.</p>
        <Link to="/" className="text-violet-400 text-sm hover:underline mt-2 inline-block">
          ← Back to Home
        </Link>
      </div>
    );
  }

  if (channelVideos.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-400">Channel not found.</p>
        <Link to="/" className="text-violet-400 text-sm hover:underline mt-2 inline-block">
          ← Back to Home
        </Link>
      </div>
    );
  }

  // Channel identity (name/avatar) is derived from its videos, since there's
  // no dedicated "channel" resource yet — same approach as before, just now
  // built from real video data instead of the dummy array.
  const channel = {
    id: channelId,
    name: channelVideos[0].channel,
    avatar: channelVideos[0].avatar,
    description: `${channelVideos[0].channel} on Vidyora.`,
    videos: channelVideos,
  };

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