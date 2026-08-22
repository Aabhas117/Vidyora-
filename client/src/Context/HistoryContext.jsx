import { createContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "../Hooks/useAuth";
import {
  loadHistory,
  pushToHistory,
  removeHistoryEntry,
  clearAllHistory,
} from "../Services/historyService";

export const HistoryContext = createContext(null);

export function HistoryProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadHistory(user._id).then(setHistory);
    } else {
      setHistory([]);
    }
  }, [isAuthenticated, user]);

  const addToHistory = useCallback(
    (video) => {
      if (!isAuthenticated || !user) return;

      // Optimistic update — move/insert at the top immediately, matching
      // the backend's upsert-on-rewatch behavior.
      setHistory((prev) => {
        const withoutDuplicate = prev.filter((entry) => entry.id !== video.id);
        const newEntry = { ...video, watchedAt: new Date().toISOString() };
        return [newEntry, ...withoutDuplicate];
      });

      pushToHistory(video.id).catch(() => {
        // If this fails, the next full reload (e.g. page refresh) will
        // re-sync from the server's real state.
      });
    },
    [isAuthenticated, user]
  );

  const removeFromHistory = useCallback(
    (videoId) => {
      if (!user) return;
      setHistory((prev) => prev.filter((entry) => entry.id !== videoId));
      removeHistoryEntry(videoId).catch(() => {});
    },
    [user]
  );

  const clearHistory = useCallback(() => {
    if (!user) return;
    setHistory([]);
    clearAllHistory().catch(() => {});
  }, [user]);

  const value = { history, addToHistory, removeFromHistory, clearHistory };

  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>;
}