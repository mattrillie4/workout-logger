import { useState, useEffect } from "react";
import { AuthContext } from "./authStore";

export const AuthProvider = ({ children }) => {
  // extract token from local storage
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authMessage, setAuthMessage] = useState("");
  // helper function for login
  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setAuthMessage("");
  };

  // helper function for logout
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  // useEffect for handling JWT token expiry
  useEffect(() => {
    const handleAuthExpired = (event) => {
      localStorage.removeItem("token");
      setToken(null);
      setAuthMessage(
        event.detail?.message ||
          "Your sesssion is expired, Please log in again.",
      );
    };
    window.addEventListener("auth:expired", handleAuthExpired); //listen to event from axios

    return () => {
      window.removeEventListener("auth:expired", handleAuthExpired);
    };
  }, []);

  //bool to check if user is logged in
  const isLoggedIn = !!token;

  return (
    <AuthContext.Provider
      value={{ token, isLoggedIn, login, logout, authMessage, setAuthMessage }}
    >
      {children}
    </AuthContext.Provider>
  );
};
