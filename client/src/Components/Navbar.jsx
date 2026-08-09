import { Link } from "react-router-dom";
import { Search, Menu, LogOut } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function Navbar({ onMenuClick }) {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 h-16 bg-zinc-950/95 backdrop-blur border-b border-zinc-800">
      <div className="h-full flex items-center gap-4 px-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>

        <Link to="/" className="font-bold text-lg text-zinc-100 tracking-tight">
          Vidyora
        </Link>

        <div className="flex-1 max-w-xl mx-auto hidden sm:flex items-center bg-zinc-900 border border-zinc-800 rounded-full pl-4 pr-1 py-1 focus-within:border-violet-500/60 transition-colors">
          <input
            type="text"
            placeholder="Search videos"
            className="flex-1 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
          />
          <button className="p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-violet-400 transition-colors">
            <Search size={16} />
          </button>
        </div>

        {/* Auth-aware section — everything else in the Navbar is unchanged */}
        <div className="ml-auto flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="flex items-center gap-2 group">
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="h-8 w-8 rounded-full object-cover bg-zinc-800 border border-zinc-700"
                />
                <span className="text-sm text-zinc-300 group-hover:text-violet-400 transition-colors hidden md:inline">
                  {user.username}
                </span>
              </Link>
              <button
                onClick={logout}
                className="p-2 rounded-full text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                aria-label="Log out"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm text-zinc-300 hover:text-zinc-100 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 rounded-full bg-violet-500 text-white text-sm font-medium hover:bg-violet-400 transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}