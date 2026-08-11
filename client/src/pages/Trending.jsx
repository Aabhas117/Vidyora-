import { TrendingUp } from "lucide-react";
import videos from "../Data/videos";
import VideoGrid from "../Components/VideoGrid";

// Parses "12K views" / "1.2M views" / "342 views" into a comparable number.
function parseViews(viewsString) {
  const match = viewsString.match(/([\d.]+)([KM]?)/i);
  if (!match) return 0;
  const [, num, suffix] = match;
  const value = parseFloat(num);
  if (suffix.toUpperCase() === "M") return value * 1_000_000;
  if (suffix.toUpperCase() === "K") return value * 1_000;
  return value;
}

export default function Trending() {
  const trending = [...videos].sort((a, b) => parseViews(b.views) - parseViews(a.views));

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp size={20} className="text-violet-400" />
        <h1 className="text-xl font-semibold text-zinc-100">Trending</h1>
      </div>
      <VideoGrid videos={trending} />
    </div>
  );
}