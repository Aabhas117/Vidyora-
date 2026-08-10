import { useContext } from "react";
import { PlaylistContext } from "../Context/PlaylistContext";

export function usePlaylists() {
  const ctx = useContext(PlaylistContext);
  if (!ctx) {
    throw new Error("usePlaylists must be used inside a PlaylistProvider");
  }
  return ctx;
}