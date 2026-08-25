import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ListPlus, Check, Plus } from "lucide-react";
import { useAuth } from "../Hooks/useAuth";
import { usePlaylists } from "../Hooks/usePlaylists";

export default function AddToPlaylistButton({ video }) {
  const { isAuthenticated } = useAuth();
  const { playlists, createPlaylist, addVideoToPlaylist, removeVideoFromPlaylist, isVideoInPlaylist } =
    usePlaylists();
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleOpen = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setOpen((o) => !o);
  };

  const handleToggleVideo = async (playlistId) => {
    if (isVideoInPlaylist(playlistId, video.id)) {
      await removeVideoFromPlaylist(playlistId, video.id);
    } else {
      await addVideoToPlaylist(playlistId, video);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const playlist = await createPlaylist(newName.trim());
    if (playlist) await addVideoToPlaylist(playlist.id, video);
    setNewName("");
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={handleToggleOpen}
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-700 text-zinc-300 hover:border-zinc-500 transition-colors"
      >
        <ListPlus size={16} /> Save
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg z-50 overflow-hidden">
          <p className="text-xs text-zinc-500 px-4 pt-3 pb-2">Save to playlist</p>

          <div className="max-h-48 overflow-y-auto">
            {playlists.length === 0 ? (
              <p className="text-xs text-zinc-600 px-4 py-3">No playlists yet — create one below.</p>
            ) : (
              playlists.map((p) => {
                const inPlaylist = isVideoInPlaylist(p.id, video.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => handleToggleVideo(p.id)}
                    className="w-full flex items-center justify-between px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800 transition-colors"
                  >
                    <span className="truncate">{p.name}</span>
                    <span
                      className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 ${
                        inPlaylist ? "bg-violet-500 border-violet-500" : "border-zinc-600"
                      }`}
                    >
                      {inPlaylist && <Check size={12} className="text-white" />}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          <form onSubmit={handleCreate} className="flex items-center gap-2 p-3 border-t border-zinc-800">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New playlist name"
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-violet-500"
            />
            <button
              type="submit"
              className="p-1.5 rounded-lg bg-violet-500 text-white hover:bg-violet-400 transition-colors shrink-0"
              aria-label="Create playlist"
            >
              <Plus size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}