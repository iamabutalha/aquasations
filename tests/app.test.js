import app from "#src/app.js";
import request from "supertest";
describe("API Endpoints", () => {
  describe("GET /health", () => {
    it("Should return health status", async () => {
      const response = await request(app).get("/health").expect(200);
      expect(response.body).toHaveProperty("status", "OK");
      expect(response.body).toHaveProperty("uptime");
    });
  });

  describe("GET /api", () => {
    it("Should return api message", async () => {
      const response = await request(app).get("/api").expect(200);
      expect(response.body).toHaveProperty(
        "message",
        "Welcome to the Aquasations API!"
      );
    });
  });

  describe("GET /nonexistant", () => {
    it("Should return api message", async () => {
      const response = await request(app).get("/nonexistant").expect(404);
      expect(response.body).toHaveProperty("error", "route not found");
    });
  });
});
