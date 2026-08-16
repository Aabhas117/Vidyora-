const mongoose = require("mongoose");
const Comment = require("../models/Comment");
const Video = require("../models/Video");

const { MAX_COMMENT_LENGTH } = Comment;
const USER_PUBLIC_FIELDS = "_id username fullName avatar";

function formatComment(comment) {
  return {
    _id: comment._id,
    text: comment.text,
    user: comment.user, // already populated with safe fields only
    parentComment: comment.parentComment,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
  };
}

async function createComment(req, res) {
  try {
    const { videoId } = req.params;
    const { text, parentComment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ message: "Invalid video ID." });
    }

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found." });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text is required." });
    }
    if (text.trim().length > MAX_COMMENT_LENGTH) {
      return res.status(400).json({ message: `Comment must be under ${MAX_COMMENT_LENGTH} characters.` });
    }

    let parentId = null;
    if (parentComment) {
      if (!mongoose.Types.ObjectId.isValid(parentComment)) {
        return res.status(400).json({ message: "Invalid parent comment ID." });
      }

      const parent = await Comment.findById(parentComment);
      if (!parent) {
        return res.status(404).json({ message: "Parent comment not found." });
      }
      if (parent.video.toString() !== videoId) {
        return res.status(400).json({ message: "Parent comment does not belong to this video." });
      }
      // Flatten replies to one level: a reply-to-a-reply attaches to the
      // original top-level comment instead, so the frontend never has to
      // render more than one level of nesting.
      parentId = parent.parentComment ? parent.parentComment : parent._id;
    }

    const comment = await Comment.create({
      user: req.user._id,
      video: videoId,
      text: text.trim(),
      parentComment: parentId,
    });

    await comment.populate("user", USER_PUBLIC_FIELDS);

    return res.status(201).json({ comment: formatComment(comment) });
  } catch (error) {
    console.error("Create comment error:", error.message);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}

async function getVideoComments(req, res) {
  try {
    const { videoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ message: "Invalid video ID." });
    }

    const allComments = await Comment.find({ video: videoId })
      .sort({ createdAt: -1 })
      .populate("user", USER_PUBLIC_FIELDS);

    // Split into top-level comments and replies, then attach each reply to
    // its parent — one level of nesting only, matching the spec.
    const topLevel = allComments.filter((c) => !c.parentComment);
    const replies = allComments.filter((c) => c.parentComment);

    const structured = topLevel.map((comment) => ({
      ...formatComment(comment),
      replies: replies
        .filter((r) => r.parentComment.toString() === comment._id.toString())
        .map(formatComment),
    }));

    return res.status(200).json({ comments: structured });
  } catch (error) {
    console.error("Get video comments error:", error.message);
    return res.status(500).json({ message: "Something went wrong. Please try again."});
  }
}

async function updateComment(req, res) {
  try {
    const { commentId } = req.params;
    const { text } = req.body;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: "Invalid comment ID." });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You do not have permission to edit this comment." });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text is required."});
    }
    if (text.trim().length > MAX_COMMENT_LENGTH) {
      return res.status(400).json({ message: `Comment must be under ${MAX_COMMENT_LENGTH} characters.` });
    }

    comment.text = text.trim();
    await comment.save();
    await comment.populate("user", USER_PUBLIC_FIELDS);

    return res.status(200).json({ comment: formatComment(comment) });
  } catch (error) {
    console.error("Update comment error:", error.message);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}

async function deleteComment(req, res) {
  try {
    const { commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: "Invalid comment ID." });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You do not have permission to delete this comment." });
    }

    // If this is a top-level comment, delete its direct replies too —
    // see final report for why this approach was chosen over soft-delete.
    if (!comment.parentComment) {
      await Comment.deleteMany({ parentComment: comment._id });
    }

    await Comment.deleteOne({ _id: comment._id });

    return res.status(200).json({ message: "Comment deleted." });
  } catch (error) {
    console.error("Delete comment error:", error.message);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}

module.exports = { createComment, getVideoComments, updateComment, deleteComment };