import api from "./api";

export async function getComments(videoId) {
  const res = await api.get(`/comments/${videoId}`);
  return res.data.comments;
}

export async function createComment(videoId, text, parentComment) {
  const res = await api.post(`/comments/${videoId}`, {
    text,
    ...(parentComment ? { parentComment } : {}),
  });
  return res.data.comment;
}

export async function updateComment(commentId, text) {
  const res = await api.patch(`/comments/${commentId}`, { text });
  return res.data.comment;
}

export async function deleteComment(commentId) {
  await api.delete(`/comments/${commentId}`);
}