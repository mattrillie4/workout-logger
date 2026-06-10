// Imports
import { useState } from "react";
import api from "../api/axiosConfig";
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  // set states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // send POST request with axios
      await api.post("/user/register", { email, password });
      // set the request as a success
      setSuccess(true);
      // set a delay, then send user to the login page to re-enter credentials
      setTimeout(() => {
        navigate("/login");
      }, 1500);
      setError(null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Registration failed. Try a different email.",
      ); // null chaining to avoid unessecary crashes
    }
  };
  return (
    <Box
      component="main"
      sx={{
        bgcolor: "background.default",
        minHeight: "calc(100vh - 64px)",
        px: 2,
        py: { xs: 4, md: 7 },
      }}
    >
      <Paper
        component="form"
        onSubmit={handleRegister}
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          maxWidth: 440,
          mx: "auto",
          p: { xs: 2.5, sm: 4 },
        }}
      >
        <Stack spacing={2.5}>
          <Stack spacing={0.5}>
            <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
              Register
            </Typography>
            <Typography color="text.secondary">
              Create an account to start tracking your training.
            </Typography>
          </Stack>

          {error && <Alert severity="error">{error}</Alert>}
          {success && (
            <Alert severity="success">Account created! Please login</Alert>
          )}

          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Stack>

          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={<PersonAddIcon />}
          >
            Signup
          </Button>

          <Typography align="center" color="text.secondary">
            Already have an account?{" "}
            <Link to="/login" style={{ color: "inherit", fontWeight: 700 }}>
              Sign In
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
};

export default Register;
