const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    logger.error("❌ MONGODB_URI is missing. Database features will be unavailable.");
    return;
  }

  const options = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000, // Reduced from 30s to 5s for faster feedback on Cloud Run
    socketTimeoutMS: 45000,
    family: 4,
  };

  mongoose.connection.on("connected", () => logger.info("✅ MongoDB connected"));
  mongoose.connection.on("error", (err) => logger.error("MongoDB error:", err));
  mongoose.connection.on("disconnected", () => logger.warn("⚠️  MongoDB disconnected"));

  try {
    await mongoose.connect(uri, options);
  } catch (err) {
    logger.error("❌ Initial MongoDB connection failed:", err.message);
    // We don't rethrow here to allow the server to start and respond to health checks
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  logger.info("MongoDB disconnected");
};

module.exports = { connectDB, disconnectDB };
