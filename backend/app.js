require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

// Create all available routes
const exerciseRouter = require("./routes/exercises");
const workoutRouter = require("./routes/workouts");
const userRouter = require("./routes/user");
const progressRouter = require("./routes/progress");
const app = express();
const port = process.env.PORT || 3000;

// setup rate limits
// general limit
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: true,
    message: "Too many requests, please try later",
  },
});
app.use(generalLimiter); // every IP can only make 100 requests every 15 mintue, broadly protects every endpoint

// separate limiter for authentication requests (login and register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: true,
    message: "Too many authentication attempts, please try again later",
  },
});
// apply to both auth routes, this time only 10 requests per 15 min
app.use("/user/login", authLimiter);
app.use("/user/register", authLimiter);

// cors configuration for frontend connection
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"], // allow local Vite dev ports
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(morgan("dev"));
app.use(express.json());

// attach routers to routes
app.use("/exercises", exerciseRouter);
app.use("/workouts", workoutRouter);
app.use("/user", userRouter);
app.use("/progress", progressRouter);

app.get("/", (req, res) => {
  res.json({ message: "Workout Logger API", docs: "coming soon" });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
