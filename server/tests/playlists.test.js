const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");
const User = require("../models/User");
const Video = require("../models/Video");
const Playlist = require("../models/Playlist");

describe("Playlists API Endpoints (/api/v1/playlists)", () => {
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
      category: "Music",
      owner: ownerId,
    });
  }

  beforeEach(async () => {
    const resA = await createAndLoginUser({
      fullName: "Playlist User A",
      username: "playlist_a",
      email: "playlist_a@example.com",
      password: "Password123!",
    });
    userA = resA.user;
    cookieA = resA.cookie;

    const resB = await createAndLoginUser({
      fullName: "Playlist User B",
      username: "playlist_b",
      email: "playlist_b@example.com",
      password: "Password123!",
    });
    userB = resB.user;
    cookieB = resB.cookie;

    video1 = await createTestVideo(userA._id, "Video One");
    video2 = await createTestVideo(userB._id, "Video Two");
  });

  describe("Authentication Checks", () => {
    it("should return 401 when POST /api/v1/playlists is called without auth", async () => {
      const res = await request(app)
        .post("/api/v1/playlists")
        .send({ name: "Unauthenticated Playlist" });
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("message", "Not authenticated.");
    });

    it("should return 401 when GET /api/v1/playlists is called without auth", async () => {
      const res = await request(app).get("/api/v1/playlists");
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("message", "Not authenticated.");
    });

    it("should return 401 when GET /api/v1/playlists/:id is called without auth", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/v1/playlists/${fakeId}`);
      expect(res.status).toBe(401);
    });

    it("should return 401 when PATCH /api/v1/playlists/:id is called without auth", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).patch(`/api/v1/playlists/${fakeId}`).send({ name: "Rename" });
      expect(res.status).toBe(401);
    });

    it("should return 401 when DELETE /api/v1/playlists/:id is called without auth", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/api/v1/playlists/${fakeId}`);
      expect(res.status).toBe(401);
    });

    it("should return 401 when adding video to playlist without auth", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).post(`/api/v1/playlists/${fakeId}/videos/${video1._id}`);
      expect(res.status).toBe(401);
    });
  });

  describe("Creating Playlists & Validation", () => {
    it("should successfully create a playlist and assign owner to req.user._id", async () => {
      const fakeOtherUserId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post("/api/v1/playlists")
        .set("Cookie", cookieA)
        .send({
          name: "My Favorite Songs",
          description: "Top hits playlist",
          owner: fakeOtherUserId,
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("playlist");
      expect(res.body.playlist.name).toBe("My Favorite Songs");
      expect(res.body.playlist.description).toBe("Top hits playlist");
      expect(res.body.playlist.owner.toString()).toBe(userA._id.toString());
      expect(res.body.playlist.owner.toString()).not.toBe(fakeOtherUserId.toString());

      // Verify DB document
      const dbPlaylist = await Playlist.findById(res.body.playlist._id);
      expect(dbPlaylist).not.toBeNull();
      expect(dbPlaylist.owner.toString()).toBe(userA._id.toString());
    });

    it("should return 400 when playlist name is missing", async () => {
      const res = await request(app)
        .post("/api/v1/playlists")
        .set("Cookie", cookieA)
        .send({ description: "No name playlist" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "Playlist name is required.");
    });

    it("should return 400 when playlist name is an empty string", async () => {
      const res = await request(app)
        .post("/api/v1/playlists")
        .set("Cookie", cookieA)
        .send({ name: "" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "Playlist name is required.");
    });

    it("should return 400 when playlist name is whitespace-only", async () => {
      const res = await request(app)
        .post("/api/v1/playlists")
        .set("Cookie", cookieA)
        .send({ name: "   \t  " });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "Playlist name is required.");
    });

    it("should return 400 when playlist name exceeds 60 characters", async () => {
      const longName = "a".repeat(61);
      const res = await request(app)
        .post("/api/v1/playlists")
        .set("Cookie", cookieA)
        .send({ name: longName });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/under 60 characters/i);
    });
  });

  describe("Read Access & Ownership Isolation", () => {
    let playlistA, playlistB;

    beforeEach(async () => {
      const resA = await request(app)
        .post("/api/v1/playlists")
        .set("Cookie", cookieA)
        .send({ name: "User A Playlist" });
      playlistA = resA.body.playlist;

      const resB = await request(app)
        .post("/api/v1/playlists")
        .set("Cookie", cookieB)
        .send({ name: "User B Playlist" });
      playlistB = resB.body.playlist;
    });

    it("should ensure GET /api/v1/playlists returns ONLY User A's playlists", async () => {
      const res = await request(app).get("/api/v1/playlists").set("Cookie", cookieA);

      expect(res.status).toBe(200);
      expect(res.body.playlists.length).toBe(1);
      expect(res.body.playlists[0]._id).toBe(playlistA._id);
      expect(res.body.playlists[0].owner.toString()).toBe(userA._id.toString());
    });

    it("should allow owner (User A) to access GET /api/v1/playlists/:id", async () => {
      const res = await request(app)
        .get(`/api/v1/playlists/${playlistA._id}`)
        .set("Cookie", cookieA);

      expect(res.status).toBe(200);
      expect(res.body.playlist._id).toBe(playlistA._id);
    });

    it("should prevent User B from accessing User A's playlist (403 Forbidden)", async () => {
      const res = await request(app)
        .get(`/api/v1/playlists/${playlistA._id}`)
        .set("Cookie", cookieB);

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/permission/i);
    });

    it("should return 400 for an invalid playlist ObjectId", async () => {
      const res = await request(app)
        .get("/api/v1/playlists/invalid-playlist-id")
        .set("Cookie", cookieA);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "Invalid playlist ID.");
    });

    it("should return 404 for a valid but nonexistent playlist ID", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/v1/playlists/${fakeId}`)
        .set("Cookie", cookieA);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("message", "Playlist not found.");
    });
  });

  describe("Playlist Update & Delete (PATCH / DELETE)", () => {
    let playlistA;

    beforeEach(async () => {
      const res = await request(app)
        .post("/api/v1/playlists")
        .set("Cookie", cookieA)
        .send({ name: "Original Playlist Name" });
      playlistA = res.body.playlist;
    });

    it("should allow owner to update playlist name and description", async () => {
      const res = await request(app)
        .patch(`/api/v1/playlists/${playlistA._id}`)
        .set("Cookie", cookieA)
        .send({ name: "New Playlist Name", description: "New description" });

      expect(res.status).toBe(200);
      expect(res.body.playlist.name).toBe("New Playlist Name");

      const dbPlaylist = await Playlist.findById(playlistA._id);
      expect(dbPlaylist.name).toBe("New Playlist Name");
      expect(dbPlaylist.description).toBe("New description");
    });

    it("should prevent User B from updating User A's playlist (403 Forbidden)", async () => {
      const res = await request(app)
        .patch(`/api/v1/playlists/${playlistA._id}`)
        .set("Cookie", cookieB)
        .send({ name: "Hacked Playlist Name" });

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/permission/i);

      // Verify DB remains unchanged
      const dbPlaylist = await Playlist.findById(playlistA._id);
      expect(dbPlaylist.name).toBe("Original Playlist Name");
    });

    it("should allow owner to delete playlist and remove document from MongoDB", async () => {
      const res = await request(app)
        .delete(`/api/v1/playlists/${playlistA._id}`)
        .set("Cookie", cookieA);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message", "Playlist deleted.");

      const dbPlaylist = await Playlist.findById(playlistA._id);
      expect(dbPlaylist).toBeNull();
    });

    it("should prevent User B from deleting User A's playlist (403 Forbidden) and keep DB document intact", async () => {
      const res = await request(app)
        .delete(`/api/v1/playlists/${playlistA._id}`)
        .set("Cookie", cookieB);

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/permission/i);

      const dbPlaylist = await Playlist.findById(playlistA._id);
      expect(dbPlaylist).not.toBeNull();
    });
  });

  describe("Playlist Videos Management & Data Integrity", () => {
    let playlistA;

    beforeEach(async () => {
      const res = await request(app)
        .post("/api/v1/playlists")
        .set("Cookie", cookieA)
        .send({ name: "My Video Collection" });
      playlistA = res.body.playlist;
    });

    it("should add a valid video to owner's playlist", async () => {
      const res = await request(app)
        .post(`/api/v1/playlists/${playlistA._id}/videos/${video1._id}`)
        .set("Cookie", cookieA);

      expect(res.status).toBe(200);
      expect(res.body.playlist.videos.length).toBe(1);

      const dbPlaylist = await Playlist.findById(playlistA._id);
      expect(dbPlaylist.videos.length).toBe(1);
      expect(dbPlaylist.videos[0].toString()).toBe(video1._id.toString());
    });

    it("should return 409 conflict when adding the same video twice and maintain only 1 reference", async () => {
      // Add first time
      await request(app)
        .post(`/api/v1/playlists/${playlistA._id}/videos/${video1._id}`)
        .set("Cookie", cookieA);

      // Add second time (duplicate)
      const res = await request(app)
        .post(`/api/v1/playlists/${playlistA._id}/videos/${video1._id}`)
        .set("Cookie", cookieA);

      expect(res.status).toBe(409);
      expect(res.body.message).toMatch(/already in the playlist/i);

      const dbPlaylist = await Playlist.findById(playlistA._id);
      expect(dbPlaylist.videos.length).toBe(1);
    });

    it("should prevent User B from adding a video to User A's playlist (403 Forbidden)", async () => {
      const res = await request(app)
        .post(`/api/v1/playlists/${playlistA._id}/videos/${video2._id}`)
        .set("Cookie", cookieB);

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/permission/i);

      const dbPlaylist = await Playlist.findById(playlistA._id);
      expect(dbPlaylist.videos.length).toBe(0);
    });

    it("should return 404 when adding a nonexistent video ID to playlist", async () => {
      const fakeVideoId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post(`/api/v1/playlists/${playlistA._id}/videos/${fakeVideoId}`)
        .set("Cookie", cookieA);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("message", "Video not found.");
    });

    it("should return 400 for invalid playlist or video ID on add video", async () => {
      const res = await request(app)
        .post(`/api/v1/playlists/${playlistA._id}/videos/invalid-video-id`)
        .set("Cookie", cookieA);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "Invalid playlist or video ID.");
    });

    it("should remove video from playlist array AND preserve actual Video document in MongoDB (CRITICAL DATA INTEGRITY TEST)", async () => {
      // 1. Add video1 to playlistA
      await request(app)
        .post(`/api/v1/playlists/${playlistA._id}/videos/${video1._id}`)
        .set("Cookie", cookieA);

      // Record Video document state in MongoDB before removal
      const videoBefore = await Video.findById(video1._id);
      expect(videoBefore).not.toBeNull();
      expect(videoBefore.title).toBe("Video One");

      // 2. Remove video1 reference from playlistA
      const removeRes = await request(app)
        .delete(`/api/v1/playlists/${playlistA._id}/videos/${video1._id}`)
        .set("Cookie", cookieA);

      expect(removeRes.status).toBe(200);

      // 3. Verify video reference is removed from playlist.videos array
      const dbPlaylist = await Playlist.findById(playlistA._id);
      expect(dbPlaylist.videos.length).toBe(0);

      // 4. CRITICAL DATA INTEGRITY VERIFICATION:
      // Verify Video document STILL exists in MongoDB and is completely unchanged!
      const videoAfter = await Video.findById(video1._id);
      expect(videoAfter).not.toBeNull();
      expect(videoAfter._id.toString()).toBe(videoBefore._id.toString());
      expect(videoAfter.title).toBe(videoBefore.title);
      expect(videoAfter.videoUrl).toBe(videoBefore.videoUrl);
    });
  });
});
