/**
 * src/components/myAuth/RoleGuard.jsx
 *
 * Works in TWO modes — same component, auto-detects which to use:
 *
 * MODE 1 — Layout Route (Outlet pattern, recommended):
 *   <Route element={<RoleGuard roles={["ADMIN", "SUPER_ADMIN"]} />}>
 *     <Route path="/admin"          element={<AdminPanel />} />
 *     <Route path="/admin/users"    element={<AdminUsers />} />
 *     <Route path="/admin/settings" element={<AdminSettings />} />
 *   </Route>
 *
 * MODE 2 — Wrapper (legacy, still works):
 *   <RoleGuard roles={["ADMIN"]} fallback={<p>Access denied.</p>}>
 *     <AdminPanel />
 *   </RoleGuard>
 *
 * Props:
 *   roles      — array of allowed roles e.g. ["ADMIN", "SUPER_ADMIN"]
 *   redirectTo — where to send unauthorized users (default: "/unauthorized")
 *   fallback   — render this instead of redirecting (wrapper mode only)
 */

import { useSelector } from "react-redux";
import { Navigate, Outlet, useOutlet } from "react-router-dom";
import { selectIsAuthenticated, selectUserRole } from "../../store/user";

export default function RoleGuard({
  roles      = [],
  children,
  fallback   = null,
  redirectTo = "/unauthorized",
}) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole        = useSelector(selectUserRole);
  const outlet          = useOutlet();
 
  const hasAccess = roles.length === 0 || roles.includes(userRole);
 
  // ── Layout route mode ────────────────────────────────
  if (outlet !== null) {
    // A child path matched — enforce auth + role.
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (!hasAccess)       return <Navigate to={redirectTo} replace />;
    return <Outlet />;
  }
 
  // ── Wrapper mode ─────────────────────────────────────
  if (children) {
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (!hasAccess) {
      if (fallback !== null) return fallback;
      return <Navigate to={redirectTo} replace />;
    }
    return children;
  }
 
  // ── No child matched and no children prop ────────────
  // Let the outer <Route path="*"> handle it.
  return null;
}
 