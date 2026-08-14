import { createContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "../Services/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // On app start, ask the backend "who am I?" using the HTTP-only cookie.
  // A 401 here just means "not logged in" — not a fatal error.
  useEffect(() => {
    let cancelled = false;

    authAPI
      .getMe()
      .then((res) => {
        if (!cancelled) setUser(res.data.user);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const register = useCallback(async ({ fullName, username, email, password }) => {
    setError(null);
    try {
      await authAPI.register({ fullName, username, email, password });
      // The backend's register endpoint doesn't issue a session on its own —
      // log in immediately afterward with the same credentials so the
      // existing "auto-login after registration" UX still works.
      const loginRes = await authAPI.login({ email, password });
      setUser(loginRes.data.user);
      return loginRes.data.user;
    } catch (err) {
      const message = err.response?.data?.message || "Couldn't create your account. Try again.";
      setError(message);
      throw new Error(message);
    }
  }, []);

  const login = useCallback(async ({ email, password }) => {
    setError(null);
    try {
      const res = await authAPI.login({ email, password });
      setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      const message = err.response?.data?.message || "Incorrect email or password.";
      setError(message);
      throw new Error(message);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch {
      // Even if the request fails, clear local state so the UI doesn't
      // stay stuck showing a logged-in user.
    }
    setUser(null);
  }, []);

  // TEMPORARY: no backend PATCH /users/me endpoint exists yet, so this only
  // updates in-memory state for the current session — it does NOT persist,
  // and will revert on refresh. This will be replaced once that endpoint
  // is built in a future phase. Profile.jsx itself needs no changes for
  // this — it already just calls updateProfile(updates).
  const updateProfile = useCallback((updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}