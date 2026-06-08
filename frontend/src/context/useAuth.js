import { useContext } from "react";
import { AuthContext } from "./authStore";

export const useAuth = () => {
  return useContext(AuthContext);
};
