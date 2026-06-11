// imports
import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import NoteIcon from "@mui/icons-material/Note";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function NavBar() {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();

  // logout helper for button
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Button
            color="inherit"
            onClick={() => navigate("/dashboard")}
            sx={{
              alignItems: "center",
              display: "flex",
              gap: 1.25,
              mr: 2,
              px: 0,
              "&:hover": {
                bgcolor: "transparent",
              },
            }}
          >
            <Box
              component="img"
              alt="Workout Logger logo"
              src="/favicon.svg"
              sx={{
                boxShadow: "0 0 18px rgba(255, 90, 31, 0.32)",
                height: 36,
                width: 36,
              }}
            />
            <Typography
              variant="h6"
              component="span"
              sx={{ color: "primary.main", fontWeight: 800 }}
            >
              Workout Logger
            </Typography>
          </Button>
          <Box sx={{ flexGrow: 1 }} />

          {isLoggedIn ? (
            <>
              <Button
                color="inherit"
                startIcon={<NoteIcon />}
                onClick={() => navigate("/workouts")}
              >
                Workouts
              </Button>
              <Button
                color="inherit"
                startIcon={<FitnessCenterIcon />}
                onClick={() => navigate("/exercises")}
              >
                Exercises
              </Button>
              <Button
                color="inherit"
                startIcon={<PersonIcon />}
                onClick={() => navigate("/profile")}
              >
                Profile
              </Button>
              <Button
                color="inherit"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => navigate("/login")} color="inherit">
                Login
              </Button>
              <Button onClick={() => navigate("/register")} color="inherit">
                Sign up
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}
