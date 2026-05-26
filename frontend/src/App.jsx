import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route for Login */}
        <Route path="/login" element={<Login />} />

        {/* Route for Register */}
        <Route path="/register" element={<Register />} />

        {/* Redirect root URL (/) straight to login */}
        <Route path="/" element={<Navigate to="/register" replace />} />

        {/* Catch-all 404 Route */}
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
