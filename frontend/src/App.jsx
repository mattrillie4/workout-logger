import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NavBar from "./components/NavBar";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        //login page
        <Route path="/login" element={<Login />} />
        //register page
        <Route path="/register" element={<Register />} />
        // dashboard page
        <Route path="/dashboard" element={<Dashboard />} />
        // root url
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        //catch-all for 404 error route
        <Route
          path="*"
          element={
            <div style={{ padding: "20px" }}>
              <h2>404: Page Not Found</h2>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
