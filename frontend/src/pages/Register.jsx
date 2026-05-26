// Imports
import React, { useState } from "react";
import api from "../api/axiosConfig";
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
    <div>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <div>
          <label>
            Email:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            Password:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
        </div>
        <button type="submit">Signup</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && (
        <p style={{ color: "green" }}>Account created! Please login</p>
      )}
      <div style={{ marginTop: "10px", textAlign: "center" }}>
        <Link to="/login" style={{ textDecoration: "none", color: "#007bff" }}>
          Already have an account? Sign In
        </Link>
      </div>
    </div>
  );
};

export default Register;
