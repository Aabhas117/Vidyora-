const mongoose = require("mongoose");
const User = require("../models/User");
const Video = require("../models/Video");
const Like = require("../models/Like");
const History = require("../models/History");
const Subscription = require("../models/Subscription");

describe("Database Integrity & Model Constraints", () => {
  let user1, user2, user3;
  let video1, video2;

  beforeEach(async () => {
    user1 = await User.create({
      fullName: "DB User 1",
      username: "dbuser1",
      email: "dbuser1@example.com",
      password: "HashedPassword123!",
    });

    user2 = await User.create({
      fullName: "DB User 2",
      username: "dbuser2",
      email: "dbuser2@example.com",
      password: "HashedPassword123!",
    });

    user3 = await User.create({
      fullName: "DB User 3",
      username: "dbuser3",
      email: "dbuser3@example.com",
      password: "HashedPassword123!",
    });

    video1 = await Video.create({
      title: "DB Integrity Video 1",
      videoUrl: "https://res.cloudinary.com/test/video1.mp4",
      videoPublicId: "pub1",
      thumbnailUrl: "https://res.cloudinary.com/test/thumb1.jpg",
      thumbnailPublicId: "tpub1",
      category: "Tech",
      owner: user1._id,
    });

    video2 = await Video.create({
      title: "DB Integrity Video 2",
      videoUrl: "https://res.cloudinary.com/test/video2.mp4",
      videoPublicId: "pub2",
      thumbnailUrl: "https://res.cloudinary.com/test/thumb2.jpg",
      thumbnailPublicId: "tpub2",
      category: "Music",
      owner: user2._id,
    });
  });

  describe("Unique Compound Indexes Enforcement", () => {
    it("should prevent duplicate likes at the database level via unique index (user, video)", async () => {
      await Like.create({ user: user1._id, video: video1._id });

      let error;
      try {
        await Like.create({ user: user1._id, video: video1._id });
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.code).toBe(11000);
      const count = await Like.countDocuments({ user: user1._id, video: video1._id });
      expect(count).toBe(1);
    });

    it("should prevent duplicate subscriptions at the database level via unique index (user, channel)", async () => {
      await Subscription.create({ user: user1._id, channel: user2._id });

      let error;
      try {
        await Subscription.create({ user: user1._id, channel: user2._id });
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.code).toBe(11000);
      const count = await Subscription.countDocuments({ user: user1._id, channel: user2._id });
      expect(count).toBe(1);
    });

    it("should prevent duplicate history records at the database level via unique index (user, video)", async () => {
      await History.create({ user: user1._id, video: video1._id });

      let error;
      try {
        await History.create({ user: user1._id, video: video1._id });
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.code).toBe(11000);
      const count = await History.countDocuments({ user: user1._id, video: video1._id });
      expect(count).toBe(1);
    });
  });

  describe("Multi-User Data Isolation & Deletion Safety", () => {
    it("should ensure user likes remain completely isolated", async () => {
      await Like.create({ user: user1._id, video: video1._id });
      await Like.create({ user: user2._id, video: video1._id });

      const user1Likes = await Like.find({ user: user1._id });
      const user2Likes = await Like.find({ user: user2._id });

      expect(user1Likes.length).toBe(1);
      expect(user2Likes.length).toBe(1);
      expect(user1Likes[0].user.toString()).toBe(user1._id.toString());
      expect(user2Likes[0].user.toString()).toBe(user2._id.toString());
    });

    it("should ensure user subscriptions remain completely isolated", async () => {
      await Subscription.create({ user: user1._id, channel: user3._id });
      await Subscription.create({ user: user2._id, channel: user3._id });

      const user1Subs = await Subscription.find({ user: user1._id });
      const user2Subs = await Subscription.find({ user: user2._id });

      expect(user1Subs.length).toBe(1);
      expect(user2Subs.length).toBe(1);
      expect(user1Subs[0].channel.toString()).toBe(user3._id.toString());
      expect(user2Subs[0].channel.toString()).toBe(user3._id.toString());
    });

    it("should ensure deleting one user's history never deletes another user's history", async () => {
      await History.create({ user: user1._id, video: video1._id });
      await History.create({ user: user1._id, video: video2._id });
      await History.create({ user: user2._id, video: video1._id });

      // Delete only User 1 history
      await History.deleteMany({ user: user1._id });

      const user1HistoryCount = await History.countDocuments({ user: user1._id });
      const user2HistoryCount = await History.countDocuments({ user: user2._id });

      expect(user1HistoryCount).toBe(0);
      expect(user2HistoryCount).toBe(1);
    });

    it("should ensure deleting one user's likes never deletes another user's likes", async () => {
      await Like.create({ user: user1._id, video: video1._id });
      await Like.create({ user: user2._id, video: video1._id });

      await Like.deleteMany({ user: user1._id });

      const user1LikeCount = await Like.countDocuments({ user: user1._id });
      const user2LikeCount = await Like.countDocuments({ user: user2._id });

      expect(user1LikeCount).toBe(0);
      expect(user2LikeCount).toBe(1);
    });

    it("should ensure deleting one user's subscription never deletes another user's subscription", async () => {
      await Subscription.create({ user: user1._id, channel: user2._id });
      await Subscription.create({ user: user3._id, channel: user2._id });

      await Subscription.deleteOne({ user: user1._id, channel: user2._id });

      const user1SubCount = await Subscription.countDocuments({ user: user1._id });
      const user3SubCount = await Subscription.countDocuments({ user: user3._id });

      expect(user1SubCount).toBe(0);
      expect(user3SubCount).toBe(1);
    });
  });
});
