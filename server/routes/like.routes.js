const express = require("express");
const { likeVideo, unlikeVideo, getMyLikes, getLikeStatus } = require("../controllers/like.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", requireAuth, getMyLikes);
router.get("/:videoId", requireAuth, getLikeStatus);
router.post("/:videoId", requireAuth, likeVideo);
router.delete("/:videoId", requireAuth, unlikeVideo);

module.exports = router;