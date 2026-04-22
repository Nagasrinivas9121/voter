const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../app");

// Mock Gemini service to avoid real API calls during tests
jest.mock("../../src/services/geminiService", () => ({
  sendMessage: jest.fn().mockResolvedValue({
    content: "Test AI response about Indian elections",
    model: "gemini-1.5-flash",
    tokens: 100,
    responseTime: 200,
  }),
  checkEligibility: jest.fn().mockResolvedValue(
    "Based on your details, you are eligible to vote in Indian elections."
  ),
}));

beforeAll(async () => {
  await mongoose.connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/elected_ai_timeline_test"
  );
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

// ─── Timeline API Tests ────────────────────────────────────────────────────

describe("Timeline API", () => {
  describe("GET /api/timeline", () => {
    it("should return all 7 election phases", async () => {
      const res = await request(app).get("/api/timeline");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(7);
    });

    it("each phase should have required fields", async () => {
      const res = await request(app).get("/api/timeline");
      const phase = res.body.data[0];
      expect(phase).toHaveProperty("id");
      expect(phase).toHaveProperty("phase");
      expect(phase).toHaveProperty("icon");
      expect(phase).toHaveProperty("description");
      expect(phase).toHaveProperty("duration");
      expect(phase).toHaveProperty("color");
      expect(phase).toHaveProperty("steps");
      expect(phase).toHaveProperty("resources");
      expect(Array.isArray(phase.steps)).toBe(true);
      expect(Array.isArray(phase.resources)).toBe(true);
    });

    it("should return from cache on second request", async () => {
      const res1 = await request(app).get("/api/timeline");
      const res2 = await request(app).get("/api/timeline");
      expect(res2.body.fromCache).toBe(true);
      expect(res1.body.data).toEqual(res2.body.data);
    });

    it("phases should be in correct order (1-7)", async () => {
      const res = await request(app).get("/api/timeline");
      const ids = res.body.data.map((p) => p.id);
      expect(ids).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });
  });

  describe("GET /api/timeline/:id", () => {
    it("should return a specific phase by id", async () => {
      const res = await request(app).get("/api/timeline/1");
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(1);
      expect(res.body.data.phase).toBe("Voter Registration");
    });

    it("should return phase 5 (Polling Day) correctly", async () => {
      const res = await request(app).get("/api/timeline/5");
      expect(res.status).toBe(200);
      expect(res.body.data.phase).toBe("Polling Day");
      expect(res.body.data.steps.length).toBeGreaterThan(3);
    });

    it("should return 400 for invalid phase id", async () => {
      const res = await request(app).get("/api/timeline/99");
      expect(res.status).toBe(400);
    });

    it("should return 400 for non-numeric id", async () => {
      const res = await request(app).get("/api/timeline/abc");
      expect(res.status).toBe(400);
    });
  });
});

// ─── Eligibility API Tests ─────────────────────────────────────────────────

describe("Eligibility API", () => {
  describe("POST /api/eligibility/check", () => {
    it("should return 400 for missing required fields", async () => {
      const res = await request(app).post("/api/eligibility/check").send({});
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 for invalid age", async () => {
      const res = await request(app).post("/api/eligibility/check").send({
        age: -5,
        isIndianCitizen: true,
        hasVoterID: false,
      });
      expect(res.status).toBe(400);
    });

    it("should return not eligible for age < 18", async () => {
      const res = await request(app).post("/api/eligibility/check").send({
        age: 16,
        isIndianCitizen: true,
        hasVoterID: false,
      });
      expect(res.status).toBe(200);
      expect(res.body.data.isEligible).toBe(false);
      expect(res.body.data.steps.length).toBeGreaterThan(0);
    });

    it("should return not eligible for non-citizen", async () => {
      const res = await request(app).post("/api/eligibility/check").send({
        age: 25,
        isIndianCitizen: false,
        hasVoterID: false,
      });
      expect(res.status).toBe(200);
      expect(res.body.data.isEligible).toBe(false);
    });

    it("should return eligible for valid voter", async () => {
      const res = await request(app).post("/api/eligibility/check").send({
        age: 25,
        isIndianCitizen: true,
        hasVoterID: true,
        state: "Telangana",
      });
      expect(res.status).toBe(200);
      expect(res.body.data.isEligible).toBe(true);
      expect(res.body.data.isRegistered).toBe(true);
      expect(res.body.data.resources).toBeDefined();
      expect(res.body.data.aiExplanation).toBeDefined();
    });

    it("should return eligible but unregistered if no voter ID", async () => {
      const res = await request(app).post("/api/eligibility/check").send({
        age: 20,
        isIndianCitizen: true,
        hasVoterID: false,
      });
      expect(res.status).toBe(200);
      expect(res.body.data.isEligible).toBe(true);
      expect(res.body.data.isRegistered).toBe(false);
    });

    it("should include official resource URLs", async () => {
      const res = await request(app).post("/api/eligibility/check").send({
        age: 30,
        isIndianCitizen: true,
        hasVoterID: true,
      });
      const urls = res.body.data.resources.map((r) => r.url);
      expect(urls).toContain("https://voters.eci.gov.in");
      expect(urls).toContain("https://eci.gov.in");
    });
  });
});

// ─── Health Check Tests ────────────────────────────────────────────────────

describe("Health Check", () => {
  it("GET /health should return 200 with DB connected", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("healthy");
    expect(res.body.app).toBe("ElectEd AI");
    expect(res.body.database).toBe("connected");
    expect(res.body.memory).toBeDefined();
    expect(res.body.uptime).toBeDefined();
  });
});

// ─── 404 Handler Tests ─────────────────────────────────────────────────────

describe("404 Handler", () => {
  it("should return 404 for unknown routes", async () => {
    const res = await request(app).get("/api/unknown-route");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Route not found");
  });
});
