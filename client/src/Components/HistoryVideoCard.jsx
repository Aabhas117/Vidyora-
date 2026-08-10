import { Link } from "react-router-dom";
import { X } from "lucide-react";

export default function HistoryVideoCard({ video, watchedLabel, onRemove }) {
  return (
    <div className="flex gap-4 group">
      <Link
        to={`/watch/${video.id}`}
        className="w-40 sm:w-48 aspect-video shrink-0 rounded-lg overflow-hidden bg-zinc-800"
      >
        <img
          src={video.thumbnail}
          alt={video.title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform"
        />
      </Link>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <Link to={`/watch/${video.id}`}>
          <h3 className="text-sm font-medium text-zinc-100 line-clamp-2 group-hover:text-violet-400 transition-colors">
            {video.title}
          </h3>
        </Link>
        <p className="text-xs text-zinc-500 mt-1">
          {video.channel} · {video.views}
        </p>
        <p className="text-xs text-zinc-600 mt-0.5">{watchedLabel}</p>
      </div>

      <button
        onClick={() => onRemove(video.id)}
        className="p-2 h-fit text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
        aria-label="Remove from history"
      >
        <X size={16} />
      </button>
    </div>
  );
}