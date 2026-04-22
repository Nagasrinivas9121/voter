const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../app");

jest.mock("../../src/config/firebase", () => ({
  verifyFirebaseToken: jest.fn().mockResolvedValue({
    uid: "firebase_chat_uid",
    email: "chatuser@example.com",
    name: "Chat User",
    picture: "",
  }),
  initFirebase: jest.fn(),
}));

jest.mock("../../src/services/geminiService", () => ({
  sendMessage: jest.fn().mockResolvedValue({
    content: "To vote in India, you need to be 18+ and a registered voter...",
    model: "gemini-1.5-flash",
    tokens: 120,
    responseTime: 500,
  }),
  checkEligibility: jest.fn().mockResolvedValue("You are eligible to vote."),
}));

let authToken;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/elected_ai_chat_test");
  const res = await request(app)
    .post("/api/auth/google")
    .send({ idToken: "valid_firebase_token" });
  authToken = res.body.token;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

describe("Chat API", () => {
  let sessionId;

  describe("POST /api/chat/send", () => {
    it("should return 401 without authentication", async () => {
      const res = await request(app).post("/api/chat/send").send({ message: "Hello" });
      expect(res.status).toBe(401);
    });

    it("should return 400 for empty message", async () => {
      const res = await request(app)
        .post("/api/chat/send")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ message: "" });
      expect(res.status).toBe(400);
    });

    it("should send a message and get AI response", async () => {
      const res = await request(app)
        .post("/api/chat/send")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ message: "How do I register to vote?", language: "en", userType: "first_time" });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message.content).toBeDefined();
      expect(res.body.sessionId).toBeDefined();
      sessionId = res.body.sessionId;
    });

    it("should continue existing session with sessionId", async () => {
      const res = await request(app)
        .post("/api/chat/send")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ message: "Tell me more", sessionId, language: "en" });
      expect(res.status).toBe(200);
      expect(res.body.sessionId).toBe(sessionId);
    });
  });

  describe("GET /api/chat/sessions", () => {
    it("should return user sessions", async () => {
      const res = await request(app)
        .get("/api/chat/sessions")
        .set("Authorization", `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toBeDefined();
    });
  });

  describe("GET /api/chat/session/:id", () => {
    it("should get a specific session", async () => {
      const res = await request(app)
        .get(`/api/chat/session/${sessionId}`)
        .set("Authorization", `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.messages.length).toBeGreaterThan(0);
    });

    it("should return 404 for non-existent session", async () => {
      const res = await request(app)
        .get(`/api/chat/session/${new mongoose.Types.ObjectId()}`)
        .set("Authorization", `Bearer ${authToken}`);
      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/chat/session/:id", () => {
    it("should archive a session", async () => {
      const res = await request(app)
        .delete(`/api/chat/session/${sessionId}`)
        .set("Authorization", `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
