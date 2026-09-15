const mongoose = require("mongoose");
const Video = require("../models/Video");
const Like = require("../models/Like");
const Comment = require("../models/Comment");
const Subscription = require("../models/Subscription");
const ViewEvent = require("../models/ViewEvent");

/**
 * GET /api/v1/analytics/overview
 * Owner-scoped overview metrics (totalViews, totalLikes, totalComments, totalSubscribers).
 */
async function getOverview(req, res) {
  try {
    const creatorId = req.user._id;

    // Get all videos owned by the authenticated creator
    const creatorVideos = await Video.find({ owner: creatorId }).select("_id views").lean();
    const videoIds = creatorVideos.map((v) => v._id);

    // 1. Total Views (SUM of fast-read denormalized Video.views)
    const totalViews = creatorVideos.reduce((acc, v) => acc + (v.views || 0), 0);

    // 2. Total Likes across creator's videos
    const totalLikes = videoIds.length > 0 ? await Like.countDocuments({ video: { $in: videoIds } }) : 0;

    // 3. Total Comments across creator's videos
    const totalComments = videoIds.length > 0 ? await Comment.countDocuments({ video: { $in: videoIds } }) : 0;

    // 4. Total Subscribers for the authenticated creator
    const totalSubscribers = await Subscription.countDocuments({ channel: creatorId });

    return res.status(200).json({
      totalViews,
      totalLikes,
      totalComments,
      totalSubscribers,
    });
  } catch (error) {
    console.error("Analytics overview error:", error.message);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}

/**
 * GET /api/v1/analytics/views-over-time?days=30
 * Bounded date range time-series analytics using ViewEvent collection.
 */
async function getViewsOverTime(req, res) {
  try {
    const creatorId = req.user._id;
    let days = parseInt(req.query.days) || 30;
    if (isNaN(days) || days < 1 || days > 90) {
      days = 30;
    }

    const creatorVideos = await Video.find({ owner: creatorId }).select("_id").lean();
    const videoIds = creatorVideos.map((v) => v._id);

    const startDate = new Date();
    startDate.setUTCDate(startDate.getUTCDate() - (days - 1));
    startDate.setUTCHours(0, 0, 0, 0);

    let viewEventsByDate = [];
    if (videoIds.length > 0) {
      viewEventsByDate = await ViewEvent.aggregate([
        {
          $match: {
            video: { $in: videoIds },
            watchedAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$watchedAt" } },
            views: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);
    }

    // Map aggregation results for fast lookup
    const viewsMap = new Map();
    viewEventsByDate.forEach((item) => {
      viewsMap.set(item._id, item.views);
    });

    // Generate complete date sequence including 0-view days
    const data = [];
    for (let i = 0; i < days; i++) {
      const dateObj = new Date(startDate);
      dateObj.setUTCDate(startDate.getUTCDate() + i);
      const dateStr = dateObj.toISOString().split("T")[0];
      data.push({
        date: dateStr,
        views: viewsMap.get(dateStr) || 0,
      });
    }

    return res.status(200).json({ days, data });
  } catch (error) {
    console.error("Views over time error:", error.message);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}

/**
 * GET /api/v1/analytics/top-videos?sort=views
 * Creator's top 10 videos ranked by views, likes, or engagement (likes + comments).
 */
async function getTopVideos(req, res) {
  try {
    const creatorId = req.user._id;
    const allowedSorts = ["views", "likes", "engagement"];
    const sortParam = allowedSorts.includes(req.query.sort) ? req.query.sort : "views";

    const creatorVideos = await Video.find({ owner: creatorId })
      .select("_id title thumbnailUrl views createdAt")
      .lean();

    if (creatorVideos.length === 0) {
      return res.status(200).json({ videos: [] });
    }

    const videoIds = creatorVideos.map((v) => v._id);

    // Calculate likes and comments per video
    const [likesGroup, commentsGroup] = await Promise.all([
      Like.aggregate([
        { $match: { video: { $in: videoIds } } },
        { $group: { _id: "$video", count: { $sum: 1 } } },
      ]),
      Comment.aggregate([
        { $match: { video: { $in: videoIds } } },
        { $group: { _id: "$video", count: { $sum: 1 } } },
      ]),
    ]);

    const likesMap = new Map(likesGroup.map((item) => [item._id.toString(), item.count]));
    const commentsMap = new Map(commentsGroup.map((item) => [item._id.toString(), item.count]));

    const enrichedVideos = creatorVideos.map((v) => {
      const likes = likesMap.get(v._id.toString()) || 0;
      const comments = commentsMap.get(v._id.toString()) || 0;
      const engagement = likes + comments;

      return {
        _id: v._id,
        title: v.title,
        thumbnail: v.thumbnailUrl,
        views: v.views || 0,
        likes,
        comments,
        engagement,
      };
    });

    // Sort descending by requested metric
    enrichedVideos.sort((a, b) => b[sortParam] - a[sortParam]);

    return res.status(200).json({ videos: enrichedVideos.slice(0, 10) });
  } catch (error) {
    console.error("Top videos error:", error.message);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}

/**
 * GET /api/v1/analytics/subscriber-growth
 * New subscribers over the past 30 days for the authenticated creator.
 */
async function getSubscriberGrowth(req, res) {
  try {
    const creatorId = req.user._id;
    const days = 30;

    const startDate = new Date();
    startDate.setUTCDate(startDate.getUTCDate() - (days - 1));
    startDate.setUTCHours(0, 0, 0, 0);

    const growthGroup = await Subscription.aggregate([
      {
        $match: {
          channel: creatorId,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          newSubscribers: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const subMap = new Map(growthGroup.map((item) => [item._id, item.newSubscribers]));

    const data = [];
    for (let i = 0; i < days; i++) {
      const dateObj = new Date(startDate);
      dateObj.setUTCDate(startDate.getUTCDate() + i);
      const dateStr = dateObj.toISOString().split("T")[0];
      data.push({
        date: dateStr,
        newSubscribers: subMap.get(dateStr) || 0,
      });
    }

    return res.status(200).json({ data });
  } catch (error) {
    console.error("Subscriber growth error:", error.message);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}

module.exports = {
  getOverview,
  getViewsOverTime,
  getTopVideos,
  getSubscriberGrowth,
};
