import { useState } from "react";
import { useAuth } from "../Hooks/useAuth";
import Avatar from "./Avatar";

function timeAgo(dateString) {
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

export default function Comment({ comment, onReply, onEdit, onDelete, isReply = false }) {
  const { user, isAuthenticated } = useAuth();
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const { text, user: author, createdAt, replies = [] } = comment;
  const isOwner = isAuthenticated && user?._id === author?._id;

  const submitReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onReply(comment._id, replyText.trim());
    setReplyText("");
    setReplying(false);
  };

  const submitEdit = (e) => {
    e.preventDefault();
    if (!editText.trim()) return;
    onEdit(comment._id, editText.trim());
    setEditing(false);
  };

  return (
    <div className="flex gap-3">
      <Avatar src={author?.avatar} name={author?.fullName || author?.username} className="h-8 w-8" />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <p className="text-sm text-zinc-100 font-medium">{author?.fullName || author?.username || "Unknown"}</p>
          <span className="text-xs text-zinc-600">{timeAgo(createdAt)}</span>
        </div>

        {editing ? (
          <form onSubmit={submitEdit} className="flex gap-2 mt-1.5">
            <input
              autoFocus
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-full px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-violet-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-full bg-violet-500 text-white text-xs font-semibold hover:bg-violet-400"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setEditText(text);
              }}
              className="px-3 py-1.5 rounded-full border border-zinc-700 text-zinc-300 text-xs hover:border-zinc-500"
            >
              Cancel
            </button>
          </form>
        ) : (
          <p className="text-sm text-zinc-400 mt-0.5">{text}</p>
        )}

        {!editing && (
          <div className="flex items-center gap-4 mt-1.5">
            {!isReply && isAuthenticated && (
              <button
                onClick={() => setReplying((r) => !r)}
                className="text-xs text-zinc-500 hover:text-violet-400 transition-colors"
              >
                Reply
              </button>
            )}
            {isOwner && (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="text-xs text-zinc-500 hover:text-violet-400 transition-colors"
                >
                  Edit
                </button>
                {confirmingDelete ? (
                  <span className="flex items-center gap-2 text-xs">
                    <span className="text-zinc-500">Delete?</span>
                    <button
                      onClick={() => onDelete(comment._id)}
                      className="text-red-400 hover:underline"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setConfirmingDelete(false)}
                      className="text-zinc-500 hover:underline"
                    >
                      Cancel
                    </button>
                  </span>
                ) : (
                  <button
                    onClick={() => setConfirmingDelete(true)}
                    className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    Delete
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {replying && (
          <form onSubmit={submitReply} className="flex gap-2 mt-3">
            <input
              autoFocus
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Reply as ${user?.fullName || user?.username || "you"}`}
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-full px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-full bg-violet-500 text-white text-xs font-semibold hover:bg-violet-400"
            >
              Reply
            </button>
          </form>
        )}

        {!isReply && replies.length > 0 && (
          <div className="mt-3 space-y-3 border-l border-zinc-800 pl-4">
            {replies.map((reply) => (
              <Comment
                key={reply._id}
                comment={reply}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                isReply
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}