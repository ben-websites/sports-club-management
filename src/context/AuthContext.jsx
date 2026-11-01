import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("scms_token") || null);
  const [loading, setLoading] = useState(true);

  // Load user profile if token exists
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/me");
        if (response.data.success) {
          setUser(response.data.user);
          localStorage.setItem("scms_user", JSON.stringify(response.data.user));
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        localStorage.removeItem("scms_token");
        localStorage.removeItem("scms_user");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token]);

  // LOGIN
  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      if (response.data.success) {
        const { token: receivedToken, user: receivedUser } = response.data;
        localStorage.setItem("scms_token", receivedToken);
        localStorage.setItem("scms_user", JSON.stringify(receivedUser));
        setToken(receivedToken);
        setUser(receivedUser);

        // Fetch detailed profile to get current membership status
        try {
          const meRes = await api.get("/auth/me", {
            headers: { Authorization: `Bearer ${receivedToken}` },
          });
          if (meRes.data.success) {
            setUser(meRes.data.user);
            localStorage.setItem("scms_user", JSON.stringify(meRes.data.user));
          }
        } catch (e) {}

        toast.success(`Welcome back, ${receivedUser.fullName}!`);
        return { success: true, user: receivedUser };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      const msg = error.response?.data?.message || "Invalid credentials. Please try again.";
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  // REGISTER
  const register = async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);
      if (response.data.success) {
        toast.success("Account created successfully! Please log in.");
        return { success: true, message: response.data.message };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      const msg = error.response?.data?.message || "Registration failed.";
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  // REFRESH CURRENT USER
  const refreshUser = async () => {
    if (!token) return;
    try {
      const response = await api.get("/auth/me");
      if (response.data.success) {
        setUser(response.data.user);
        localStorage.setItem("scms_user", JSON.stringify(response.data.user));
      }
    } catch (error) {
      console.error("Refresh user error:", error);
    }
  };

  // UPDATE PROFILE
  const updateUserProfile = async (profileData) => {
    try {
      const response = await api.put("/auth/profile", profileData);
      if (response.data.success) {
        toast.success("Profile updated successfully!");
        await refreshUser();
        return { success: true };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to update profile.";
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("scms_token");
    localStorage.removeItem("scms_user");
    setToken(null);
    setUser(null);
    toast.success("Logged out successfully.");
  };

  const role = user?.role || null;
  const isAuthenticated = !!token && !!user;
  const hasMembership = !!user?.membership || !!user?.application;
  const isMemberActive = user?.membership?.status === "Active";

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        loading,
        isAuthenticated,
        hasMembership,
        isMemberActive,
        login,
        register,
        logout,
        refreshUser,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
