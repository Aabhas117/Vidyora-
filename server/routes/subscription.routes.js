const express = require("express");
const {
  subscribeToChannel,
  unsubscribeFromChannel,
  getMySubscriptions,
  getSubscriptionStatus,
  getSubscriberCount,
} = require("../controllers/subscription.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", requireAuth, getMySubscriptions);
router.get("/:channelId/status", requireAuth, getSubscriptionStatus);
router.get("/channel/:channelId/count", requireAuth, getSubscriberCount);
router.post("/:channelId", requireAuth, subscribeToChannel);
router.delete("/:channelId", requireAuth, unsubscribeFromChannel);

module.exports = router;