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
    expect(Array.isArray(response.body.data)).toBe(true); // no exercises should be archived in this endpoint
    expect(
      response.body.data.some((exercise) => exercise.isArchived === true),
    ).toBe(false);
    expect(
      response.body.data.every((exercise) => exercise.category === "chest"),
    ).toBe(true); // all should be chest for this test example
    //test structure of response
    expect(response.body.data[0]).toHaveProperty("userId");
    expect(response.body.data[0]).toMatchObject({
      id: expect.any(Number),
      name: expect.any(String),
      category: "chest",
      isArchived: false,
    });
  });
});

describe("GET /archived", () => {
  it("rejects requests without a token", async () => {
    const response = await request(app).get("/exercises/archived");

    expect(response.status).toBe(401);
    expect(response.body.error).toBe(true);
    expect(response.body.message).toBe(
      "Authorization header ('Bearer token') not found",
    );
  });
  it("returns user archived exercises", async () => {
    const response = await request(app)
      .get("/exercises/ archived")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.error).toBe(false);
    expect(
      response.body.data.every((exercise) => exercise.isArchived === true),
    ).toBe(true);
  });
});
