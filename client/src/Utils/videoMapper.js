export function mapVideo(backendVideo) {
  if (!backendVideo) return null;

  return {
    id: backendVideo._id,
    title: backendVideo.title,
    description: backendVideo.description || "",
    category: backendVideo.category,
    thumbnail: backendVideo.thumbnailUrl,
    videoUrl: backendVideo.videoUrl,
    views: formatViews(backendVideo.views),
    uploaded: formatUploaded(backendVideo.createdAt),
    // Fallback chain guarantees this is NEVER undefined, even if owner
    // failed to populate (e.g. deleted user) — always a safe string.
    channel: backendVideo.owner?.fullName || backendVideo.owner?.username || "Unknown Channel",
    avatar: backendVideo.owner?.avatar || "",
    // The real MongoDB User._id — this is what channel links/subscriptions
    // should use, never a slugified name.
    channelId: backendVideo.owner?._id || null,
  };
}

export function mapVideos(backendVideos) {
  return (backendVideos || []).map(mapVideo);
}

function formatViews(count = 0) {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M views`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K views`;
  return `${count} view${count === 1 ? "" : "s"}`;
}

function formatUploaded(dateString) {
  if (!dateString) return "";
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  const units = [["year", 31536000], ["month", 2592000], ["day", 86400], ["hour", 3600], ["minute", 60]];
  for (const [label, secs] of units) {
    const value = Math.floor(seconds / secs);
    if (value >= 1) return `${value} ${label}${value > 1 ? "s" : ""} ago`;
  }
  return "just now";
}