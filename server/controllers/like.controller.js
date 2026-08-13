const mongoose = require("mongoose");
const Like = require("../models/Like");
const Video = require("../models/Video");

async function likeVideo(req, res) {
  try {
    const { videoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ message: "Invalid video ID." });
    }

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found." });
    }

    const existingLike = await Like.findOne({ user: req.user._id, video: videoId });
    if (existingLike) {
      return res.status(409).json({ message: "You already liked this video." });
    }

    const like = await Like.create({ user: req.user._id, video: videoId });

    return res.status(201).json({
      like: {
        _id: like._id,
        video: like.video,
        createdAt: like.createdAt,
      },
    });
  } catch (error) {
    // Fallback safety net: if two identical requests race each other between
    // the findOne check above and this create call, the unique index still
    // rejects the second insert — this catches that race as a clean 409
    // instead of a raw MongoDB duplicate-key error leaking to the client.
    if (error.code === 11000) {
      return res.status(409).json({ message: "You already liked this video." });
    }
    console.error("Like video error:", error.message);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}

async function unlikeVideo(req, res) {
  try {
    const { videoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ message: "Invalid video ID." });
    }

    // Scoped to req.user._id — a user can only ever delete their own like,
    // never one belonging to someone else, regardless of what videoId is passed.
    const deleted = await Like.findOneAndDelete({ user: req.user._id, video: videoId });

    if (!deleted) {
      return res.status(404).json({ message: "Like not found." });
    }

    return res.status(200).json({ message: "Video unliked." });
  } catch (error) {
    console.error("Unlike video error:", error.message);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}

async function getMyLikes(req, res) {
  try {
    const likes = await Like.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("video", "_id title thumbnailUrl videoUrl owner category views");

    return res.status(200).json({ likes });
  } catch (error) {
    console.error("Get my likes error:", error.message);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}

async function getLikeStatus(req, res) {
  try {
    const { videoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ message: "Invalid video ID." });
    }

    const like = await Like.findOne({ user: req.user._id, video: videoId });

    return res.status(200).json({ liked: !!like });
  } catch (error) {
    console.error("Get like status error:", error.message);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}

module.exports = { likeVideo, unlikeVideo, getMyLikes, getLikeStatus };