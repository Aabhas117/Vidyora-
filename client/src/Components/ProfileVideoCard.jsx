import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import VideoCard from "./VideoCard";

export default function ProfileVideoCard({ video, onEdit, onDelete }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <div>
      <VideoCard video={video} />
      <div className="flex items-center justify-between mt-2 px-1">
        <button
          onClick={() => onEdit(video)}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-violet-400 transition-colors"
        >
          <Pencil size={13} /> Edit
        </button>

        {confirmingDelete ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDelete(video.id)}
              className="text-xs px-2.5 py-1 rounded-full bg-red-500 text-white hover:bg-red-400 transition-colors"
            >
              Delete
            </button>
            <button
              onClick={() => setConfirmingDelete(false)}
              className="text-xs px-2.5 py-1 rounded-full border border-zinc-700 text-zinc-300 hover:border-zinc-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmingDelete(true)}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-red-400 transition-colors"
          >
            <Trash2 size={13} /> Delete
          </button>
        )}
      </div>
    </div>
  );
}