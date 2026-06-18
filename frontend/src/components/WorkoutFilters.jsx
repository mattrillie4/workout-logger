import {
  Box,
  Button,
  FormControl,
  FormLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
} from "@mui/material";

const categories = [
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

const formatCategory = (category) =>
  category
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const WorkoutFilters = ({
  filters,
  exerciseOptions,
  isLoading,
  onChange,
  onApply,
  onClear,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        mb: 3,
        p: 2,
      }}
    >
      <Box component="form" onSubmit={onApply}>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{ alignItems: { xs: "stretch", md: "center" } }}
          >
            <TextField
              label="Search"
              value={filters.search}
              onChange={(event) => onChange("search", event.target.value)}
              placeholder="Workout, notes, or exercise"
              fullWidth
              size="small"
            />

            <FormControl fullWidth size="small">
              <InputLabel id="workout-exercise-filter-label">
                Exercise
              </InputLabel>
              <Select
                labelId="workout-exercise-filter-label"
                label="Exercise"
                value={filters.exerciseId}
                onChange={(event) => onChange("exerciseId", event.target.value)}
              >
                <MenuItem value="">All exercises</MenuItem>
                {exerciseOptions.map((exercise) => (
                  <MenuItem key={exercise.id} value={String(exercise.id)}>
                    {exercise.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel id="workout-category-filter-label">
                Category
              </InputLabel>
              <Select
                labelId="workout-category-filter-label"
                label="Category"
                value={filters.category}
                onChange={(event) => onChange("category", event.target.value)}
              >
                <MenuItem value="">All categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {formatCategory(category)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{ alignItems: { xs: "stretch", md: "center" } }}
          >
            <FormControl fullWidth>
              <FormLabel sx={{ mb: 0.5 }}>From</FormLabel>
              <TextField
                type="date"
                value={filters.from}
                onChange={(event) => onChange("from", event.target.value)}
                fullWidth
                size="small"
              />
            </FormControl>

            <FormControl fullWidth>
              <FormLabel sx={{ mb: 0.5 }}>To</FormLabel>
              <TextField
                type="date"
                value={filters.to}
                onChange={(event) => onChange("to", event.target.value)}
                fullWidth
                size="small"
              />
            </FormControl>

            <FormControl fullWidth>
              <FormLabel sx={{ mb: 0.5 }}>Sort</FormLabel>
              <Select
                value={filters.sort}
                onChange={(event) => onChange("sort", event.target.value)}
                size="small"
              >
                <MenuItem value="date_desc">Newest first</MenuItem>
                <MenuItem value="date_asc">Oldest first</MenuItem>
                <MenuItem value="name_asc">Name A-Z</MenuItem>
                <MenuItem value="name_desc">Name Z-A</MenuItem>
              </Select>
            </FormControl>

            <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
              <Button type="submit" variant="contained" disabled={isLoading}>
                Apply
              </Button>
              <Button variant="outlined" onClick={onClear} disabled={isLoading}>
                Clear
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Box>
    </Paper>
  );
};

export default WorkoutFilters;
