import { createContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "../Hooks/useAuth";
import {
  loadSubscriptions,
  subscribeToChannelOnServer,
  unsubscribeFromChannelOnServer,
} from "../Services/subscriptionService";

export const SubscriptionContext = createContext(null);

export function SubscriptionProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadSubscriptions().then(setSubscriptions);
    } else {
      setSubscriptions([]);
    }
  }, [isAuthenticated, user]);

  const isSubscribed = useCallback(
    (channelId) => Boolean(channelId && subscriptions.some((c) => c.id === channelId)),
    [subscriptions]
  );

  const subscribe = useCallback(
    (channel) => {
      if (!user || !channel?.id) return;
      const newSub = { id: channel.id, name: channel.name || "Unknown Channel", avatar: channel.avatar || "" };
      setSubscriptions((prev) => {
        if (prev.some((c) => c.id === channel.id)) return prev;
        return [newSub, ...prev];
      });
      subscribeToChannelOnServer(channel.id).catch(() => {
        // Rollback on failure
        setSubscriptions((prev) => prev.filter((c) => c.id !== channel.id));
      });
    },
    [user]
  );

  const unsubscribe = useCallback(
    (channelId) => {
      if (!user || !channelId) return;
      const targetSub = subscriptions.find((c) => c.id === channelId);
      setSubscriptions((prev) => prev.filter((c) => c.id !== channelId));
      unsubscribeFromChannelOnServer(channelId).catch(() => {
        // Rollback on failure
        if (targetSub) {
          setSubscriptions((prev) => [targetSub, ...prev]);
        }
      });
    },
    [user, subscriptions]
  );

  const toggleSubscription = useCallback(
    (channel) => {
      if (!isAuthenticated || !user || !channel?.id) return false;
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