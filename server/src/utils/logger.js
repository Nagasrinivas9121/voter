const { createLogger, format, transports } = require("winston");

const { combine, timestamp, json, errors, colorize, printf } = format;

// Google Cloud Logging uses 'severity' instead of 'level'
const severityFormat = format((info) => {
  const { level, ...rest } = info;
  return {
    ...rest,
    severity: level.toUpperCase(),
  };
});

const consoleFormat = printf(({ level, message, timestamp, stack, service, userId }) => {
  const metadata = userId ? ` [User: ${userId}]` : "";
  const serviceName = service ? ` [${service}]` : "";
  return `${timestamp} [${level}]${serviceName}${metadata}: ${stack || message}`;
});

const logger = createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  defaultMeta: { service: "elected-ai-backend" },
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    severityFormat(),
    process.env.NODE_ENV === "production" ? json() : combine(colorize(), consoleFormat)
  ),
  transports: [
    new transports.Console(),
  ],
  silent: process.env.NODE_ENV === "test",
});

module.exports = logger;


