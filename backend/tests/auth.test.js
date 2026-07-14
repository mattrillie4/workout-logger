const request = require("supertest");
const app = require("../app");
const { makeTestEmail } = require("./testHelpers");

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

const registerEmail = makeTestEmail(); // create temporary test email

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
  it("rejects missing email", async () => {
    const response = await request(app)
      .post("/user/register")
      .send({ password: "Password123" });
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
    expect(response.body.message).toBe(
      "Password must be at least 8 characters long",
    );
  });
  it("creates a user with valid details", async () => {
    const response = await request(app)
      .post("/user/register")
      .send({ email: registerEmail, password: "TestPassword123!" });
    expect(response.status).toBe(201);
    expect(response.body.error).toBe(false);
    expect(response.body.message).toBe("User created");
  });
  it("rejects duplicate email", async () => {
    const response = await request(app)
      .post("/user/register")
      .send({ email: registerEmail, password: "TestPassword123!" });
    expect(response.status).toBe(409);
    expect(response.body.error).toBe(true);
    expect(response.body.message).toBe("User already exists");
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
  it("rejects incorrect password", async () => {
    const response = await request(app)
      .post("/user/login")
      .send({ email: registerEmail, password: "WrongPassword123" });
    expect(response.status).toBe(401);
    expect(response.body.error).toBe(true);
    expect(response.body.message).toBe("Incorrect email or password");
  });
  it("returns a JWT for valid credentials", async () => {
    const response = await request(app)
      .post("/user/login")
      .send({ email: registerEmail, password: "TestPassword123!" });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(typeof response.body.token).toBe("string");
    expect(response.body.token.length).toBeGreaterThan(10);
  });
});
