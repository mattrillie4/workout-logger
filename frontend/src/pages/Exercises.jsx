import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import DeleteIcon from "@mui/icons-material/Delete";

const formatCategory = (category) => {
  if (!category) return "Uncategorised";
  return category
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const Exercises = () => {
  //set state
  const [exercises, setExercises] = useState([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [saving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // fetch exercise data on load
  useEffect(() => {
    const fetchExercises = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await api.get("/exercises/me");
        setExercises(response.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load exercises.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchExercises();
  }, []);
  // helper function to archive/delete custom exercise
  const handleDeleteExercise = async (exerciseId) => {
    //double-check if user wants to delete
    const confirmed = window.confirm("Archive this exercise?");
    if (!confirmed) {
      return; //return if not
    }

    setError("");
    setSuccess("");

    try {
      await api.delete(`/exercises/${exerciseId}`);
      // set exercises to re-render page
      setExercises((currentExercises) =>
        currentExercises.filter((exercise) => exercise.id !== exerciseId),
      );

      setSuccess("Exercise archived.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not archive exercise.");
    }
  };
  return (
    <Box
      component="main"
      sx={{
        bgcolor: "background.default",
        minHeight: "calc(100vh - 64px)",
        px: { xs: 2, md: 4 },
        py: { xs: 3, md: 5 },
      }}
    >
      <Box sx={{ maxWidth: 1100, mx: "auto" }}>
        <Stack spacing={1} sx={{ mb: 3 }}>
          <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
            Exercise Library
          </Typography>
          <Typography color="text.secondary">
            Browse default exercises and your custom movement library.
          </Typography>
        </Stack>

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

        {isLoading ? (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <CircularProgress size={22} />
            <Typography color="text.secondary">Loading exercises</Typography>
          </Stack>
        ) : exercises.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              p: { xs: 2.5, md: 4 },
            }}
          >
            <Stack spacing={1.5} alignItems="flex-start">
              <FitnessCenterIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                No exercises found
              </Typography>
              <Typography color="text.secondary">
                Create a custom exercise to start building your library.
              </Typography>
            </Stack>
          </Paper>
        ) : (
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(3, minmax(0, 1fr))",
              },
            }}
          >
            {exercises.map((exercise) => {
              const isCustom = exercise.userId !== null;

              return (
                <Paper
                  key={exercise.id}
                  elevation={0}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    p: 2,
                    transition: "border-color 160ms ease, transform 160ms ease",
                    "&:hover": {
                      borderColor: isCustom ? "secondary.main" : "primary.main",
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  <Stack spacing={1.5}>
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="flex-start"
                      justifyContent="space-between"
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 700, overflowWrap: "anywhere" }}
                        >
                          {exercise.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatCategory(exercise.category)}
                        </Typography>
                      </Box>

                      <FitnessCenterIcon
                        color={isCustom ? "secondary" : "primary"}
                        fontSize="small"
                        sx={{ flexShrink: 0, mt: 0.5 }}
                      />
                    </Stack>

                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 1,
                        alignItems: "center",
                      }}
                    >
                      <Chip
                        label={formatCategory(exercise.category)}
                        size="small"
                        color={isCustom ? "secondary" : "primary"}
                        variant="outlined"
                      />
                      <Chip
                        label={isCustom ? "Custom" : "Default"}
                        size="small"
                        sx={{
                          bgcolor: isCustom
                            ? "rgba(182, 255, 59, 0.08)"
                            : "rgba(255, 90, 31, 0.08)",
                          color: isCustom ? "secondary.main" : "primary.main",
                        }}
                      />
                      {isCustom && (
                        <Tooltip title="Archive">
                          <IconButton
                            color="error"
                            sx={{ marginLeft: "auto" }}
                            aria-label="Archive exercise"
                            onClick={() => handleDeleteExercise(exercise.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </Stack>
                </Paper>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Exercises;
