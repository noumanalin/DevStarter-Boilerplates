/**
 * src/components/myAuth/RoleGuard.jsx
 * Restricts access based on user role.
 * Usage:
 *   <RoleGuard roles={["ADMIN", "SUPER_ADMIN"]}>
 *     <AdminPanel />
 *   </RoleGuard>
 *
 *   <RoleGuard roles={["SUPER_ADMIN"]} fallback={<p>Access denied.</p>}>
 *     <SuperAdminPanel />
 *   </RoleGuard>
 */
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { selectUserRole, selectIsAuthenticated } from "../../store/user";

export default function RoleGuard({
  roles = [],
  children,
  fallback = null,
  redirectTo = "/unauthorized",
}) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectUserRole);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const hasAccess = roles.length === 0 || roles.includes(userRole);

  if (!hasAccess) {
    // If a fallback element is provided, render it instead of redirecting
    if (fallback !== null) return fallback;
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}