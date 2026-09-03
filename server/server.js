const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const dns = require("dns");
const connectDB = require("./config/db");
dns.setServers(["1.1.1.1", "8.8.8.8"]);
dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://vidyora-amber.vercel.app",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.get('/', (req, res)=>{
    res.status(200).json({
      success: true,
      message: "running,"
    })
  }
)

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Vidyora API is running",
    timestamp: new Date().toISOString(),
  });
});

// Routes
const authRoutes = require("./routes/auth.routes");
const videoRoutes = require("./routes/video.routes");
const likeRoutes = require("./routes/like.routes");
const commentRoutes = require("./routes/comment.routes");
const historyRoutes = require("./routes/history.routes");
const playlistRoutes = require("./routes/playlist.routes");
const subscriptionRoutes = require("./routes/subscription.routes");

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/videos", videoRoutes);
app.use("/api/v1/likes", likeRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/history", historyRoutes);
app.use("/api/v1/playlists", playlistRoutes);
app.use("/api/v1/subscriptions", subscriptionRoutes);

if (require.main === module) {
  const PORT = process.env.PORT || 8000;
  connectDB();
  app.listen(PORT, () => {
    console.log(`Vidyora server running on http://localhost:${PORT}`);
  });
}

// Export for Vercel
module.exports = app;
