const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    videoPublicId: {
      type: String,
      required: true, // needed later to delete the asset from Cloudinary
    },
    thumbnailUrl: {
      type: String,
      required: true,
    },
    thumbnailPublicId: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    duration: {
      type: String,
      default: "0:00",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Video", videoSchema);