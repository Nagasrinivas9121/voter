require("dotenv").config();

const app = require("./app");
const { connectDB } = require("./src/config/database");
const logger = require("./src/utils/logger");

// ✅ Cloud Run requires PORT=8080
const PORT = process.env.PORT || 8080;

// ─── START SERVER (NON-BLOCKING) ─────────────────────────────
const server = app.listen(PORT, "0.0.0.0", () => {
  logger.info(`🚀 ElectEd AI Server successfully started on port ${PORT}`);
  logger.info(`📌 Target binding: 0.0.0.0:${PORT}`);
  logger.info(`📌 Environment: ${process.env.NODE_ENV || "development"}`);
});

server.on('error', (err) => {
  logger.error("❌ Server failed to start:", err);
  process.exit(1);
});

// ─── DATABASE CONNECTION (NON-BLOCKING) ──────────────────────
connectDB()
  .then(() => {
    logger.info("✅ MongoDB connected");
  })
  .catch((error) => {
    logger.error("❌ MongoDB connection failed:", error);
    // Do NOT crash app — Cloud Run must stay alive
  });

// ─── HEALTH LOG (OPTIONAL DEBUG) ─────────────────────────────
process.on("uncaughtException", (err) => {
  logger.error("💥 Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason) => {
  logger.error("⚠️ Unhandled Rejection:", reason);
});

// ─── GRACEFUL SHUTDOWN ───────────────────────────────────────
process.on("SIGTERM", () => {
  logger.info("🛑 SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});