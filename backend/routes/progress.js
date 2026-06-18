const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const authorisation = require("../middleware/authorisation");

const prisma = new PrismaClient();

// GET request, returns overarching summary information about a users workout history
// Things like total workouts, workouts this week, sets, etc.
router.get("/summary", authorisation, async (req, res) => {
  const userId = req.user.userId;

  try {
    // return total workouts that the user has logged
    const totalWorkouts = await prisma.workout.count({
      where: {
        userId: userId,
      },
    });

    //calculate date a week ago
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    //return workouts logged in the last 7 days (not calendar week)
    const workoutsLastSevenDays = await prisma.workout.count({
      where: {
        userId: userId,
        date: {
          gte: oneWeekAgo,
        },
      },
    });

    const totalSets = await prisma.set.count({
      where: {
        workoutExercise: {
          workout: {
            userId: userId,
          },
        },
      },
    });

    const cardioSum = await prisma.workout.aggregate({
      _sum: {
        cardioDuration: true,
      },
      where: {
        userId: userId,
      },
    });
    const totalCardioMinutes = cardioSum._sum.cardioDuration || 0; //extract just one value

    //calculate total volume, by multiplying reps * weight, across all sets for a user
    const sets = await prisma.set.findMany({
      where: {
        workoutExercise: {
          workout: {
            userId: userId, // select only sets from user, climb up relations
          },
        },
      },
      select: {
        reps: true,
        weight: true,
      },
    });
    // sum all entries
    const totalVolume = sets.reduce((sum, set) => {
      return sum + set.reps * set.weight;
    }, 0);

    // find most trained category
    const workoutExercises = await prisma.workoutExercise.findMany({
      where: {
        workout: {
          userId,
        },
      },
      select: {
        exercise: {
          select: {
            category: true,
          },
        },
      },
    });
    // return object with counts for each category
    const categoryCounts = workoutExercises.reduce(
      (counts, workoutExercise) => {
        const category = workoutExercise.exercise.category;
        counts[category] = (counts[category] || 0) + 1;
        return counts;
      },
      {},
    );
    // convert into arrays, and sort by most trained (highest count)
    const mostTrainedCategory =
      Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ??
      null;

    // return success and data
    res.status(200).json({
      error: false,
      data: {
        totalWorkouts,
        workoutsLastSevenDays,
        totalSets,
        totalCardioMinutes,
        totalVolume,
        mostTrainedCategory,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

// GET request, returns progress information for a specific exercise, which is given as a path param
router.get("/exercises/:id", authorisation, async (req, res) => {
  // extract params and user id
  const userId = req.user.userId;
  const exerciseId = parseInt(req.params.id);
  //validate exerciseId
  if (Number.isNaN(exerciseId) || exerciseId < 1) {
    return res.status(400).json({
      error: true,
      message: "Invalid exercise id",
    });
  }

  try {
    const exercise = await prisma.exercise.findFirst({
      where: {
        id: exerciseId,
        OR: [{ userId: null }, { userId: userId }], // only allow global, and exercises owned by user
      },
      select: {
        id: true,
        name: true,
        category: true,
      },
    });
    if (!exercise) {
      return res.status(404).json({
        error: true,
        message: "Exercise does not exist",
      });
    }

    const bestWeight = await prisma.set.findFirst({
      where: {
        workoutExercise: {
          exerciseId: exerciseId,
          workout: {
            userId: userId,
          },
        },
      },
      orderBy: {
        weight: "desc",
      },
      select: {
        weight: true,
        reps: true,
        workoutExercise: {
          select: {
            workout: {
              select: { id: true, name: true, date: true },
            },
          },
        },
      },
    });
    res.status(200).json({
      error: false,
      data: {
        exercise,
        bestWeight,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

module.exports = router;
