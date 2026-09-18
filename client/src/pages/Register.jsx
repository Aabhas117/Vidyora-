import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Hooks/useAuth";
import {
  Play,
  Upload,
  User,
  AtSign,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  Loader2,
  Camera,
  Check,
} from "lucide-react";

export default function Register() {
  const { register, error } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (form.password !== form.confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await register({
        fullName: form.fullName,
        username: form.username,
        email: form.email,
        password: form.password,
      });
      navigate("/", { replace: true });
    } catch {
      // error surfaced via context
    } finally {
      setSubmitting(false);
    }
  };

  const passwordsMatch =
    form.confirmPassword.length > 0 && form.password === form.confirmPassword;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Ambient Glow Decoration */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Centered Signup Card */}
      <div className="w-full max-w-lg mx-auto relative z-10">
        <div className="bg-zinc-900/90 border border-zinc-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {/* Top Accent Line */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-80" />

          {/* Header & Logo */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-2 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:scale-105 transition-transform">
                <Play size={18} className="fill-white text-white ml-0.5" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                Vidyora
              </span>
            </Link>
            <h1 className="text-xl font-bold text-zinc-100">Create your account</h1>
            <p className="text-xs text-zinc-400 mt-1">
              Join Vidyora to watch, upload, and subscribe
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {(error || localError) && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                <p className="flex-1">{localError || error}</p>
              </div>
            )}

            {/* Avatar Upload Section */}
            <div className="flex items-center gap-4 p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
              <div className="relative h-14 w-14 rounded-full bg-zinc-850 border border-zinc-700/80 overflow-hidden flex items-center justify-center shrink-0 group ring-2 ring-violet-500/20">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Camera size={20} className="text-zinc-400 group-hover:text-violet-400 transition-colors" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700/70 text-xs font-medium text-zinc-200 hover:bg-zinc-750 hover:border-violet-500/40 hover:text-violet-300 transition-all cursor-pointer">
                  <Upload size={13} />
                  <span>{avatarPreview ? "Change avatar" : "Upload avatar"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-zinc-500 mt-1 truncate">
                  JPG, PNG or GIF (Optional channel picture)
                </p>
              </div>
            </div>

            {/* Full Name & Username Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                  <User size={13} className="text-zinc-400" />
                  Full Name
                </label>
                <div className="relative">
                  <input
                    name="fullName"
                    type="text"
                    required
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Alex Morgan"
                    className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3.5 py-2.5 pl-9 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                  />
                  <User
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                  <AtSign size={13} className="text-zinc-400" />
                  Username
                </label>
                <div className="relative">
                  <input
                    name="username"
                    type="text"
                    required
                    value={form.username}
                    onChange={handleChange}
                    placeholder="alexmorgan"
                    className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3.5 py-2.5 pl-9 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                  />
                  <AtSign
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
                  />
                </div>
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                <Mail size={13} className="text-zinc-400" />
                Email Address
              </label>
              <div className="relative">
                <input
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="alex@example.com"
                  className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3.5 py-2.5 pl-9 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
                <Mail
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
                />
              </div>
            </div>

            {/* Password & Confirm Password Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                  <Lock size={13} className="text-zinc-400" />
                  Password
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3.5 py-2.5 pl-9 pr-9 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                  />
                  <Lock
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                    <ShieldCheck size={13} className="text-zinc-400" />
                    Confirm Password
                  </label>
                  {passwordsMatch && (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 font-medium">
                      <Check size={11} /> Match
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full bg-zinc-950/80 border rounded-xl px-3.5 py-2.5 pl-9 pr-9 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 transition-all ${
                      passwordsMatch
                        ? "border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500/20"
                        : "border-zinc-800 focus:border-violet-500 focus:ring-violet-500/20"
                    }`}
                  />
                  <ShieldCheck
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-500 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl py-3 text-sm shadow-lg shadow-violet-600/25 transition-all duration-200 transform active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 group cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Creating account…</span>
                </>
              ) : (
                <>
                  <span>Create Vidyora Account</span>
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-5 border-t border-zinc-800/80 text-center">
            <p className="text-xs text-zinc-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-violet-400 hover:text-violet-300 hover:underline transition-colors"
              >
                Sign in instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
