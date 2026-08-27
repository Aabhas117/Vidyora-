const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function optionalAuth(req, res, next) {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (user) {
      req.user = user;
    }

    return next();
  } catch {
    return next();
  }
}

async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({ message: "Not authenticated." });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired session." });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.status(500).json({ message: "Something went wrong." });
  }
}

module.exports = { optionalAuth, requireAuth };