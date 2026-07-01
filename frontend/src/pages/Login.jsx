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
import LoginIcon from "@mui/icons-material/Login";

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const Login = () => {
  // set states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const { login, authMessage, setAuthMessage } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await api.post("/user/login", {
        email,
        password,
      });
      login(response.data.token);
      // set success and re-navigate
      setSuccess(true);
      setError(null);
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Check your email and password.",
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
        onSubmit={handleLogin}
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
              Login
            </Typography>
            <Typography color="text.secondary">
              Sign in to continue logging your workouts.
            </Typography>
          </Stack>
          {authMessage && (
            <Alert severity="warning" onClose={() => setAuthMessage("")}>
              {authMessage}
            </Alert>
          )}
          {error && <Alert severity="error">{error}</Alert>}
          {success && (
            <Alert severity="success">Login successful! Redirecting...</Alert>
          )}

          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              maxLength={255}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              required
            />
          </Stack>

          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={<LoginIcon />}
          >
            Sign In
          </Button>

          <Typography align="center" color="text.secondary">
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "inherit", fontWeight: 700 }}>
              Sign Up
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
};
export default Login;
