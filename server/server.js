const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const { securityHeaders, mongoSanitize } = require("./middleware/security.middleware");
const { apiLimiter } = require("./middleware/rateLimit.middleware");

dotenv.config();

if (!process.env.VERCEL) {
  try {
    const dns = require("dns");
    dns.setServers(["1.1.1.1", "8.8.8.8"]);
  } catch {
    // Ignore DNS setServers failure in serverless or restricted network environments
  }
}

// Validate JWT_SECRET on startup without killing serverless process
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.warn("WARNING: JWT_SECRET should be defined in environment and be at least 32 characters long.");
}

const app = express();

// Trust reverse proxy (Vercel / Render / Nginx) for correct client IP detection
app.set("trust proxy", 1);

// Security Headers & NoSQL Input Sanitization
app.use(securityHeaders);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(mongoSanitize);

const allowedOrigins = [
  "http://localhost:5173",
  "https://vidyora-amber.vercel.app",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

// Public root & health check endpoints (accessible without DB connection)
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Vidyora API running",
  });
});

app.get("/api/health", (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.status(200).json({
    status: "ok",
    message: "Vidyora API is running",
    dbConnected,
    timestamp: new Date().toISOString(),
  });
});

// Global API rate limiting for /api/v1
app.use("/api/v1", apiLimiter);

// Ensure MongoDB connection before handling /api/v1 requests
app.use("/api/v1", async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection middleware error:", error.message);
    return res.status(500).json({
      message: "Database connection failed.",
    });
  }
});

// Routes
const authRoutes = require("./routes/auth.routes");
const videoRoutes = require("./routes/video.routes");
const likeRoutes = require("./routes/like.routes");
const commentRoutes = require("./routes/comment.routes");
const historyRoutes = require("./routes/history.routes");
const playlistRoutes = require("./routes/playlist.routes");
const subscriptionRoutes = require("./routes/subscription.routes");
const analyticsRoutes = require("./routes/analytics.routes");

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/videos", videoRoutes);
app.use("/api/v1/likes", likeRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/history", historyRoutes);
app.use("/api/v1/playlists", playlistRoutes);
app.use("/api/v1/subscriptions", subscriptionRoutes);
app.use("/api/v1/analytics", analyticsRoutes);

// Safe global error handler (hides stack traces and sensitive details in production)
app.use((err, req, res, _next) => {
  console.error("Unhandled error:", err.message);
  const isProd = process.env.NODE_ENV === "production";
  return res.status(err.status || 500).json({
    message: isProd ? "Something went wrong. Please try again." : err.message || "Internal server error",
  });
});

if (require.main === module) {
  const PORT = process.env.PORT || 8000;
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Vidyora server running on http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error("Server startup failed:", err.message);
    });
}

// Export for Vercel
module.exports = app;
