const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const mongoSanitize = require("express-mongo-sanitize");
const mongoose = require("mongoose");

const { errorHandler } = require("./src/middleware/errorHandler");
const { generalLimiter, chatLimiter, authLimiter } = require("./src/middleware/rateLimiter");
const logger = require("./src/utils/logger");

// Routes
const authRoutes = require("./src/routes/auth");
const chatRoutes = require("./src/routes/chat");
const timelineRoutes = require("./src/routes/timeline");
const dashboardRoutes = require("./src/routes/dashboard");
const adminRoutes = require("./src/routes/admin");
const eligibilityRoutes = require("./src/routes/eligibility");

const app = express();

// ─── Security Middleware ────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'", "https://www.googletagmanager.com"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// ─── CORS ───────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173").split(",");
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ─── Body Parsing & Sanitization ────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(mongoSanitize()); 
app.use(compression());

// ─── Structured JSON Logging (Google Cloud) ─────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`, {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get("user-agent"),
      userId: req.user?._id,
    });
  });
  next();
});

// ─── Rate Limiting ──────────────────────────────────────────────────────────
app.use("/api", generalLimiter);

// ─── Health Check ───────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" };
  
  res.status(200).json({
    status: "healthy",
    app: "ElectEd AI",
    version: "1.1.0",
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    database: dbStatus[dbState] || "unknown",
  });
});

// ─── API Routes ─────────────────────────────────────────────────────────────
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/chat", chatLimiter, chatRoutes);
app.use("/api/timeline", timelineRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/eligibility", eligibilityRoutes);

// ─── 404 Handler ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;

