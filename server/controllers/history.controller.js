const mongoose = require("mongoose");
const History = require("../models/History");
const Video = require("../models/Video");

async function addToHistory(req, res) {
  try {
    const { videoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ message: "Invalid video ID." });
    }

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found." });
    }

    // findOneAndUpdate with upsert:true is the core of "rewatch behavior" —
    // if a history doc for this user+video already exists, its watchedAt is
    // simply overwritten (bumping it to the top of the sort order); if it
    // doesn't exist, one is created. Either way, exactly one document ever
    // exists per user+video, enforced further by the unique index as a
    // backstop against race conditions.
    const historyItem = await History.findOneAndUpdate(
      { user: req.user._id, video: videoId },
      { watchedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json({
      history: {
        _id: historyItem._id,
        video: historyItem.video,
        watchedAt: historyItem.watchedAt,
      },
    });
  } catch (error) {
    console.error("Add to history error:", error.message);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}

async function getHistory(req, res) {
  try {
    const history = await History.find({ user: req.user._id })
      .sort({ watchedAt: -1 })
      .populate("video", "_id title thumbnailUrl videoUrl owner category views");

    return res.status(200).json({ history });
  } catch (error) {
    console.error("Get history error:", error.message);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}

async function removeFromHistory(req, res) {
  try {
    const { videoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ message: "Invalid video ID." });
    }

    // Scoped to req.user._id — a user can only ever delete their own
    // history entry, never one belonging to someone else.
    const deleted = await History.findOneAndDelete({ user: req.user._id, video: videoId });

    if (!deleted) {
      return res.status(404).json({ message: "History item not found." });
    }

    return res.status(200).json({ message: "Removed from watch history." });
  } catch (error) {
    console.error("Remove from history error:", error.message);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}

async function clearHistory(req, res) {
  try {
    await History.deleteMany({ user: req.user._id });
    return res.status(200).json({ message: "Watch history cleared successfully." });
  } catch (error) {
    console.error("Clear history error:", error.message);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}

module.exports = { addToHistory, getHistory, removeFromHistory, clearHistory };