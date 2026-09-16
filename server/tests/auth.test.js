const request = require("supertest");
const bcrypt = require("bcryptjs");
const app = require("../server");
const User = require("../models/User");

describe("Authentication API Endpoints (/api/v1/auth)", () => {
  const validUser = {
    fullName: "Test User",
    username: "testuser",
    email: "testuser@example.com",
    password: "Password123!",
  };

  describe("POST /api/v1/auth/register", () => {
    it("should successfully register a new user with valid data", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(validUser);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("user");
      expect(res.body.user).toHaveProperty("_id");
      expect(res.body.user.fullName).toBe("Test User");
      expect(res.body.user.username).toBe("testuser");
      expect(res.body.user.email).toBe("testuser@example.com");

      // Security assertions: password/hash must not be exposed in API response
      expect(res.body.user.password).toBeUndefined();
      expect(res.body.user.hash).toBeUndefined();
      expect(res.body.password).toBeUndefined();

      // Database verification: password must be stored as bcrypt hash
      const dbUser = await User.findOne({ email: "testuser@example.com" }).select("+password");
      expect(dbUser).not.toBeNull();
      expect(dbUser.password).not.toBe(validUser.password);
      expect(dbUser.password).toMatch(/^\$2[abxy]\$/);
      const isPasswordValid = await bcrypt.compare(validUser.password, dbUser.password);
      expect(isPasswordValid).toBe(true);
    });

    it("should return 400 if fullName is missing", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({ ...validUser, fullName: "" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "Full name is required.");
    });

    it("should return 400 if username is missing", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({ ...validUser, username: "" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "Username is required.");
    });

    it("should return 400 if email is missing", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({ ...validUser, email: "" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "Email is required.");
    });

    it("should return 400 if password is missing", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({ ...validUser, password: "" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "Password is required.");
    });

    it("should return 400 if password does not meet length/complexity requirements", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({ ...validUser, password: "simple" });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Password must be at least 8 characters/);
    });

    it("should return 409 if registering with duplicate username", async () => {
      await request(app).post("/api/v1/auth/register").send(validUser);

      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          ...validUser,
          email: "different@example.com",
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toMatch(/account with that username already exists/i);
    });

    it("should return 409 if registering with duplicate email", async () => {
      await request(app).post("/api/v1/auth/register").send(validUser);

      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          ...validUser,
          username: "differentuser",
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toMatch(/account with that email already exists/i);
    });
  });

  describe("POST /api/v1/auth/login", () => {
    beforeEach(async () => {
      await request(app).post("/api/v1/auth/register").send(validUser);
    });

    it("should log in successfully with valid credentials and set HTTP-only accessToken cookie", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: validUser.email,
          password: validUser.password,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("user");
      expect(res.body.user.email).toBe(validUser.email);
      expect(res.body.user.password).toBeUndefined();
      expect(res.body.token).toBeUndefined();

      // Verify accessToken cookie is set in headers
      const cookies = res.headers["set-cookie"];
      expect(cookies).toBeDefined();
      const accessTokenCookie = cookies.find((c) => c.startsWith("accessToken="));
      expect(accessTokenCookie).toBeDefined();
      expect(accessTokenCookie).toMatch(/HttpOnly/i);
    });

    it("should return 401 with generic error message for incorrect password", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: validUser.email,
          password: "WrongPassword123!",
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("message", "Incorrect email or password.");
    });

    it("should return 401 with the SAME generic error message for non-existent email", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: validUser.password,
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("message", "Incorrect email or password.");
    });

    it("should return 400 if email or password field is missing", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: validUser.email });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "Password is required.");
    });
  });

  describe("GET /api/v1/auth/me", () => {
    let authCookie;

    beforeEach(async () => {
      await request(app).post("/api/v1/auth/register").send(validUser);
      const loginRes = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: validUser.email,
          password: validUser.password,
        });

      authCookie = loginRes.headers["set-cookie"];
    });

    it("should return authenticated user details when valid cookie is provided", async () => {
      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Cookie", authCookie);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("user");
      expect(res.body.user).not.toBeNull();
      expect(res.body.user.email).toBe(validUser.email);
      expect(res.body.user.password).toBeUndefined();
    });

    it("should return user null when no cookie is provided", async () => {
      const res = await request(app).get("/api/v1/auth/me");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ user: null });
    });

    it("should return user null when an invalid token cookie is provided", async () => {
      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Cookie", ["accessToken=invalid_jwt_token_string"]);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ user: null });
    });
  });

  describe("POST /api/v1/auth/logout", () => {
    it("should successfully clear auth cookie and invalidate session", async () => {
      await request(app).post("/api/v1/auth/register").send(validUser);
      const loginRes = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: validUser.email,
          password: validUser.password,
        });

      const authCookie = loginRes.headers["set-cookie"];

      // Confirm logged in session works
      const meResBefore = await request(app)
        .get("/api/v1/auth/me")
        .set("Cookie", authCookie);
      expect(meResBefore.body.user).not.toBeNull();

      // Perform logout
      const logoutRes = await request(app)
        .post("/api/v1/auth/logout")
        .set("Cookie", authCookie);

      expect(logoutRes.status).toBe(200);
      expect(logoutRes.body).toHaveProperty("message", "Logged out successfully.");

      // Verify cookie cleared header
      const cookies = logoutRes.headers["set-cookie"];
      expect(cookies).toBeDefined();
      const clearedCookie = cookies.find((c) => c.startsWith("accessToken="));
      expect(clearedCookie).toMatch(/accessToken=;/);

      // Verify subsequent request is unauthenticated
      const meResAfter = await request(app)
        .get("/api/v1/auth/me")
        .set("Cookie", cookies);

      expect(meResAfter.status).toBe(200);
      expect(meResAfter.body).toEqual({ user: null });
    });
  });
});
