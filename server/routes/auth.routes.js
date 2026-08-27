const express = require("express");
const { registerUser, loginUser, getMe, logoutUser, updateMe } = require("../controllers/auth.controller");
const { optionalAuth, requireAuth } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me", optionalAuth, getMe);
router.patch("/me", requireAuth, upload.single("avatar"), updateMe);

module.exports = router;