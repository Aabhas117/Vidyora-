import { useState } from "react";
import { ThumbsUp } from "lucide-react";

export default function LikeButton({ initialLikes = 0 }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);

  const toggleLike = () => {
    setLiked((prev) => !prev);
    setLikes((prev) => (liked ? prev - 1 : prev + 1));
  };

  return (
    <button
      onClick={toggleLike}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${
        liked
          ? "bg-violet-500/10 border-violet-500 text-violet-400"
          : "border-zinc-700 text-zinc-300 hover:border-zinc-500"
      }`}
    >
      <ThumbsUp size={16} className={liked ? "fill-violet-400" : ""} />
      {likes}
    </button>
  );
}