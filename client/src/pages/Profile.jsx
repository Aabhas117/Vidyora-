import { useAuth } from "../Hooks/useAuth";

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <img
            src={user.avatar}
            alt={user.fullName}
            className="h-20 w-20 rounded-full object-cover bg-zinc-800 border border-zinc-700"
          />
          <div>
            <h1 className="text-lg font-semibold text-zinc-100">{user.fullName}</h1>
            <p className="text-sm text-zinc-500">@{user.username}</p>
            <p className="text-sm text-zinc-500">{user.email}</p>
          </div>
        </div>

        <div className="flex gap-8 mt-6 pt-6 border-t border-zinc-800">
          <div>
            <p className="text-lg font-semibold text-zinc-100">{user.videos}</p>
            <p className="text-xs text-zinc-500">Videos</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-zinc-100">{user.subscribers}</p>
            <p className="text-xs text-zinc-500">Subscribers</p>
          </div>
        </div>

        <button className="mt-6 px-5 py-2 rounded-full bg-zinc-800 border border-zinc-700 text-sm text-zinc-300 hover:border-violet-500/50 hover:text-violet-400 transition-colors">
          Edit Profile
        </button>
      </div>
    </div>
  );
}