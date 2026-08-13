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

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
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

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/videos", videoRoutes);
app.use("/api/v1/likes", likeRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/history", historyRoutes);
// Routes will be registered here as they're built, e.g.:
// app.use("/api/v1/auth", require("./routes/auth.routes"));

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Vidyora API running on port ${PORT}`);
});
