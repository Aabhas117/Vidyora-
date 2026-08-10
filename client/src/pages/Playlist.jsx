import { useState } from "react";
import { Link } from "react-router-dom";
import { ListVideo, Plus, Trash2 } from "lucide-react";
import { usePlaylists } from "../Hooks/usePlaylists";

const NAME_LIMIT = 60;
const DESCRIPTION_LIMIT = 200;

export default function Playlist() {
  const { playlists, createPlaylist, deletePlaylist } = usePlaylists();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(null);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Playlist name is required.");
      return;
    }
    createPlaylist(name, description);
    setName("");
    setDescription("");
    setError("");
    setShowForm(false);
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-zinc-100">My Playlists</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-400 transition-colors"
          >
            <Plus size={16} /> Create Playlist
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-8 flex flex-col gap-3"
        >
          <div>
            <div className="flex justify-between items-baseline mb-1">
              <label className="text-xs text-zinc-400">Playlist Name</label>
              <span className="text-xs text-zinc-600">{name.length}/{NAME_LIMIT}</span>
            </div>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              maxLength={NAME_LIMIT}
              placeholder="e.g. React Tutorials"
              className={`w-full bg-zinc-950 border rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none transition-colors ${
                error ? "border-red-500/60" : "border-zinc-800 focus:border-violet-500"
              }`}
            />
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
          </div>

          <div>
            <div className="flex justify-between items-baseline mb-1">
              <label className="text-xs text-zinc-400">Description (optional)</label>
              <span className="text-xs text-zinc-600">{description.length}/{DESCRIPTION_LIMIT}</span>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={DESCRIPTION_LIMIT}
              rows={2}
              placeholder="What's this playlist for?"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-violet-500 resize-none"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setName("");
                setDescription("");
                setError("");
              }}
              className="px-4 py-2 rounded-lg border border-zinc-700 text-sm text-zinc-300 hover:border-zinc-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-400 transition-colors"
            >
              Create
            </button>
          </div>
        </form>
      )}

      {playlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20">
          <ListVideo size={36} className="text-zinc-600 mb-3" />
          <p className="text-zinc-200 font-medium">No playlists yet</p>
          <p className="text-sm text-zinc-500 mt-1">Create a playlist to organize your favorite videos.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {playlists.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors"
            >
              <Link to={`/playlists/${p.id}`} className="flex items-center gap-4 min-w-0 flex-1">
                <div className="h-12 w-12 rounded-lg bg-zinc-800 flex items-center justify-center text-violet-400 shrink-0">
                  <ListVideo size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-100 truncate">{p.name}</p>
                  <p className="text-xs text-zinc-500">{p.videos.length} video{p.videos.length === 1 ? "" : "s"}</p>
                </div>
              </Link>

              {confirmingDelete === p.id ? (
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-zinc-400 mr-1">Delete playlist?</span>
                  <button
                    onClick={() => {
                      deletePlaylist(p.id);
                      setConfirmingDelete(null);
                    }}
                    className="text-xs px-3 py-1.5 rounded-full bg-red-500 text-white hover:bg-red-400 transition-colors"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setConfirmingDelete(null)}
                    className="text-xs px-3 py-1.5 rounded-full border border-zinc-700 text-zinc-300 hover:border-zinc-500 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmingDelete(p.id)}
                  className="p-2 text-zinc-600 hover:text-red-400 transition-colors shrink-0"
                  aria-label="Delete playlist"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}