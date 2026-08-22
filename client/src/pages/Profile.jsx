import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera } from "lucide-react";
import { useAuth } from "../Hooks/useAuth";
import { useSubscriptions } from "../Hooks/useSubscriptions";
import { getMyVideos } from "../Services/videoService";
import ProfileVideoCard from "../Components/ProfileVideoCard";
import EditVideoModal from "../Components/EditVideoModal";
import Avatar from "../Components/Avatar";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { subscriptions } = useSubscriptions();
  const navigate = useNavigate();

  const [myVideos, setMyVideos] = useState([]);
  const [videosLoading, setVideosLoading] = useState(true);
  const [videosError, setVideosError] = useState(false);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: user.fullName,
    username: user.username,
    email: user.email,
  });
  const [avatarPreview, setAvatarPreview] = useState(user.avatar);
  const [errors, setErrors] = useState({});
  const [editingVideo, setEditingVideo] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);    


  useEffect(() => {
    let cancelled = false;

    getMyVideos()
      .then((data) => {
        if (!cancelled) setMyVideos(data);
      })
      .catch(() => {
        if (!cancelled) setVideosError(true);
      })
      .finally(() => {
        if (!cancelled) setVideosLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleAvatarChange = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  setAvatarFile(file);
  setAvatarPreview(URL.createObjectURL(file));
};

  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = "Full name is required.";
    if (!form.username.trim()) next.username = "Username is required.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  
const handleSave = async (e) => {
  e.preventDefault();
  if (!validate()) return;
  try {
    await updateProfile(form, avatarFile);
    setAvatarFile(null);
    setEditing(false);
  } catch (err) {
    setErrors({ form: err.response?.data?.message || "Couldn't save changes. Try again." });
  }
};

  const handleCancel = () => {
  setForm({
    fullName: user.fullName,
    username: user.username,
    email: user.email,
  });
  setAvatarPreview(user.avatar);
  setAvatarFile(null);
  setErrors({});
  setEditing(false);
};

  // TEMPORARY: My Videos edit/delete still operate on local state only —
  // real PATCH/DELETE wiring for these video-card actions is a separate,
  // not-yet-done piece (the backend PATCH/DELETE /videos/:id routes exist,
  // but this page doesn't call them yet).


  const handleDeleteVideo = (videoId) => {
    setMyVideos((prev) => prev.filter((v) => v.id !== videoId));
  };
  const handleSaveEditedVideo = (videoId, patch) => {
    setMyVideos((prev) =>
      prev.map((v) => (v.id === videoId ? { ...v, ...patch } : v)),
    );
    setEditingVideo(null);
  };

  return (
    <div className="max-w-2xl">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        {editing ? (
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar
                  src={avatarPreview}
                  name={form.fullName}
                  className="h-20 w-20"
                />
                <label className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-violet-500 flex items-center justify-center cursor-pointer hover:bg-violet-400 transition-colors">
                  <Camera size={13} className="text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xs text-zinc-500">
                Click the camera icon to change your avatar.
              </p>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-zinc-400">Full Name</span>
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                className={`bg-zinc-950 border rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none ${
                  errors.fullName
                    ? "border-red-500/60"
                    : "border-zinc-800 focus:border-violet-500"
                }`}
              />
              {errors.fullName && (
                <p className="text-xs text-red-400">{errors.fullName}</p>
              )}
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-zinc-400">Username</span>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                className={`bg-zinc-950 border rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none ${
                  errors.username
                    ? "border-red-500/60"
                    : "border-zinc-800 focus:border-violet-500"
                }`}
              />
              {errors.username && (
                <p className="text-xs text-red-400">{errors.username}</p>
              )}
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-zinc-400">Email</span>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className={`bg-zinc-950 border rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none ${
                  errors.email
                    ? "border-red-500/60"
                    : "border-zinc-800 focus:border-violet-500"
                }`}
              />
              {errors.email && (
                <p className="text-xs text-red-400">{errors.email}</p>
              )}
            </label>

            <div className="flex gap-2 justify-end mt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg border border-zinc-700 text-sm text-zinc-300 hover:border-zinc-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-400 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <Avatar
                src={user.avatar}
                name={user.fullName}
                className="h-20 w-20"
              />
              <div>
                <h1 className="text-lg font-semibold text-zinc-100">
                  {user.fullName}
                </h1>
                <p className="text-sm text-zinc-500">@{user.username}</p>
                <p className="text-sm text-zinc-500">{user.email}</p>
              </div>
            </div>

            <div className="flex gap-8 mt-6 pt-6 border-t border-zinc-800">
              <div>
                <p className="text-lg font-semibold text-zinc-100">
                  {myVideos.length}
                </p>
                <p className="text-xs text-zinc-500">Videos</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-zinc-100">
                  {user.subscribers ?? 0}
                </p>
                <p className="text-xs text-zinc-500">
                  Subscribers <span className="text-zinc-600">(mock)</span>
                </p>
              </div>
              <button
                onClick={() => navigate("/subscriptions")}
                className="text-left"
              >
                <p className="text-lg font-semibold text-zinc-100">
                  {subscriptions.length}
                </p>
                <p className="text-xs text-zinc-500 hover:text-violet-400 transition-colors">
                  Subscriptions →
                </p>
              </button>
            </div>

            <button
              onClick={() => setEditing(true)}
              className="mt-6 px-5 py-2 rounded-full bg-zinc-800 border border-zinc-700 text-sm text-zinc-300 hover:border-violet-500/50 hover:text-violet-400 transition-colors"
            >
              Edit Profile
            </button>
          </>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">My Videos</h2>
        {videosLoading ? (
          <p className="text-sm text-zinc-500">Loading your videos...</p>
        ) : videosError ? (
          <p className="text-sm text-zinc-500">Unable to load your videos.</p>
        ) : myVideos.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No videos uploaded yet.{" "}
            <button
              onClick={() => navigate("/upload")}
              className="text-violet-400 hover:underline"
            >
              Upload one
            </button>
            .
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6">
            {myVideos.map((video) => (
              <ProfileVideoCard
                key={video.id}
                video={video}
                onEdit={setEditingVideo}
                onDelete={handleDeleteVideo}
              />
            ))}
          </div>
        )}
      </div>

      {editingVideo && (
        <EditVideoModal
          video={editingVideo}
          onClose={() => setEditingVideo(null)}
          onSave={handleSaveEditedVideo}
        />
      )}
    </div>
  );
}
