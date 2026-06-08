import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

// wrapper for routes to redirect if user is not authorised
const ProtectedRoute = ({ children }) => {
  //utilises custom auth
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
