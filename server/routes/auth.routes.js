const express = require("express");
const { registerUser, loginUser, getMe, logoutUser, updateMe } = require("../controllers/auth.controller");
const { optionalAuth, requireAuth } = require("../middleware/auth.middleware");
const { authLimiter } = require("../middleware/rateLimit.middleware");
const upload = require("../middleware/upload.middleware");

const router = express.Router();

router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);
router.post("/logout", logoutUser);
router.get("/me", optionalAuth, getMe);
router.patch("/me", requireAuth, upload.single("avatar"), updateMe);

module.exports = router;