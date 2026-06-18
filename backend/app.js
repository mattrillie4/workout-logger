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

const allowedOrigins = (
  process.env.CLIENT_URL || "http://localhost:5173,http://localhost:5174"
)
  .split(",")
  .map((origin) => origin.trim());

// cors configuration for frontend connection
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

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
