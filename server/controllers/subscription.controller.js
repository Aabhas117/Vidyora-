const mongoose = require("mongoose");
const Subscription = require("../models/Subscription");
const User = require("../models/User");

const CHANNEL_PUBLIC_FIELDS = "_id username fullName avatar bio";

async function subscribeToChannel(req, res) {
  try {
    const { channelId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
      return res.status(400).json({ message: "Invalid channel ID." });
    }

    // Self-subscription check happens before the DB lookup for the channel —
    // no need to query at all if the IDs already match.
    if (channelId === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot subscribe to your own channel." });
    }

    const channel = await User.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found." });
    }

    const existing = await Subscription.findOne({ user: req.user._id, channel: channelId });
    if (existing) {
      return res.status(409).json({ message: "You are already subscribed to this channel." });
    }

    const subscription = await Subscription.create({ user: req.user._id, channel: channelId });

    return res.status(201).json({
      subscription: {
        _id: subscription._id,
        channel: subscription.channel,
        createdAt: subscription.createdAt,
      },
    });
  } catch (error) {
    // Race-condition safety net, same pattern as Likes.
    if (error.code === 11000) {
      return res.status(409).json({ message: "You are already subscribed to this channel." });
    }
    console.error("Subscribe error:", error.message);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}

async function unsubscribeFromChannel(req, res) {
  try {
    const { channelId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
      return res.status(400).json({ message: "Invalid channel ID." });
    }

    const channel = await User.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found." });
    }

    const deleted = await Subscription.findOneAndDelete({ user: req.user._id, channel: channelId });

    if (!deleted) {
      return res.status(404).json({ message: "Subscription not found." });
    }

    return res.status(200).json({ message: "Unsubscribed successfully." });
  } catch (error) {
    console.error("Unsubscribe error:", error.message);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}

async function getMySubscriptions(req, res) {
  try {
    const subscriptions = await Subscription.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("channel", CHANNEL_PUBLIC_FIELDS);

    return res.status(200).json({ subscriptions });
  } catch (error) {
    console.error("Get my subscriptions error:", error.message);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}

async function getSubscriptionStatus(req, res) {
  try {
    const { channelId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
      return res.status(400).json({ message: "Invalid channel ID." });
    }

    const channel = await User.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found." });
    }

    const subscription = await Subscription.findOne({ user: req.user._id, channel: channelId });

    return res.status(200).json({ subscribed: !!subscription });
  } catch (error) {
    console.error("Get subscription status error:", error.message);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}

async function getSubscriberCount(req, res) {
  try {
    const { channelId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
      return res.status(400).json({ message: "Invalid channel ID." });
    }

    const channel = await User.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found." });
    }

    const subscriberCount = await Subscription.countDocuments({ channel: channelId });

    return res.status(200).json({ channelId, subscriberCount });
  } catch (error) {
    console.error("Get subscriber count error:", error.message);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}

module.exports = {
  subscribeToChannel,
  unsubscribeFromChannel,
  getMySubscriptions,
  getSubscriptionStatus,
  getSubscriberCount,
};