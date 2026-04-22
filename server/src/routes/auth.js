const express = require("express");
const router = express.Router();
const { googleLogin, verifyToken, updateProfile, logout } = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");
const { validate, schemas } = require("../middleware/validate");
const { authLimiter } = require("../middleware/rateLimiter");

router.post("/google", authLimiter, validate(schemas.auth.googleLogin), googleLogin);
router.get("/verify", authenticate, verifyToken);
router.patch("/profile", authenticate, validate(schemas.auth.updateProfile), updateProfile);
router.post("/logout", authenticate, logout);

module.exports = router;
