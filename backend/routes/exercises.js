const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");

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
module.exports = router;
