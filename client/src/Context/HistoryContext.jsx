import { createContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "../Hooks/useAuth";
import { loadHistory, saveHistory } from "../Services/historyService";

export const HistoryContext = createContext(null);

export function HistoryProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [history, setHistory] = useState([]);

  // Reload history whenever who's logged in changes (login, logout, or a different account logs in).
  useEffect(() => {
    if (isAuthenticated && user) {
      setHistory(loadHistory(user.id));
    } else {
      setHistory([]);
    }
  }, [isAuthenticated, user]);

  const addToHistory = useCallback(
    (video) => {
      // Only track history for logged-in users — history is a per-account feature.
      if (!isAuthenticated || !user) return;

      setHistory((prev) => {
        // Remove any existing entry for this video first, so re-watching
        // moves it to the top instead of creating a duplicate.
        const withoutDuplicate = prev.filter((entry) => entry.id !== video.id);
        const newEntry = { ...video, watchedAt: new Date().toISOString() };
        const next = [newEntry, ...withoutDuplicate];
        saveHistory(user.id, next);
        return next;
      });
    },
    [isAuthenticated, user]
  );

  const removeFromHistory = useCallback(
    (videoId) => {
      if (!user) return;
      setHistory((prev) => {
        const next = prev.filter((entry) => entry.id !== videoId);
        saveHistory(user.id, next);
        return next;
      });
    },
    [user]
  );

  const clearHistory = useCallback(() => {
    if (!user) return;
    setHistory([]);
    saveHistory(user.id, []);
  }, [user]);

  const value = { history, addToHistory, removeFromHistory, clearHistory };

  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>;
}