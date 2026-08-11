import { useContext } from "react";
import { SubscriptionContext } from "../Context/SubscriptionContext";

export function useSubscriptions() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) {
    throw new Error("useSubscriptions must be used inside a SubscriptionProvider");
  }
  return ctx;
}