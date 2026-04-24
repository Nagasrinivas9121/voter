const User = require("../models/User");
const { verifyFirebaseToken } = require("../config/firebase");
const { asyncHandler } = require("../middleware/errorHandler");
const logger = require("../utils/logger");

/**
 * POST /api/auth/google
 * Verify Firebase ID token → upsert user → return profile
 * Note: We don't generate a local JWT; the client uses the Firebase ID token for all requests.
 */
const googleLogin = asyncHandler(async (req, res) => {
  const { idToken, userType } = req.body;

  if (!idToken) {
    return res.status(400).json({ success: false, message: "Firebase ID token is required" });
  }

  const decoded = await verifyFirebaseToken(idToken);

  let user = await User.findOne({ firebaseUid: decoded.uid });

  if (user) {
    user.lastLoginAt = new Date();
    // Allow updating userType during login if it was previously general
    if (userType && user.userType === "general") {
      user.userType = userType;
    }
    await user.save();
    logger.info(`User logged in: ${user.email}`, { userId: user._id, method: "google" });
  } else {
    user = await User.create({
      firebaseUid: decoded.uid,
      email: decoded.email,
      displayName: decoded.name || decoded.email.split("@")[0],
      photoURL: decoded.picture || "",
      userType: userType || "general",
    });
    logger.info(`New user registered: ${user.email}`, { userId: user._id });
  }

  res.status(200).json({
    success: true,
    message: "Authentication successful",
    user: user.toPublicJSON(),
    // We send back the idToken just for consistency, though the client already has it
    token: idToken 
  });
});

/**
 * GET /api/auth/verify
 * Return current user (authenticated via middleware)
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
  }).lean();

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  res.status(200).json({
    success: true,
    message: "Profile updated",
    user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: user.role,
        userType: user.userType,
        language: user.language,
    }
  });
});

/**
 * POST /api/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  logger.info(`User logged out: ${req.user?.email || "unknown"}`, { userId: req.user?._id });
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

module.exports = { googleLogin, verifyToken, updateProfile, logout };

