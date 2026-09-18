const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");
const User = require("../models/User");
const Video = require("../models/Video");
const Like = require("../models/Like");

describe("Likes API Endpoints (/api/v1/likes)", () => {
  let userA, cookieA;
  let userB, cookieB;
  let video1, video2;

  async function createAndLoginUser(userData) {
    const registerRes = await request(app).post("/api/v1/auth/register").send(userData);
    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email: userData.email,
      password: userData.password,
    });
    return {
      user: registerRes.body.user,
      cookie: loginRes.headers["set-cookie"],
    };
  }

  async function createTestVideo(ownerId, title = "Test Video") {
    return await Video.create({
      title,
      description: "Sample video description",
      videoUrl: "https://res.cloudinary.com/test/video/upload/sample.mp4",
      videoPublicId: "sample_vid_public",
      thumbnailUrl: "https://res.cloudinary.com/test/image/upload/sample.jpg",
      thumbnailPublicId: "sample_thumb_public",
      category: "Gaming",
      owner: ownerId,
    });
  }

  beforeEach(async () => {
    const resA = await createAndLoginUser({
      fullName: "User Alpha",
      username: "useralpha",
      email: "alpha@example.com",
      password: "Password123!",
    });
    userA = resA.user;
    cookieA = resA.cookie;

    const resB = await createAndLoginUser({
      fullName: "User Beta",
      username: "userbeta",
      email: "beta@example.com",
      password: "Password123!",
    });
    userB = resB.user;
    cookieB = resB.cookie;

    video1 = await createTestVideo(userB._id, "Video One");
    video2 = await createTestVideo(userB._id, "Video Two");
  });

  describe("Authentication Checks", () => {
    it("should return 401 when POST /api/v1/likes/:videoId is called without auth cookie", async () => {
      const res = await request(app).post(`/api/v1/likes/${video1._id}`);
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("message", "Not authenticated.");
    });

    it("should return 401 when DELETE /api/v1/likes/:videoId is called without auth cookie", async () => {
      const res = await request(app).delete(`/api/v1/likes/${video1._id}`);
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("message", "Not authenticated.");
    });

    it("should return 401 when GET /api/v1/likes is called without auth cookie", async () => {
      const res = await request(app).get("/api/v1/likes");
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("message", "Not authenticated.");
    });

    it("should return 401 when GET /api/v1/likes/:videoId is called without auth cookie", async () => {
      const res = await request(app).get(`/api/v1/likes/${video1._id}`);
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("message", "Not authenticated.");
    });
  });

  describe("POST /api/v1/likes/:videoId (Like Video)", () => {
    it("should successfully like a valid video and create a Like document", async () => {
      const res = await request(app)
        .post(`/api/v1/likes/${video1._id}`)
        .set("Cookie", cookieA);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("like");
      expect(res.body.like).toHaveProperty("_id");
      expect(res.body.like.video).toBe(video1._id.toString());

      // Confirm DB state
      const dbLike = await Like.findOne({ user: userA._id, video: video1._id });
      expect(dbLike).not.toBeNull();
      expect(dbLike.user.toString()).toBe(userA._id.toString());
      expect(dbLike.video.toString()).toBe(video1._id.toString());
    });

    it("should return 409 conflict when user likes the same video twice and keep only 1 Like document", async () => {
      // First like
      await request(app).post(`/api/v1/likes/${video1._id}`).set("Cookie", cookieA);

      // Duplicate like
      const res = await request(app)
        .post(`/api/v1/likes/${video1._id}`)
        .set("Cookie", cookieA);

      expect(res.status).toBe(409);
      expect(res.body).toHaveProperty("message", "You already liked this video.");

      // Confirm DB contains exactly ONE Like document
      const count = await Like.countDocuments({ user: userA._id, video: video1._id });
      expect(count).toBe(1);
    });

    it("should return 400 for an invalid MongoDB video ID", async () => {
      const res = await request(app)
        .post("/api/v1/likes/invalid-mongo-id")
        .set("Cookie", cookieA);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "Invalid video ID.");
    });

    it("should return 404 for a valid but nonexistent video ID", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post(`/api/v1/likes/${fakeId}`)
        .set("Cookie", cookieA);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("message", "Video not found.");
    });
  });

  describe("DELETE /api/v1/likes/:videoId (Unlike Video)", () => {
    it("should successfully unlike a video and remove the Like document", async () => {
      await request(app).post(`/api/v1/likes/${video1._id}`).set("Cookie", cookieA);

      const res = await request(app)
        .delete(`/api/v1/likes/${video1._id}`)
        .set("Cookie", cookieA);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message", "Video unliked.");

      // Confirm DB document is removed
      const dbLike = await Like.findOne({ user: userA._id, video: video1._id });
      expect(dbLike).toBeNull();
    });

    it("should return 404 when attempting to unlike a video that user never liked", async () => {
      const res = await request(app)
        .delete(`/api/v1/likes/${video1._id}`)
        .set("Cookie", cookieA);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("message", "Like not found.");
    });

    it("should return 400 for invalid video ID on DELETE", async () => {
      const res = await request(app)
        .delete("/api/v1/likes/invalid-id")
        .set("Cookie", cookieA);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "Invalid video ID.");
    });
  });

  describe("Ownership & Security Isolation", () => {
    it("should prevent User B from deleting or modifying User A's Like document", async () => {
      // User A likes video1
      await request(app).post(`/api/v1/likes/${video1._id}`).set("Cookie", cookieA);

      // Authenticate as User B and attempt to delete video1 like
      const res = await request(app)
        .delete(`/api/v1/likes/${video1._id}`)
        .set("Cookie", cookieB);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("message", "Like not found.");

      // Confirm User A's Like document remains in MongoDB
      const userALike = await Like.findOne({ user: userA._id, video: video1._id });
      expect(userALike).not.toBeNull();
    });
  });

  describe("GET /api/v1/likes (User-Specific Likes & Status)", () => {
    it("should return only authenticated User A's likes and not User B's likes", async () => {
      // User A likes video1
      await request(app).post(`/api/v1/likes/${video1._id}`).set("Cookie", cookieA);
      // User B likes video2
      await request(app).post(`/api/v1/likes/${video2._id}`).set("Cookie", cookieB);

      // GET likes as User A
      const res = await request(app).get("/api/v1/likes").set("Cookie", cookieA);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("likes");
      expect(res.body.likes.length).toBe(1);
      expect(res.body.likes[0].video._id).toBe(video1._id.toString());
      expect(res.body.likes[0].user.toString()).toBe(userA._id.toString());
    });

    it("should return correct like status via GET /api/v1/likes/:videoId", async () => {
      // Before liking
      const resBefore = await request(app)
        .get(`/api/v1/likes/${video1._id}`)
        .set("Cookie", cookieA);
      expect(resBefore.status).toBe(200);
      expect(resBefore.body).toEqual({ liked: false });

      // After liking
      await request(app).post(`/api/v1/likes/${video1._id}`).set("Cookie", cookieA);

      const resAfter = await request(app)
        .get(`/api/v1/likes/${video1._id}`)
        .set("Cookie", cookieA);
      expect(resAfter.status).toBe(200);
      expect(resAfter.body).toEqual({ liked: true });
    });
  });
});
