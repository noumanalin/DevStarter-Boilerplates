/**
 * src/api/user/useUser.js
 * TanStack Query hooks for profile, login history, active sessions.
 * Auth state itself lives in Redux — these hooks are for supplemental data only.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

import {
  getProfileApi,
  updateProfileApi,
  getLoginHistoryApi,
  getActiveSessionsApi,
  revokeSessionApi,
} from "./userApi.js";
import { updateUser } from "@/store/user";
import { logoutAllDevicesApi } from "./authApi.js";
import { clearCredentials } from "@/store/user";

/* ─── QUERY KEYS ────────────────────────────────────── */
export const USER_KEYS = {
  profile: ["user", "profile"],
  loginHistory: ["user", "loginHistory"],
  activeSessions: ["user", "activeSessions"],
};

/* ─────────────────────────────────────────────────────
   GET PROFILE
   Only used when explicitly refreshing (e.g. after profile update).
   Do NOT place this hook on every page.
───────────────────────────────────────────────────── */
export const useGetProfile = (options = {}) => {
  return useQuery({
    queryKey: USER_KEYS.profile,
    queryFn: getProfileApi,
    staleTime: 10 * 60 * 1000, // 10 min — don't spam the API
    select: (data) => data?.data?.user ?? data?.data ?? null,
    ...options,
  });
};

/* ─────────────────────────────────────────────────────
   UPDATE PROFILE
───────────────────────────────────────────────────── */
export const useUpdateProfile = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfileApi,
    onSuccess: (data) => {
      const updated = data?.data?.user ?? data?.data ?? null;
      if (updated) {
        // Sync persisted Redux state
        dispatch(updateUser(updated));
        // Refresh query cache too
        queryClient.setQueryData(USER_KEYS.profile, data);
      }
      toast.success(data?.message || "Profile updated successfully.");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to update profile.");
    },
  });
};

/* ─────────────────────────────────────────────────────
   LOGIN HISTORY
───────────────────────────────────────────────────── */
export const useGetLoginHistory = (options = {}) => {
  return useQuery({
    queryKey: USER_KEYS.loginHistory,
    queryFn: getLoginHistoryApi,
    staleTime: 5 * 60 * 1000,
    select: (data) => data?.data?.history ?? data?.data ?? [],
    ...options,
  });
};

/* ─────────────────────────────────────────────────────
   ACTIVE SESSIONS
───────────────────────────────────────────────────── */
export const useGetActiveSessions = (options = {}) => {
  return useQuery({
    queryKey: USER_KEYS.activeSessions,
    queryFn: getActiveSessionsApi,
    staleTime: 2 * 60 * 1000,
    select: (data) => data?.data ?? [],
    ...options,
  });
};

/* ─────────────────────────────────────────────────────
   REVOKE SESSION
───────────────────────────────────────────────────── */
export const useRevokeSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeSessionApi,
    onSuccess: (data) => {
      toast.success(data?.message || "Session revoked.");
      queryClient.invalidateQueries({ queryKey: USER_KEYS.activeSessions });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to revoke session.");
    },
  });
};

/* ─────────────────────────────────────────────────────
   LOGOUT ALL DEVICES
───────────────────────────────────────────────────── */
export const useLogoutAllDevices = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutAllDevicesApi,
    onSuccess: (data) => {
      toast.success(data?.message || "Logged out from all devices.");
      dispatch(clearCredentials());
      queryClient.clear();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to logout all devices.");
    },
  });
};