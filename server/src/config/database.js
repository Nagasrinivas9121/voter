const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI environment variable is not set");

  const options = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    family: 4,
  };

  mongoose.connection.on("connected", () => logger.info("✅ MongoDB connected"));
  mongoose.connection.on("error", (err) => logger.error("MongoDB error:", err));
  mongoose.connection.on("disconnected", () => logger.warn("⚠️  MongoDB disconnected"));

  await mongoose.connect(uri, options);
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  logger.info("MongoDB disconnected");
};

module.exports = { connectDB, disconnectDB };
