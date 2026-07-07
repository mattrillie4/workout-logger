const request = require("supertest");
const app = require("../app");

// most basic test, tests server is running
describe("GET /", () => {
  it("returns API status info", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Workout Logger API");
  });
});

// Auth testing
// POST register testing, /user/register

describe("POST /user/register", () => {
  it("rejects missing email and password", async () => {
    const response = await request(app).post("/user/register").send({});
    expect(response.status).toBe(400);
    expect(response.body.error).toBe(true);
    expect(response.body.message).toBe(
      "Request body incomplete, both email and password required",
    );
  });
  it("rejects missing password", async () => {
    const response = await request(app)
      .post("/user/register")
      .send({ email: "test@example.com" });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe(true);
    expect(response.body.message).toBe(
      "Request body incomplete, both email and password required",
    );
  });

  it("rejects passwords less than 8 characters", async () => {
    const response = await request(app)
      .post("/user/register")
      .send({ email: "test@email.com", password: "short" });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe(true);
  });
});

// POST login testing, /user/login
describe("POST /user/login", () => {
  it("rejects missing password", async () => {
    const response = await request(app)
      .post("/user/login")
      .send({ email: "test@example.com" });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe(true);
    expect(response.body.message).toBe(
      "Request body incomplete, both email and password required",
    );
  });
  it("rejects missing email", async () => {
    const response = await request(app)
      .post("/user/login")
      .send({ password: "password123" });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe(true);
    expect(response.body.message).toBe(
      "Request body incomplete, both email and password required",
    );
  });

  it("rejects missing email AND password", async () => {
    const response = await request(app).post("/user/login").send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toBe(true);
    expect(response.body.message).toBe(
      "Request body incomplete, both email and password required",
    );
  });
});
