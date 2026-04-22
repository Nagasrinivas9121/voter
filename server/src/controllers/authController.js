const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { verifyFirebaseToken } = require("../config/firebase");
const { asyncHandler } = require("../middleware/errorHandler");
const logger = require("../utils/logger");

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

/**
 * POST /api/auth/google
 * Verify Firebase ID token → upsert user → return JWT
 */
const googleLogin = asyncHandler(async (req, res) => {
  const { idToken, userType } = req.body;

  const decoded = await verifyFirebaseToken(idToken);

  let user = await User.findOne({ firebaseUid: decoded.uid });

  if (user) {
    user.lastLoginAt = new Date();
    if (userType && user.userType === "general") user.userType = userType;
    await user.save();
  } else {
    user = await User.create({
      firebaseUid: decoded.uid,
      email: decoded.email,
      displayName: decoded.name || decoded.email.split("@")[0],
      photoURL: decoded.picture || "",
      userType: userType || "general",
    });
    logger.info(`New user registered: ${decoded.email}`);
  }

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    user: user.toPublicJSON(),
  });
});

/**
 * GET /api/auth/verify
 * Verify JWT and return current user
 */
const verifyToken = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

/**
 * PATCH /api/auth/profile
 * Update user profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { displayName, userType, language } = req.body;

  const update = {};
  if (displayName) update.displayName = displayName;
  if (userType) update.userType = userType;
  if (language) update.language = language;

  const user = await User.findByIdAndUpdate(req.user._id, update, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "Profile updated",
    user: user.toPublicJSON(),
  });
});

/**
 * POST /api/auth/logout
 * Client-side logout (invalidate client token — stateless JWT)
 */
const logout = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

module.exports = { googleLogin, verifyToken, updateProfile, logout };
