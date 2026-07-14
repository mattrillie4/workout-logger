import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Pagination,
  Paper,
  Stack,
  Typography,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import NotesIcon from "@mui/icons-material/Notes";
import TimerIcon from "@mui/icons-material/Timer";
import api from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import WorkoutFilters from "../components/WorkoutFilters";

// helper functions
const formatWorkoutDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-AU"); //format date if provided
};

const defaultFilters = {
  search: "",
  exerciseId: "",
  category: "",
  from: "",
  to: "",
  sort: "date_desc",
};

const WORKOUTS_PER_PAGE = 5;

const buildWorkoutQuery = (filters, page) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  params.set("page", page);
  params.set("pageSize", WORKOUTS_PER_PAGE);

  return params.toString();
};

const Workouts = () => {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [exerciseOptions, setExerciseOptions] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: WORKOUTS_PER_PAGE,
    totalItems: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchWorkouts = async (nextFilters = filters, nextPage = page) => {
    setIsLoading(true);
    setError("");

    try {
      const query = buildWorkoutQuery(nextFilters, nextPage);
      const response = await api.get(`/workouts?${query}`);
      setWorkouts(response.data.data || []);
      setPagination(
        response.data.pagination || {
          page: nextPage,
          pageSize: WORKOUTS_PER_PAGE,
          totalItems: response.data.data?.length || 0,
          totalPages: 1,
        },
      );
    } catch (err) {
      setError(err.response?.data?.message || "Could not load workouts.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchInitialWorkouts = async () => {
      try {
        const query = buildWorkoutQuery(defaultFilters, 1);
        const response = await api.get(`/workouts?${query}`);
        if (isMounted) {
          setWorkouts(response.data.data || []);
          setPagination(
            response.data.pagination || {
              page: 1,
              pageSize: WORKOUTS_PER_PAGE,
              totalItems: response.data.data?.length || 0,
              totalPages: 1,
            },
          );
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || "Could not load workouts.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchInitialWorkouts();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const fetchExerciseOptions = async () => {
      try {
        const response = await api.get("/exercises/me");
        setExerciseOptions(response.data.data || []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Could not load exercise filters.",
        );
      }
    };

    fetchExerciseOptions();
  }, []);

  const updateFilter = (field, value) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [field]: value,
    }));
  };

  const applyFilters = (event) => {
    event.preventDefault();
    setPage(1);
    fetchWorkouts(filters, 1);
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    setPage(1);
    fetchWorkouts(defaultFilters, 1);
  };

  const handlePageChange = (event, nextPage) => {
    setPage(nextPage);
    fetchWorkouts(filters, nextPage);
  };

  // delete workout function for delete button
  const handleDeleteWorkout = async (workoutId) => {
    const confirmed = window.confirm("Delete this workout?");

    if (!confirmed) {
      return;
    }
    // pass given workout id to api delete endpoint
    try {
      await api.delete(`/workouts/${workoutId}`);
      const nextPage = workouts.length === 1 && page > 1 ? page - 1 : page;
      setPage(nextPage);
      fetchWorkouts(filters, nextPage);
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete workout.");
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
        <Stack spacing={1.5} sx={{ alignItems: "flex-start", mb: 3 }}>
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

        <WorkoutFilters
          filters={filters}
          exerciseOptions={exerciseOptions}
          isLoading={isLoading}
          onChange={updateFilter}
          onApply={applyFilters}
          onClear={clearFilters}
        />

        {isLoading ? (
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <CircularProgress size={22} />
            <Typography color="text.secondary">Loading workouts</Typography>
          </Stack>
        ) : workouts.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              p: { xs: 2.5, md: 4 },
            }}
          >
            <Stack spacing={1.5} sx={{ alignItems: "flex-start" }}>
              <FitnessCenterIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                No workouts found
              </Typography>
              <Typography color="text.secondary">
                Try adjusting your filters or log a new workout.
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
            <Typography variant="body2" color="text.secondary">
              Showing page {pagination.page} of {pagination.totalPages} (
              {pagination.totalItems} workouts)
            </Typography>

            {workouts.map((workout) => (
              <Paper
                key={workout.id}
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  overflow: "hidden",
                  transition: "border-color 160ms ease, transform 160ms ease",
                  "&:hover": {
                    borderColor: "primary.main",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                <Box sx={{ p: { xs: 2, md: 3 } }}>
                  <Stack spacing={2}>
                    <Stack
                      direction="row"
                      spacing={1.5}
                      sx={{
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {workout.name}
                        </Typography>
                        <Typography color="text.secondary">
                          {formatWorkoutDate(workout.date)}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                        <Tooltip title="Delete workout" arrow>
                          <IconButton
                            color="error"
                            aria-label="Delete workout"
                            onClick={() => handleDeleteWorkout(workout.id)}
                            sx={{
                              flexShrink: 0,
                              height: 36,
                              width: 36,
                              bgcolor: "rgba(255, 77, 94, 0.08)",
                              "&:hover": {
                                bgcolor: "rgba(255, 77, 94, 0.18)",
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Edit workout" arrow>
                          <IconButton
                            color="secondary"
                            aria-label="Edit workout"
                            sx={{
                              flexShrink: 0,
                              height: 36,
                              width: 36,
                              bgcolor: "rgba(182, 255, 59, 0.08)",
                              "&:hover": {
                                bgcolor: "rgba(182, 255, 59, 0.18)",
                              },
                            }}
                            onClick={() =>
                              navigate(`/dashboard?editWorkoutId=${workout.id}`)
                            }
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>

                    {workout.cardioDuration && (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <TimerIcon color="primary" sx={{ fontSize: 18 }} />
                        <Typography variant="body2" color="text.secondary">
                          {workout.cardioDuration} min cardio
                        </Typography>
                      </Stack>
                    )}

                    {workout.notes && (
                      <Box
                        sx={{
                          bgcolor: "rgba(255, 255, 255, 0.03)",
                          borderLeft: "3px solid",
                          borderColor: "secondary.main",
                          borderRadius: 1,
                          p: 1.5,
                        }}
                      >
                        <Stack direction="row" spacing={1} sx={{ mb: 0.5 }}>
                          <NotesIcon
                            color="secondary"
                            sx={{ fontSize: 18, mt: "2px" }}
                          />
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontWeight: 700 }}
                          >
                            Notes
                          </Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                          {workout.notes}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Box>

                <Divider />

                <Stack spacing={2} sx={{ p: { xs: 2, md: 3 } }}>
                  {workout.workoutExercises?.map((workoutExercise) => (
                    <Box
                      key={workoutExercise.id}
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          bgcolor: "rgba(255, 255, 255, 0.025)",
                          borderBottom: "1px solid",
                          borderColor: "divider",
                          p: 1.5,
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={1.5}
                          sx={{
                            alignItems: "baseline",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography sx={{ fontWeight: 800 }}>
                            {workoutExercise.exercise?.name || "Exercise"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {workoutExercise.sets?.length || 0}{" "}
                            {(workoutExercise.sets?.length || 0) === 1
                              ? "set"
                              : "sets"}
                          </Typography>
                        </Stack>
                      </Box>

                      <Box>
                        <Box
                          sx={{
                            color: "text.secondary",
                            display: "grid",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            gridTemplateColumns: "56px 1fr 1fr",
                            px: 1.5,
                            py: 1,
                            textTransform: "uppercase",
                          }}
                        >
                          <Box>Set</Box>
                          <Box>Reps</Box>
                          <Box>Weight</Box>
                        </Box>
                        {workoutExercise.sets?.map((set, index) => (
                          <Box
                            key={set.id || `${workoutExercise.id}-${index}`}
                            sx={{
                              borderTop: "1px solid",
                              borderColor: "divider",
                              display: "grid",
                              gridTemplateColumns: "56px 1fr 1fr",
                              px: 1.5,
                              py: 1,
                            }}
                          >
                            <Typography color="text.secondary">
                              {index + 1}
                            </Typography>
                            <Typography>{set.reps}</Typography>
                            <Typography>
                              {set.weight} {set.weightUnit || "kg"}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            ))}

            {pagination.totalPages > 1 && (
              <Stack direction="row" sx={{ justifyContent: "center", pt: 1 }}>
                <Pagination
                  count={pagination.totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  disabled={isLoading}
                />
              </Stack>
            )}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default Workouts;
