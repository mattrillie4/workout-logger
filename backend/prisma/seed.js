const { PrismaClient } = require("@prisma/client");

// create prisma client
const prisma = new PrismaClient();

// Seeding file to populate database with initial data that doesnt rely on users
async function main() {
  console.log("Starting database seeding.");

  // Define default exercises
  const defaultExercises = [
    // Chest
    { name: "Bench Press", category: "chest" },
    { name: "Incline Dumbbell Press", category: "chest" },
    { name: "Dumbbell Bench Press", category: "chest" },
    { name: "Incline Bench Press", category: "chest" },
    { name: "Machine Chest Press", category: "chest" },
    { name: "Cable Chest Fly", category: "chest" },
    { name: "Pec Deck", category: "chest" },
    { name: "Chest Dip Machine", category: "chest" },

    // Back
    { name: "Deadlift", category: "back" },
    { name: "Lat Pulldown", category: "back" },
    { name: "Barbell Row", category: "back" },
    { name: "Dumbbell Row", category: "back" },
    { name: "Seated Cable Row", category: "back" },
    { name: "T-Bar Row", category: "back" },
    { name: "Machine Row", category: "back" },
    { name: "Face Pull", category: "back" },
    { name: "Straight Arm Pulldown", category: "back" },

    // Legs
    { name: "Squat", category: "legs" },
    { name: "Front Squat", category: "legs" },
    { name: "Leg Press", category: "legs" },
    { name: "Romanian Deadlift", category: "legs" },
    { name: "Leg Extension", category: "legs" },
    { name: "Seated Hamstring Curl", category: "legs" },
    { name: "Lying Hamstring Curl", category: "legs" },
    { name: "Calf Raise", category: "legs" },
    { name: "Hip Thrust", category: "legs" },
    { name: "Hack Squat", category: "legs" },

    // Shoulders
    { name: "Overhead Press", category: "shoulders" },
    { name: "Seated Dumbbell Shoulder Press", category: "shoulders" },
    { name: "Machine Shoulder Press", category: "shoulders" },
    { name: "Lateral Raise", category: "shoulders" },
    { name: "Cable Lateral Raise", category: "shoulders" },
    { name: "Rear Delt Fly", category: "shoulders" },
    { name: "Arnold Press", category: "shoulders" },
    { name: "Upright Row", category: "shoulders" },
    { name: "Shrug", category: "shoulders" },

    // Arms
    { name: "Barbell Curl", category: "arms" },
    { name: "Dumbbell Curl", category: "arms" },
    { name: "Hammer Curl", category: "arms" },
    { name: "Preacher Curl", category: "arms" },
    { name: "Cable Bicep Curl", category: "arms" },
    { name: "Tricep Pushdown", category: "arms" },
    { name: "Overhead Tricep Extension", category: "arms" },
    { name: "Skull Crusher", category: "arms" },
    { name: "Close Grip Bench Press", category: "arms" },

    // Core
    { name: "Cable Crunch", category: "core" },
    { name: "Machine Crunch", category: "core" },
    { name: "Weighted Sit Up", category: "core" },
    { name: "Weighted Russian Twist", category: "core" },

    // Full body
    { name: "Clean", category: "full body" },
    { name: "Clean and Press", category: "full body" },
    { name: "Thruster", category: "full body" },
    { name: "Landmine Press", category: "full body" },
  ];

  const archivedDefaultExercises = [
    "Pull Ups",
    "Treadmill Run",
    "Stair Master",
  ];

  // loop through these exercises and insert them into the database
  console.log("Inserting exercises.");

  for (const exercise of defaultExercises) {
    const existingExercise = await prisma.exercise.findFirst({
      where: {
        name: exercise.name,
        userId: null,
      },
    });

    if (existingExercise) {
      await prisma.exercise.update({
        where: {
          id: existingExercise.id,
        },
        data: {
          category: exercise.category,
          isArchived: false,
        },
      });
    } else {
      await prisma.exercise.create({
        data: {
          name: exercise.name,
          category: exercise.category,
          userId: null,
          isArchived: false,
        },
      });
    }
  }

  console.log("Archiving default exercises that do not fit weighted sets.");

  for (const exerciseName of archivedDefaultExercises) {
    await prisma.exercise.updateMany({
      where: {
        name: exerciseName,
        userId: null,
      },
      data: {
        isArchived: true,
      },
    });
  }

  console.log("Seeding finished successfully!");
}

main()
  .catch((error) => {
    console.error("Seeding error.", error);
    process.exit(1);
  })
  .finally(async () => {
    // disconnect when done with the database
    await prisma.$disconnect();
  });
