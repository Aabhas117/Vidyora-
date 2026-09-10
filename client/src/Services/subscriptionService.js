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
      return {
        id: channelObj._id || sub.channel,
        name: channelObj.fullName || channelObj.username || "Unknown Channel",
        avatar: channelObj.avatar || "",
        username: channelObj.username || "",
      };
    });
  } catch {
    return [];
  }
}

export async function subscribeToChannelOnServer(channelId) {
  await api.post(`/subscriptions/${channelId}`);
}

export async function unsubscribeFromChannelOnServer(channelId) {
  await api.delete(`/subscriptions/${channelId}`);
}