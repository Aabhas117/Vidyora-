import { useContext } from "react";
import { HistoryContext } from "../Context/HistoryContext";

export function useHistory() {
  const ctx = useContext(HistoryContext);
  if (!ctx) {
    throw new Error("useHistory must be used inside a HistoryProvider");
  }
  return ctx;
}