import { createContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "../Hooks/useAuth";
import { loadSubscriptions, saveSubscriptions } from "../Services/subscriptionService";

export const SubscriptionContext = createContext(null);

export function SubscriptionProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);

  useEffect(() => {
    if (isAuthenticated && user) {
      setSubscriptions(loadSubscriptions(user._id));
    } else {
      setSubscriptions([]);
    }
  }, [isAuthenticated, user]);

  const isSubscribed = useCallback(
    (channelId) => subscriptions.some((c) => c.id === channelId),
    [subscriptions]
  );

  const subscribe = useCallback(
    (channel) => {
      if (!user) return;
      setSubscriptions((prev) => {
        if (prev.some((c) => c.id === channel.id)) return prev; // no duplicates
        const next = [{ id: channel.id, name: channel.name, avatar: channel.avatar }, ...prev];
        saveSubscriptions(user._id, next);
        return next;
      });
    },
    [user]
  );

  const unsubscribe = useCallback(
    (channelId) => {
      if (!user) return;
      setSubscriptions((prev) => {
        const next = prev.filter((c) => c.id !== channelId);
        saveSubscriptions(user._id, next);
        return next;
      });
    },
    [user]
  );

  const toggleSubscription = useCallback(
    (channel) => {
      if (!isAuthenticated || !user) return false;
      if (isSubscribed(channel.id)) {
        unsubscribe(channel.id);
      } else {
        subscribe(channel);
      }
      return true;
    },
    [isAuthenticated, user, isSubscribed, subscribe, unsubscribe]
  );

  const value = { subscriptions, isSubscribed, subscribe, unsubscribe, toggleSubscription };

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}