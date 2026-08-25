import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ListVideo, Pencil, Trash2 } from "lucide-react";
import { usePlaylists } from "../Hooks/usePlaylists";
import VideoGrid from "../Components/VideoGrid";

const NAME_LIMIT = 60;
const DESCRIPTION_LIMIT = 200;

export default function PlaylistDetail() {
  const { playlistId } = useParams();
  const { getPlaylistById, renamePlaylist, deletePlaylist } = usePlaylists();
  const navigate = useNavigate();
  const playlist = getPlaylistById(playlistId);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(playlist?.name || "");
  const [description, setDescription] = useState(playlist?.description || "");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  if (!playlist) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-400">Playlist not found.</p>
        <Link to="/playlists" className="text-violet-400 text-sm hover:underline mt-2 inline-block">
          ← Back to Playlists
        </Link>
      </div>
    );
  }

  const startEditing = () => {
    setName(playlist.name);
    setDescription(playlist.description || "");
    setEditing(true);
  };

  const handleSaveRename = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await renamePlaylist(playlist.id, name, description);
      setEditing(false);
    } catch {
      // Leave the edit form open so the user can retry.
    }
  };

  const handleDelete = async () => {
    await deletePlaylist(playlist.id);
    navigate("/playlists");
  };

  const createdLabel = new Date(playlist.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div>
      <Link to="/playlists" className="text-xs text-zinc-500 hover:text-violet-400 transition-colors">
        ← All playlists
      </Link>

      <div className="flex items-start justify-between gap-4 mt-3 mb-6">
        <div className="flex items-start gap-3 min-w-0">
          <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center text-violet-400 shrink-0 mt-0.5">
            <ListVideo size={18} />
          </div>

          {editing ? (
            <form onSubmit={handleSaveRename} className="flex flex-col gap-2 min-w-0 w-full max-w-md">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={NAME_LIMIT}
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-violet-500"
                autoFocus
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={DESCRIPTION_LIMIT}
                rows={2}
                placeholder="Description (optional)"
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-violet-500 resize-none"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="text-xs px-3 py-1.5 rounded-full bg-violet-500 text-white hover:bg-violet-400 transition-colors"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="text-xs px-3 py-1.5 rounded-full border border-zinc-700 text-zinc-300 hover:border-zinc-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="min-w-0">
              <h1 className="text-xl font-semibold text-zinc-100">{playlist.name}</h1>
              {playlist.description && (
                <p className="text-sm text-zinc-400 mt-1">{playlist.description}</p>
              )}
              <p className="text-xs text-zinc-500 mt-1">
                {playlist.videos.length} video{playlist.videos.length === 1 ? "" : "s"} · Created {createdLabel}
              </p>
            </div>
          )}
        </div>

        {!editing && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={startEditing}
              className="p-2 text-zinc-500 hover:text-violet-400 transition-colors"
              aria-label="Rename playlist"
            >
              <Pencil size={16} />
            </button>

            {confirmingDelete ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDelete}
                  className="text-xs px-3 py-1.5 rounded-full bg-red-500 text-white hover:bg-red-400 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setConfirmingDelete(false)}
                  className="text-xs px-3 py-1.5 rounded-full border border-zinc-700 text-zinc-300 hover:border-zinc-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmingDelete(true)}
                className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
                aria-label="Delete playlist"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        )}
      </div>

      {playlist.videos.length === 0 ? (
        <p className="text-sm text-zinc-500 py-12 text-center">
          This playlist is empty. Add videos from any watch page.
        </p>
      ) : (
        <VideoGrid videos={playlist.videos} />
      )}
    </div>
  );
}