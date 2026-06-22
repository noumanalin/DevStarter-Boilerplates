import express from "express";
import isLoggedIn from "../../middlewares/isLoggedIn.js";
import { validateBody } from "../../middlewares/validate.middleware.js";
import { authRateLimiter, otpRateLimiter } from "../../middlewares/rateLimit.middleware.js";
import {
  register, verifyOtp, resendOtp, login,
  refreshAccessToken, logout, logoutAllDevices,
  forgotPassword, resetPassword,
} from "../../controllers/auth/auth.controller.js";

const router = express.Router();

router.post("/register",        authRateLimiter, validateBody("name", "email", "password"),            register);
router.post("/verify-otp",      authRateLimiter, validateBody("email", "otp"),                         verifyOtp);
router.post("/resend-otp",      otpRateLimiter,  validateBody("email", "purpose"),                     resendOtp);
router.post("/login",           authRateLimiter, validateBody("email", "password"),                    login);
router.post("/refresh-token",   validateBody("refreshToken"),                                           refreshAccessToken);
router.post("/logout",          logout);
router.post("/logout-all",      isLoggedIn(),                                                           logoutAllDevices);
router.post("/forgot-password", otpRateLimiter,  validateBody("email"),                                forgotPassword);
router.post("/reset-password",  otpRateLimiter,  validateBody("email", "otp", "newPassword"),          resetPassword);

export default router;