// backend -> utils/helper.js file 
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_DAYS } from "../config/tokenConfig.js";


/* ─── OTP ─────────────────────────────────────────── */
export const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
export const otpExpiresAt = (minutes = 10) => new Date(Date.now() + minutes * 60 * 1000);

/* ─── HASHING ─────────────────────────────────────── */
export const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

/* ─── JWT ─────────────────────────────────────────── */
export const generateAccessToken = (userId, role) =>
  jwt.sign({ user_id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });

export const generateRefreshToken = () => crypto.randomBytes(64).toString("hex");

/* ─── RESPONSE ─────────────────────────────────────── */
export const sendSuccess = (res, message, data = {}, statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, ...data });

export const sendError = (res, message, statusCode = 400) =>
  res.status(statusCode).json({ success: false, message });

/* ─── REQUEST META ─────────────────────────────────── */
// export const getIpAddress = (req) =>
//   (req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "").split(",")[0].trim();

export const getIpAddress = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  let ip = forwarded ? forwarded.split(",")[0].trim() : req.socket?.remoteAddress;
  if (ip?.startsWith("::ffff:")) ip = ip.replace("::ffff:", ""); // IPv4-mapped IPv6
  if (ip === "::1") ip = "127.0.0.1";
  return ip || null;
};

export const normalizeDeviceType = (type = "") => {
  const t = type.toLowerCase();
  if (t === "mobile") return "MOBILE";
  if (t === "tablet") return "TABLET";
  if (t === "laptop") return "LAPTOP";
  return "DESKTOP";
};

/* ─── SESSION EXPIRY ───────────────────────────────── */
export const refreshTokenExpiresAt = () =>
  new Date(Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000);