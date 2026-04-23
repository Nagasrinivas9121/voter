require("dotenv").config();

const config = {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 8080,
  mongodb: {
    uri: process.env.MONGODB_URI,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
  },
  cors: {
    allowedOrigins: (process.env.ALLOWED_ORIGINS || "http://localhost:5173").split(","),
  },
  cache: {
    stdTTL: 600, // 10 minutes
    checkperiod: 120,
  },
};

// Validate required env vars
const requiredVars = [
  "MONGODB_URI",
  "JWT_SECRET",
  "GEMINI_API_KEY",
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
];

if (config.env !== "test") {
  requiredVars.forEach((v) => {
    if (!process.env[v]) {
      console.warn(`⚠️  WARNING: Missing required environment variable: ${v}`);
    }
  });
}

module.exports = config;
