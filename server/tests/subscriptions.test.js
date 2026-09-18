const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");
const User = require("../models/User");
const Subscription = require("../models/Subscription");

describe("Subscriptions API Endpoints (/api/v1/subscriptions)", () => {
  let userA, cookieA;
  let userB, cookieB;
  let userC, cookieC;
  let userD;

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

  beforeEach(async () => {
    const resA = await createAndLoginUser({
      fullName: "Sub User Alpha",
      username: "subalpha",
      email: "subalpha@example.com",
      password: "Password123!",
    });
    userA = resA.user;
    cookieA = resA.cookie;

    const resB = await createAndLoginUser({
      fullName: "Sub User Beta",
      username: "subbeta",
      email: "subbeta@example.com",
      password: "Password123!",
    });
    userB = resB.user;
    cookieB = resB.cookie;

    const resC = await createAndLoginUser({
      fullName: "Sub User Gamma",
      username: "subgamma",
      email: "subgamma@example.com",
      password: "Password123!",
    });
    userC = resC.user;
    cookieC = resC.cookie;

    const resD = await createAndLoginUser({
      fullName: "Sub User Delta",
      username: "subdelta",
      email: "subdelta@example.com",
      password: "Password123!",
    });
    userD = resD.user;
  });

  describe("Authentication Checks", () => {
    it("should return 401 when POST /api/v1/subscriptions/:channelId is called without auth", async () => {
      const res = await request(app).post(`/api/v1/subscriptions/${userB._id}`);
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("message", "Not authenticated.");
    });

    it("should return 401 when DELETE /api/v1/subscriptions/:channelId is called without auth", async () => {
      const res = await request(app).delete(`/api/v1/subscriptions/${userB._id}`);
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("message", "Not authenticated.");
    });

    it("should return 401 when GET /api/v1/subscriptions is called without auth", async () => {
      const res = await request(app).get("/api/v1/subscriptions");
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("message", "Not authenticated.");
    });

    it("should return 401 when GET /api/v1/subscriptions/:channelId/status is called without auth", async () => {
      const res = await request(app).get(`/api/v1/subscriptions/${userB._id}/status`);
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("message", "Not authenticated.");
    });

    it("should return 401 when GET /api/v1/subscriptions/channel/:channelId/count is called without auth", async () => {
      const res = await request(app).get(`/api/v1/subscriptions/channel/${userB._id}/count`);
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("message", "Not authenticated.");
    });
  });

  describe("POST /api/v1/subscriptions/:channelId (Subscribe)", () => {
    it("should successfully subscribe User A to User B and create a Subscription document", async () => {
      const res = await request(app)
        .post(`/api/v1/subscriptions/${userB._id}`)
        .set("Cookie", cookieA);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("subscription");
      expect(res.body.subscription).toHaveProperty("_id");
      expect(res.body.subscription.channel).toBe(userB._id.toString());

      // Confirm DB document exists
      const dbSub = await Subscription.findOne({ user: userA._id, channel: userB._id });
      expect(dbSub).not.toBeNull();
      expect(dbSub.user.toString()).toBe(userA._id.toString());
      expect(dbSub.channel.toString()).toBe(userB._id.toString());
    });

    it("should return 409 conflict when User A subscribes to User B twice", async () => {
      await request(app).post(`/api/v1/subscriptions/${userB._id}`).set("Cookie", cookieA);

      const res = await request(app)
        .post(`/api/v1/subscriptions/${userB._id}`)
        .set("Cookie", cookieA);

      expect(res.status).toBe(409);
      expect(res.body).toHaveProperty("message", "You are already subscribed to this channel.");

      // Confirm DB contains exactly ONE subscription
      const count = await Subscription.countDocuments({ user: userA._id, channel: userB._id });
      expect(count).toBe(1);
    });

    it("should return 400 when User A attempts to subscribe to self", async () => {
      const res = await request(app)
        .post(`/api/v1/subscriptions/${userA._id}`)
        .set("Cookie", cookieA);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "You cannot subscribe to your own channel.");

      // Confirm no subscription created in DB
      const count = await Subscription.countDocuments({ user: userA._id, channel: userA._id });
      expect(count).toBe(0);
    });

    it("should return 400 for an invalid channel ID", async () => {
      const res = await request(app)
        .post("/api/v1/subscriptions/invalid-channel-id")
        .set("Cookie", cookieA);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "Invalid channel ID.");
    });

    it("should return 404 for a valid but nonexistent channel ID", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post(`/api/v1/subscriptions/${fakeId}`)
        .set("Cookie", cookieA);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("message", "Channel not found.");
    });
  });

  describe("DELETE /api/v1/subscriptions/:channelId (Unsubscribe)", () => {
    it("should successfully unsubscribe User A from User B and remove the Subscription document", async () => {
      await request(app).post(`/api/v1/subscriptions/${userB._id}`).set("Cookie", cookieA);

      const res = await request(app)
        .delete(`/api/v1/subscriptions/${userB._id}`)
        .set("Cookie", cookieA);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message", "Unsubscribed successfully.");

      // Confirm DB document is removed
      const dbSub = await Subscription.findOne({ user: userA._id, channel: userB._id });
      expect(dbSub).toBeNull();
    });

    it("should return 404 when attempting to unsubscribe without an active subscription", async () => {
      const res = await request(app)
        .delete(`/api/v1/subscriptions/${userB._id}`)
        .set("Cookie", cookieA);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("message", "Subscription not found.");
    });

    it("should return 400 for invalid channel ID on DELETE", async () => {
      const res = await request(app)
        .delete("/api/v1/subscriptions/invalid-id")
        .set("Cookie", cookieA);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "Invalid channel ID.");
    });

    it("should return 404 for nonexistent channel ID on DELETE", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/v1/subscriptions/${fakeId}`)
        .set("Cookie", cookieA);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("message", "Channel not found.");
    });
  });

  describe("Subscription Isolation & Data Retrieval", () => {
    it("should isolate user subscriptions so User A only sees their own subscriptions", async () => {
      // User A subscribes to User B
      await request(app).post(`/api/v1/subscriptions/${userB._id}`).set("Cookie", cookieA);
      // User C subscribes to User D
      await request(app).post(`/api/v1/subscriptions/${userD._id}`).set("Cookie", cookieC);

      // GET subscriptions as User A
      const resA = await request(app).get("/api/v1/subscriptions").set("Cookie", cookieA);
      expect(resA.status).toBe(200);
      expect(resA.body).toHaveProperty("subscriptions");
      expect(resA.body.subscriptions.length).toBe(1);
      expect(resA.body.subscriptions[0].channel._id).toBe(userB._id.toString());

      // GET subscriptions as User C
      const resC = await request(app).get("/api/v1/subscriptions").set("Cookie", cookieC);
      expect(resC.status).toBe(200);
      expect(resC.body.subscriptions.length).toBe(1);
      expect(resC.body.subscriptions[0].channel._id).toBe(userD._id.toString());
    });

    it("should accurately reflect subscription status and subscriber count", async () => {
      // Check status before subscribing
      const statusBefore = await request(app)
        .get(`/api/v1/subscriptions/${userB._id}/status`)
        .set("Cookie", cookieA);
      expect(statusBefore.status).toBe(200);
      expect(statusBefore.body).toEqual({ subscribed: false });

      // Check subscriber count before subscribing
      const countBefore = await request(app)
        .get(`/api/v1/subscriptions/channel/${userB._id}/count`)
        .set("Cookie", cookieA);
      expect(countBefore.status).toBe(200);
      expect(countBefore.body).toEqual({ channelId: userB._id.toString(), subscriberCount: 0 });

      // Subscribe User A -> User B
      await request(app).post(`/api/v1/subscriptions/${userB._id}`).set("Cookie", cookieA);

      // Check status after subscribing
      const statusAfter = await request(app)
        .get(`/api/v1/subscriptions/${userB._id}/status`)
        .set("Cookie", cookieA);
      expect(statusAfter.status).toBe(200);
      expect(statusAfter.body).toEqual({ subscribed: true });

      // Check subscriber count after subscribing
      const countAfter = await request(app)
        .get(`/api/v1/subscriptions/channel/${userB._id}/count`)
        .set("Cookie", cookieA);
      expect(countAfter.status).toBe(200);
      expect(countAfter.body).toEqual({ channelId: userB._id.toString(), subscriberCount: 1 });

      // Unsubscribe User A from User B
      await request(app).delete(`/api/v1/subscriptions/${userB._id}`).set("Cookie", cookieA);

      // Check status after unsubscribing
      const statusFinal = await request(app)
        .get(`/api/v1/subscriptions/${userB._id}/status`)
        .set("Cookie", cookieA);
      expect(statusFinal.status).toBe(200);
      expect(statusFinal.body).toEqual({ subscribed: false });
    });
  });
});
