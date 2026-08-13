const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
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
    watchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Database-level guarantee: one history entry per user+video pair, ever.
historySchema.index({ user: 1, video: 1 }, { unique: true });

// The main read query is "this user's history, newest watched first" —
// index the exact shape of that query.
historySchema.index({ user: 1, watchedAt: -1 });

module.exports = mongoose.model("History", historySchema);