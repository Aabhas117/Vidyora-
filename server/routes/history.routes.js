const express = require("express");
const {
  addToHistory,
  getHistory,
  removeFromHistory,
  clearHistory,
} = require("../controllers/history.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", requireAuth, getHistory);
router.post("/:videoId", requireAuth, addToHistory);
router.delete("/:videoId", requireAuth, removeFromHistory);
router.delete("/", requireAuth, clearHistory);

module.exports = router;