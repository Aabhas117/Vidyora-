import { useState, useMemo } from "react";
import { Trash2, History as HistoryIcon } from "lucide-react";
import { useHistory } from "../Hooks/useHistory";
import HistoryVideoCard from "../Components/HistoryVideoCard";

function getDateLabel(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const startOf = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((startOf(now) - startOf(date)) / 86400000);

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function History() {
  const { history, removeFromHistory, clearHistory } = useHistory();
  const [confirmingClear, setConfirmingClear] = useState(false);

  // Group the already-newest-first history array by date label,
  // without needing a date library.
  const groups = useMemo(() => {
    const map = new Map();
    history.forEach((video) => {
      const label = getDateLabel(video.watchedAt);
      if (!map.has(label)) map.set(label, []);
      map.get(label).push(video);
    });
    return Array.from(map.entries());
  }, [history]);

  const handleClearClick = () => {
    if (confirmingClear) {
      clearHistory();
      setConfirmingClear(false);
    } else {
      setConfirmingClear(true);
    }
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-24">
        <HistoryIcon size={36} className="text-zinc-600 mb-3" />
        <p className="text-zinc-200 font-medium">No watch history yet</p>
        <p className="text-sm text-zinc-500 mt-1">Videos you watch will appear here.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-zinc-100">Watch History</h1>

        {confirmingClear ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Clear all history?</span>
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

      <div className="flex flex-col gap-8">
        {groups.map(([label, videos]) => (
          <div key={label}>
            <h2 className="text-sm font-semibold text-zinc-400 mb-4">{label}</h2>
            <div className="flex flex-col gap-5">
              {videos.map((video) => (
                <HistoryVideoCard
                  key={video.id}
                  video={video}
                  watchedLabel={`Watched ${label === "Today" ? "recently" : label.toLowerCase()}`}
                  onRemove={removeFromHistory}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}