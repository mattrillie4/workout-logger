const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const authorisation = require("../middleware/authorisation");

// set limits for workouts
const MAX_EXERCISES_PER_WORKOUT = 20;
const MAX_SETS_PER_EXERCISE = 20;

// general function to validate the workout body in the request
// used in PUT and POST requests, avoids refactoring
const validateWorkoutBody = ({
  name,
  exercises,
  cardioDuration,
  notes,
  date,
}) => {
  // validate name
  if (!name || typeof name !== "string" || name.trim() === "") {
    return "Workout name is required";
  }
  // validate notes
  if (notes !== undefined && notes !== null && typeof notes !== "string") {
    return "Notes must be a string";
  }
  // date validation
  if (date !== undefined && date !== null && date !== "") {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Invalid date";
    }
  }
  // cardio duration validation
  if (
    cardioDuration !== undefined &&
    cardioDuration !== null &&
    cardioDuration !== ""
  ) {
    const parsedCardioDuration = parseInt(cardioDuration);

    if (Number.isNaN(parsedCardioDuration) || parsedCardioDuration < 0) {
      return "Cardio duration must be a valid positive number";
    }
  }
  // loop through exercises and validate amounts and that each one has sets and reps
  if (!Array.isArray(exercises) || exercises.length === 0) {
    return "At least one exercise is required";
  }

  if (exercises.length > MAX_EXERCISES_PER_WORKOUT) {
    return `A workout cannot contain more than ${MAX_EXERCISES_PER_WORKOUT} exercises`;
  }

  for (const exercise of exercises) {
    const exerciseId = parseInt(exercise.exerciseId);

    if (
      Number.isNaN(exerciseId) ||
      exerciseId < 1 ||
      !Array.isArray(exercise.sets) ||
      exercise.sets.length === 0
    ) {
      return "Each exercise must have a valid exerciseId and at least one set";
    }

    if (exercise.sets.length > MAX_SETS_PER_EXERCISE) {
      return `An exercise cannot contain more than ${MAX_SETS_PER_EXERCISE} sets`;
    }

    for (const set of exercise.sets) {
      const reps = parseInt(set.reps);
      const weight = parseFloat(set.weight);

      if (
        Number.isNaN(reps) ||
        Number.isNaN(weight) ||
        reps < 1 ||
        weight < 0
      ) {
        return "Each set must have valid reps and weight";
      }
    }
  }

  return null;
};

const prisma = new PrismaClient();

