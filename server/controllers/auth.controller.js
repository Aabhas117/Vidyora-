const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs/promises");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary");
const { validateFileSignature } = require("../middleware/upload.middleware");

const MIN_PASSWORD_LENGTH = 8;
const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_+\-=\[\]{}|;:',.<>\/]).{8,}$/;

function toSafeUser(user) {
  if (!user) return null;
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
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000, // 1 day, in ms
  });
}

async function cleanupTempFile(filePath) {
  if (!filePath) return;
  try {
    await fs.unlink(filePath);
  } catch {
    // ignore — file may already be gone
  }
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
    if (password.length < MIN_PASSWORD_LENGTH || !PASSWORD_COMPLEXITY_REGEX.test(password)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character.",
      });
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
    // Explicitly select +password since User schema hides it by default
    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Incorrect email or password." });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: "Incorrect email or password." });
    }

    const token = generateToken(user._id);
    setAuthCookie(res, token);

    return res.status(200).json({ user: toSafeUser(user) });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}

async function getMe(req, res) {
  return res.status(200).json({ user: req.user ? toSafeUser(req.user) : null });
}

async function logoutUser(req, res) {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  });
  return res.status(200).json({ message: "Logged out successfully." });
}

async function updateMe(req, res) {
  const avatarFile = req.file;

  try {
    const user = req.user;
    const { fullName, username, email } = req.body;

    if (fullName !== undefined) {
      if (!fullName.trim()) {
        return res.status(400).json({ message: "Full name cannot be empty." });
      }
      user.fullName = fullName.trim();
    }

    if (username !== undefined) {
      const normalizedUsername = username.trim().toLowerCase();
      if (!normalizedUsername) {
        return res.status(400).json({ message: "Username cannot be empty." });
      }
      if (normalizedUsername !== user.username) {
        const existing = await User.findOne({ username: normalizedUsername });
        if (existing) {
          return res.status(409).json({ message: "That username is already taken." });
        }
      }
      user.username = normalizedUsername;
    }

    if (email !== undefined) {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail) {
        return res.status(400).json({ message: "Email cannot be empty." });
      }
      if (normalizedEmail !== user.email) {
        const existing = await User.findOne({ email: normalizedEmail });
        if (existing) {
          return res.status(409).json({ message: "That email is already in use." });
        }
      }
      user.email = normalizedEmail;
    }

    if (avatarFile) {
      // Validate file signature before Cloudinary upload
      if (!validateFileSignature(avatarFile.path, "avatar")) {
        await cleanupTempFile(avatarFile.path);
        return res.status(400).json({ message: "Invalid avatar file content. File appears to be corrupted or spoofed." });
      }

      let uploadResult;
      try {
        uploadResult = await cloudinary.uploader.upload(avatarFile.path, {
          resource_type: "image",
          folder: "vidyora/avatars",
        });
      } finally {
        await cleanupTempFile(avatarFile.path);
      }
      user.avatar = uploadResult.secure_url;
    }

    await user.save();

    return res.status(200).json({ user: toSafeUser(user) });
  } catch (error) {
    await cleanupTempFile(avatarFile?.path);
    console.error("Update profile error:", error.message);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}

module.exports = { registerUser, loginUser, getMe, logoutUser, updateMe };