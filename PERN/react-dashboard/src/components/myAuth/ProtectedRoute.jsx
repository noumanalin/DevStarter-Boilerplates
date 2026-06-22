/**
 * src/components/myAuth/ProtectedRoute.jsx
 * Redirects unauthenticated users to /login.
 * Reads from Redux Persist — no API call needed.
 */
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { selectIsAuthenticated } from "../../store/user";

export default function ProtectedRoute({ children, redirectTo = "/login" }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return children;
}