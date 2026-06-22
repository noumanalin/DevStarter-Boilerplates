import crypto from "crypto";
import jwt from "jsonwebtoken";

/* ─── OTP ─────────────────────────────────────────── */
export const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
export const otpExpiresAt = (minutes = 10) => new Date(Date.now() + minutes * 60 * 1000);

/* ─── HASHING ─────────────────────────────────────── */
export const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

/* ─── JWT ─────────────────────────────────────────── */
export const generateAccessToken = (userId, role) =>
  jwt.sign({ user_id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
  });

export const generateRefreshToken = () => crypto.randomBytes(64).toString("hex");

/* ─── RESPONSE ─────────────────────────────────────── */
export const sendSuccess = (res, message, data = {}, statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, ...data });

export const sendError = (res, message, statusCode = 400) =>
  res.status(statusCode).json({ success: false, message });

/* ─── REQUEST META ─────────────────────────────────── */
export const getIpAddress = (req) =>
  (req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "").split(",")[0].trim();

export const normalizeDeviceType = (type = "") => {
  const t = type.toLowerCase();
  if (t === "mobile") return "MOBILE";
  if (t === "tablet") return "TABLET";
  if (t === "laptop") return "LAPTOP";
  return "DESKTOP";
};

/* ─── SESSION EXPIRY ───────────────────────────────── */
export const refreshTokenExpiresAt = () => {
  const days = parseInt(process.env.REFRESH_TOKEN_DAYS || "30", 10);
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
};