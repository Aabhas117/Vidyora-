/**
 * Converts one backend video document into the shape the existing frontend
 * components (VideoCard, WatchVideo, etc.) already expect. This is the ONLY
 * place backend↔frontend video field names should be translated — no
 * component should ever read raw backend field names directly.
 */
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
    channel: backendVideo.owner?.fullName || backendVideo.owner?.username || "Unknown",
    avatar: backendVideo.owner?.avatar || "",
    // Kept for features (channel navigation, subscribe) that need the real
    // owner ID/username rather than just a display name.
    ownerId: backendVideo.owner?._id,
    ownerUsername: backendVideo.owner?.username,
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
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [label, secs] of units) {
    const value = Math.floor(seconds / secs);
    if (value >= 1) return `${value} ${label}${value > 1 ? "s" : ""} ago`;
  }
  return "just now";
}