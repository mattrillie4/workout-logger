import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
//mui imports
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import DeleteIcon from "@mui/icons-material/Delete";
import RestoreIcon from "@mui/icons-material/Restore";

const exerciseCategories = [
  "chest",
  "back",
  "legs",
  "shoulders",
  "arms",
  "core",
  "cardio",
  "full body",
  "other",
];

const formatCategory = (category) => {
  if (!category) return "Uncategorised";
  return category
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const sortByName = (items) =>
  [...items].sort((first, second) => first.name.localeCompare(second.name));

const Exercises = () => {
  //set state
  const [exercises, setExercises] = useState([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [isLoadingExercises, setIsLoadingExercises] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [archivedExercises, setArchivedExercises] = useState([]);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isLoadingArchived, setIsLoadingArchived] = useState(false);
  const [archiveError, setArchiveError] = useState("");
  const [restoringExerciseId, setRestoringExerciseId] = useState(null);

  // fetch exercise data on load
  useEffect(() => {
    const fetchExercises = async () => {
      setIsLoadingExercises(true);
      setError("");

      try {
        const response = await api.get("/exercises/me");
        setExercises(response.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load exercises.");
      } finally {
        setIsLoadingExercises(false);
      }
    };
    fetchExercises();
  }, []);

  const resetCreateForm = () => {
    setName("");
    setCategory("");
  };

  const closeCreateDialog = () => {
    if (isCreating) return;
    setIsCreateOpen(false);
    resetCreateForm();
  };

  // helper function to archive/delete custom exercise
  const handleDeleteExercise = async (exerciseId) => {
    const exerciseToArchive = exercises.find(
      (exercise) => exercise.id === exerciseId,
    );

    //double-check if user wants to delete
    const confirmed = window.confirm("Archive this exercise?");
    if (!confirmed) {
      return; //return if not
    }

    setError("");
    setSuccess("");
    setIsArchiving(true);

    try {
      await api.delete(`/exercises/${exerciseId}`);

      setExercises((currentExercises) =>
        currentExercises.filter((exercise) => exercise.id !== exerciseId),
      );

      if (exerciseToArchive) {
        setArchivedExercises((currentArchivedExercises) =>
          sortByName([
            ...currentArchivedExercises,
            { ...exerciseToArchive, isArchived: true },
          ]),
        );
      }

      setSuccess("Exercise archived.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not archive exercise.");
    } finally {
      setIsArchiving(false);
    }
  };

  // helper function to create a new custom exercise
  const handleCreateExercise = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsCreating(true);

    // send request to database
    try {
      const response = await api.post("/exercises", {
        name: name.trim(),
        category,
      });

      // re-render with new state
      setExercises((currentExercises) =>
        sortByName([...currentExercises, response.data.data]),
      );
      resetCreateForm();
      setIsCreateOpen(false);
      setSuccess("Exercise created.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not create exercise.");
    } finally {
      setIsCreating(false);
    }
  };

  // function to retrieve archived exercises on click
  const getArchivedExercises = async () => {
    setIsLoadingArchived(true);
    setArchiveError("");

    try {
      const response = await api.get("/exercises/archived");
      setArchivedExercises(response.data.data || []);
    } catch (err) {
      setArchiveError(
        err.response?.data?.message || "Could not load archived exercises.",
      );
    } finally {
      setIsLoadingArchived(false);
    }
  };

  const openArchiveDialog = () => {
    setIsArchiveOpen(true);
    getArchivedExercises();
  };

  const handleRestoreExercise = async (exerciseId) => {
    setArchiveError("");
    setError("");
    setSuccess("");
    setRestoringExerciseId(exerciseId);

    try {
      const response = await api.patch(`/exercises/${exerciseId}/restore`);
      const restoredExercise = response.data.data;

      setArchivedExercises((currentArchivedExercises) =>
        currentArchivedExercises.filter(
          (exercise) => exercise.id !== exerciseId,
        ),
      );
      setExercises((currentExercises) =>
        sortByName([...currentExercises, restoredExercise]),
      );
      setSuccess("Exercise restored.");
    } catch (err) {
      setArchiveError(
        err.response?.data?.message || "Could not restore exercise.",
      );
    } finally {
      setRestoringExerciseId(null);
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
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", sm: "flex-start" }}
          justifyContent="space-between"
          sx={{ mb: 3 }}
        >
          <Stack spacing={1}>
            <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
              Exercise Library
            </Typography>
            <Typography color="text.secondary">
              Browse default exercises and your custom movement library.
            </Typography>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Button variant="outlined" onClick={openArchiveDialog}>
              Archived Exercises
            </Button>
            <Button variant="contained" onClick={() => setIsCreateOpen(true)}>
              Create Exercise
            </Button>
          </Stack>
        </Stack>

        <Dialog
          open={isCreateOpen}
          onClose={closeCreateDialog}
          fullWidth
          maxWidth="xs"
        >
          <Box component="form" onSubmit={handleCreateExercise}>
            <DialogTitle>Create exercise</DialogTitle>

            <DialogContent>
              <Stack spacing={2} sx={{ pt: 1 }}>
                <TextField
                  label="Exercise name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoFocus
                  fullWidth
                  required
                />

                <FormControl fullWidth required>
                  <InputLabel id="exercise-category-label">Category</InputLabel>
                  <Select
                    labelId="exercise-category-label"
                    label="Category"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                  >
                    {exerciseCategories.map((exerciseCategory) => (
                      <MenuItem key={exerciseCategory} value={exerciseCategory}>
                        {formatCategory(exerciseCategory)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </DialogContent>

            <DialogActions>
              <Button onClick={closeCreateDialog} disabled={isCreating}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isCreating || !name.trim() || !category}
              >
                {isCreating ? "Creating..." : "Create"}
              </Button>
            </DialogActions>
          </Box>
        </Dialog>

        <Dialog
          open={isArchiveOpen}
          onClose={() => !restoringExerciseId && setIsArchiveOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Archived Exercises</DialogTitle>

          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              {archiveError && <Alert severity="error">{archiveError}</Alert>}

              {isLoadingArchived ? (
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <CircularProgress size={22} />
                  <Typography color="text.secondary">
                    Loading archived exercises
                  </Typography>
                </Stack>
              ) : archivedExercises.length === 0 ? (
                <Typography color="text.secondary">
                  No archived exercises.
                </Typography>
              ) : (
                archivedExercises.map((exercise) => (
                  <Paper
                    key={exercise.id}
                    elevation={0}
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      p: 2,
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 700, overflowWrap: "anywhere" }}
                        >
                          {exercise.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatCategory(exercise.category)}
                        </Typography>
                      </Box>

                      <Tooltip title="Restore">
                        <span>
                          <IconButton
                            color="primary"
                            aria-label="Restore exercise"
                            onClick={() => handleRestoreExercise(exercise.id)}
                            disabled={restoringExerciseId !== null}
                          >
                            {restoringExerciseId === exercise.id ? (
                              <CircularProgress size={20} />
                            ) : (
                              <RestoreIcon fontSize="small" />
                            )}
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Stack>
                  </Paper>
                ))
              )}
            </Stack>
          </DialogContent>

          <DialogActions>
            <Button
              onClick={() => setIsArchiveOpen(false)}
              disabled={restoringExerciseId !== null}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

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

        {isLoadingExercises ? (
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
              <Button variant="contained" onClick={() => setIsCreateOpen(true)}>
                Create Exercise
              </Button>
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
                          <span>
                            <IconButton
                              color="error"
                              sx={{ marginLeft: "auto" }}
                              aria-label="Archive exercise"
                              onClick={() => handleDeleteExercise(exercise.id)}
                              disabled={isArchiving}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
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
