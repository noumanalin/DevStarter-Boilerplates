/**
 * src/api/user/userApi.js
 * Raw API call functions for user profile, login history, session management.
 */
import api from "../axios.js";

/* ─── GET PROFILE ───────────────────────────────────── */
export const getProfileApi = async () => {
  const response = await api.get("user/profile");
  return response?.data;
};

/* ─── UPDATE PROFILE ────────────────────────────────── */
export const updateProfileApi = async (data) => {
  // data can include FormData (for avatar) or plain object
  const isFormData = data instanceof FormData;
  const response = await api.put("user/profile", data, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
  });
  return response?.data;
};

/* ─── GET LOGIN HISTORY ─────────────────────────────── */
export const getLoginHistoryApi = async () => {
  const response = await api.get("user/login-history");
  return response?.data;
};

/* ─── GET ACTIVE SESSIONS ───────────────────────────── */
export const getActiveSessionsApi = async () => {
  const response = await api.get("session/active");
  return response?.data;
};

/* ─── REVOKE SESSION ────────────────────────────────── */
export const revokeSessionApi = async (sessionId) => {
  const response = await api.delete(`session/${sessionId}`);
  return response?.data;
};

/* ─── ADMIN: GET ALL USERS ──────────────────────────── */
export const getAllUsersApi = async () => {
  const response = await api.get("user/");
  return response?.data;
};

/* ─── ADMIN: GET USER BY ID ─────────────────────────── */
export const getUserByIdApi = async (id) => {
  const response = await api.get(`user/${id}`);
  return response?.data;
};

/* ─── ADMIN: UPDATE USER ROLE ───────────────────────── */
export const updateUserRoleApi = async ({ id, role }) => {
  const response = await api.patch(`user/${id}/role`, { role });
  return response?.data;
};

/* ─── ADMIN: UPDATE USER STATUS ─────────────────────── */
export const updateUserStatusApi = async ({ id, status }) => {
  const response = await api.patch(`user/${id}/status`, { status });
  return response?.data;
};

/* ─── ADMIN: DELETE USER ────────────────────────────── */
export const deleteUserApi = async (id) => {
  const response = await api.delete(`user/${id}`);
  return response?.data;
};