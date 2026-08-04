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
    expect(workout.workoutExercises[0].exerciseId).toBe(1);
    expect(workout.notes).toBe(null);
    expect(workout.totalExercises).toBe(1);
    expect(workout.totalSets).toBe(1);
  });

  // test updating a small part of the workout
  it("updates pre-existing workout", async () => {
    const response = await request(app)
      .put(`/workouts/${workoutId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Flow Test Workout (updated)",
        notes: "Added notes to the workout",
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

    const workout = response.body.data;
    expect(workout.id).toBe(workoutId);
    expect(response.status).toBe(200);
    expect(response.body.error).toBe(false);
    expect(workout.notes).toBe("Added notes to the workout");
    expect(workout.name).toBe("Flow Test Workout (updated)");
    expect(workout.workoutExercises[0].exerciseId).toBe(1); // exercises should stay the same
  });

  it("rejects deletion of workout that doesn't exist or belong to the user", async () => {
    const response = await request(app)
      .delete("/workouts/999999")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(404);
    expect(response.body.error).toBe(true);
    expect(response.body.message).toBe("Workout does not exist");
  });

  it("successfully deletes a workout", async () => {
    const response = await request(app)
      .delete(`/workouts/${workoutId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.error).toBe(false);
    expect(response.body.message).toBe("Workout deleted successfully");

    // fetch workouts to check deletion was successful
    const workoutList = await request(app)
      .get("/workouts")
      .set("Authorization", `Bearer ${token}`);

    expect(workoutList.status).toBe(200);
    const workout = workoutList.body.data.find((item) => item.id === workoutId);
    expect(workout).toBeUndefined();
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
