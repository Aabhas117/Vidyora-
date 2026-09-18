const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");
const User = require("../models/User");
const Video = require("../models/Video");
const History = require("../models/History");

describe("History API Endpoints (/api/v1/history)", () => {
  let userA, cookieA;
  let userB, cookieB;
  let video1, video2, video3;

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
      category: "Education",
      owner: ownerId,
    });
  }

  beforeEach(async () => {
    const resA = await createAndLoginUser({
      fullName: "History User Alpha",
      username: "historyalpha",
      email: "historyalpha@example.com",
      password: "Password123!",
    });
    userA = resA.user;
    cookieA = resA.cookie;

    const resB = await createAndLoginUser({
      fullName: "History User Beta",
      username: "historybeta",
      email: "historybeta@example.com",
      password: "Password123!",
    });
    userB = resB.user;
    cookieB = resB.cookie;

    video1 = await createTestVideo(userB._id, "Video One");
    video2 = await createTestVideo(userB._id, "Video Two");
    video3 = await createTestVideo(userB._id, "Video Three");
  });

  describe("Authentication Checks", () => {
    it("should return 401 when GET /api/v1/history is called without auth cookie", async () => {
      const res = await request(app).get("/api/v1/history");
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("message", "Not authenticated.");
    });

    it("should return 401 when POST /api/v1/history/:videoId is called without auth cookie", async () => {
      const res = await request(app).post(`/api/v1/history/${video1._id}`);
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("message", "Not authenticated.");
    });

    it("should return 401 when DELETE /api/v1/history/:videoId is called without auth cookie", async () => {
      const res = await request(app).delete(`/api/v1/history/${video1._id}`);
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("message", "Not authenticated.");
    });

    it("should return 401 when DELETE /api/v1/history is called without auth cookie", async () => {
      const res = await request(app).delete("/api/v1/history");
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("message", "Not authenticated.");
    });
  });

  describe("POST /api/v1/history/:videoId (Add to History)", () => {
    it("should successfully add a video to history and create a History document", async () => {
      const res = await request(app)
        .post(`/api/v1/history/${video1._id}`)
        .set("Cookie", cookieA);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("history");
      expect(res.body.history).toHaveProperty("_id");
      expect(res.body.history.video).toBe(video1._id.toString());
      expect(res.body.history.watchedAt).toBeDefined();

      // Confirm DB document exists
      const dbHistory = await History.findOne({ user: userA._id, video: video1._id });
      expect(dbHistory).not.toBeNull();
      expect(dbHistory.user.toString()).toBe(userA._id.toString());
      expect(dbHistory.video.toString()).toBe(video1._id.toString());
    });

    it("should handle re-watch behavior by upserting and updating watchedAt timestamp without duplicating records", async () => {
      // First watch
      const res1 = await request(app)
        .post(`/api/v1/history/${video1._id}`)
        .set("Cookie", cookieA);

      const firstHistoryDoc = await History.findOne({ user: userA._id, video: video1._id });
      const originalWatchedAt = new Date(firstHistoryDoc.watchedAt).getTime();

      // Small delay to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Second watch (rewatch)
      const res2 = await request(app)
        .post(`/api/v1/history/${video1._id}`)
        .set("Cookie", cookieA);

      expect(res2.status).toBe(201);

      // Confirm there is ONLY ONE history record for User A + video1
      const count = await History.countDocuments({ user: userA._id, video: video1._id });
      expect(count).toBe(1);

      const updatedHistoryDoc = await History.findOne({ user: userA._id, video: video1._id });
      expect(updatedHistoryDoc._id.toString()).toBe(firstHistoryDoc._id.toString());

      const updatedWatchedAt = new Date(updatedHistoryDoc.watchedAt).getTime();
      expect(updatedWatchedAt).toBeGreaterThanOrEqual(originalWatchedAt);
    });

    it("should return 400 for an invalid video ID", async () => {
      const res = await request(app)
        .post("/api/v1/history/invalid-id")
        .set("Cookie", cookieA);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "Invalid video ID.");
    });

    it("should return 404 for a valid but nonexistent video ID", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post(`/api/v1/history/${fakeId}`)
        .set("Cookie", cookieA);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("message", "Video not found.");
    });
  });

  describe("GET /api/v1/history (Fetch History)", () => {
    it("should return history records in newest-first order (sorted by watchedAt: -1)", async () => {
      await request(app).post(`/api/v1/history/${video1._id}`).set("Cookie", cookieA);
      await new Promise((resolve) => setTimeout(resolve, 20));
      await request(app).post(`/api/v1/history/${video2._id}`).set("Cookie", cookieA);
      await new Promise((resolve) => setTimeout(resolve, 20));
      await request(app).post(`/api/v1/history/${video3._id}`).set("Cookie", cookieA);

      const res = await request(app).get("/api/v1/history").set("Cookie", cookieA);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("history");
      expect(res.body.history.length).toBe(3);

      // Newest should be video3, then video2, then video1
      expect(res.body.history[0].video._id).toBe(video3._id.toString());
      expect(res.body.history[1].video._id).toBe(video2._id.toString());
      expect(res.body.history[2].video._id).toBe(video1._id.toString());
    });

    it("should isolate user history so User A cannot see User B's history", async () => {
      // User A watches video1
      await request(app).post(`/api/v1/history/${video1._id}`).set("Cookie", cookieA);
      // User B watches video2
      await request(app).post(`/api/v1/history/${video2._id}`).set("Cookie", cookieB);

      // GET history as User A
      const resA = await request(app).get("/api/v1/history").set("Cookie", cookieA);
      expect(resA.status).toBe(200);
      expect(resA.body.history.length).toBe(1);
      expect(resA.body.history[0].video._id).toBe(video1._id.toString());

      // GET history as User B
      const resB = await request(app).get("/api/v1/history").set("Cookie", cookieB);
      expect(resB.status).toBe(200);
      expect(resB.body.history.length).toBe(1);
      expect(resB.body.history[0].video._id).toBe(video2._id.toString());
    });
  });

  describe("DELETE /api/v1/history/:videoId (Remove Single History Entry)", () => {
    it("should successfully remove a video from User A's history", async () => {
      await request(app).post(`/api/v1/history/${video1._id}`).set("Cookie", cookieA);
      await request(app).post(`/api/v1/history/${video2._id}`).set("Cookie", cookieA);

      const res = await request(app)
        .delete(`/api/v1/history/${video1._id}`)
        .set("Cookie", cookieA);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message", "Removed from watch history.");

      // Confirm video1 history item deleted, video2 remains
      const doc1 = await History.findOne({ user: userA._id, video: video1._id });
      expect(doc1).toBeNull();

      const doc2 = await History.findOne({ user: userA._id, video: video2._id });
      expect(doc2).not.toBeNull();
    });

    it("should return 404 when attempting to delete a video not in history", async () => {
      const res = await request(app)
        .delete(`/api/v1/history/${video1._id}`)
        .set("Cookie", cookieA);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("message", "History item not found.");
    });

    it("should return 400 for an invalid video ID on DELETE", async () => {
      const res = await request(app)
        .delete("/api/v1/history/invalid-id")
        .set("Cookie", cookieA);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "Invalid video ID.");
    });
  });

  describe("DELETE /api/v1/history (Clear All History)", () => {
    it("should clear User A's history while keeping User B's history intact", async () => {
      // User A watches video1 and video2
      await request(app).post(`/api/v1/history/${video1._id}`).set("Cookie", cookieA);
      await request(app).post(`/api/v1/history/${video2._id}`).set("Cookie", cookieA);
      // User B watches video3
      await request(app).post(`/api/v1/history/${video3._id}`).set("Cookie", cookieB);

      // User A clears history
      const res = await request(app).delete("/api/v1/history").set("Cookie", cookieA);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message", "Watch history cleared successfully.");

      // Confirm User A has 0 history items
      const userACount = await History.countDocuments({ user: userA._id });
      expect(userACount).toBe(0);

      // Confirm User B still has 1 history item
      const userBCount = await History.countDocuments({ user: userB._id });
      expect(userBCount).toBe(1);
    });
  });
});
