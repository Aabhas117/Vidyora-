export default function VideoPlayer({ src, poster }) {
  return (
    <div className="aspect-video w-full bg-black rounded-xl overflow-hidden">
      <video
        key={src}
        src={src}
        poster={poster}
        controls
        className="h-full w-full"
      >
        Your browser doesn't support embedded videos.
      </video>
    </div>
  );
}