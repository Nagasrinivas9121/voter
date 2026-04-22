const jwt = require("jsonwebtoken");
const User = require("../models/User");
const logger = require("../utils/logger");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-__v").lean();
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "Account is deactivated" });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    logger.error("Auth middleware error:", error);
    return res.status(500).json({ success: false, message: "Authentication error" });
  }
};

const requireAdmin = (req, res, next) => {
  // Check both the DB user role and the JWT "admin" claim
  const isUserAdmin = req.user && (req.user.role === "admin" || req.user.admin === true);

  if (!isUserAdmin) {
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).lean();
    if (user) req.user = user;
    next();
  } catch {
    next();
  }
};

module.exports = { authenticate, requireAdmin, optionalAuth };
