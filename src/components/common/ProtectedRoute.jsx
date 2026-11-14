import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PageLoader from "../dashboard/PageLoader";

const homeFor = (role) =>
  role === "admin" ? "/admin/dashboard" : role === "coach" ? "/coach/dashboard" : "/user/dashboard";

const Spinner = ({ message }) => (
  <div className="flex min-h-screen items-center justify-center bg-[#0c0c0e]">
    <PageLoader message={message} />
  </div>
);

/**
 * Guards a route tree.
 *
 *   requireClub   - the workspace: the session must be scoped to a club
 *                   (`resolveTenant` refuses everything else).
 *   platformOnly  - the software owner's console.
 */
export const ProtectedRoute = ({
  adminOnly = false,
  coachOnly = false,
  requireClub = false,
  platformOnly = false,
}) => {
  const { isAuthenticated, role, loading, activeClub, isPlatformOwner } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner message="Verifying session..." />;

  if (platformOnly) {
    if (!isPlatformOwner) {
      return <Navigate to="/platform/login" state={{ from: location.pathname }} replace />;
    }
    return <Outlet />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Signed in, but this login is not attached to a club yet: they choose one
  // (or apply to one) before any workspace page opens.
  if (requireClub && !activeClub) {
    return <Navigate to="/select-club" replace />;
  }

  if (adminOnly && role !== "admin") {
    return <Navigate to={homeFor(role)} replace />;
  }

  if (coachOnly && role !== "coach") {
    return <Navigate to={homeFor(role)} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
