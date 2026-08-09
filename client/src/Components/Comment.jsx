export default function Comment({ comment }) {
  const { username, avatar, text } = comment;

  return (
    <div className="flex gap-3">
      <img src={avatar} alt={username} className="h-8 w-8 rounded-full shrink-0 bg-zinc-800" />
      <div>
        <p className="text-sm text-zinc-100 font-medium">{username}</p>
        <p className="text-sm text-zinc-400">{text}</p>
      </div>
    </div>
  );
}