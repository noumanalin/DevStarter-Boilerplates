/**
 * src/api/user/authApi.js
 * Raw API call functions for authentication endpoints.
 * Import and use via useAuth.js hooks — not directly in components.
 */
import api from "../axios.js";

/* ─── REGISTER ─────────────────────────────────────── */
export const registerApi = async (data) => {
  const response = await api.post("auth/register", data);
  return response?.data;
};

/* ─── VERIFY OTP ────────────────────────────────────── */
export const verifyOtpApi = async (data) => {
  // data: { email, otp }
  const response = await api.post("auth/verify-otp", data);
  return response?.data;
};

/* ─── RESEND OTP ────────────────────────────────────── */
export const resendOtpApi = async (data) => {
  // data: { email, purpose: "EMAIL_VERIFICATION" | "PASSWORD_RESET" }
  const response = await api.post("auth/resend-otp", data);
  return response?.data;
};

/* ─── LOGIN ─────────────────────────────────────────── */
export const loginApi = async (data) => {
  // data: { email, password, ...deviceInfo }
  const response = await api.post("auth/login", data);
  return response?.data;
};

/* ─── REFRESH TOKEN ─────────────────────────────────── */
export const refreshTokenApi = async (refreshToken) => {
  const response = await api.post("auth/refresh-token", { refreshToken });
  return response?.data;
};

/* ─── LOGOUT ────────────────────────────────────────── */
export const logoutApi = async (refreshToken) => {
  const response = await api.post("auth/logout", { refreshToken });
  return response?.data;
};

/* ─── LOGOUT ALL DEVICES ────────────────────────────── */
export const logoutAllDevicesApi = async () => {
  const response = await api.post("auth/logout-all");
  return response?.data;
};

/* ─── FORGOT PASSWORD ───────────────────────────────── */
export const forgotPasswordApi = async (data) => {
  // data: { email }
  const response = await api.post("auth/forgot-password", data);
  return response?.data;
};

/* ─── RESET PASSWORD ────────────────────────────────── */
export const resetPasswordApi = async (data) => {
  // data: { email, otp, newPassword }
  const response = await api.post("auth/reset-password", data);
  return response?.data;
};