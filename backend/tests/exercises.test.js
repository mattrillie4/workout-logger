const request = require("supertest");
const app = require("../app");
const { createTestUserAndToken } = require("./testHelpers");

// create, login user, and store token
beforeAll(async () => {
  const result = await createTestUserAndToken();
  token = result.token;
});

// Tests the endpoints contained in exercises.js

// tests global exercise get request
describe("GET /", () => {
  it("returns global exercises", async () => {
    const response = await request(app).get("/exercises");

    expect(response.status).toBe(200);
    expect(response.body.error).toBe(false);
    expect(Array.isArray(response.body.data)).toBe(true); // check if returns array
    expect(response.body.data[0]).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        name: expect.any(String),
        category: expect.any(String),
        userId: null,
        isArchived: false,
      }),
    ); // test the structure for one of the exercises
  });
});

describe("GET /me", () => {
  it("rejects requests without a token", async () => {
    const response = await request(app).get("/exercises/me");

    expect(response.status).toBe(401);
    expect(response.body.error).toBe(true);
    expect(response.body.message).toBe(
      "Authorization header ('Bearer token') not found",
    );
  });
});

describe("GET /:category", () => {
  it("rejects requests without a token", async () => {
    const response = await request(app).get("/exercises/chest");

    expect(response.status).toBe(401);
    expect(response.body.error).toBe(true);
    expect(response.body.message).toBe(
      "Authorization header ('Bearer token') not found",
    );
  });
  it("returns exercises in specific category with valid token", async () => {
    const response = await request(app)
      .get("/exercises/chest")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.error).toBe(false);
  });
});
