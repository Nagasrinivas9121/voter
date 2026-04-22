const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../app");

// Mock Firebase Admin
jest.mock("../../src/config/firebase", () => ({
  verifyFirebaseToken: jest.fn().mockResolvedValue({
    uid: "firebase_test_uid",
    email: "test@example.com",
    name: "Test User",
    picture: "",
  }),
  initFirebase: jest.fn(),
}));

// Use in-memory mongoose for tests
beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/elected_ai_test");
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

describe("Auth API", () => {
  describe("POST /api/auth/google", () => {
    it("should return 400 for missing idToken", async () => {
      const res = await request(app).post("/api/auth/google").send({});
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should login/register user with valid Firebase token", async () => {
      const res = await request(app)
        .post("/api/auth/google")
        .send({ idToken: "valid_firebase_token", userType: "first_time" });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe("test@example.com");
    });
  });

  describe("GET /api/auth/verify", () => {
    let authToken;
    beforeAll(async () => {
      const res = await request(app)
        .post("/api/auth/google")
        .send({ idToken: "valid_firebase_token" });
      authToken = res.body.token;
    });

    it("should return 401 without token", async () => {
      const res = await request(app).get("/api/auth/verify");
      expect(res.status).toBe(401);
    });

    it("should verify valid JWT token", async () => {
      const res = await request(app)
        .get("/api/auth/verify")
        .set("Authorization", `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});

describe("Health Check", () => {
  it("GET /health should return 200", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("healthy");
    expect(res.body.app).toBe("ElectEd AI");
  });
});
