const mongoose = require("mongoose");

const viewEventSchema = new mongoose.Schema({
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
    default: null,
  },
  watchedAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

// Index for filtering view events by video and chronological order
viewEventSchema.index({ video: 1, watchedAt: -1 });

// Index for date-range time-series analytics queries across creator videos
viewEventSchema.index({ watchedAt: -1 });

module.exports = mongoose.model("ViewEvent", viewEventSchema);
