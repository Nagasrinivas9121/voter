const rateLimit = require("express-rate-limit");

const createLimiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: message || "Too many requests. Please try again later.",
    },
    skip: (req) => process.env.NODE_ENV === "test",
  });

const generalLimiter = createLimiter(
  15 * 60 * 1000,
  100,
  "Too many requests from this IP. Please try again in 15 minutes."
);

const chatLimiter = createLimiter(
  60 * 1000,
  20,
  "Too many messages. Please slow down."
);

const authLimiter = createLimiter(
  15 * 60 * 1000,
  10,
  "Too many auth attempts. Please try again in 15 minutes."
);

module.exports = { generalLimiter, chatLimiter, authLimiter };
