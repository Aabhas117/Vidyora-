/**
 * MOCK subscription persistence — localStorage only, no backend yet.
 *
 * Later this becomes:
 *   GET    /api/v1/subscriptions
 *   POST   /api/v1/subscriptions/:channelId
 *   DELETE /api/v1/subscriptions/:channelId
 *
 * SubscriptionContext.jsx never needs to change when that happens —
 * it only calls loadSubscriptions/saveSubscriptions and updates state.
 */
const STORAGE_PREFIX = "vidyora_subscriptions_";

function getKey(userId) {
  return `${STORAGE_PREFIX}${userId}`;
}

export function loadSubscriptions(userId) {
  if (!userId) return [];
  try {
    return JSON.parse(localStorage.getItem(getKey(userId))) || [];
  } catch {
    return [];
  }
}

export function saveSubscriptions(userId, subscriptions) {
  if (!userId) return;
  localStorage.setItem(getKey(userId), JSON.stringify(subscriptions));
}