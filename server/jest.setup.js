// Load environment variables for test suite
require("dotenv").config();

// Override test-specific env vars
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-key-for-jest";
process.env.JWT_EXPIRES_IN = "1h";

// Silence console during tests
if (process.env.JEST_SILENT !== "false") {
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "info").mockImplementation(() => {});
}