// POST request, "/workouts", allows an authorised user to create a workout
router.post("/", authorisation, async (req, res) => {
  const { name, date, notes, cardioDuration, exercises } = req.body ?? {};
  const userId = req.user.userId;

  // call validation function
  const validationError = validateWorkoutBody({ name, exercises });
  // if it contains error, return
  if (validationError) {
    return res.status(400).json({
      error: true,
      message: validationError,
    });
  }

  try {
    const result = await prisma.workout.create({
      // create initial workout entry (including user specific id)
      data: {
        name: name.trim(),
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
// optional query params: exerciseId, category, search, from, to, sort
router.get("/", authorisation, async (req, res) => {
  const userId = req.user.userId;
  // accepted query params
  const { search, exerciseId, category, from, to, sort } = req.query;

  // build database query
  const where = {
    userId: userId,
    AND: [],
  };
  // INPUT VALIDATION
  //
  if (search !== undefined && search.trim() !== "") {
    const trimmedSearch = search.trim();
    // push onto existing array of filters
    // search criteria will apply to relevant data (name, notes and exercises)
    where.AND.push({
      OR: [
        {
          name: {
            contains: trimmedSearch,
            mode: "insensitive",
          },
        },
        {
          notes: {
            contains: trimmedSearch,
            mode: "insensitive",
          },
        },
        {
          workoutExercises: {
            some: {
              exercise: {
                name: {
                  contains: trimmedSearch,
                  mode: "insensitive",
                },
              },
            },
          },
        },
      ],
    });
  }
  if (exerciseId !== undefined) {
    // If exerciseId is provided, it takes priority over category because it is more specific.
    const parsedExerciseId = parseInt(exerciseId);

    if (Number.isNaN(parsedExerciseId) || parsedExerciseId < 1) {
      return res.status(400).json({
        error: true,
        message: "Invalid exercise id",
      });
    }

    where.AND.push({
      workoutExercises: {
        some: {
          exerciseId: parsedExerciseId,
        },
      },
    });
  }
  if (category !== undefined && category.trim() !== "") {
    where.AND.push({
      workoutExercises: {
        some: {
          exercise: {
            category: category.trim().toLowerCase(),
          },
        },
      },
    });
  }
  // from and to validation, filters between dates
  if (from !== undefined && from.trim() !== "") {
    //format from date properly
    const fromDate = new Date(from);
    // validate
    if (Number.isNaN(fromDate.getTime())) {
      return res.status(400).json({
        error: true,
        message: "Invalid from date",
      });
    }
    where.AND.push({
      date: {
        gte: fromDate,
      },
    });
  }
  if (to !== undefined && to.trim() !== "") {
    // format to date properly
    const toDate = new Date(to);
    //validate
    if (Number.isNaN(toDate.getTime())) {
      return res.status(400).json({
        error: true,
        message: "Invalid to date",
      });
    }
    where.AND.push({
      date: {
        lte: toDate,
      },
    });
  }
  // if no params supplied, delete AND structure
  if (where.AND.length === 0) {
    delete where.AND;
  }
  // sort validation
  let orderBy = {
    date: "desc", // default ordering
  };
  // if sort provided, change orderBy accordingly
  if (sort == "date_asc") {
    orderBy = { date: "asc" };
  } else if (sort == "name_asc") {
    orderBy = { name: "asc" };
  } else if (sort == "name_desc") {
    orderBy = { name: "desc" };
  }

  try {
    // query database for all workouts by user, ordering by most recent, and including the exercises and sets
    const workouts = await prisma.workout.findMany({
      where: where,
      orderBy,
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
        message: "Workout does not exist",
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

// DELETE request, "/workouts/:id", allows an authorised user to delete a specific workout given its id
// will be used on the frontend to allow deletion of workouts
router.delete("/:id", authorisation, async (req, res) => {
  const userId = req.user.userId;
  const workoutId = parseInt(req.params.id);

  // input validation for id
  if (Number.isNaN(workoutId) || workoutId < 1) {
    return res.status(400).json({
      error: true,
      message: "Invalid workout id",
    });
  }
  try {
    // first query database for specific workout belonging to user
    const workout = await prisma.workout.findFirst({
      where: {
        id: workoutId,
        userId,
      },
    });
    // return error if it doesnt exist
    if (!workout) {
      return res.status(404).json({
        error: true,
        message: "Workout does not exist",
      });
    }
    // if it does, delete
    await prisma.workout.delete({
      where: {
        id: workoutId,
      },
    });
    res.status(200).json({
      error: false,
      message: "Workout deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

// PUT request, "/workouts/:id", allows an authorised user to update an already existing workout
router.put("/:id", authorisation, async (req, res) => {
  const userId = req.user.userId;
  const workoutId = parseInt(req.params.id);

  const { name, date, notes, cardioDuration, exercises } = req.body ?? {};

  // call validation function
  const validationError = validateWorkoutBody({ name, exercises });
  // if it contains error, return
  if (validationError) {
    return res.status(400).json({
      error: true,
      message: validationError,
    });
  }

  try {
    // Check workout exists and belongs to this user
    const workout = await prisma.workout.findFirst({
      where: {
        id: workoutId,
        userId: userId,
      },
    });

    if (!workout) {
      return res.status(404).json({
        error: true,
        message: "Workout does not exist",
      });
    }

    const updatedWorkout = await prisma.$transaction(async (tx) => {
      // delete old exercises attached to this workout to be replaced
      // due to cascade delete, the sets attached to these workoutExercises will also delete
      await tx.workoutExercise.deleteMany({
        where: {
          workoutId: workoutId,
        },
      });

      // update workout and recreate nested exercises/sets
      const result = await tx.workout.update({
        where: {
          id: workoutId,
        },
        data: {
          name: name.trim(),
          date: date ? new Date(date) : workout.date,
          notes: notes || null,
          cardioDuration: cardioDuration ? parseInt(cardioDuration) : null,

          workoutExercises: {
            create: exercises.map((ex, exerciseIndex) => ({
              exerciseId: parseInt(ex.exerciseId),
              order: exerciseIndex + 1,
              sets: {
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
              exercise: true,
              sets: true,
            },
          },
        },
      });

      return result;
    });

    res.status(200).json({
      error: false,
      data: updatedWorkout,
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
