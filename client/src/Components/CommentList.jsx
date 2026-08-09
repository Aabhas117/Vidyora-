import { useState } from "react";
import Comment from "./Comment";

const initialComments = [
  { id: 1, username: "Rahul", avatar: "https://i.pravatar.cc/40?img=11", text: "Amazing tutorial, thanks!" },
  { id: 2, username: "Priya", avatar: "https://i.pravatar.cc/40?img=12", text: "This helped me understand routing so much better." },
  { id: 3, username: "Aman", avatar: "https://i.pravatar.cc/40?img=13", text: "Waiting for the backend part 🔥" },
];

export default function CommentList() {
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState("");

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newComment = {
      id: Date.now(),
      username: "You",
      avatar: "https://i.pravatar.cc/40?img=14",
      text: text.trim(),
    };

    setComments((prev) => [newComment, ...prev]);
    setText("");
  };

  return (
    <div>
      <h2 className="text-sm font-semibold text-zinc-300 mb-4">
        {comments.length} Comments
      </h2>

      <form onSubmit={handleAddComment} className="flex gap-3 mb-6">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 bg-transparent border-b border-zinc-800 pb-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500"
        />
        {text && (
          <button
            type="submit"
            className="px-4 py-1.5 h-fit rounded-full bg-violet-500 text-white text-xs font-semibold hover:bg-violet-400"
          >
            Comment
          </button>
        )}
      </form>

      <div className="space-y-5">
        {comments.map((comment) => (
          <Comment key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
}