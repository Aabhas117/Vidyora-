import { Home, TrendingUp, Users, History, ThumbsUp, ListVideo, X } from "lucide-react";

const navItems = [
  { label: "Home", icon: Home, active: true },
  { label: "Trending", icon: TrendingUp },
  { label: "Subscriptions", icon: Users },
  { label: "History", icon: History },
  { label: "Liked Videos", icon: ThumbsUp },
  { label: "Playlists", icon: ListVideo },
];

// `open` / `onClose` control visibility on mobile (a slide-in panel).
// On desktop (md breakpoint and up) the sidebar is always visible via CSS.
export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Dark overlay behind the sidebar on mobile, closes it on click */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
        />
      )}

      <aside
        className={`fixed md:sticky top-16 left-0 z-30 h-[calc(100vh-4rem)] w-60 bg-zinc-950 border-r border-zinc-800
        transition-transform duration-200
        ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="flex items-center justify-between px-4 py-3 md:hidden">
          <span className="text-sm text-zinc-500">Menu</span>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-100">
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-3">
          {navItems.map(({ label, icon: Icon, active }) => (
            <button
              key={label}
              className={`flex items-center gap-4 px-3 py-2.5 rounded-lg text-sm text-left transition-colors ${
                active
                  ? "bg-zinc-800 text-violet-400 font-medium"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}