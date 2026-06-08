import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import api from "../api/axiosConfig";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    const fetchUser = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await api.get("/user/me");
        setUser(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load profile.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [isLoggedIn]);

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
        bgcolor: "#f6f8fa",
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

        <Paper
          elevation={0}
          sx={{
            border: "1px solid #dde3ea",
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
                <Stack direction="row" spacing={1.5} alignItems="center">
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
      {value}
    </Typography>
  </Box>
);

export default Profile;
