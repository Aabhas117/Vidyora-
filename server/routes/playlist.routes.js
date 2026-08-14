const express = require("express");
const {
  createPlaylist,
  getMyPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
} = require("../controllers/playlist.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", requireAuth, createPlaylist);
router.get("/", requireAuth, getMyPlaylists);
router.get("/:playlistId", requireAuth, getPlaylistById);
router.patch("/:playlistId", requireAuth, updatePlaylist);
router.delete("/:playlistId", requireAuth, deletePlaylist);

router.post("/:playlistId/videos/:videoId", requireAuth, addVideoToPlaylist);
router.delete("/:playlistId/videos/:videoId", requireAuth, removeVideoFromPlaylist);

module.exports = router;