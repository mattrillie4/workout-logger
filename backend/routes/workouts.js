const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const authorisation = require("../middleware/authorisation");

const prisma = new PrismaClient();

router.post("/", authorisation, async (req, res) => {
  const { name, date, notes, cardioDuration, exercises } = req.body ?? {};
  const userId = req.user.userId;

  if (!name || !exercises) {
    return res.status(400).json({
      error: true,
      message: "Request body incomplete, name and exercises required",
    });
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
    res.status(201).json(result);
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
