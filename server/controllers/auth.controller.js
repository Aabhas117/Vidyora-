const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const MIN_PASSWORD_LENGTH = 6;

function toSafeUser(user) {
  return {
    _id: user._id,
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    bio: user.bio,
    createdAt: user.createdAt,
  };
}

function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
}

function setAuthCookie(res, token) {
  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // false on localhost so the cookie isn't dropped over plain http
    sameSite: "lax", // allows the cookie on same-site navigation/requests during local dev
    maxAge: 24 * 60 * 60 * 1000, // 1 day, in ms — keep in sync with JWT_EXPIRES_IN
  });
}

async function registerUser(req, res) {
  try {
    const { fullName, username, email, password } = req.body;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ message: "Full name is required." });
    }
    if (!username || !username.trim()) {
      return res.status(400).json({ message: "Username is required." });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ message: "Email is required." });
    }
    if (!password) {
      return res.status(400).json({ message: "Password is required." });
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return res
        .status(400)
        .json({ message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` });
    }

    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      $or: [{ username: normalizedUsername }, { email: normalizedEmail }],
    });

    if (existingUser) {
      const field = existingUser.username === normalizedUsername ? "username" : "email";
      return res.status(409).json({ message: `An account with that ${field} already exists.` });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      fullName: fullName.trim(),
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
    });

    return res.status(201).json({ user: toSafeUser(user) });
  } catch (error) {
    console.error("Register error:", error.message);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ message: "Email is required." });
    }
    if (!password) {
      return res.status(400).json({ message: "Password is required." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    // Same generic message whether the account doesn't exist or the password
    // is wrong — this avoids confirming to an attacker whether a given email
    // is registered at all.
    if (!user) {
      return res.status(401).json({ message: "Incorrect email or password." });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: "Incorrect email or password." });
    }

    const token = generateToken(user._id);
    setAuthCookie(res, token);

    const logUser = toSafeUser(user);

    return res.status(200).json({ ...logUser,  token });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}

async function getMe(req, res) {
  // req.user is attached by auth.middleware.js before this runs
  return res.status(200).json({ user: toSafeUser(req.user) });
}

async function logoutUser(req, res) {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  return res.status(200).json({ message: "Logged out successfully." });
}

module.exports = { registerUser, loginUser, getMe, logoutUser };