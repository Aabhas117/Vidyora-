export default function Avatar({ src, name, className = "h-9 w-9" }) {
  if (src) {
    return <img src={src} alt={name || "avatar"} className={`${className} rounded-full object-cover bg-zinc-800 shrink-0`} />;
  }
  return (
    <div className={`${className} rounded-full bg-zinc-800 flex items-center justify-center text-violet-400 shrink-0`}>
      {name?.[0]?.toUpperCase() || "?"}
    </div>
  );
}