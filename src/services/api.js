import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://scms-backend-dusky.vercel.app/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("scms_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for notifications and auth handling
api.interceptors.response.use(
  (response) => {
    const method = response.config?.method?.toLowerCase();
    const url = response.config?.url || "";

    // Show toast for state-mutating actions (POST, PUT, DELETE, PATCH)
    if (["post", "put", "delete", "patch"].includes(method)) {
      // Dispatch activity event for instant notification refresh across panels
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("scms-activity-event", { detail: { url, method } }));
      }

      // Don't auto-toast for auth/read endpoints where silent update is preferred
      const isSilentEndpoint =
        url.includes("/auth/login") ||
        url.includes("/auth/register") ||
        url.includes("/notifications/") && (url.includes("/read") || url.includes("/mark-all-read"));

      if (!isSilentEndpoint) {
        const msg =
          response.data?.message ||
          (response.data?.success !== false ? "Action completed successfully!" : null);
        if (msg) {
          toast.success(msg, { id: msg });
        }
      }
    }

    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";

    if (status === 401) {
      // If unauthorized on protected route, clean up token
      if (
        !window.location.pathname.includes("/login") &&
        !window.location.pathname.includes("/register") &&
        window.location.pathname !== "/"
      ) {
        localStorage.removeItem("scms_token");
        localStorage.removeItem("scms_user");
        window.location.href = "/login";
      }
    }

    // Surface notifications for all API errors
    if (!url.includes("/auth/login") && !url.includes("/auth/register")) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "An error occurred. Please try again.";
      if (errorMsg && status !== 401) {
        toast.error(errorMsg, { id: errorMsg });
      }
    }

    return Promise.reject(error);
  }
);

export default api;
