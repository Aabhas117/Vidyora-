const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");
const User = require("../models/User");
const Video = require("../models/Video");
const Comment = require("../models/Comment");

describe("Comments API Endpoints (/api/v1/comments)", () => {
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
      category: "Education",
      owner: ownerId,
    });
  }

  beforeEach(async () => {
    const resA = await createAndLoginUser({
      fullName: "Commenter User A",
      username: "commenter_a",
      email: "commenter_a@example.com",
      password: "Password123!",
    });
    userA = resA.user;
    cookieA = resA.cookie;

    const resB = await createAndLoginUser({
      fullName: "Commenter User B",
      username: "commenter_b",
      email: "commenter_b@example.com",
      password: "Password123!",
    });
    userB = resB.user;
    cookieB = resB.cookie;

    video1 = await createTestVideo(userA._id, "Video One");
    video2 = await createTestVideo(userB._id, "Video Two");
  });

  describe("Authentication & Public Read", () => {
    it("should allow GET /api/v1/comments/:videoId WITHOUT authentication cookie", async () => {
      const res = await request(app).get(`/api/v1/comments/${video1._id}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("comments");
      expect(Array.isArray(res.body.comments)).toBe(true);
    });

    it("should return 401 when POST /api/v1/comments/:videoId is called without authentication", async () => {
      const res = await request(app)
        .post(`/api/v1/comments/${video1._id}`)
        .send({ text: "Unauthenticated comment" });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("message", "Not authenticated.");
    });

    it("should assign comment to authenticated req.user._id and ignore client-supplied user ID in body", async () => {
      const fakeOtherUserId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post(`/api/v1/comments/${video1._id}`)
        .set("Cookie", cookieA)
        .send({
          text: "Authenticated user comment",
          user: fakeOtherUserId,
          userId: fakeOtherUserId,
        });

      expect(res.status).toBe(201);
      expect(res.body.comment.user._id).toBe(userA._id.toString());
      expect(res.body.comment.user._id).not.toBe(fakeOtherUserId.toString());

      // Verify in MongoDB
      const dbComment = await Comment.findById(res.body.comment._id);
      expect(dbComment.user.toString()).toBe(userA._id.toString());
    });
  });

  describe("Creating Comments & Validation", () => {
    it("should successfully create a valid comment and store it in MongoDB", async () => {
      const res = await request(app)
        .post(`/api/v1/comments/${video1._id}`)
        .set("Cookie", cookieA)
        .send({ text: "Great video!" });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("comment");
      expect(res.body.comment.text).toBe("Great video!");

      const dbComment = await Comment.findById(res.body.comment._id);
      expect(dbComment).not.toBeNull();
      expect(dbComment.text).toBe("Great video!");
      expect(dbComment.video.toString()).toBe(video1._id.toString());
      expect(dbComment.user.toString()).toBe(userA._id.toString());
    });

    it("should return 400 error for empty comment text", async () => {
      const res = await request(app)
        .post(`/api/v1/comments/${video1._id}`)
        .set("Cookie", cookieA)
        .send({ text: "" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "Comment text is required.");
    });

    it("should return 400 error for whitespace-only comment text", async () => {
      const res = await request(app)
        .post(`/api/v1/comments/${video1._id}`)
        .set("Cookie", cookieA)
        .send({ text: "   \n\t  " });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "Comment text is required.");
    });

    it("should return 400 error when comment text exceeds maximum allowed length (1000 chars)", async () => {
      const longText = "a".repeat(1001);
      const res = await request(app)
        .post(`/api/v1/comments/${video1._id}`)
        .set("Cookie", cookieA)
        .send({ text: longText });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/under 1000 characters/i);
    });

    it("should return 404 when commenting on a valid but nonexistent video ID", async () => {
      const fakeVideoId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post(`/api/v1/comments/${fakeVideoId}`)
        .set("Cookie", cookieA)
        .send({ text: "Comment on non-existent video" });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("message", "Video not found.");
    });

    it("should return 400 for an invalid video ObjectId", async () => {
      const res = await request(app)
        .post("/api/v1/comments/invalid-video-id")
        .set("Cookie", cookieA)
        .send({ text: "Comment text" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "Invalid video ID.");
    });

    it("should allow a user to create multiple separate comments on the same video", async () => {
      const res1 = await request(app)
        .post(`/api/v1/comments/${video1._id}`)
        .set("Cookie", cookieA)
        .send({ text: "First comment by User A" });

      const res2 = await request(app)
        .post(`/api/v1/comments/${video1._id}`)
        .set("Cookie", cookieA)
        .send({ text: "Second comment by User A" });

      expect(res1.status).toBe(201);
      expect(res2.status).toBe(201);
      expect(res1.body.comment._id).not.toBe(res2.body.comment._id);

      const count = await Comment.countDocuments({ user: userA._id, video: video1._id });
      expect(count).toBe(2);
    });
  });

  describe("Comment Replies & Nesting Rules", () => {
    let topLevelComment;

    beforeEach(async () => {
      const res = await request(app)
        .post(`/api/v1/comments/${video1._id}`)
        .set("Cookie", cookieA)
        .send({ text: "Top level comment by User A" });
      topLevelComment = res.body.comment;
    });

    it("should create a valid reply and return it nested under parent in GET comments", async () => {
      const replyRes = await request(app)
        .post(`/api/v1/comments/${video1._id}`)
        .set("Cookie", cookieB)
        .send({
          text: "Reply by User B",
          parentComment: topLevelComment._id,
        });

      expect(replyRes.status).toBe(201);
      expect(replyRes.body.comment.parentComment).toBe(topLevelComment._id);

      // GET comments to verify structure
      const getRes = await request(app).get(`/api/v1/comments/${video1._id}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body.comments.length).toBe(1);

      const parentNode = getRes.body.comments[0];
      expect(parentNode._id).toBe(topLevelComment._id);
      expect(parentNode.replies.length).toBe(1);
      expect(parentNode.replies[0].text).toBe("Reply by User B");
    });

    it("should return 404 when replying to a nonexistent parent comment ID", async () => {
      const fakeParentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post(`/api/v1/comments/${video1._id}`)
        .set("Cookie", cookieB)
        .send({
          text: "Reply to ghost comment",
          parentComment: fakeParentId,
        });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("message", "Parent comment not found.");
    });

    it("should return 400 when replying to a parent comment belonging to a DIFFERENT video", async () => {
      // Create top-level comment on video2
      const video2CommentRes = await request(app)
        .post(`/api/v1/comments/${video2._id}`)
        .set("Cookie", cookieB)
        .send({ text: "Comment on video 2" });
      const video2CommentId = video2CommentRes.body.comment._id;

      // Attempt to reply on video1 using parentComment from video2
      const res = await request(app)
        .post(`/api/v1/comments/${video1._id}`)
        .set("Cookie", cookieA)
        .send({
          text: "Cross-video reply attempt",
          parentComment: video2CommentId,
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "Parent comment does not belong to this video.");
    });

    it("should enforce one-level nesting rule (flattens reply to reply by attaching to top-level parent comment)", async () => {
      // 1. Create top-level comment A
      const commentA = topLevelComment;

      // 2. Create reply B to A
      const resB = await request(app)
        .post(`/api/v1/comments/${video1._id}`)
        .set("Cookie", cookieB)
        .send({
          text: "Reply B to A",
          parentComment: commentA._id,
        });
      const replyB = resB.body.comment;

      // 3. Attempt to create reply C to reply B
      const resC = await request(app)
        .post(`/api/v1/comments/${video1._id}`)
        .set("Cookie", cookieA)
        .send({
          text: "Reply C to B",
          parentComment: replyB._id,
        });

      expect(resC.status).toBe(201);
      // Implementation flattens reply C so its parentComment becomes commentA._id
      expect(resC.body.comment.parentComment).toBe(commentA._id);

      // Verify GET comments returns both replies B and C under top-level comment A
      const getRes = await request(app).get(`/api/v1/comments/${video1._id}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body.comments[0].replies.length).toBe(2);
    });
  });

  describe("Updating Comments (PATCH)", () => {
    let commentA;

    beforeEach(async () => {
      const res = await request(app)
        .post(`/api/v1/comments/${video1._id}`)
        .set("Cookie", cookieA)
        .send({ text: "Original text by User A" });
      commentA = res.body.comment;
    });

    it("should allow the owner to update their own comment and update MongoDB", async () => {
      const res = await request(app)
        .patch(`/api/v1/comments/${commentA._id}`)
        .set("Cookie", cookieA)
        .send({ text: "Updated text by User A" });

      expect(res.status).toBe(200);
      expect(res.body.comment.text).toBe("Updated text by User A");

      const dbComment = await Comment.findById(commentA._id);
      expect(dbComment.text).toBe("Updated text by User A");
    });

    it("should prevent User B from updating User A's comment (403 Forbidden) and keep DB unchanged", async () => {
      const res = await request(app)
        .patch(`/api/v1/comments/${commentA._id}`)
        .set("Cookie", cookieB)
        .send({ text: "Hacked text by User B" });

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/permission/i);

      // Verify DB text is unchanged
      const dbComment = await Comment.findById(commentA._id);
      expect(dbComment.text).toBe("Original text by User A");
    });
  });

  describe("Deleting Comments (DELETE)", () => {
    let parentComment, reply1, reply2, unrelatedComment;

    beforeEach(async () => {
      // Parent comment by User A
      const pRes = await request(app)
        .post(`/api/v1/comments/${video1._id}`)
        .set("Cookie", cookieA)
        .send({ text: "Parent Comment" });
      parentComment = pRes.body.comment;

      // Reply 1 by User B
      const r1Res = await request(app)
        .post(`/api/v1/comments/${video1._id}`)
        .set("Cookie", cookieB)
        .send({ text: "Reply 1", parentComment: parentComment._id });
      reply1 = r1Res.body.comment;

      // Reply 2 by User A
      const r2Res = await request(app)
        .post(`/api/v1/comments/${video1._id}`)
        .set("Cookie", cookieA)
        .send({ text: "Reply 2", parentComment: parentComment._id });
      reply2 = r2Res.body.comment;

      // Unrelated top-level comment
      const uRes = await request(app)
        .post(`/api/v1/comments/${video1._id}`)
        .set("Cookie", cookieB)
        .send({ text: "Unrelated comment" });
      unrelatedComment = uRes.body.comment;
    });

    it("should allow User B to delete their own reply without removing parent or sibling reply", async () => {
      const res = await request(app)
        .delete(`/api/v1/comments/${reply1._id}`)
        .set("Cookie", cookieB);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message", "Comment deleted.");

      // reply1 removed
      const dbReply1 = await Comment.findById(reply1._id);
      expect(dbReply1).toBeNull();

      // Parent and reply2 still exist
      const dbParent = await Comment.findById(parentComment._id);
      expect(dbParent).not.toBeNull();

      const dbReply2 = await Comment.findById(reply2._id);
      expect(dbReply2).not.toBeNull();
    });

    it("should allow owner to delete top-level comment and cascade delete all its replies while leaving unrelated comments", async () => {
      const res = await request(app)
        .delete(`/api/v1/comments/${parentComment._id}`)
        .set("Cookie", cookieA);

      expect(res.status).toBe(200);

      // Parent and replies deleted
      expect(await Comment.findById(parentComment._id)).toBeNull();
      expect(await Comment.findById(reply1._id)).toBeNull();
      expect(await Comment.findById(reply2._id)).toBeNull();

      // Unrelated comment remains
      expect(await Comment.findById(unrelatedComment._id)).not.toBeNull();
    });

    it("should prevent User B from deleting User A's comment (403 Forbidden) and keep DB unchanged", async () => {
      const res = await request(app)
        .delete(`/api/v1/comments/${parentComment._id}`)
        .set("Cookie", cookieB);

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/permission/i);

      // Parent comment remains in DB
      expect(await Comment.findById(parentComment._id)).not.toBeNull();
    });
  });
});
