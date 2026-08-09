import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const { login, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ identifier: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(form);
      // Send the user back to whatever page redirected them here, or Home.
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch {
      // error already set in AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-950">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-zinc-100 text-center mb-1">Welcome back</h1>
        <p className="text-sm text-zinc-500 text-center mb-8">Sign in to continue to Vidyora</p>

        <form
          onSubmit={handleSubmit}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4"
        >
          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-zinc-400">Email or Username</span>
            <input
              name="identifier"
              required
              value={form.identifier}
              onChange={handleChange}
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-violet-500"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-zinc-400">Password</span>
            <input
              name="password"
              type="password"
              required
              value={form.password}
              onChange={handleChange}
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-violet-500"
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 bg-violet-500 text-white font-semibold rounded-lg py-2.5 text-sm hover:bg-violet-400 transition-colors disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-6">
          New to Vidyora?{" "}
          <Link to="/register" className="text-violet-400 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}