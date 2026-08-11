import { useNavigate } from "react-router-dom";
import { useAuth } from "../Hooks/useAuth";
import { useSubscriptions } from "../Hooks/useSubscriptions";

export default function SubscriptionButton({ channel }) {
  const { isAuthenticated } = useAuth();
  const { isSubscribed, toggleSubscription } = useSubscriptions();
  const navigate = useNavigate();

  const subscribed = isSubscribed(channel.id);

  const handleClick = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    toggleSubscription(channel);
  };

  return (
    <button
      onClick={handleClick}
      className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
        subscribed
          ? "bg-zinc-800 text-zinc-300 border border-zinc-700"
          : "bg-violet-500 text-white hover:bg-violet-400"
      }`}
    >
      {subscribed ? "Subscribed" : "Subscribe"}
    </button>
  );
}