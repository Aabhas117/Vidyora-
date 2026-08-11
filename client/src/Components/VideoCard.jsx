import { Link } from "react-router-dom";
import { getChannelId } from "../Data/channelUtils";

export default function VideoCard({ video }) {
  const { id, title, channel, views, uploaded, thumbnail, avatar } = video;

  return (
    <div className="group cursor-pointer">
      <Link to={`/watch/${id}`} className="block">
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-zinc-800 border border-zinc-800 group-hover:border-violet-500/50 transition-colors">
          <img
            src={thumbnail}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>

      <div className="flex gap-3 mt-3">
        <Link to={`/channel/${getChannelId(channel)}`}>
          <img src={avatar} alt={channel} className="h-9 w-9 rounded-full shrink-0 bg-zinc-800" />
        </Link>
        <div className="min-w-0">
          <Link to={`/watch/${id}`}>
            <h3 className="text-sm font-medium text-zinc-100 leading-snug line-clamp-2 group-hover:text-violet-400 transition-colors">
              {title}
            </h3>
          </Link>
          <Link
            to={`/channel/${getChannelId(channel)}`}
            className="text-xs text-zinc-400 mt-1 hover:text-violet-400 transition-colors block w-fit"
          >
            {channel}
          </Link>
          <p className="text-xs text-zinc-500">
            {views} · {uploaded}
          </p>
        </div>
      </div>
    </div>
  );
}