const request = require("supertest");
const app = require("../app");

// Contains flow tests, that test the whole system, simulates a user journey
describe("Full user flow: register, login, create and fetch workouts", () => {
  // declare variables needed later
  let token;
  let workoutId;

  // register new user
  it("registers a new user", async () => {
    const response = await request(app)
      .post("/user/register")
      .send({ email: "flowtest@example.com", password: "password123" });

    expect(response.status).toBe(201);
    expect(response.body.error).toBe(false);
    expect(response.body.message).toBe("User created");
  });

  // login with that user
  it("login with user and store returned token", async () => {
    const response = await request(app).post("/user/login").send({
      email: "flowtest@example.com",
      password: "password123",
    });
    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
    token = response.body.token; // store token
  });
});
