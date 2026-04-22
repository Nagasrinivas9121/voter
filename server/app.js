const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");

const { errorHandler } = require("./src/middleware/errorHandler");
const { generalLimiter } = require("./src/middleware/rateLimiter");

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
        scriptSrc: ["'self'"],
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
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(compression());

// ─── Logging ────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("combined"));
}

// ─── Rate Limiting ──────────────────────────────────────────────────────────
app.use("/api", generalLimiter);

// ─── Health Check ───────────────────────────────────────────────────────────
const mongoose = require("mongoose");
app.get("/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" };
  const memUsage = process.memoryUsage();

  // For Cloud Run, the health check should return 200 if the process is alive.
  // We report the database status but don't fail the probe unless the app itself is critical.
  res.status(200).json({
    status: "healthy",
    app: "ElectEd AI",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    database: dbStatus[dbState] || "unknown",
    memory: {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      heap: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
    },
  });
});

// ─── API Routes ─────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/timeline", timelineRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/eligibility", eligibilityRoutes);

// ─── 404 Handler ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
