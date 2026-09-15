const express = require("express");
const {
  getOverview,
  getViewsOverTime,
  getTopVideos,
  getSubscriberGrowth,
} = require("../controllers/analytics.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

// All analytics endpoints require authentication and are creator-scoped via req.user._id
router.use(requireAuth);

router.get("/overview", getOverview);
router.get("/views-over-time", getViewsOverTime);
router.get("/top-videos", getTopVideos);
router.get("/subscriber-growth", getSubscriberGrowth);

module.exports = router;
