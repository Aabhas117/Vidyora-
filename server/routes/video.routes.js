const express = require("express");
const {
  getAllVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
} = require("../controllers/video.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

const router = express.Router();

router.get("/", getAllVideos);
router.get("/:id", getVideoById);

router.post(
  "/",
  requireAuth,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  createVideo
);

router.patch(
  "/:id",
  requireAuth,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  updateVideo
);

router.delete("/:id", requireAuth, deleteVideo);

module.exports = router;