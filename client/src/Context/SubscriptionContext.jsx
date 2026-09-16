import { createContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "../Hooks/useAuth";
import {
  loadSubscriptions,
  subscribeToChannelOnServer,
  unsubscribeFromChannelOnServer,
} from "../Services/subscriptionService";

export const SubscriptionContext = createContext(null);

function getCleanId(target) {
  if (!target) return "";
  if (typeof target === "string") return target;
  if (target.id) return target.id.toString();
  if (target._id) return target._id.toString();
  return target.toString();
}

export function SubscriptionProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);

  useEffect(() => {
    let active = true;
    if (isAuthenticated && user) {
      loadSubscriptions().then((subs) => {
        if (active) setSubscriptions(subs);
      });
    } else {
      setSubscriptions([]);
    }
    return () => {
      active = false;
    };
  }, [isAuthenticated, user]);

  const isSubscribed = useCallback(
    (target) => {
      const idStr = getCleanId(target);
      if (!idStr) return false;
      return subscriptions.some((c) => c.id === idStr);
    },
    [subscriptions]
  );

  const subscribe = useCallback(
    async (channel) => {
      const channelId = getCleanId(channel);
      if (!user || !channelId) return false;

      // Prevent self-subscription
      if (user._id?.toString() === channelId) {
        return false;
      }

      const newSub = {
        id: channelId,
        name: channel.name || channel.fullName || channel.username || "Unknown Channel",
        avatar: channel.avatar || "",
      };

      setSubscriptions((prev) => {
        if (prev.some((c) => c.id === channelId)) return prev;
        return [newSub, ...prev];
      });

      try {
        await subscribeToChannelOnServer(channelId);
        return true;
      } catch (err) {
        const status = err.response?.status;
        // 409 means user is ALREADY subscribed on server — keep local subscription state intact!
        if (status === 409) {
          return true;
        }
        // Rollback on genuine errors
        setSubscriptions((prev) => prev.filter((c) => c.id !== channelId));
        throw err;
      }
    },
    [user]
  );

  const unsubscribe = useCallback(
    async (target) => {
      const channelId = getCleanId(target);
      if (!user || !channelId) return false;

      const targetSub = subscriptions.find((c) => c.id === channelId);
      setSubscriptions((prev) => prev.filter((c) => c.id !== channelId));

      try {
        await unsubscribeFromChannelOnServer(channelId);
        return true;
      } catch (err) {
        const status = err.response?.status;
        // 404 means subscription is ALREADY deleted on server — keep removed from state!
        if (status === 404) {
          return true;
        }
        // Rollback on genuine errors
        if (targetSub) {
          setSubscriptions((prev) => [targetSub, ...prev]);
        }
        throw err;
      }
    },
    [user, subscriptions]
  );

  const toggleSubscription = useCallback(
    async (channel) => {
      const channelId = getCleanId(channel);
      if (!isAuthenticated || !user || !channelId) return false;

      // Self-subscription protection
      if (user._id?.toString() === channelId) {
        return false;
      }

      if (isSubscribed(channelId)) {
        return await unsubscribe(channelId);
      } else {
        return await subscribe(channel);
      }
    },
    [isAuthenticated, user, isSubscribed, subscribe, unsubscribe]
  );

  const value = { subscriptions, isSubscribed, subscribe, unsubscribe, toggleSubscription };

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}