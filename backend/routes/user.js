// Imports, router setup and client setup
const express = require("express");
const jwt = require("jsonwebtoken");
const argon2 = require("argon2");
const { PrismaClient } = require("@prisma/client");

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
        message: "Incorrect email or password ",
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
module.exports = router;
