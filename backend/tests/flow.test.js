const request = require("supertest");
const app = require("../app");
const { PrismaClient } = require("@prisma/client");
const { createTestUserAndToken } = require("./testHelpers");

const prisma = new PrismaClient();

// Contains flow tests, that test the whole system, simulates a user journey
describe("Full user flow: register, login, create and fetch workouts", () => {
  // declare variables needed later
  let token;
  let workoutId;

  // create, login user, and store token
  beforeAll(async () => {
    const result = await createTestUserAndToken();
    token = result.token;
  });

  it("creates a workout", async () => {
    const response = await request(app)
      .post("/workouts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Flow Test Workout",
        date: "2026-07-14",
        exercises: [
          {
            exerciseId: 1,
            sets: [
              {
                reps: 10,
                weight: 50,
                weightUnit: "kg",
              },
            ],
          },
        ],
      });

    expect(response.status).toBe(201);
    expect(response.body.error).toBe(false);

    workoutId = response.body.data.id;
  });

  // test fetching the workout
  it("fetches workouts and includes the created workout", async () => {
    const response = await request(app)
      .get("/workouts")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    const workout = response.body.data.find((item) => item.id === workoutId);
    expect(workout).toBeDefined();
    expect(workout.name).toBe("Flow Test Workout");
  });
});

// deletes all test users, to minimise storage waste
afterAll(async () => {
  const testUsers = await prisma.user.findMany({
    where: {
      email: {
        startsWith: "test-",
      },
    },
    select: {
      id: true,
    },
  });

  const testUserIds = testUsers.map((user) => user.id);

  await prisma.workout.deleteMany({
    where: {
      userId: {
        in: testUserIds,
      },
    },
  });

  await prisma.user.deleteMany({
    where: {
      id: {
        in: testUserIds,
      },
    },
  });

  await prisma.$disconnect();
});
