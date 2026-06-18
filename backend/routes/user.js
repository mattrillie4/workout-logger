// Imports, router setup and client setup
const express = require("express");
const jwt = require("jsonwebtoken");
const argon2 = require("argon2");
const { PrismaClient } = require("@prisma/client");
const authorisation = require("../middleware/authorisation");

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

// POST request, /user/register
// Registers a new user to the application given a valid (unique) email and password
router.post("/register", async (req, res) => {
  //extract email and password from input
  const { email, password } = req.body ?? {};

  // Input validation (both email and password are present)
  if (!email || !password) {
    return res.status(400).json({
      error: true,
      message: "Request body incomplete, both email and password required",
    });
  }
  if (password.length < 8) {
    return res.status(400).json({
      error: true,
      message: "Password must be at least 8 characters long",
    });
  }

  try {
    // query database for matching user
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });
    if (existingUser) {
      return res.status(409).json({
        error: true,
        message: "User already exists", // return conflict error accordingly
      });
    }
    // hash the input password with argon2
    const hash = await argon2.hash(password, {
      type: argon2.argon2id, // specifically use argon2id, for better security
    });

    //create user
    await prisma.user.create({
      data: {
        email: email,
        hash: hash,
      },
    });
    //return success code
    res.status(201).json({ error: false, message: "User created" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

// POST request, /user/login
// Validates a users login attempt, compares hash input password with hash in the database
// Issues JWT if authenticated correctly
router.post("/login", async (req, res) => {
  //extract email and password from input
  const { email, password } = req.body ?? {};
  // validate request body
  if (!email || !password) {
    return res.status(400).json({
      error: true,
      message: "Request body incomplete, both email and password required",
    });
  }
  try {
    // Find user by the email
    const user = await prisma.user.findUnique({
      where: { email: email },
    });
    // Handle errors for incorrect password or non-existing user
    if (!user || !(await argon2.verify(user.hash, password))) {
      return res.status(401).json({
        error: true,
        message: "Incorrect email or password",
      });
    }
    // Now that input is validated, issue JWT (24hr life)
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "24h",
      algorithm: "HS256",
    });
    // return success code and token
    res.status(200).json({
      token: token,
      token_type: "Bearer",
      expires_in: 86400, // 24 hours
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
});

// GET request, /user/me
// Checks if JWT is valid, returns logged in user info
// Useful for testing and user persistence
router.get("/me", authorisation, async (req, res) => {
  const userId = req.user.userId;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });
    // if user doesnt exist, return error
    if (!user) {
      return res.status(404).json({
        error: true,
        message: "User not found",
      });
    }
    //else, return success and user
    res.status(200).json({
      error: false,
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

// GET request, /user/profile
// Retrieves the profile information for a given user
router.get("/profile", authorisation, async (req, res) => {
  const userId = req.user.userId;
  try {
    const profileInfo = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        height_cm: true,
        weight_kg: true,
        date_of_birth: true,
        gender: true,
      },
    });
    //if user doesnt exist for some reason, return error
    if (!profileInfo) {
      return res.status(404).json({
        error: true,
        message: "User not found",
      });
    }
    // return success and data
    res.status(200).json({
      error: false,
      data: profileInfo,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

// POST request, /user/profile
// Updates the user database with provided profile information, inline with the get request
router.post("/profile", authorisation, async (req, res) => {
  //extract user id and profile info
  const userId = req.user.userId;
  const { date_of_birth, weight_kg, height_cm, gender } = req.body ?? {};
  const parsedHeight =
    height_cm === undefined
      ? undefined
      : height_cm === null || height_cm === ""
        ? null
        : parseFloat(height_cm);
  const parsedWeight =
    weight_kg === undefined
      ? undefined
      : weight_kg === null || weight_kg === ""
        ? null
        : parseFloat(weight_kg);
  const parsedGender =
    gender === undefined
      ? undefined
      : gender
        ? gender.trim().toLowerCase()
        : null;
  const parsedDateOfBirth =
    date_of_birth === undefined
      ? undefined
      : date_of_birth
        ? new Date(date_of_birth)
        : null;

  // input validation
  if (
    parsedHeight !== undefined &&
    parsedHeight !== null &&
    (Number.isNaN(parsedHeight) || parsedHeight < 50 || parsedHeight > 300)
  ) {
    return res.status(400).json({
      error: true,
      message: "Height must be a number between 50 and 300 cm",
    });
  }

  if (
    parsedWeight !== undefined &&
    parsedWeight !== null &&
    (Number.isNaN(parsedWeight) || parsedWeight < 20 || parsedWeight > 500)
  ) {
    return res.status(400).json({
      error: true,
      message: "Weight must be a number between 20 and 500 kg",
    });
  }

  if (parsedDateOfBirth !== undefined && parsedDateOfBirth !== null) {
    if (isNaN(parsedDateOfBirth.getTime())) {
      return res
        .status(400)
        .json({ error: true, message: "Date of birth must be a valid date" });
    }
    const today = new Date();
    let age = today.getFullYear() - parsedDateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - parsedDateOfBirth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < parsedDateOfBirth.getDate())
    ) {
      age--;
    }
    if (age < 13 || age > 120) {
      return res
        .status(400)
        .json({ error: true, message: "Age must be between 13 and 120" });
    }
  }

  if (
    parsedGender !== undefined &&
    parsedGender !== null &&
    !["male", "female", "other"].includes(parsedGender)
  ) {
    return res
      .status(400)
      .json({ error: true, message: "Invalid value for gender" });
  }
  try {
    const updatedProfile = await prisma.user.update({
      where: { id: userId },
      data: {
        date_of_birth: parsedDateOfBirth,
        weight_kg: parsedWeight,
        height_cm: parsedHeight,
        gender: parsedGender,
      },
      select: {
        height_cm: true,
        weight_kg: true,
        date_of_birth: true,
        gender: true,
      },
    });
    //return success
    res.status(200).json({
      error: false,
      message: "Profile updated successfully",
      data: updatedProfile,
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
