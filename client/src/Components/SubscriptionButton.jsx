import { useState } from "react";

export default function SubscriptionButton() {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <button
      onClick={() => setSubscribed((prev) => !prev)}
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