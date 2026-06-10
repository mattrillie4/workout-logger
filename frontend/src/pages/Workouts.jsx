import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import api from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";

// helper functions
const formatWorkoutDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString(); //format date if provided
};

const handleDeleteWorkout = () => {
  return;
};

const Workouts = () => {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWorkouts = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await api.get("/workouts");
        setWorkouts(response.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load workouts.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkouts();
  }, []);
  // delete workout function for delete button
  const handleDeleteWorkout = async (workoutId) => {
    const confirmed = window.confirm("Delete this workout?");

    if (!confirmed) {
      return;
    }
    // pass given workout id to api delete endpoint
    try {
      await api.delete(`/workouts/${workoutId}`);
      setWorkouts((currentWorkouts) =>
        currentWorkouts.filter((workout) => workout.id !== workoutId),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete workout.");
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
        <Stack spacing={1.5} alignItems="flex-start" sx={{ mb: 3 }}>
          <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
            Workouts
          </Typography>
          <Typography color="text.secondary">
            Review the sessions you have logged so far.
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => navigate("/dashboard")}
            sx={{ alignSelf: "flex-start" }}
          >
            Log workout
          </Button>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {isLoading ? (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <CircularProgress size={22} />
            <Typography color="text.secondary">Loading workouts</Typography>
          </Stack>
        ) : workouts.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              border: "1px solid #dde3ea",
              borderRadius: 2,
              p: { xs: 2.5, md: 4 },
            }}
          >
            <Stack spacing={1.5} alignItems="flex-start">
              <FitnessCenterIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                No workouts logged yet
              </Typography>
              <Typography color="text.secondary">
                Once you save a workout, it will appear here.
              </Typography>
              <Button
                variant="outlined"
                size="medium"
                startIcon={<AddIcon />}
                onClick={() => navigate("/dashboard")}
                sx={{ alignSelf: "flex-start" }}
              >
                Log your first workout
              </Button>
            </Stack>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {workouts.map((workout) => (
              <Paper
                key={workout.id}
                elevation={0}
                sx={{
                  border: "1px solid #b2becd",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <Box sx={{ p: { xs: 2, md: 3 } }}>
                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="flex-start"
                    justifyContent="space-between"
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {workout.name}
                      </Typography>
                      <Typography color="text.secondary">
                        {formatWorkoutDate(workout.date)}
                      </Typography>
                    </Box>
                    <Tooltip title="Delete workout" arrow>
                      <IconButton
                        color="error"
                        aria-label="Delete workout"
                        onClick={() => handleDeleteWorkout(workout.id)}
                        sx={{
                          flexShrink: 0,
                          height: 36,
                          ml: "auto",
                          width: 36,
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Edit workout" arrow>
                      <IconButton
                        color="info"
                        aria-label="Edit workout"
                        sx={{
                          flexShrink: 0,
                          height: 36,
                          ml: "auto",
                          width: 36,
                        }}
                      >
                        <EditIcon fontSise="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>

                  {workout.cardioDuration && (
                    <Typography color="text.secondary">
                      Cardio: {workout.cardioDuration} min
                    </Typography>
                  )}

                  {workout.notes && (
                    <Typography sx={{ mt: 2 }}>{workout.notes}</Typography>
                  )}
                </Box>

                <Divider />

                <Stack spacing={1.5} sx={{ p: { xs: 2, md: 3 } }}>
                  {workout.workoutExercises?.map((workoutExercise) => (
                    <Box key={workoutExercise.id}>
                      <Typography sx={{ fontWeight: 700 }}>
                        {workoutExercise.exercise?.name || "Exercise"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {workoutExercise.sets
                          ?.map((set) => `${set.reps} reps at ${set.weight} kg`)
                          .join(" | ")}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default Workouts;
