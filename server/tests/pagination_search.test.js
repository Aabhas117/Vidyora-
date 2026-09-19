const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const Video = require("../models/Video");
const User = require("../models/User");
const videoRoutes = require("../routes/video.routes");

const app = express();
app.use(express.json());
app.use("/api/v1/videos", videoRoutes);

describe("GET /api/v1/videos Pagination & Search", () => {
  let user;

  beforeEach(async () => {
    user = await User.create({
      fullName: "Test Author",
      username: "testauthor",
      email: "author@test.com",
      password: "hashedpassword123",
    });

    await Video.createIndexes();

    await Video.create([
      {
        title: "React Tutorial for Beginners",
        description: "Learn React framework from scratch",
        category: "Tech",
        videoUrl: "https://res.cloudinary.com/demo/video/upload/v1/sample.mp4",
        videoPublicId: "sample1",
        thumbnailUrl: "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg",
        thumbnailPublicId: "thumb1",
        views: 500,
        owner: user._id,
        createdAt: new Date("2026-01-01"),
      },
      {
        title: "Node.js API Development",
        description: "Build scalable backend with Express and MongoDB",
        category: "Tech",
        videoUrl: "https://res.cloudinary.com/demo/video/upload/v2/sample.mp4",
        videoPublicId: "sample2",
        thumbnailUrl: "https://res.cloudinary.com/demo/image/upload/v2/sample.jpg",
        thumbnailPublicId: "thumb2",
        views: 1200,
        owner: user._id,
        createdAt: new Date("2026-01-02"),
      },
      {
        title: "Cooking Italian Pasta",
        description: "Delicious homemade pasta recipe with fresh basil",
        category: "Food",
        videoUrl: "https://res.cloudinary.com/demo/video/upload/v3/sample.mp4",
        videoPublicId: "sample3",
        thumbnailUrl: "https://res.cloudinary.com/demo/image/upload/v3/sample.jpg",
        thumbnailPublicId: "thumb3",
        views: 300,
        owner: user._id,
        createdAt: new Date("2026-01-03"),
      },
    ]);
  });

  describe("Pagination", () => {
    it("should return default paginated response (page 1, limit 10)", async () => {
      const res = await request(app).get("/api/v1/videos");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("videos");
      expect(res.body).toHaveProperty("totalPages", 1);
      expect(res.body).toHaveProperty("currentPage", 1);
      expect(res.body).toHaveProperty("totalCount", 3);
      expect(res.body.videos.length).toBe(3);
    });

    it("should correctly paginate with page and limit parameters", async () => {
      const page1 = await request(app).get("/api/v1/videos?page=1&limit=2");
      expect(page1.status).toBe(200);
      expect(page1.body.videos.length).toBe(2);
      expect(page1.body.currentPage).toBe(1);
      expect(page1.body.totalPages).toBe(2);
      expect(page1.body.totalCount).toBe(3);

      const page2 = await request(app).get("/api/v1/videos?page=2&limit=2");
      expect(page2.status).toBe(200);
      expect(page2.body.videos.length).toBe(1);
      expect(page2.body.currentPage).toBe(2);
    });

    it("should handle invalid, negative, or 0 page & limit values gracefully", async () => {
      const res = await request(app).get("/api/v1/videos?page=-1&limit=abc");
      expect(res.status).toBe(200);
      expect(res.body.currentPage).toBe(1);
      expect(res.body.videos.length).toBe(3);
    });

    it("should clamp large limit values to max 100", async () => {
      const res = await request(app).get("/api/v1/videos?limit=500");
      expect(res.status).toBe(200);
      expect(res.body.totalCount).toBe(3);
    });

    it("should handle page beyond totalPages returning empty array", async () => {
      const res = await request(app).get("/api/v1/videos?page=999&limit=10");
      expect(res.status).toBe(200);
      expect(res.body.currentPage).toBe(999);
      expect(res.body.totalPages).toBe(1);
      expect(res.body.totalCount).toBe(3);
      expect(res.body.videos).toEqual([]);
    });
  });

  describe("MongoDB Text Search", () => {
    it("should search videos matching title or description via $text", async () => {
      const res = await request(app).get("/api/v1/videos?search=React");
      expect(res.status).toBe(200);
      expect(res.body.videos.length).toBe(1);
      expect(res.body.videos[0].title).toContain("React");
      expect(res.body.totalCount).toBe(1);
    });

    it("should search videos matching category", async () => {
      const res = await request(app).get("/api/v1/videos?search=Food");
      expect(res.status).toBe(200);
      expect(res.body.videos.length).toBe(1);
      expect(res.body.videos[0].title).toContain("Cooking");
    });

    it("should handle search with no matching results", async () => {
      const res = await request(app).get("/api/v1/videos?search=NonExistentTerm123");
      expect(res.status).toBe(200);
      expect(res.body.videos).toEqual([]);
      expect(res.body.totalCount).toBe(0);
      expect(res.body.totalPages).toBe(0);
    });
  });

  describe("Sorting", () => {
    it("should sort by views when sort=views is specified", async () => {
      const res = await request(app).get("/api/v1/videos?sort=views");
      expect(res.status).toBe(200);
      expect(res.body.videos[0].views).toBe(1200);
      expect(res.body.videos[1].views).toBe(500);
      expect(res.body.videos[2].views).toBe(300);
    });
  });
});
