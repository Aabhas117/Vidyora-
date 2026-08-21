const mongoose = require("mongoose");
const fs = require("fs/promises");
const Video = require("../models/Video");
const cloudinary = require("../config/cloudinary");

const OWNER_PUBLIC_FIELDS = "_id username fullName avatar";

async function getMyVideos(req, res) {
  try {
    const videos = await Video.find({ owner: req.user._id })
      .sort({ createdAt: -1 })
      .populate("owner", OWNER_PUBLIC_FIELDS);

    return res.status(200).json({ videos });
  } catch (error) {
    console.error("Get my videos error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
}

async function getAllVideos(req, res) {
  try {
    const videos = await Video.find()
      .sort({ createdAt: -1 })
      .populate("owner", OWNER_PUBLIC_FIELDS);

    return res.status(200).json({ videos });
  } catch (error) {
    console.error("Get all videos error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
}

async function getVideoById(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid video ID." });
    }

    const video = await Video.findById(id).populate(
      "owner",
      OWNER_PUBLIC_FIELDS,
    );

    if (!video) {
      return res.status(404).json({ message: "Video not found." });
    }

    return res.status(200).json({ video });
  } catch (error) {
    console.error("Get video by id error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
}

async function cleanupTempFile(filePath) {
  if (!filePath) return;
  try {
    await fs.unlink(filePath);
  } catch {
    // ignore — file may already be gone
  }
}

async function createVideo(req, res) {
  const videoFile = req.files?.video?.[0];
  const thumbnailFile = req.files?.thumbnail?.[0];

  try {
    const { title, description, category } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required." });
    }
    if (!category || !category.trim()) {
      return res.status(400).json({ message: "Category is required." });
    }
    if (!videoFile) {
      return res.status(400).json({ message: "Video file is required." });
    }
    if (!thumbnailFile) {
      return res.status(400).json({ message: "Thumbnail is required." });
    }

    let videoResult;
    try {
      videoResult = await cloudinary.uploader.upload(videoFile.path, {
        resource_type: "video",
        folder: "vidyora/videos",
      });
    } catch (err) {
      await cleanupTempFile(videoFile.path);
      await cleanupTempFile(thumbnailFile.path);
      console.error("Cloudinary video upload error:", err.message);
      return res
        .status(500)
        .json({ message: "Failed to upload video. Please try again." });
    }

    let thumbnailResult;
    try {
      thumbnailResult = await cloudinary.uploader.upload(thumbnailFile.path, {
        resource_type: "image",
        folder: "vidyora/thumbnails",
      });
    } catch (err) {
      await cloudinary.uploader
        .destroy(videoResult.public_id, { resource_type: "video" })
        .catch(() => {});
      await cleanupTempFile(videoFile.path);
      await cleanupTempFile(thumbnailFile.path);
      console.error("Cloudinary thumbnail upload error:", err.message);
      return res
        .status(500)
        .json({ message: "Failed to upload thumbnail. Please try again." });
    }

    await cleanupTempFile(videoFile.path);
    await cleanupTempFile(thumbnailFile.path);

    let video;
    try {
      video = await Video.create({
        title: title.trim(),
        description: description ? description.trim() : "",
        category: category.trim(),
        videoUrl: videoResult.secure_url,
        videoPublicId: videoResult.public_id,
        thumbnailUrl: thumbnailResult.secure_url,
        thumbnailPublicId: thumbnailResult.public_id,
        owner: req.user._id,
      });
    } catch (err) {
      await cloudinary.uploader
        .destroy(videoResult.public_id, { resource_type: "video" })
        .catch(() => {});
      await cloudinary.uploader
        .destroy(thumbnailResult.public_id, { resource_type: "image" })
        .catch(() => {});
      console.error("Video document creation error:", err.message);
      return res
        .status(500)
        .json({ message: "Failed to save video. Please try again." });
    }

    return res.status(201).json({
      video: {
        _id: video._id,
        title: video.title,
        description: video.description,
        category: video.category,
        videoUrl: video.videoUrl,
        thumbnailUrl: video.thumbnailUrl,
        owner: video.owner,
        views: video.views,
        createdAt: video.createdAt,
      },
    });
  } catch (error) {
    await cleanupTempFile(videoFile?.path);
    await cleanupTempFile(thumbnailFile?.path);
    console.error("Create video error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
}

async function updateVideo(req, res) {
  const newVideoFile = req.files?.video?.[0];
  const newThumbnailFile = req.files?.thumbnail?.[0];

  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      await cleanupTempFile(newVideoFile?.path);
      await cleanupTempFile(newThumbnailFile?.path);
      return res.status(400).json({ message: "Invalid video ID." });
    }

    const video = await Video.findById(id);

    if (!video) {
      await cleanupTempFile(newVideoFile?.path);
      await cleanupTempFile(newThumbnailFile?.path);
      return res.status(404).json({ message: "Video not found." });
    }

    // Ownership check — the client can never claim to own a video by sending
    // an owner field; only the authenticated user's real _id counts.
    if (video.owner.toString() !== req.user._id.toString()) {
      await cleanupTempFile(newVideoFile?.path);
      await cleanupTempFile(newThumbnailFile?.path);
      return res
        .status(403)
        .json({ message: "You do not have permission to update this video." });
    }

    const { title, description, category } = req.body;

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({ message: "Title cannot be empty." });
      }
      video.title = title.trim();
    }
    if (description !== undefined) {
      video.description = description.trim();
    }
    if (category !== undefined) {
      if (!category.trim()) {
        return res.status(400).json({ message: "Category cannot be empty." });
      }
      video.category = category.trim();
    }

    // --- Optional thumbnail replacement ---
    if (newThumbnailFile) {
      let newThumbnailResult;
      try {
        newThumbnailResult = await cloudinary.uploader.upload(
          newThumbnailFile.path,
          {
            resource_type: "image",
            folder: "vidyora/thumbnails",
          },
        );
      } catch (err) {
        await cleanupTempFile(newThumbnailFile.path);
        await cleanupTempFile(newVideoFile?.path);
        console.error("Thumbnail replacement upload error:", err.message);
        return res
          .status(500)
          .json({
            message: "Failed to upload new thumbnail. Existing thumbnail kept.",
          });
      }

      // New upload succeeded — safe to delete the old one now.
      const oldThumbnailPublicId = video.thumbnailPublicId;
      video.thumbnailUrl = newThumbnailResult.secure_url;
      video.thumbnailPublicId = newThumbnailResult.public_id;
      await cleanupTempFile(newThumbnailFile.path);

      cloudinary.uploader
        .destroy(oldThumbnailPublicId, { resource_type: "image" })
        .catch((err) =>
          console.error("Old thumbnail cleanup error:", err.message),
        );
    }

    // --- Optional video replacement ---
    if (newVideoFile) {
      let newVideoResult;
      try {
        newVideoResult = await cloudinary.uploader.upload(newVideoFile.path, {
          resource_type: "video",
          folder: "vidyora/videos",
        });
      } catch (err) {
        await cleanupTempFile(newVideoFile.path);
        console.error("Video replacement upload error:", err.message);
        return res
          .status(500)
          .json({
            message: "Failed to upload new video. Existing video kept.",
          });
      }

      const oldVideoPublicId = video.videoPublicId;
      video.videoUrl = newVideoResult.secure_url;
      video.videoPublicId = newVideoResult.public_id;
      await cleanupTempFile(newVideoFile.path);

      cloudinary.uploader
        .destroy(oldVideoPublicId, { resource_type: "video" })
        .catch((err) => console.error("Old video cleanup error:", err.message));
    }

    await video.save();

    return res.status(200).json({
      video: {
        _id: video._id,
        title: video.title,
        description: video.description,
        category: video.category,
        videoUrl: video.videoUrl,
        thumbnailUrl: video.thumbnailUrl,
        owner: video.owner,
        views: video.views,
        createdAt: video.createdAt,
        updatedAt: video.updatedAt,
      },
    });
  } catch (error) {
    await cleanupTempFile(newVideoFile?.path);
    await cleanupTempFile(newThumbnailFile?.path);
    console.error("Update video error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
}

async function deleteVideo(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid video ID." });
    }

    const video = await Video.findById(id);

    if (!video) {
      return res.status(404).json({ message: "Video not found." });
    }

    if (video.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You do not have permission to delete this video." });
    }

    // Delete Cloudinary assets using their stored public IDs — never derived from the URL.
    await cloudinary.uploader
      .destroy(video.videoPublicId, { resource_type: "video" })
      .catch((err) =>
        console.error("Cloudinary video delete error:", err.message),
      );

    await cloudinary.uploader
      .destroy(video.thumbnailPublicId, { resource_type: "image" })
      .catch((err) =>
        console.error("Cloudinary thumbnail delete error:", err.message),
      );

    await Video.deleteOne({ _id: video._id });

    return res.status(200).json({ message: "Video deleted successfully." });
  } catch (error) {
    console.error("Delete video error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
}

module.exports = {
  getAllVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
  getMyVideos,
};
