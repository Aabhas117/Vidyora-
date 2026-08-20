// Takes an array of videos and lays them out in a responsive grid.
// It doesn't know or care where the data came from — that's Home.jsx's job.
import VideoCard from "./VideoCard";
export default function VideoGrid({ videos }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}
