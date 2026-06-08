import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import SaveIcon from "@mui/icons-material/Save";
import api from "../api/axiosConfig";
import { useAuth } from "../context/useAuth";

const blankSet = () => ({
  reps: "",
  weight: "",
});

const blankWorkoutExercise = () => ({
  exerciseId: "",
  sets: [blankSet()],
});

const initialWorkout = () => ({
  name: "",
  date: new Date().toISOString().slice(0, 10),
  notes: "",
  cardioDuration: "",
  exercises: [blankWorkoutExercise()],
});

const Dashboard = () => {
  const { isLoggedIn } = useAuth();
  const [workout, setWorkout] = useState(initialWorkout);
  const [exerciseOptions, setExerciseOptions] = useState([]);
  const [isLoadingExercises, setIsLoadingExercises] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchExercises = async () => {
      setIsLoadingExercises(true);
      setError("");

      try {
        const response = await api.get(
          isLoggedIn ? "/exercises/me" : "/exercises",
        );
        setExerciseOptions(response.data.data || []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Could not load exercise options.",
        );
      } finally {
        setIsLoadingExercises(false);
      }
    };

    fetchExercises();
  }, [isLoggedIn]);
  //memoize exercises to avoid re-renders
  const exerciseMap = useMemo(() => {
    return exerciseOptions.reduce((map, exercise) => {
      map[exercise.id] = exercise;
      return map;
    }, {});
  }, [exerciseOptions]);

  const updateWorkoutField = (field, value) => {
    setWorkout((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateExercise = (exerciseIndex, field, value) => {
    setWorkout((current) => ({
      ...current,
      exercises: current.exercises.map((exercise, index) =>
        index === exerciseIndex ? { ...exercise, [field]: value } : exercise,
      ),
    }));
  };

  const updateSet = (exerciseIndex, setIndex, field, value) => {
    setWorkout((current) => ({
      ...current,
      exercises: current.exercises.map((exercise, index) => {
        if (index !== exerciseIndex) {
          return exercise;
        }

        return {
          ...exercise,
          sets: exercise.sets.map((set, currentSetIndex) =>
            currentSetIndex === setIndex ? { ...set, [field]: value } : set,
          ),
        };
      }),
    }));
  };

  const addExercise = () => {
    setWorkout((current) => ({
      ...current,
      exercises: [...current.exercises, blankWorkoutExercise()],
    }));
  };

  const removeExercise = (exerciseIndex) => {
    setWorkout((current) => ({
      ...current,
      exercises: current.exercises.filter(
        (_, index) => index !== exerciseIndex,
      ),
    }));
  };

  const addSet = (exerciseIndex) => {
    setWorkout((current) => ({
      ...current,
      exercises: current.exercises.map((exercise, index) =>
        index === exerciseIndex
          ? { ...exercise, sets: [...exercise.sets, blankSet()] }
          : exercise,
      ),
    }));
  };

  const removeSet = (exerciseIndex, setIndex) => {
    setWorkout((current) => ({
      ...current,
      exercises: current.exercises.map((exercise, index) => {
        if (index !== exerciseIndex) {
          return exercise;
        }

        return {
          ...exercise,
          sets: exercise.sets.filter(
            (_, currentSetIndex) => currentSetIndex !== setIndex,
          ),
        };
      }),
    }));
  };

  const validateWorkout = () => {
    if (!isLoggedIn) {
      return "Please log in before saving a workout.";
    }

    if (!workout.name.trim()) {
      return "Workout name is required.";
    }

    if (workout.exercises.length === 0) {
      return "Add at least one exercise.";
    }

    for (const exercise of workout.exercises) {
      if (!exercise.exerciseId) {
        return "Choose an exercise for every exercise block.";
      }

      if (exercise.sets.length === 0) {
        return "Every exercise needs at least one set.";
      }

      for (const set of exercise.sets) {
        const reps = Number(set.reps);
        const weight = Number(set.weight);

        if (!Number.isInteger(reps) || reps < 1) {
          return "Each set needs reps of at least 1.";
        }

        if (Number.isNaN(weight) || weight < 0) {
          return "Each set needs a weight of 0 or more.";
        }
      }
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validateWorkout();
    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = {
      name: workout.name.trim(),
      date: workout.date || undefined,
      notes: workout.notes.trim() || undefined,
      cardioDuration: workout.cardioDuration || undefined,
      exercises: workout.exercises.map((exercise) => ({
        exerciseId: exercise.exerciseId,
        sets: exercise.sets.map((set) => ({
          reps: set.reps,
          weight: set.weight,
        })),
      })),
    };

    setIsSubmitting(true);

    try {
      await api.post("/workouts", payload);
      setWorkout(initialWorkout());
      setSuccess("Workout saved successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save this workout.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      component="main"
      sx={{
        bgcolor: "#f6f8fa",
        minHeight: "calc(100vh - 64px)",
        px: { xs: 2, md: 4 },
        py: { xs: 3, md: 5 },
      }}
    >
      <Box sx={{ maxWidth: 1100, mx: "auto" }}>
        <Stack spacing={1} sx={{ mb: 3 }}>
          <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
            Log workout
          </Typography>
          <Typography color="text.secondary">
            Add exercises and sets as you train, then save the session.
          </Typography>
        </Stack>

        {!isLoggedIn && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            You can build the workout here, but you need to log in before
            saving.
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Paper
          component="form"
          onSubmit={handleSubmit}
          elevation={0}
          sx={{
            border: "1px solid #dde3ea",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                  md: "5fr 3fr 4fr",
                },
              }}
            >
              <Box>
                <TextField
                  fullWidth
                  required
                  label="Workout name"
                  value={workout.name}
                  onChange={(event) =>
                    updateWorkoutField("name", event.target.value)
                  }
                  placeholder="Push day"
                />
              </Box>
              <Box>
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  value={workout.date}
                  onChange={(event) =>
                    updateWorkoutField("date", event.target.value)
                  }
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Box>
              <Box>
                <TextField
                  fullWidth
                  label="Cardio duration"
                  type="number"
                  value={workout.cardioDuration}
                  onChange={(event) =>
                    updateWorkoutField("cardioDuration", event.target.value)
                  }
                  slotProps={{ htmlInput: { min: 0 } }}
                  helperText="Optional minutes"
                />
              </Box>
              <Box sx={{ gridColumn: "1 / -1" }}>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  label="Notes"
                  value={workout.notes}
                  onChange={(event) =>
                    updateWorkoutField("notes", event.target.value)
                  }
                  placeholder="Energy, form notes, soreness, anything useful."
                />
              </Box>
            </Box>
          </Box>

          <Divider />

          <Stack spacing={2} sx={{ p: { xs: 2, md: 3 } }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              alignItems={{ xs: "stretch", sm: "center" }}
              justifyContent="space-between"
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <FitnessCenterIcon color="primary" />
                <Typography
                  component="h2"
                  variant="h6"
                  sx={{ fontWeight: 700 }}
                >
                  Exercises
                </Typography>
              </Stack>
              <Button
                type="button"
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addExercise}
              >
                Add exercise
              </Button>
            </Stack>

            {isLoadingExercises ? (
              <Stack direction="row" spacing={1.5} alignItems="center">
                <CircularProgress size={22} />
                <Typography color="text.secondary">
                  Loading exercises
                </Typography>
              </Stack>
            ) : (
              workout.exercises.map((exercise, exerciseIndex) => {
                const selectedExercise = exerciseMap[exercise.exerciseId];

                return (
                  <Paper
                    key={exerciseIndex}
                    elevation={0}
                    sx={{
                      border: "1px solid #dde3ea",
                      borderRadius: 1,
                      p: { xs: 2, md: 2.5 },
                    }}
                  >
                    <Stack spacing={2}>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1.5}
                        alignItems={{ xs: "stretch", sm: "flex-start" }}
                      >
                        <FormControl fullWidth required>
                          <InputLabel id={`exercise-${exerciseIndex}-label`}>
                            Exercise
                          </InputLabel>
                          <Select
                            labelId={`exercise-${exerciseIndex}-label`}
                            label="Exercise"
                            value={exercise.exerciseId}
                            onChange={(event) =>
                              updateExercise(
                                exerciseIndex,
                                "exerciseId",
                                event.target.value,
                              )
                            }
                          >
                            {exerciseOptions.map((option) => (
                              <MenuItem key={option.id} value={option.id}>
                                {option.name}
                              </MenuItem>
                            ))}
                          </Select>
                          <FormHelperText>
                            {selectedExercise?.category ||
                              "Choose from your library"}
                          </FormHelperText>
                        </FormControl>
                        <IconButton
                          type="button"
                          aria-label="Remove exercise"
                          onClick={() => removeExercise(exerciseIndex)}
                          disabled={workout.exercises.length === 1}
                          sx={{ mt: { sm: 1 } }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>

                      <Stack spacing={1.5}>
                        {exercise.sets.map((set, setIndex) => (
                          <Box
                            key={setIndex}
                            sx={{
                              alignItems: "center",
                              display: "grid",
                              gap: 1.5,
                              gridTemplateColumns: {
                                xs: "1fr 1fr",
                                sm: "120px minmax(0, 1fr) minmax(0, 1fr) 56px",
                              },
                            }}
                          >
                            <Box
                              sx={{ gridColumn: { xs: "1 / -1", sm: "auto" } }}
                            >
                              <Typography color="text.secondary">
                                Set {setIndex + 1}
                              </Typography>
                            </Box>
                            <Box>
                              <TextField
                                fullWidth
                                required
                                label="Reps"
                                type="number"
                                value={set.reps}
                                onChange={(event) =>
                                  updateSet(
                                    exerciseIndex,
                                    setIndex,
                                    "reps",
                                    event.target.value,
                                  )
                                }
                                slotProps={{ htmlInput: { min: 1, step: 1 } }}
                              />
                            </Box>
                            <Box>
                              <TextField
                                fullWidth
                                required
                                label="Weight"
                                type="number"
                                value={set.weight}
                                onChange={(event) =>
                                  updateSet(
                                    exerciseIndex,
                                    setIndex,
                                    "weight",
                                    event.target.value,
                                  )
                                }
                                slotProps={{ htmlInput: { min: 0, step: 0.5 } }}
                              />
                            </Box>
                            <Box>
                              <IconButton
                                type="button"
                                aria-label="Remove set"
                                onClick={() =>
                                  removeSet(exerciseIndex, setIndex)
                                }
                                disabled={exercise.sets.length === 1}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </Box>
                        ))}
                      </Stack>

                      <Box>
                        <Button
                          type="button"
                          startIcon={<AddIcon />}
                          onClick={() => addSet(exerciseIndex)}
                        >
                          Add set
                        </Button>
                      </Box>
                    </Stack>
                  </Paper>
                );
              })
            )}
          </Stack>

          <Divider />

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            justifyContent="flex-end"
            sx={{ p: { xs: 2, md: 3 } }}
          >
            <Button
              type="button"
              variant="text"
              onClick={() => {
                setWorkout(initialWorkout());
                setError("");
                setSuccess("");
              }}
            >
              Reset
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={isSubmitting || isLoadingExercises}
            >
              {isSubmitting ? "Saving" : "Save workout"}
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;
