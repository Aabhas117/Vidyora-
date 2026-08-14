import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Hooks/useAuth";
import { Upload } from "lucide-react";

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

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // avatar intentionally omitted — no backend support for it yet on register
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
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-950">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-zinc-100 text-center mb-1">
          Join Vidyora
        </h1>
        <p className="text-sm text-zinc-500 text-center mb-8">
          Create an account to get started
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4"
        >
          {(error || localError) && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {localError || error}
            </p>
          )}

          {/* Avatar upload */}
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center shrink-0">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <Upload size={18} className="text-zinc-500" />
              )}
            </div>
            <label className="text-xs text-violet-400 hover:underline cursor-pointer">
              Upload avatar
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>

          <Field
            label="Full Name"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            required
          />
          <Field
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
          />
          <Field
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <Field
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <Field
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 bg-violet-500 text-white font-semibold rounded-lg py-2.5 text-sm hover:bg-violet-400 transition-colors disabled:opacity-60"
          >
            {submitting ? "Creating account…" : "Register"}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-violet-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

// Small local helper so every input isn't hand-written five times.
function Field({ label, ...inputProps }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs text-zinc-400">{label}</span>
      <input
        {...inputProps}
        className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-violet-500"
      />
    </label>
  );
}
