import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Hooks/useAuth";
import { useSubscriptions } from "../Hooks/useSubscriptions";

export default function SubscriptionButton({ channel }) {
  const { user, isAuthenticated } = useAuth();
  const { isSubscribed, toggleSubscription } = useSubscriptions();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  if (!channel) return null;

  const channelId = typeof channel === "string" ? channel : (channel.id || channel._id);

  // Do not render Subscribe button if watching/viewing your own channel
  if (isAuthenticated && user && user._id?.toString() === channelId?.toString()) {
    return null;
  }

  const subscribed = isSubscribed(channelId);

  const handleClick = async (e) => {
    e?.stopPropagation();
    e?.preventDefault();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (loading) return;

    setLoading(true);
    try {
      await toggleSubscription(channel);
    } catch (err) {
      console.error("Subscription toggle failed:", err?.response?.data?.message || err?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        subscribed
          ? "bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-750"
          : "bg-violet-500 text-white hover:bg-violet-400"
      }`}
    >
      {loading ? "..." : subscribed ? "Subscribed" : "Subscribe"}
    </button>
  );
}