const { PrismaClient } = require("@prisma/client");

// create prisma client
const prisma = new PrismaClient();

// Seeding file to populate database with initial data that doesnt rely on users
async function main() {
  console.log("Starting database seeding.");

  // Define default exercises
  const defaultExercises = [
    { name: "Bench Press", category: "chest" },
    { name: "Incline Dumbbell Press", category: "chest" },
    { name: "Squat", category: "legs" },
    { name: "Romanian Deadlift", category: "legs" },
    { name: "Deadlift", category: "back" },
    { name: "Pull Ups", category: "back" },
    { name: "Overhead Press", category: "shoulders" },
    { name: "Treadmill Run", category: "cardio" },
    { name: "Lat Pulldown", category: "back" },
    { name: "Cable Chest Fly", category: "chest" },
    { name: "Stair Master", category: "cardio" },
    { name: "Cable Bicep Curl", category: "biceps" },
    { name: "Tricep Pushdown", category: "triceps" },
  ];

  // loop through these exercises and insert them into the database
  console.log("Inserting exercises.");

  for (const exercise of defaultExercises) {
    await prisma.exercise.upsert({
      // use upsert instead of create to avoid duplicates if seeding is ran multiple times

      where: { name: exercise.name },
      update: {}, // dont update if exercise already exists
      create: {
        name: exercise.name,
        category: exercise.category,
        userId: null,
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
