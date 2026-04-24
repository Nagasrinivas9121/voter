const { verifyFirebaseToken } = require("../config/firebase");
const User = require("../models/User");
const logger = require("../utils/logger");

/**
 * Middleware to authenticate requests using Firebase ID tokens
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    
    // Verify token with Firebase
    const decodedToken = await verifyFirebaseToken(token);
    
    if (!decodedToken) {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    // Find user in local DB by Firebase UID
    const user = await User.findOne({ firebaseUid: decodedToken.uid }).select("-__v").lean();
    
    if (!user) {
      // In a real hackathon project, you might want to auto-create the user here 
      // if they authenticated with Firebase but aren't in your DB yet.
      return res.status(401).json({ success: false, message: "User profile not found" });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "Account is deactivated" });
    }

    // Attach user and Firebase UID to request
    req.user = user;
    req.firebaseUid = decodedToken.uid;
    
    // Add userId to logger context for structured logging
    logger.defaultMeta = { ...logger.defaultMeta, userId: user._id.toString() };
    
    next();
  } catch (error) {
    logger.error("Auth middleware error:", { error: error.message, stack: error.stack });
    return res.status(401).json({ 
      success: false, 
      message: error.code === 'auth/id-token-expired' ? "Token expired" : "Authentication failed" 
    });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    logger.warn(`Unauthorized admin access attempt by: ${req.user?._id || "unknown"}`);
    return res.status(403).json({
      success: false,
      message: "Access Denied: Admin privileges required",
    });
  }
  next();
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }
    const token = authHeader.split(" ")[1];
    const decodedToken = await verifyFirebaseToken(token);
    const user = await User.findOne({ firebaseUid: decodedToken.uid }).lean();
    if (user) req.user = user;
    next();
  } catch {
    next();
  }
};

module.exports = { authenticate, requireAdmin, optionalAuth };

