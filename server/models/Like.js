const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema(
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
  },
  { timestamps: true }
);

// Database-level guarantee: the same user+video pair can never exist twice,
// no matter what the application code does.
likeSchema.index({ user: 1, video: 1 }, { unique: true });

module.exports = mongoose.model("Like", likeSchema);