// src/pages/Home.jsx
import VideoGrid from "../components/VideoGrid";
import videos from "../Data/Videos";

export default function Home() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-zinc-100 mb-6">Recommended Videos</h1>
      <VideoGrid videos={videos} />
    </div>
  );
}