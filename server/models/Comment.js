const mongoose = require("mongoose");

const MAX_COMMENT_LENGTH = 1000;

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: MAX_COMMENT_LENGTH,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
  },
  { timestamps: true }
);

// Fetching a video's comments (sorted newest-first) is the hot path — index it.
commentSchema.index({ video: 1, createdAt: -1 });

module.exports = mongoose.model("Comment", commentSchema);
module.exports.MAX_COMMENT_LENGTH = MAX_COMMENT_LENGTH;