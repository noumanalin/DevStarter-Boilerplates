import rateLimit from "express-rate-limit";

/**
 * General API Rate Limiter
 * 100 requests per 15 minutes per IP
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes.",
  },
});

/**
 * Auth Rate Limiter (login, register)
 * 10 requests per 10 minutes per IP
 */
export const authRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts, please try again after 10 minutes.",
  },
});

/**
 * OTP / Forgot Password Rate Limiter
 * 5 requests per 15 minutes per IP
 */
export const otpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many OTP requests, please try again after 15 minutes.",
  },
});

/**
 * Newsletter Rate Limiter
 * 10 requests per 10 minutes per IP
 */
export const newsletterRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many newsletter requests, please try again after 10 minutes.",
  },
});