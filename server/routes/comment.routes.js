const express = require("express");
const {
  createComment,
  getVideoComments,
  updateComment,
  deleteComment,
} = require("../controllers/comment.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/:videoId", getVideoComments); // public
router.post("/:videoId", requireAuth, createComment);
router.patch("/:commentId", requireAuth, updateComment);
router.delete("/:commentId", requireAuth, deleteComment);

module.exports = router;