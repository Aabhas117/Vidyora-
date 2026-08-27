const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

dotenv.config();

const app = express();

// Connect to MongoDB Atlas before accepting traffic
connectDB();

const allowedOrigins = [
  "http://localhost:5173","https://vidyora-amber.vercel.app",
  process.env.CLIENT_URL, 
];

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

// Health check — confirms the API is running, independent of DB status
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Vidyora API is running",
    timestamp: new Date().toISOString(),
  });
});
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

// Routes will be registered here as they're built, e.g.:
// app.use("/api/v1/auth", require("./routes/auth.routes"));

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Vidyora API running on port ${PORT}`);
});
