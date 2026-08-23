import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Hooks/useAuth";
import Comment from "./Comment";
import { getComments, createComment, updateComment, deleteComment } from "../Services/commentService";

export default function CommentList({ videoId }) {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [text, setText] = useState("");

  const loadComments = useCallback(() => {
    if (!videoId) return;
    setLoading(true);
    setError(false);
    getComments(videoId)
      .then(setComments)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [videoId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!text.trim()) return;

    try {
      const newComment = await createComment(videoId, text.trim());
      setComments((prev) => [{ ...newComment, replies: [] }, ...prev]);
      setText("");
    } catch {
      // Leave the input as-is so the user can retry.
    }
  };

  const handleReply = async (parentCommentId, replyText) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      const newReply = await createComment(videoId, replyText, parentCommentId);
      setComments((prev) =>
        prev.map((c) =>
          c._id === parentCommentId ? { ...c, replies: [...(c.replies || []), newReply] } : c
        )
      );
    } catch {
      // Silently fail — comment list stays consistent with server state.
    }
  };

  const handleEdit = async (commentId, newText) => {
    try {
      const updated = await updateComment(commentId, newText);
      setComments((prev) =>
        prev.map((c) => {
          if (c._id === commentId) return { ...c, text: updated.text };
          if (c.replies?.some((r) => r._id === commentId)) {
            return {
              ...c,
              replies: c.replies.map((r) => (r._id === commentId ? { ...r, text: updated.text } : r)),
            };
          }
          return c;
        })
      );
    } catch {
      // Leave displayed text unchanged if the edit failed.
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await deleteComment(commentId);
      // Deleting a top-level comment also removes its replies on the
      // backend — mirror that by removing the whole top-level entry.
      // Deleting a reply only removes that one reply from its parent.
      setComments((prev) => {
        const isTopLevel = prev.some((c) => c._id === commentId);
        if (isTopLevel) {
          return prev.filter((c) => c._id !== commentId);
        }
        return prev.map((c) => ({
          ...c,
          replies: (c.replies || []).filter((r) => r._id !== commentId),
        }));
      });
    } catch {
      // Leave the comment visible if deletion failed server-side.
    }
  };

  const totalCount = comments.reduce((sum, c) => sum + 1 + (c.replies?.length || 0), 0);

  return (
    <div>
      <h2 className="text-sm font-semibold text-zinc-300 mb-4">{totalCount} Comments</h2>

      <form onSubmit={handleAddComment} className="flex gap-3 mb-6">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={isAuthenticated ? "Add a comment..." : "Sign in to comment"}
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

      {loading ? (
        <p className="text-sm text-zinc-500">Loading comments...</p>
      ) : error ? (
        <p className="text-sm text-zinc-500">Couldn't load comments. Try refreshing.</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-zinc-500">Be the first to comment.</p>
      ) : (
        <div className="space-y-5">
          {comments.map((comment) => (
            <Comment
              key={comment._id}
              comment={comment}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}