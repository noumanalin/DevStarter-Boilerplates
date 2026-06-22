/**
 * src/components/myAuth/hooks/useAuthForms.js
 * All auth mutations (login, register, OTP, forgot/reset password, logout).
 * Components call these hooks — never raw API functions directly.
 */
import { useMutation } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";

import {
  loginApi,
  registerApi,
  verifyOtpApi,
  resendOtpApi,
  logoutApi,
  forgotPasswordApi,
  resetPasswordApi,
} from "@/api/user/authApi";
import { setCredentials, clearCredentials, selectRefreshToken } from "../../../store/user";
import { getDeviceInfo } from "../../../utils/deviceInfo";

/* ─── LOGIN ─────────────────────────────────────────── */
export const useLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (credentials) => {
      const deviceInfo = getDeviceInfo();
      return loginApi({ ...credentials, ...deviceInfo });
    },
    onSuccess: (data) => {
      const { accessToken, refreshToken, user } = data?.data ?? {};
      dispatch(setCredentials({ user, accessToken, refreshToken }));
      toast.success(data?.message || "Welcome back!");
      navigate("/dashboard", { replace: true });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Login failed. Please try again.");
    },
  });
};

/* ─── REGISTER ──────────────────────────────────────── */
export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: registerApi,
    onSuccess: (data, variables) => {
      toast.success(data?.message || "Account created! Check your email.");
      // Pass email to OTP page via state
      navigate("/verify-otp", {
        state: { email: variables.email, purpose: "EMAIL_VERIFICATION" },
      });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Registration failed.");
    },
  });
};

/* ─── VERIFY OTP ────────────────────────────────────── */
export const useVerifyOtp = ({ onSuccess: onSuccessCb } = {}) => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: verifyOtpApi,
    onSuccess: (data, variables) => {
      toast.success(data?.message || "Verified successfully!");
      if (onSuccessCb) {
        onSuccessCb(data, variables);
      } else {
        navigate("/login");
      }
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Invalid OTP. Please try again.");
    },
  });
};

/* ─── RESEND OTP ────────────────────────────────────── */
export const useResendOtp = () => {
  return useMutation({
    mutationFn: resendOtpApi,
    onSuccess: (data) => {
      toast.success(data?.message || "OTP resent! Check your email.");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to resend OTP.");
    },
  });
};

/* ─── LOGOUT ────────────────────────────────────────── */
export const useLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const refreshToken = useSelector(selectRefreshToken);

  return useMutation({
    mutationFn: () => logoutApi(refreshToken),
    onSuccess: () => {
      dispatch(clearCredentials());
      queryClient.clear();
      navigate("/login", { replace: true });
    },
    onError: () => {
      // Always clear local state even if backend call fails
      dispatch(clearCredentials());
      queryClient.clear();
      navigate("/login", { replace: true });
    },
  });
};

/* ─── FORGOT PASSWORD ───────────────────────────────── */
export const useForgotPassword = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: forgotPasswordApi,
    onSuccess: (data, variables) => {
      toast.success(data?.message || "Check your email for the OTP.");
      navigate("/verify-otp", {
        state: { email: variables.email, purpose: "PASSWORD_RESET" },
      });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Request failed.");
    },
  });
};

/* ─── RESET PASSWORD ────────────────────────────────── */
export const useResetPassword = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: resetPasswordApi,
    onSuccess: (data) => {
      toast.success(data?.message || "Password reset! Please log in.");
      navigate("/login", { replace: true });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Reset failed. Try again.");
    },
  });
};