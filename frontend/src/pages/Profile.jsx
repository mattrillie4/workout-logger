import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import api from "../api/axiosConfig";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";

//age calculator function
const calculateAge = (dob) => {
  if (!dob) return null;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};
//capitilisation helper function
const capitalise = (str) => {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : "-";
};
// date format helper function
const formatDateInput = (date) => {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
};
//formats api response
const profileToForm = (profile) => ({
  height_cm: profile?.height_cm ?? "",
  weight_kg: profile?.weight_kg ?? "",
  date_of_birth: formatDateInput(profile?.date_of_birth),
  gender: profile?.gender ?? "",
});

const emptySummary = {
  totalWorkouts: 0,
  workoutsLastSevenDays: 0,
  totalSets: 0,
};

const Profile = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState(profileToForm(null));
  const [isEditingMetrics, setIsEditingMetrics] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [summary, setSummary] = useState(emptySummary);

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    const fetchUser = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [userResponse, profileResponse, summaryResponse] =
          await Promise.all([
            api.get("/user/me"),
            api.get("/user/profile"),
            api.get("/progress/summary"),
          ]);
        setUser(userResponse.data.data);
        setProfile(profileResponse.data.data);
        setSummary(summaryResponse.data.data);
        setProfileForm(profileToForm(profileResponse.data.data));
      } catch (err) {
        setError(err.response?.data?.message || "Could not load profile.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [isLoggedIn]);

  const updateProfileForm = (field, value) => {
    setProfileForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleProfileUpdate = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSavingProfile(true);

    try {
      // send profile data to backend
      const response = await api.post("/user/profile", profileForm);
      setProfile(response.data.data);
      setProfileForm(profileToForm(response.data.data));
      setIsEditingMetrics(false);
      setSuccess("Profile metrics updated.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not update profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <Box sx={{ maxWidth: 720, mx: "auto", px: 2, py: 5 }}>
        <Alert
          severity="warning"
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<LoginIcon />}
              onClick={() => navigate("/login")}
            >
              Login
            </Button>
          }
        >
          Log in to view your profile.
        </Alert>
      </Box>
    );
  }

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
      <Box sx={{ maxWidth: 900, mx: "auto" }}>
        <Stack spacing={1} sx={{ mb: 3 }}>
          <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
            Profile
          </Typography>
          <Typography color="text.secondary">
            Your account and training profile.
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

        <Paper
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <Stack spacing={0}>
            <Box sx={{ p: { xs: 2, md: 3 } }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Account
              </Typography>

              {isLoading ? (
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: "center" }}
                >
                  <CircularProgress size={22} />
                  <Typography color="text.secondary">
                    Loading profile
                  </Typography>
                </Stack>
              ) : (
                <Box
                  sx={{
                    display: "grid",
                    gap: 2,
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, minmax(0, 1fr))",
                    },
                  }}
                >
                  <ProfileField label="Email" value={user?.email || "-"} />
                  <ProfileField label="User ID" value={user?.id || "-"} />
                  <ProfileField
                    label="Member since"
                    value={
                      user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "-"
                    }
                  />
                </Box>
              )}
            </Box>

            <Divider />

            {isLoading ? (
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ alignItems: "center" }}
              >
                <CircularProgress size={22} />
                <Typography color="text.secondary">Loading profile</Typography>
              </Stack>
            ) : (
              <Box
                component="form"
                onSubmit={handleProfileUpdate}
                sx={{ p: { xs: 2, md: 3 } }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  sx={{
                    alignItems: { xs: "stretch", sm: "center" },
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Body Metrics
                  </Typography>
                  {isEditingMetrics ? (
                    <Stack direction="row" spacing={1}>
                      <Button
                        type="button"
                        onClick={() => {
                          setProfileForm(profileToForm(profile));
                          setIsEditingMetrics(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<SaveIcon />}
                        disabled={isSavingProfile}
                      >
                        {isSavingProfile ? "Saving" : "Save"}
                      </Button>
                    </Stack>
                  ) : (
                    <Button
                      type="button"
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => setIsEditingMetrics(true)}
                    >
                      Edit
                    </Button>
                  )}
                </Stack>

                {isEditingMetrics ? (
                  <Box
                    sx={{
                      display: "grid",
                      gap: 2,
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, minmax(0, 1fr))",
                      },
                    }}
                  >
                    <TextField
                      fullWidth
                      label="Height"
                      type="number"
                      value={profileForm.height_cm}
                      onChange={(event) =>
                        updateProfileForm("height_cm", event.target.value)
                      }
                      helperText="Centimetres"
                      slotProps={{
                        htmlInput: { min: 50, max: 300, step: 0.1 },
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Weight"
                      type="number"
                      value={profileForm.weight_kg}
                      onChange={(event) =>
                        updateProfileForm("weight_kg", event.target.value)
                      }
                      helperText="Kilograms"
                      slotProps={{
                        htmlInput: { min: 20, max: 500, step: 0.1 },
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Date of birth"
                      type="date"
                      value={profileForm.date_of_birth}
                      onChange={(event) =>
                        updateProfileForm("date_of_birth", event.target.value)
                      }
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <FormControl fullWidth>
                      <InputLabel id="gender-label">Gender</InputLabel>
                      <Select
                        labelId="gender-label"
                        label="Gender"
                        value={profileForm.gender}
                        onChange={(event) =>
                          updateProfileForm("gender", event.target.value)
                        }
                      >
                        <MenuItem value="">Prefer not to say</MenuItem>
                        <MenuItem value="male">Male</MenuItem>
                        <MenuItem value="female">Female</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: "grid",
                      gap: 2,
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, minmax(0, 1fr))",
                      },
                    }}
                  >
                    <ProfileField
                      label="Height"
                      value={
                        profile?.height_cm ? `${profile.height_cm} cm` : "-"
                      }
                    />
                    <ProfileField
                      label="Weight"
                      value={
                        profile?.weight_kg ? `${profile.weight_kg} kg` : "-"
                      }
                    />
                    <ProfileField
                      label="Age"
                      value={calculateAge(profile?.date_of_birth) ?? "-"}
                    />
                    <ProfileField
                      label="Gender"
                      value={capitalise(profile?.gender) || "-"}
                    />
                  </Box>
                )}
              </Box>
            )}

            <Divider />

            <Box sx={{ p: { xs: 2, md: 3 } }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Training Summary
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(3, minmax(0, 1fr))",
                  },
                }}
              >
                <SummaryField
                  label="Total Workouts"
                  value={summary.totalWorkouts}
                />
                <SummaryField
                  label="Last 7 Days"
                  value={summary.workoutsLastSevenDays}
                />
                <SummaryField
                  label="Favorite category"
                  value={capitalise(summary.mostTrainedCategory)}
                />
                <SummaryField label="Total Sets" value={summary.totalSets} />
                <SummaryField
                  label="Total Cardio"
                  value={
                    <span>
                      {summary.totalCardioMinutes}
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "#888",
                          marginLeft: 4,
                        }}
                      >
                        minutes
                      </span>
                    </span>
                  }
                />
                <SummaryField
                  label="Total Volume"
                  value={
                    <span>
                      {summary.totalVolume}
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "#888",
                          marginLeft: 4,
                        }}
                      >
                        kg
                      </span>
                    </span>
                  }
                />
              </Box>
            </Box>

            <Divider />

            <Box sx={{ p: { xs: 2, md: 3 } }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Training Profile
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                  },
                }}
              >
                <ProfileField label="Goal" value="Not set" />
                <ProfileField label="Experience level" value="Not set" />
                <ProfileField label="Preferred split" value="Not set" />
                <ProfileField label="Weekly target" value="Not set" />
              </Box>
            </Box>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
};

const ProfileField = ({ label, value }) => (
  <Box>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography sx={{ fontWeight: 600, overflowWrap: "anywhere" }}>
      {value ?? "-"}
    </Typography>
  </Box>
);

const SummaryField = ({ label, value }) => (
  <Box
    sx={{
      border: "1px solid",
      borderColor: "divider",
      borderRadius: 1,
      p: 2,
    }}
  >
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
      {value ?? 0}
    </Typography>
  </Box>
);

export default Profile;
