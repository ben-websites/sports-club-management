import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PageLoader from "../dashboard/PageLoader";

export const ProtectedRoute = ({ adminOnly = false, coachOnly = false }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0c0c0e]">
        <PageLoader message="Verifying session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && role !== "admin") {
    return <Navigate to={role === "coach" ? "/coach/dashboard" : "/user/dashboard"} replace />;
  }

  if (coachOnly && role !== "coach") {
    return <Navigate to={role === "admin" ? "/admin/dashboard" : "/user/dashboard"} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
