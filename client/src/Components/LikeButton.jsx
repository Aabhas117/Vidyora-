import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { useAuth } from "../Hooks/useAuth";
import { useLikes } from "../Hooks/useLikes";

export default function LikeButton({ video }) {
  const { isAuthenticated } = useAuth();
  const { isLiked, toggleLike } = useLikes();
  const navigate = useNavigate();

  const liked = isLiked(video.id);

  const handleClick = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    toggleLike(video);
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${
        liked
          ? "bg-violet-500/10 border-violet-500 text-violet-400"
          : "border-zinc-700 text-zinc-300 hover:border-zinc-500"
      }`}
    >
      <Heart size={16} className={liked ? "fill-violet-400" : ""} />
      {liked ? "Liked" : "Like"}
    </button>
  );
}