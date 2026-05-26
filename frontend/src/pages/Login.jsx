// Imports
import React, { useState } from "react";
import api from "../api/axiosConfig";

import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  // set states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await api.post("/user/login", {
        email,
        password,
      });
      localStorage.setItem("token", response.data.token);
      // set success and re-navigate
      setSuccess(true);
      setError(null);
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Registration failed. Try a different email.",
      ); // null chaining to avoid unessecary crashes
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>
            Email:
            <input
              type="email"
              maxLength={255}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
          </label>
        </div>
        <div>
          <label>
            Password:
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              required
            />
          </label>
        </div>
        <button type="submit">Sign In</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && (
        <p style={{ color: "green" }}>Login successful! Redirecting...</p>
      )}
      <div style={{ marginTop: "10px", textAlign: "center" }}>
        <Link
          to="/register"
          style={{ textDecoration: "none", color: "#007bff" }}
        >
          Don't have an account? Sign Up
        </Link>
      </div>
    </div>
  );
};
export default Login;
