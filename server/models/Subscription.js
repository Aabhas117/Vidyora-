const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // the "channel" is just a regular User document being followed
      required: true,
    },
  },
  { timestamps: true }
);

// Database-level guarantee: one subscription per user+channel pair, ever.
subscriptionSchema.index({ user: 1, channel: 1 }, { unique: true });

// The subscriber-count endpoint queries "how many subs does this channel have" —
// index the channel field to keep that count fast as subscriptions grow.
subscriptionSchema.index({ channel: 1 });

module.exports = mongoose.model("Subscription", subscriptionSchema);