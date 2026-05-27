const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const authorisation = require("../middleware/authorisation");

const prisma = new PrismaClient();

// POST request, "/workouts", allows an authorised user to create a workout
router.post("/", authorisation, async (req, res) => {
  const { name, date, notes, cardioDuration, exercises } = req.body ?? {};
  const userId = req.user.userId;

  // Detailed error handling, ensures workouts are given in the correct format
  if (!name || typeof name !== "string") {
    return res.status(400).json({
      error: true,
      message: "Workout name is required",
    });
  }

  if (!Array.isArray(exercises) || exercises.length === 0) {
    return res.status(400).json({
      error: true,
      message: "At least one exercise is required",
    });
  }

  for (const exercise of exercises) {
    if (
      !exercise.exerciseId ||
      !Array.isArray(exercise.sets) ||
      exercise.sets.length === 0
    ) {
      return res.status(400).json({
        error: true,
        message: "Each exercise must have an exerciseId and at least one set",
      });
    }

    for (const set of exercise.sets) {
      if (set.reps === undefined || set.weight === undefined) {
        return res.status(400).json({
          error: true,
          message: "Each set must have reps and weight",
        });
      }
    }
  }

  try {
    const result = await prisma.workout.create({
      // create initial workout entry (including user specific id)
      data: {
        name: name,
        userId: userId,
        date: date ? new Date(date) : new Date(),
        notes: notes || null,
        cardioDuration: cardioDuration ? parseInt(cardioDuration) : null,

        // nested relational
        workoutExercises: {
          create: exercises.map((ex, exerciseIndex) => ({
            exerciseId: parseInt(ex.exerciseId),
            order: exerciseIndex + 1,
            sets: {
              // map through sets and log the reps and weight
              create: ex.sets.map((set, setIndex) => ({
                reps: parseInt(set.reps),
                weight: parseFloat(set.weight),
                order: setIndex + 1,
              })),
            },
          })),
        },
      },
      include: {
        workoutExercises: {
          include: {
            sets: true,
          },
        },
      },
    });
    // return the created workout on success
    res.status(201).json({
      error: false,
      data: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

// GET request, "/workouts", allows a user to retrieve a list of their created workouts
router.get("/", authorisation, async (req, res) => {
  const userId = req.user.userId;
  try {
    // query database for all workouts by user, ordering by most recent, and including the exercises and sets
    const workouts = await prisma.workout.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        date: "desc",
      },
      include: {
        workoutExercises: {
          orderBy: {
            order: "asc",
          },
          include: {
            exercise: true,
            sets: {
              orderBy: {
                order: "asc",
              },
            },
          },
        },
      },
    });
    res.status(200).json({
      error: false,
      data: workouts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

// GET request, "/workouts/:id", returns the detailed information about a single workout given its id
// searches from a specific user
router.get("/:id", authorisation, async (req, res) => {
  const userId = req.user.userId;
  const workoutId = parseInt(req.params.id);

  // input validation for the id
  if (Number.isNaN(workoutId) || workoutId < 1) {
    return res.status(400).json({
      error: true,
      message: "Invalid workout id",
    });
  }
  try {
    const workout = await prisma.workout.findFirst({
      where: {
        id: workoutId,
        userId: userId,
      },
      include: {
        workoutExercises: {
          orderBy: {
            order: "asc",
          },
          include: {
            exercise: true,
            sets: {
              orderBy: {
                order: "asc",
              },
            },
          },
        },
      },
    });
    // handle error if no workout exists
    if (!workout) {
      return res.status(404).json({
        error: true,
        message: "Workout not found",
      });
    }
    // if it does exist, return success status and data object
    res.status(200).json({
      error: false,
      data: workout,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

//export router
module.exports = router;
