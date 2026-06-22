/**
 * src/components/myAuth/AuthProvider.jsx
 * Wraps the app. Hydrates auth from Redux Persist (already done by redux-persist).
 * Sets up the axios token interceptors via the store.
 * Does NOT call the profile API on mount — persisted state is used directly.
 */
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectIsAuthenticated, selectAccessToken } from "../../store/user";

export default function AuthProvider({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const accessToken = useSelector(selectAccessToken);


  return <>{children}</>;
}