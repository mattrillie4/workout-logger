require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

// Create all available routes
const exerciseRouter = require("./routes/exercises");
const workoutRouter = require("./routes/workouts");
const userRouter = require("./routes/user");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// attach routers to routes
app.use("/exercises", exerciseRouter);
app.use("/workouts", workoutRouter);
app.use("/user", userRouter);

app.get("/", (req, res) => {
  res.json({ message: "Workout Logger API", docs: "coming soon" });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
