import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext(null);

// Two separate localStorage keys, on purpose:
// USERS_KEY  = a mock "database" of everyone who has ever registered.
// SESSION_KEY = which one of them is currently logged in on this browser.
const USERS_KEY = "vidyora_users";
const SESSION_KEY = "vidyora_session";

function getStoredUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveStoredUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // On first load, restore whoever was logged in before a refresh.
  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setLoading(false);
  }, []);

  /**
   * MOCK register.
   * Later this becomes:
   *   const res = await api.post("/auth/register", details);
   *   setUser(res.data.user);
   * Nothing outside this function needs to change when that happens —
   * every component just calls register(details) and reacts to success/failure.
   */
  const register = async ({ fullName, username, email, password, confirmPassword, avatar }) => {
    setError(null);

    if (password !== confirmPassword) {
      const msg = "Passwords don't match.";
      setError(msg);
      throw new Error(msg);
    }

    const users = getStoredUsers();
    if (users.some((u) => u.email === email || u.username === username)) {
      const msg = "An account with that email or username already exists.";
      setError(msg);
      throw new Error(msg);
    }

    const newUser = {
      id: Date.now(),
      fullName,
      username,
      email,
      password, // mock only — a real backend would hash this and never send it back
      avatar: avatar || `https://i.pravatar.cc/150?u=${username}`,
      videos: 0,
      subscribers: 0,
    };

    saveStoredUsers([...users, newUser]);

    const { password: _pw, ...safeUser } = newUser;
    localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
    setUser(safeUser);
    return safeUser;
  };

  /**
   * MOCK login.
   * Later this becomes:
   *   const res = await api.post("/auth/login", credentials);
   *   setUser(res.data.user);
   */
  const login = async ({ identifier, password }) => {
    setError(null);
    const users = getStoredUsers();
    const found = users.find(
      (u) => (u.email === identifier || u.username === identifier) && u.password === password
    );

    if (!found) {
      const msg = "Incorrect email/username or password.";
      setError(msg);
      throw new Error(msg);
    }

    const { password: _pw, ...safeUser } = found;
    localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
    setUser(safeUser);
    return safeUser;
  };

  const logout = () => {
    // Later: also call `api.post("/auth/logout")` to invalidate the token server-side.
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}