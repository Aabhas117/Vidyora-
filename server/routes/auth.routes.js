const express = require("express");
const { registerUser, loginUser, getMe, logoutUser } = require("../controllers/auth.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me", requireAuth, getMe);

module.exports = router;