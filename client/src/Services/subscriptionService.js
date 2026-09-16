import api from "./api";

/**
 * Real backend-backed subscription service.
 *
 * GET    /subscriptions
 * POST   /subscriptions/:channelId
 * DELETE /subscriptions/:channelId
 */

export async function loadSubscriptions() {
  try {
    const res = await api.get("/subscriptions");
    return (res.data.subscriptions || []).map((sub) => {
      const channelObj = sub.channel || {};
      const channelId = channelObj._id || sub.channel;
      return {
        id: channelId ? channelId.toString() : "",
        name: channelObj.fullName || channelObj.username || "Unknown Channel",
        avatar: channelObj.avatar || "",
        username: channelObj.username || "",
      };
    }).filter((c) => Boolean(c.id));
  } catch {
    return [];
  }
}

export async function subscribeToChannelOnServer(channelId) {
  const res = await api.post(`/subscriptions/${channelId}`);
  return res.data;
}

export async function unsubscribeFromChannelOnServer(channelId) {
  const res = await api.delete(`/subscriptions/${channelId}`);
  return res.data;
}