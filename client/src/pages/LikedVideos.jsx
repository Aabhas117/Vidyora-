import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Trash2 } from "lucide-react";
import { useLikes } from "../Hooks/useLikes";
import VideoGrid from "../Components/VideoGrid";

export default function LikedVideos() {
  const { likedVideos, clearLikedVideos } = useLikes();
  const [confirmingClear, setConfirmingClear] = useState(false);
  const navigate = useNavigate();

  const handleClearClick = () => {
    if (confirmingClear) {
      clearLikedVideos();
      setConfirmingClear(false);
    } else {
      setConfirmingClear(true);
    }
  };

  if (likedVideos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-24">
        <Heart size={36} className="text-zinc-600 mb-3" />
        <p className="text-zinc-200 font-medium">No liked videos yet</p>
        <p className="text-sm text-zinc-500 mt-1">Videos you like will appear here.</p>
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-zinc-100">Liked Videos</h1>

        {confirmingClear ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Clear all liked videos?</span>
            <button
              onClick={handleClearClick}
              className="text-xs px-3 py-1.5 rounded-full bg-red-500 text-white hover:bg-red-400 transition-colors"
            >
              Confirm
            </button>
            <button
              onClick={() => setConfirmingClear(false)}
              className="text-xs px-3 py-1.5 rounded-full border border-zinc-700 text-zinc-300 hover:border-zinc-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={handleClearClick}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-red-400 transition-colors"
          >
            <Trash2 size={14} /> Clear all
          </button>
        )}
      </div>

      <VideoGrid videos={likedVideos} />
    </div>
  );
}