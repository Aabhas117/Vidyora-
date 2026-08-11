import { useContext } from "react";
import { UserVideoContext } from "../Context/UserVideoContext";

export function useUserVideos() {
  const ctx = useContext(UserVideoContext);
  if (!ctx) {
    throw new Error("useUserVideos must be used inside a UserVideoProvider");
  }
  return ctx;
}