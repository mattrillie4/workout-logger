import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // extract token from local storage
  const [token, setToken] = useState(localStorage.getItem("token"));

  // helper function for login
  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  // helper function for logout
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  //bool to check if user is logged in
  const isLoggedIn = !!token;

  return (
    <AuthContext.Provider value={{ token, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
