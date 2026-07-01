import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000", // direct link to express server
});

//  interceptor to automatically attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// add an interceptor for JWT token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || "";
    const requestUrl = error.config?.url || "";
    const hasStoredToken = Boolean(localStorage.getItem("token"));

    // check that the failed request was using a bad or expired JWT
    const authTokenFailed =
      status === 401 &&
      hasStoredToken &&
      !requestUrl.includes("/user/login") &&
      !requestUrl.includes("/user/register") &&
      (message.toLowerCase().includes("expired") ||
        message.toLowerCase().includes("invalid jwt") ||
        message.toLowerCase().includes("jwt malformed"));

    if (authTokenFailed) {
      // create event for auth provider to respond to
      localStorage.removeItem("token");
      window.dispatchEvent(
        new CustomEvent("auth:expired", {
          detail: { message: "Your session expired. Please log in again." },
        }),
      );
    }
    return Promise.reject(error);
  },
);

export default api;
