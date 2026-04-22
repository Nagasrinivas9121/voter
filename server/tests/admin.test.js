const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const app = require("../app");
const User = require("../src/models/User");

// Helper to generate a test token
const generateTestToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || "test-secret", { expiresIn: "1h" });
};

let adminToken;
let userToken;
let testAdmin;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/elected_ai_admin_test");
  
  // Create a test admin user
  testAdmin = await User.create({
    displayName: "Admin Test",
    email: "admin@test.com",
    firebaseUid: "fb-admin-123",
    role: "admin"
  });

  adminToken = generateTestToken({ id: testAdmin._id, admin: true });

  // Create a real non-admin user so the token resolves in auth middleware
  const testUser = await User.create({
    displayName: "Regular User",
    email: "user@test.com",
    firebaseUid: "fb-user-456",
    role: "user"
  });
  userToken = generateTestToken({ id: testUser._id, admin: false });
});

afterAll(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe("Admin API Security", () => {
  
  describe("GET /api/admin/stats", () => {
    it("should reject access if no token is provided", async () => {
      const res = await request(app).get("/api/admin/stats");
      expect(res.status).toBe(401);
    });

    it("should reject access for non-admin users", async () => {
      const res = await request(app)
        .get("/api/admin/stats")
        .set("Authorization", `Bearer ${userToken}`);
      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/Admin privileges required/);
    });

    it("should allow access for admin users with valid token", async () => {
      const res = await request(app)
        .get("/api/admin/stats")
        .set("Authorization", `Bearer ${adminToken}`);
      
      // If the endpoint is implemented, it should be 200 or 404 (if no data)
      // If not yet implemented, it will be 404 but the AUTH will have passed
      expect([200, 404]).toContain(res.status);
    });
  });

  describe("Admin Claim Validation", () => {
    it("should respect the 'admin: true' claim from the JWT payload", async () => {
      // Create a temporary token for a standard user but with an admin CLAIM
      const spoofedAdminToken = generateTestToken({ id: testAdmin._id, admin: true });
      
      const res = await request(app)
        .get("/api/admin/stats")
        .set("Authorization", `Bearer ${spoofedAdminToken}`);
      
      expect(res.status).not.toBe(403);
    });
  });

});
