import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

const AuthContext = createContext();

const TOKEN_KEY = "scms_token";
const USER_KEY = "scms_user";
const CLUB_KEY = "scms_club";
const CLUBS_KEY = "scms_clubs";
const PLATFORM_TOKEN_KEY = "scms_platform_token";
const PLATFORM_USER_KEY = "scms_platform_user";

const readJson = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeJson = (key, value) => {
  if (value === null || value === undefined) localStorage.removeItem(key);
  else localStorage.setItem(key, JSON.stringify(value));
};

/**
 * The session.
 *
 * There are two independent sign-ins:
 *   club      - a member / coach / club admin, scoped to one club
 *   platform  - the software owner, who sees every club
 *
 * A club token carries its club, so `activeClub` is never guessed on the client.
 * `clubs` is the list of clubs this person may enter, which is what the club
 * switcher and the post-login chooser read.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readJson(USER_KEY));
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || null);
  const [clubs, setClubs] = useState(() => readJson(CLUBS_KEY) || []);
  const [activeClub, setActiveClub] = useState(() => readJson(CLUB_KEY));

  const [platformToken, setPlatformToken] = useState(
    localStorage.getItem(PLATFORM_TOKEN_KEY) || null
  );
  const [platformUser, setPlatformUser] = useState(() => readJson(PLATFORM_USER_KEY));

  const [loading, setLoading] = useState(true);

  const persistSession = useCallback((payload) => {
    const {
      token: nextToken,
      user: nextUser,
      club = null,
      clubs: nextClubs = [],
    } = payload || {};

    if (nextToken) {
      localStorage.setItem(TOKEN_KEY, nextToken);
      setToken(nextToken);
    }

    if (nextUser) {
      setUser(nextUser);
      writeJson(USER_KEY, nextUser);
    }

    writeJson(CLUB_KEY, club);
    setActiveClub(club || null);

    writeJson(CLUBS_KEY, nextClubs);
    setClubs(nextClubs || []);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(CLUB_KEY);
    localStorage.removeItem(CLUBS_KEY);
    setToken(null);
    setUser(null);
    setActiveClub(null);
    setClubs([]);
  }, []);

  // Re-validate whatever session was stored last time.
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get("/auth/me");
        if (data.success) {
          setUser(data.user);
          writeJson(USER_KEY, data.user);
          setClubs(data.user.clubs || []);
          writeJson(CLUBS_KEY, data.user.clubs || []);
          setActiveClub(data.user.club || null);
          writeJson(CLUB_KEY, data.user.club || null);
        }
      } catch (error) {
        // 401 means the token is gone/expired; a 403 CLUB_REQUIRED means the
        // person is fine but has not chosen a club yet - keep them signed in.
        if (error.response?.status === 401) {
          clearSession();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token, clearSession]);

  /* ------------------------------------------------------------ login --- */

  const applyAuthResponse = (data) => {
    persistSession({
      token: data.token,
      user: data.user,
      club: data.club || data.user?.club || null,
      clubs: data.clubs || [],
    });
    return data;
  };

  // Members, coaches and club admins: plain email + password.
  const login = async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });

      if (!data.success) {
        return { success: false, message: data.message };
      }

      applyAuthResponse(data);

      // Several clubs: the caller routes to the chooser instead of a dashboard.
      if (data.requiresClubSelection && !data.club) {
        toast.success("Choose the club you want to open.");
        return { success: true, requiresClubSelection: true, clubs: data.clubs || [] };
      }

      toast.success(`Welcome back, ${data.user?.fullName || "there"}!`);
      return { success: true, user: data.user, club: data.club || null };
    } catch (error) {
      const message = error.response?.data?.message || "Invalid credentials. Please try again.";
      const code = error.response?.data?.code || null;

      toast.error(message);
      return { success: false, message, code };
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await api.post("/auth/register", userData);
      if (data.success) {
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed.";
      toast.error(message);
      return { success: false, message };
    }
  };

  /**
   * Switch (or first choose) the club this session works in.
   * The new token is minted by the server after it re-checks ClubUsers.
   */
  const selectClub = async (clubSlug) => {
    try {
      const { data } = await api.post("/auth/select-club", { clubSlug });

      if (!data.success) return { success: false, message: data.message };

      persistSession({
        token: data.token,
        user: data.user,
        club: data.club,
        clubs: data.clubs || clubs,
      });

      toast.success(`Now working in ${data.club?.name || "your club"}.`);
      return { success: true, club: data.club };
    } catch (error) {
      const message = error.response?.data?.message || "Could not switch club.";
      toast.error(message);
      return { success: false, message };
    }
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const { data } = await api.get("/auth/me");
      if (data.success) {
        setUser(data.user);
        writeJson(USER_KEY, data.user);
        setClubs(data.user.clubs || []);
        writeJson(CLUBS_KEY, data.user.clubs || []);
        if (data.user.club) {
          setActiveClub(data.user.club);
          writeJson(CLUB_KEY, data.user.club);
        }
      }
    } catch (error) {
      console.error("Refresh user error:", error);
    }
  };

  const updateUserProfile = async (profileData) => {
    try {
      const { data } = await api.put("/auth/profile", profileData);
      if (data.success) {
        toast.success("Profile updated successfully!");
        await refreshUser();
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update profile.";
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = ({ silent = false } = {}) => {
    clearSession();
    if (!silent) toast.success("Logged out successfully.");
  };

  /* --------------------------------------------------------- platform --- */

  const platformLogin = async ({ credential, email, password }) => {
    try {
      const { data } = await api.post("/platform/auth/login", { credential, email, password });

      if (!data.success) return { success: false, message: data.message };

      localStorage.setItem(PLATFORM_TOKEN_KEY, data.token);
      writeJson(PLATFORM_USER_KEY, data.user);
      setPlatformToken(data.token);
      setPlatformUser(data.user);

      return { success: true, user: data.user };
    } catch (error) {
      const message =
        error.response?.data?.message || "Platform sign-in failed. Please try again.";
      toast.error(message);
      return { success: false, message };
    }
  };

  const platformLogout = () => {
    localStorage.removeItem(PLATFORM_TOKEN_KEY);
    localStorage.removeItem(PLATFORM_USER_KEY);
    setPlatformToken(null);
    setPlatformUser(null);
  };

  const role = user?.role || null;
  const isAuthenticated = !!token && !!user;
  const isCoach = role === "coach";
  const hasMembership = !!user?.membership || !!user?.application;
  const isMemberActive = user?.membership?.status === "Active";
  const needsClub = isAuthenticated && !activeClub;
  const isPlatformOwner = !!platformToken && platformUser?.role === "super_admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        loading,
        clubs,
        activeClub,
        isAuthenticated,
        isCoach,
        hasMembership,
        isMemberActive,
        needsClub,
        login,
        register,
        selectClub,
        logout,
        refreshUser,
        updateUserProfile,

        platformToken,
        platformUser,
        isPlatformOwner,
        platformLogin,
        platformLogout,
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
