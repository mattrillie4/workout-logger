const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const authorisation = require("../middleware/authorisation");

const prisma = new PrismaClient();

// GET request, /exercises
// Returns all the global default exercises
router.get("/", async (req, res) => {
  try {
    const globalExercises = await prisma.exercise.findMany({
      where: {
        userId: null,
      },
    });
    res.status(200).json({
      error: false,
      data: globalExercises,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      message: "Database error",
    });
  }
});

// GET request, /exercises/me
/* The protected version of GET exercises, returns all the exercises global exerises
AND the custom exercises created by a user. Avoids the need for complicated optional auth logic
in GET exercises */
router.get("/me", authorisation, async (req, res) => {
  const userId = req.user.userId; // extract user id

  try {
    // query database
    const exercises = await prisma.exercise.findMany({
      where: {
        OR: [{ userId: null }, { userId: userId }],
      },
      orderBy: {
        name: "asc",
      },
    });
    // return success
    res.status(200).json({
      error: false,
      data: exercises,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

// GET request, /exercises/:category
// Return all the globale exercises in a specific category (chest, legs, etc.)
router.get("/:category", async (req, res) => {
  //extract the category from the request
  const exerciseCategory = req.params.category;

  try {
    // query the exercise table
    const results = await prisma.exercise.findMany({
      where: { category: exerciseCategory },
    });
    //return success
    res.status(200).json({
      error: false,
      data: results,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      message: "Database error",
    });
  }
});

// POST request, /exercises
// Allows a user to create an exercise of their own, so they arent limited to exercises seeded in the database
router.post("/", authorisation, async (req, res) => {
  // list of allowed categories
  const allowedCategories = [
    "chest",
    "back",
    "legs",
    "shoulders",
    "arms",
    "core",
    "cardio",
    "full Body",
    "other",
  ];

  const userId = req.user.userId;
  const { name, category } = req.body ?? {};

  // error handling for name
  if (!name || typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({
      error: true,
      message: "Exercise name is required",
    });
  }
  if (!category || typeof category !== "string" || category.trim() === "") {
    return res.status(400).json({
      error: true,
      message: "Exercise category is required",
    });
  }
  // format to check against list
  const formattedCategory = category.trim().toLowerCase();
  if (!allowedCategories.includes(formattedCategory)) {
    return res.status(400).json({
      error: true,
      message: "Invalid exercise category",
    });
  }
  try {
    // check if the exercise already exists in the database (seeded or custom)
    const existingExercise = await prisma.exercise.findFirst({
      where: {
        name: name.trim(),
        OR: [{ userId: null }, { userId: userId }],
      },
    });
    // if it exists, return error
    if (existingExercise) {
      return res.status(409).json({
        error: true,
        message: "Exercise already exists",
      });
    }

    // else, insert new exercise, including userId to make it unique
    const customExercise = await prisma.exercise.create({
      data: {
        name: name.trim(),
        category: formattedCategory,
        userId: userId,
      },
    });
    // return success
    res.status(201).json({
      error: false,
      data: customExercise,
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
