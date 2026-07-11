import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import InsightsIcon from "@mui/icons-material/Insights";
import HistoryIcon from "@mui/icons-material/History";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axiosConfig";

const emptySummary = {
  totalWorkouts: 0,
  workoutsLastSevenDays: 0,
  totalSets: 0,
  totalCardioMinutes: 0,
  totalVolumeKg: 0,
  mostTrainedCategory: null,
};
// format helper functions
const formatCategory = (category) => {
  if (!category) return "-";
  return category
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString();
};

const formatNumber = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "0";
  }

  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0,
  }).format(Number(value));
};

const Progress = () => {
  const navigate = useNavigate();
  const { exerciseId } = useParams();
  const [summary, setSummary] = useState(emptySummary);
  const [exercises, setExercises] = useState([]);
  const [exerciseProgress, setExerciseProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingExercise, setIsLoadingExercise] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProgressBase = async () => {
      setIsLoading(true);
      setError("");
      // fetch summary information (same as profile, and global+custom exercises)
      try {
        const [summaryResponse, exercisesResponse] = await Promise.all([
          api.get("/progress/summary"),
          api.get("/exercises/me"),
        ]);

        setSummary(summaryResponse.data.data || emptySummary);
        setExercises(exercisesResponse.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load progress.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgressBase();
  }, []);

  useEffect(() => {
    if (!exerciseId) {
      return;
    }
    // fetch progress for an exercise from backend
    const fetchExerciseProgress = async () => {
      setIsLoadingExercise(true);
      setError("");

      try {
        const progressResponse = await api.get(
          `/progress/exercises/${exerciseId}`,
        );
        setExerciseProgress(progressResponse.data.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Could not load exercise progress.",
        );
      } finally {
        setIsLoadingExercise(false);
      }
    };

    fetchExerciseProgress();
  }, [exerciseId]);

  // set new exercise id
  const handleExerciseChange = (event) => {
    const nextExerciseId = event.target.value;

    if (nextExerciseId) {
      navigate(`/progress/${nextExerciseId}`);
    } else {
      navigate("/progress");
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
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          sx={{
            alignItems: { xs: "stretch", md: "flex-start" },
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <Stack spacing={1}>
            <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
              Progress
            </Typography>
            <Typography color="text.secondary">
              Track overall training totals and drill into exercise progress.
            </Typography>
          </Stack>

          <FormControl sx={{ minWidth: { xs: "100%", sm: 280 } }}>
            <InputLabel id="progress-exercise-label">Exercise</InputLabel>
            <Select
              labelId="progress-exercise-label"
              label="Exercise"
              value={exerciseId || ""}
              onChange={handleExerciseChange}
              disabled={isLoading}
            >
              <MenuItem value="">All progress</MenuItem>
              {exercises.map((exercise) => (
                <MenuItem key={exercise.id} value={String(exercise.id)}>
                  {exercise.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {isLoading ? (
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <CircularProgress size={22} />
            <Typography color="text.secondary">Loading progress</Typography>
          </Stack>
        ) : (
          <Stack spacing={3}>
            <Paper
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  bgcolor: "#24282E",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  p: { xs: 2, md: 3 },
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  sx={{
                    alignItems: { xs: "flex-start", sm: "center" },
                    justifyContent: "space-between",
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <InsightsIcon color="secondary" />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        Training Summary
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Your current logged training totals.
                      </Typography>
                    </Box>
                  </Stack>
                  <Chip
                    color="primary"
                    variant="outlined"
                    label={`${summary.workoutsLastSevenDays || 0} workouts last 7 days`}
                  />
                </Stack>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gap: 0,
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                    lg: "repeat(3, minmax(0, 1fr))",
                  },
                }}
              >
                <SummaryMetric
                  label="Total Workouts"
                  value={summary.totalWorkouts}
                />
                <SummaryMetric label="Total Sets" value={summary.totalSets} />
                <SummaryMetric
                  label="Total Volume"
                  value={formatNumber(summary.totalVolumeKg)}
                  unit="kg"
                />
                <SummaryMetric
                  label="Total Cardio"
                  value={summary.totalCardioMinutes}
                  unit="min"
                />
                <SummaryMetric
                  label="Favorite Category"
                  value={formatCategory(summary.mostTrainedCategory)}
                />
                <SummaryMetric
                  label="Exercises Available"
                  value={exercises.length}
                />
              </Box>
            </Paper>

            {exerciseId ? (
              <ExerciseDetail
                exerciseProgress={exerciseProgress}
                isLoading={isLoadingExercise}
                onBack={() => navigate("/progress")}
              />
            ) : (
              <ExerciseProgressList exercises={exercises} />
            )}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

const SummaryMetric = ({ label, value, unit }) => (
  <Box
    sx={{
      borderColor: "divider",
      borderRight: { sm: "1px solid" },
      borderTop: "1px solid",
      minHeight: 118,
      p: { xs: 2, md: 2.5 },
    }}
  >
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography
      variant="h4"
      sx={{ fontWeight: 900, mt: 0.75, overflowWrap: "anywhere" }}
    >
      {value ?? 0}
      {unit && (
        <Typography component="span" color="text.secondary" sx={{ ml: 0.75 }}>
          {unit}
        </Typography>
      )}
    </Typography>
  </Box>
);

const ExerciseProgressList = ({ exercises }) => {
  const navigate = useNavigate();

  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        p: { xs: 2, md: 3 },
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <ShowChartIcon color="primary" />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Exercise Progress
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Choose an exercise to inspect strength, volume, and session trend.
            </Typography>
          </Box>
        </Stack>

        {exercises.length === 0 ? (
          <Typography color="text.secondary">
            No exercises found in your library yet.
          </Typography>
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
            {exercises.map((exercise) => (
              <Paper
                key={exercise.id}
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  p: 2,
                  transition: "border-color 160ms ease, transform 160ms ease",
                  "&:hover": {
                    borderColor: "primary.main",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                <Stack spacing={1.5} alignItems="flex-start">
                  <FitnessCenterIcon
                    color={exercise.userId ? "secondary" : "primary"}
                  />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {exercise.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatCategory(exercise.category)}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate(`/progress/${exercise.id}`)}
                  >
                    View progress
                  </Button>
                </Stack>
              </Paper>
            ))}
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

const ExerciseDetail = ({ exerciseProgress, isLoading, onBack }) => {
  const exercise = exerciseProgress?.exercise;
  const bestWeight = exerciseProgress?.bestWeight;
  const bestWeightWorkout = bestWeight?.workoutExercise?.workout;
  const recentSessions = exerciseProgress?.formattedRecentSessions || [];
  const progressHistory = exerciseProgress?.progressHistory || [];

  if (isLoading) {
    return (
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
        <CircularProgress size={22} />
        <Typography color="text.secondary">
          Loading exercise progress
        </Typography>
      </Stack>
    );
  }

  if (!exerciseProgress) {
    return null;
  }

  return (
    <Stack spacing={2}>
      <Button
        variant="text"
        startIcon={<ArrowBackIcon />}
        onClick={onBack}
        sx={{ alignSelf: "flex-start" }}
      >
        All progress
      </Button>

      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{
              alignItems: { xs: "flex-start", sm: "center" },
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography component="h2" variant="h5" sx={{ fontWeight: 800 }}>
                {exercise?.name || "Exercise progress"}
              </Typography>
              <Typography color="text.secondary">
                {formatCategory(exercise?.category)}
              </Typography>
            </Box>
            <Chip
              color="primary"
              label={`Last trained: ${
                exerciseProgress.lastTrained?.date
                  ? formatDate(exerciseProgress.lastTrained.date)
                  : "Not yet"
              }`}
            />
            <Chip
              color="secondary"
              icon={<TrendingUpIcon />}
              label={`${exerciseProgress.totalSets || 0} logged sets`}
            />
          </Stack>
        </Box>

        <Divider />

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(4, minmax(0, 1fr))",
            },
            p: { xs: 2, md: 3 },
          }}
        >
          <ProgressMetric
            label="Best Weight"
            value={formatNumber(bestWeight?.weight)}
            unit={bestWeight?.weightUnit || "kg"}
            caption={
              bestWeight
                ? `${bestWeight.reps} reps${bestWeightWorkout?.date ? ` on ${formatDate(bestWeightWorkout.date)}` : ""}`
                : "No weighted sets yet"
            }
          />
          <ProgressMetric
            label="Reps at Best Weight"
            value={bestWeight?.reps || 0}
            caption={
              bestWeightWorkout?.name
                ? `Logged in ${bestWeightWorkout.name}`
                : "From the heaviest logged set"
            }
          />
          <ProgressMetric
            label="Total Sets"
            value={exerciseProgress.totalSets}
            caption="All logged sets for this exercise"
          />
          <ProgressMetric
            label="Category"
            value={formatCategory(exercise?.category)}
            caption="Exercise grouping"
          />
        </Box>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          p: { xs: 2, md: 3 },
        }}
      >
        <Stack spacing={2}>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(1, minmax(0, 1fr))",
              },
            }}
          >
            <MetricPlaceholder
              title="Volume"
              progressHistory={progressHistory}
            />
          </Box>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          p: { xs: 2, md: 3 },
        }}
      >
        <Stack spacing={2.5}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{
              alignItems: { xs: "flex-start", sm: "center" },
              justifyContent: "space-between",
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <HistoryIcon color="primary" />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Recent Sessions
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your last three logged sessions for this exercise.
                </Typography>
              </Box>
            </Stack>
            <Chip
              variant="outlined"
              color="primary"
              label={`${recentSessions.length} shown`}
            />
          </Stack>

          {recentSessions.length === 0 ? (
            <Box
              sx={{
                border: "1px dashed",
                borderColor: "divider",
                borderRadius: 1,
                p: 2,
              }}
            >
              <Typography color="text.secondary">
                Log this exercise in a workout to see recent sessions here.
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(3, minmax(0, 1fr))",
                },
              }}
            >
              {recentSessions.map((session) => (
                <RecentSessionCard key={session.id} session={session} />
              ))}
            </Box>
          )}
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          p: { xs: 2, md: 3 },
        }}
      >
        <Stack spacing={1}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <EmojiEventsIcon sx={{ color: "warning.main", fontSize: 24 }} />
            Best Set
          </Typography>
          {bestWeight ? (
            <>
              <Typography sx={{ fontWeight: 700 }}>
                {formatNumber(bestWeight.weight)}{" "}
                {bestWeight.weightUnit || "kg"} x {bestWeight.reps}
              </Typography>
              <Typography color="text.secondary">
                {bestWeightWorkout?.name || "Workout"}
                {bestWeightWorkout?.date
                  ? ` | ${formatDate(bestWeightWorkout.date)}`
                  : ""}
              </Typography>
            </>
          ) : (
            <Typography color="text.secondary">
              Log this exercise in a workout to start building progress history.
            </Typography>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
};

const RecentSessionCard = ({ session }) => {
  const sets = session.sets || [];

  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: "#24282E",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        minHeight: 190,
        overflow: "hidden",
      }}
    >
      <Stack spacing={0}>
        <Box
          sx={{
            borderBottom: "1px solid",
            borderColor: "divider",
            p: 2,
          }}
        >
          <Stack spacing={0.75}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 800, overflowWrap: "anywhere" }}
            >
              {session.name || "Workout"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatDate(session.date)}
            </Typography>
          </Stack>
        </Box>

        <Stack spacing={1.25} sx={{ p: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              color="secondary"
              variant="outlined"
              size="small"
              label={`${sets.length} ${sets.length === 1 ? "set" : "sets"}`}
            />
          </Stack>

          {sets.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No sets returned for this session.
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {sets.map((set, index) => (
                <Chip
                  key={`${session.id}-${set.order || index}`}
                  size="small"
                  variant="outlined"
                  label={`${set.reps} x ${formatNumber(set.weight)} ${
                    set.weightUnit || "kg"
                  }`}
                  sx={{
                    bgcolor: "rgba(255, 90, 31, 0.08)",
                    borderColor: "rgba(255, 90, 31, 0.34)",
                  }}
                />
              ))}
            </Box>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
};

const MetricPlaceholder = ({ title, progressHistory }) => {
  const chartData = [...progressHistory].reverse().map((session, index) => ({
    label: `${index + 1}. ${session.name} - ${formatDate(session.date)}`,
    volumeKg: Number(session.volumeKg || 0),
  }));

  return (
    <Box
      sx={{
        border: "1px dashed",
        borderColor: "divider",
        borderRadius: 1,
        p: 2,
      }}
    >
      <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        Volume from your progress history.
      </Typography>
      <BarChart
        xAxis={[
          {
            id: "volumeOverTime",
            scaleType: "band",
            data: chartData.map((item) => item.label),
          },
        ]}
        series={[
          {
            label: "Volume (kg)",
            data: chartData.map((item) => item.volumeKg),
          },
        ]}
        height={350}
      />
    </Box>
  );
};

const ProgressMetric = ({ label, value, unit, caption }) => (
  <Paper
    elevation={0}
    sx={{
      bgcolor: "#24282E",
      border: "1px solid",
      borderColor: "divider",
      borderRadius: 1,
      p: 2,
    }}
  >
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="h4" sx={{ fontWeight: 900, mt: 0.75 }}>
      {value ?? 0}
      {unit && (
        <Typography component="span" color="text.secondary" sx={{ ml: 0.75 }}>
          {unit}
        </Typography>
      )}
    </Typography>
    {caption && (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {caption}
      </Typography>
    )}
  </Paper>
);

export default Progress;
