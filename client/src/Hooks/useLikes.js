import { useContext } from "react";
import { LikeContext } from "../Context/LikeContext";

export function useLikes() {
  const ctx = useContext(LikeContext);
  if (!ctx) {
    throw new Error("useLikes must be used inside a LikeProvider");
  }
  return ctx;
}