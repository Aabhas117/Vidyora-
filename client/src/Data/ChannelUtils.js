/**
 * Every video currently only stores its channel as a plain name string
 * (e.g. "Vidyora Academy"), with no stable ID. Rather than inventing a
 * separate channel list that could drift out of sync with Videos.js,
 * every channel's ID is derived directly from its name — same name
 * always produces the same ID, with zero duplication of data.
 *
 * Later, when a real backend exists, channels will have real database
 * IDs and this file goes away — every place that calls getChannelId()
 * would instead just read video.channelId directly from the API response.
 */
export function getChannelId(channelName) {
  return channelName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Builds a normalized channel object from the existing dummy video data —
 * scans all videos, finds ones belonging to this channel, and derives
 * avatar/description/subscriber info from what's already there.
 */
export function getChannelById(channelId, videos) {
  const channelVideos = videos.filter((v) => getChannelId(v.channel) === channelId);
  if (channelVideos.length === 0) return null;

  const first = channelVideos[0];
  return {
    id: channelId,
    name: first.channel,
    avatar: first.avatar,
    description: `${first.channel} on Vidyora.`,
    videos: channelVideos,
  };
}