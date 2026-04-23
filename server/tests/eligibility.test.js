const request = require("supertest");
const app = require("../app");

describe("Eligibility API", () => {
  describe("POST /api/eligibility/check", () => {
    it("should return 400 for invalid age", async () => {
      const res = await request(app)
        .post("/api/eligibility/check")
        .send({ age: 150, isIndianCitizen: true, hasVoterID: true });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 for missing required fields", async () => {
      const res = await request(app)
        .post("/api/eligibility/check")
        .send({ age: 25 });
      expect(res.status).toBe(400);
    });

    it("should return 200 for valid data", async () => {
      // Mock geminiService.checkEligibility if needed, but here it might call real one or we can mock it
      // For unit tests, we should mock.
      const res = await request(app)
        .post("/api/eligibility/check")
        .send({ 
          age: 21, 
          isIndianCitizen: true, 
          hasVoterID: false,
          state: "Telangana"
        });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });
});
