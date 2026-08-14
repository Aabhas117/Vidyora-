const mongoose = require("mongoose");

const NAME_MAX_LENGTH = 60;
const DESCRIPTION_MAX_LENGTH = 300;

const playlistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: NAME_MAX_LENGTH,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: DESCRIPTION_MAX_LENGTH,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    videos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
  },
  { timestamps: true }
);

// The main list query is "this user's playlists, newest first."
playlistSchema.index({ owner: 1, createdAt: -1 });

module.exports = mongoose.model("Playlist", playlistSchema);
module.exports.NAME_MAX_LENGTH = NAME_MAX_LENGTH;
module.exports.DESCRIPTION_MAX_LENGTH = DESCRIPTION_MAX_LENGTH;