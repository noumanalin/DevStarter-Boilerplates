/**
 * src/components/myAuth/ProtectedRoute.jsx
 *
 * Works in TWO modes — same component, auto-detects which to use:
 *
 * MODE 1 — Layout Route (Outlet pattern, recommended):
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/dashboard" element={<Dashboard />} />
 *     <Route path="/profile"   element={<Profile />} />
 *   </Route>
 *
 * MODE 2 — Wrapper (legacy, still works):
 *   <Route path="/dashboard" element={
 *     <ProtectedRoute>
 *       <Dashboard />
 *     </ProtectedRoute>
 *   } />
 *
 * In both modes: unauthenticated users are redirected to /login,
 * and location.state.from is set so they return after logging in.
 */
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation, useOutlet } from "react-router-dom";
import { selectIsAuthenticated } from "../../store/user";

export default function ProtectedRoute({ children, redirectTo = "/login" }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location        = useLocation();
  const outlet          = useOutlet();
 
  if (outlet !== null) {
    if (!isAuthenticated) {
      return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }
    return <Outlet />;
  }
 
  if (children) {
    if (!isAuthenticated) {
      return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }
    return children;
  }
 
  return null;
}