const mongoose = require("mongoose");
const Playlist = require("../models/Playlist");
const Video = require("../models/Video");

const { NAME_MAX_LENGTH, DESCRIPTION_MAX_LENGTH } = Playlist;
const VIDEO_PUBLIC_FIELDS = "_id title thumbnailUrl videoUrl owner views duration";

function formatPlaylist(playlist) {
  return {
    _id: playlist._id,
    name: playlist.name,
    description: playlist.description,
    owner: playlist.owner,
    videos: playlist.videos,
    createdAt: playlist.createdAt,
    updatedAt: playlist.updatedAt,
  };
}

async function createPlaylist(req, res) {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Playlist name is required." });
    }
    if (name.trim().length > NAME_MAX_LENGTH) {
      return res.status(400).json({ message: `Name must be under ${NAME_MAX_LENGTH} characters.` });
    }
    if (description && description.trim().length > DESCRIPTION_MAX_LENGTH) {
      return res.status(400).json({ message: `Description must be under ${DESCRIPTION_MAX_LENGTH} characters.` });
    }

    const playlist = await Playlist.create({
      name: name.trim(),
      description: description ? description.trim() : "",
      owner: req.user._id,
      videos: [],
    });

    return res.status(201).json({ playlist: formatPlaylist(playlist) });
  } catch (error) {
    console.error("Create playlist error:", error.message);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}

async function getMyPlaylists(req, res) {
  try {
    const playlists = await Playlist.find({ owner: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({ playlists: playlists.map(formatPlaylist) });
  } catch (error) {
    console.error("Get my playlists error:", error.message);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}

async function getPlaylistById(req, res) {
  try {
    const { playlistId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
      return res.status(400).json({ message: "Invalid playlist ID." });
    }

    const playlist = await Playlist.findById(playlistId).populate("videos", VIDEO_PUBLIC_FIELDS);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found." });
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You do not have permission to view this playlist." });
    }

    return res.status(200).json({ playlist: formatPlaylist(playlist) });
  } catch (error) {
    console.error("Get playlist by id error:", error.message);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}

async function updatePlaylist(req, res) {
  try {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
      return res.status(400).json({ message: "Invalid playlist ID." });
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found." });
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You do not have permission to update this playlist." });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ message: "Playlist name cannot be empty." });
      }
      if (name.trim().length > NAME_MAX_LENGTH) {
        return res.status(400).json({ message: `Name must be under ${NAME_MAX_LENGTH} characters.` });
      }
      playlist.name = name.trim();
    }

    if (description !== undefined) {
      if (description.trim().length > DESCRIPTION_MAX_LENGTH) {
        return res.status(400).json({ message: `Description must be under ${DESCRIPTION_MAX_LENGTH} characters.` });
      }
      playlist.description = description.trim();
    }

    await playlist.save();

    return res.status(200).json({ playlist: formatPlaylist(playlist) });
  } catch (error) {
    console.error("Update playlist error:", error.message);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}

async function deletePlaylist(req, res) {
  try {
    const { playlistId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
      return res.status(400).json({ message: "Invalid playlist ID." });
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found." });
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You do not have permission to delete this playlist." });
    }

    // Only the Playlist document is removed — the videos referenced inside
    // it are independent resources and are never touched.
    await Playlist.deleteOne({ _id: playlist._id });

    return res.status(200).json({ message: "Playlist deleted." });
  } catch (error) {
    console.error("Delete playlist error:", error.message);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}

async function addVideoToPlaylist(req, res) {
  try {
    const { playlistId, videoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(playlistId) || !mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ message: "Invalid playlist or video ID." });
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found." });
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You do not have permission to modify this playlist." });
    }

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found." });
    }

    const alreadyInPlaylist = playlist.videos.some((v) => v.toString() === videoId);
    if (alreadyInPlaylist) {
      return res.status(409).json({ message: "This video is already in the playlist." });
    }

    playlist.videos.push(videoId);
    await playlist.save();
    await playlist.populate("videos", VIDEO_PUBLIC_FIELDS);

    return res.status(200).json({ playlist: formatPlaylist(playlist) });
  } catch (error) {
    console.error("Add video to playlist error:", error.message);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}

async function removeVideoFromPlaylist(req, res) {
  try {
    const { playlistId, videoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(playlistId) || !mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ message: "Invalid playlist or video ID." });
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found." });
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You do not have permission to modify this playlist." });
    }

    const videoIndex = playlist.videos.findIndex((v) => v.toString() === videoId);
    if (videoIndex === -1) {
      return res.status(404).json({ message: "This video is not in the playlist." });
    }

    // Only the reference is removed from the array — the Video document
    // itself is never touched.
    playlist.videos.splice(videoIndex, 1);
    await playlist.save();
    await playlist.populate("videos", VIDEO_PUBLIC_FIELDS);

    return res.status(200).json({ playlist: formatPlaylist(playlist) });
  } catch (error) {
    console.error("Remove video from playlist error:", error.message);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}

module.exports = {
  createPlaylist,
  getMyPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
};