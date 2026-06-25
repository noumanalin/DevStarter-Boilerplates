// controllers/auth/auth.controller.js
import bcrypt from "bcrypt";
import { prisma } from "../../config/db.js";
import {
  generateOtp, otpExpiresAt, hashToken,
  generateAccessToken, generateRefreshToken,
  sendSuccess, sendError,
  getIpAddress, normalizeDeviceType, refreshTokenExpiresAt,
} from "../../utils/helper.js";
import {
  sendOtpEmail, sendWelcomeEmail,
  sendPasswordChangedEmail,
} from "../../services/emailNotifications.js";
import {
  uploadToCloudinary,
  getResourceType,
  getUploadFormat,
} from "../../config/cloudinary.js";
import { enforceLoginHistoryLimit, enforceSessionLimit } from "./enforcement.limit.js";

/* ─── helpers ──────────────────────────────────────────── */
const buildSessionPayload = (req, body, userId) => ({
  userId,
  refreshToken: "",
  ipAddress:    getIpAddress(req),
  userAgent:    body.userAgent || req.headers["user-agent"] || null,
  deviceType:   normalizeDeviceType(body.deviceType),
  expiresAt:    refreshTokenExpiresAt(),
});

const buildLoginHistoryPayload = (req, body, userId) => ({
  userId,
  ipAddress:    getIpAddress(req),
  browser:      body.browser      || null,
  os:           body.os           || null,
  deviceType:   normalizeDeviceType(body.deviceType),
  screenWidth:  body.screenWidth  ? parseInt(body.screenWidth)  : null,
  screenHeight: body.screenHeight ? parseInt(body.screenHeight) : null,
  userAgent:    body.userAgent    || req.headers["user-agent"]  || null,
});

/* ─── REGISTER ──────────────────────────────────────────── */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) return sendError(res, "An account with this email already exists.", 409);

    // ── Upload avatar to Cloudinary (optional) ───────────
    let avatar_url = null;

    if (req.file) {
      const mime         = req.file.mimetype;
      const resourceType = getResourceType(mime);
      const format       = getUploadFormat(mime, req.file.originalname);

      const result = await uploadToCloudinary(
        req.file.buffer,
        "avatars",
        undefined,    // auto-generate public_id
        resourceType,
        format
      );

      avatar_url = result.secure_url;
    }

    // ── Hash password + generate OTP ─────────────────────
    const hashed    = await bcrypt.hash(password, 12);
    const otp       = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);

    await prisma.user.create({
      data: {
        name:         name.trim(),
        email:        normalizedEmail,
        password:     hashed,
        avatar_url,
        otp:          hashedOtp,
        otp_expires:  otpExpiresAt(10),
        otp_purpose:  "EMAIL_VERIFICATION",
        otp_attempts: 0,
      },
    });

    await sendOtpEmail(normalizedEmail, otp, "EMAIL_VERIFICATION");

    return sendSuccess(
      res,
      "Account created. Please check your email for the verification code.",
      {},
      201
    );
  } catch (err) {
    console.error("register:", err);
    return sendError(res, "Registration failed. Please try again.", 500);
  }
};

/* ─── VERIFY OTP ──────────────────────────────────────── */
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) return sendError(res, "User not found.", 404);

    if (user.is_verified && user.otp_purpose === "EMAIL_VERIFICATION")
      return sendError(res, "Email is already verified.", 400);

    if (user.otp_attempts >= 5)
      return sendError(res, "Too many failed attempts. Please request a new OTP.", 429);
    if (!user.otp || !user.otp_expires)
      return sendError(res, "No OTP found. Please request a new one.", 400);
    if (new Date() > new Date(user.otp_expires))
      return sendError(res, "OTP has expired. Please request a new one.", 400);

    const isValid = await bcrypt.compare(otp, user.otp);
    if (!isValid) {
      await prisma.user.update({
        where: { id: user.id },
        data:  { otp_attempts: { increment: 1 } },
      });
      return sendError(res, "Invalid OTP. Please try again.", 400);
    }

    await prisma.user.update({
      where: { id: user.id },
      data:  { is_verified: true, otp: null, otp_expires: null, otp_purpose: null, otp_attempts: 0 },
    });

    if (user.otp_purpose === "EMAIL_VERIFICATION") {
      await sendWelcomeEmail(normalizedEmail, user.name);
    }

    return sendSuccess(res, "Email verified successfully.");
  } catch (err) {
    console.error("verifyOtp:", err);
    return sendError(res, "Verification failed. Please try again.", 500);
  }
};

/* ─── RESEND OTP ──────────────────────────────────────── */
export const resendOtp = async (req, res) => {
  try {
    const { email, purpose } = req.body;
    const normalizedEmail    = email.toLowerCase().trim();

    const validPurposes = ["EMAIL_VERIFICATION", "PASSWORD_RESET"];
    if (!validPurposes.includes(purpose))
      return sendError(res, "Invalid OTP purpose.", 400);

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) return sendError(res, "No account found with this email.", 404);

    if (purpose === "EMAIL_VERIFICATION" && user.is_verified)
      return sendError(res, "Email is already verified.", 400);

    const otp       = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);

    await prisma.user.update({
      where: { id: user.id },
      data:  { otp: hashedOtp, otp_expires: otpExpiresAt(10), otp_purpose: purpose, otp_attempts: 0 },
    });

    await sendOtpEmail(normalizedEmail, otp, purpose);

    return sendSuccess(res, "A new OTP has been sent to your email.");
  } catch (err) {
    console.error("resendOtp:", err);
    return sendError(res, "Failed to resend OTP.", 500);
  }
};

/* ─── LOGIN ───────────────────────────────────────────── */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) return sendError(res, "Invalid email or password.", 401);

    if (user.status === "BANNED") return sendError(res, "Your account has been banned. Contact support.", 403);
    if (user.status === "SUSPENDED") return sendError(res, "Your account is suspended. Contact support.", 403);
    if (user.deleted_at) return sendError(res, "This account no longer exists.", 404);
    if (!user.is_verified) return sendError(res, "Please verify your email before logging in.", 403);

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return sendError(res, "Invalid email or password.", 401);

    const accessToken = generateAccessToken(user.id, user.role);
    const rawRefreshToken = generateRefreshToken();
    const hashedRefreshToken = hashToken(rawRefreshToken);

    const sessionBase = buildSessionPayload(req, req.body, user.id);
    const historyPayload = buildLoginHistoryPayload(req, req.body, user.id);
    const now = new Date();

    // Create session and login history in a transaction
    const [session] = await prisma.$transaction([
      prisma.session.create({ 
        data: { ...sessionBase, refreshToken: hashedRefreshToken } 
      }),
      prisma.loginHistory.create({ data: historyPayload }),
      prisma.user.update({
        where: { id: user.id },
        data: { last_login_at: now },
      }),
    ]);

    // ✅ Enforce session limit (keep only 8 most recent sessions)
    // Pass the new session ID to keep it from being deleted
    await enforceSessionLimit(user.id, session.id);

    // ✅ Enforce login history limit (keep only 8 most recent)
    await enforceLoginHistoryLimit(user.id);

    return sendSuccess(res, "Logged in successfully.", {
      data: {
        accessToken,
        refreshToken: rawRefreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar_url: user.avatar_url,
          last_login_at: user.last_login_at,
        },
        session: {
          id: session.id,
          deviceType: session.deviceType,
          ipAddress: session.ipAddress,
          createdAt: session.createdAt,
          expiresAt: session.expiresAt,
        },
      },
    });
  } catch (err) {
    console.error("login:", err);
    return sendError(res, "Login failed. Please try again.", 500);
  }
};

/* ─── REFRESH ACCESS TOKEN ────────────────────────────── */
export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return sendError(res, "Refresh token is required.", 400);

    const hashedToken = hashToken(refreshToken);
    const session = await prisma.session.findUnique({
      where:   { refreshToken: hashedToken },
      include: { user: { select: { id: true, role: true, status: true, deleted_at: true } } },
    });

    if (!session) return sendError(res, "Invalid or expired session.", 401);
    if (new Date() > new Date(session.expiresAt)) {
      await prisma.session.delete({ where: { id: session.id } });
      return sendError(res, "Session expired. Please log in again.", 401);
    }

    const { user } = session;
    if (user.status === "BANNED" || user.status === "SUSPENDED" || user.deleted_at)
      return sendError(res, "Account access denied.", 403);

    const newAccessToken        = generateAccessToken(user.id, user.role);
    const newRawRefreshToken    = generateRefreshToken();
    const newHashedRefreshToken = hashToken(newRawRefreshToken);

    // Rotate token in-place — row count stays the same, no pruning needed
    await prisma.session.update({
      where: { id: session.id },
      data:  { refreshToken: newHashedRefreshToken, expiresAt: refreshTokenExpiresAt() },
    });

    return sendSuccess(res, "Token refreshed.", {
      data: { accessToken: newAccessToken, refreshToken: newRawRefreshToken },
    });
  } catch (err) {
    console.error("refreshAccessToken:", err);
    return sendError(res, "Token refresh failed.", 500);
  }
};

/* ─── LOGOUT ──────────────────────────────────────────── */
export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      const hashed = hashToken(refreshToken);
      await prisma.session.deleteMany({ where: { refreshToken: hashed } });
    }
    return sendSuccess(res, "Logged out successfully.");
  } catch (err) {
    console.error("logout:", err);
    return sendError(res, "Logout failed.", 500);
  }
};

/* ─── LOGOUT ALL DEVICES ──────────────────────────────── */
export const logoutAllDevices = async (req, res) => {
  try {
    await prisma.session.deleteMany({ where: { userId: req.user.id } });
    return sendSuccess(res, "Logged out from all devices.");
  } catch (err) {
    console.error("logoutAllDevices:", err);
    return sendError(res, "Failed to logout from all devices.", 500);
  }
};

/* ─── FORGOT PASSWORD ─────────────────────────────────── */
export const forgotPassword = async (req, res) => {
  try {
    const { email }       = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const user            = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    // Always return success to prevent email enumeration
    if (!user || user.deleted_at)
      return sendSuccess(res, "If an account with that email exists, an OTP has been sent.");

    const otp       = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);

    await prisma.user.update({
      where: { id: user.id },
      data:  { otp: hashedOtp, otp_expires: otpExpiresAt(10), otp_purpose: "PASSWORD_RESET", otp_attempts: 0 },
    });

    await sendOtpEmail(normalizedEmail, otp, "PASSWORD_RESET");

    return sendSuccess(res, "If an account with that email exists, an OTP has been sent.");
  } catch (err) {
    console.error("forgotPassword:", err);
    return sendError(res, "Request failed. Please try again.", 500);
  }
};

/* ─── RESET PASSWORD ──────────────────────────────────── */
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const normalizedEmail             = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) return sendError(res, "User not found.", 404);

    if (user.otp_purpose !== "PASSWORD_RESET")
      return sendError(res, "No password reset was requested.", 400);
    if (user.otp_attempts >= 5)
      return sendError(res, "Too many failed attempts. Please request a new OTP.", 429);
    if (!user.otp || !user.otp_expires)
      return sendError(res, "No OTP found. Please request a new one.", 400);
    if (new Date() > new Date(user.otp_expires))
      return sendError(res, "OTP has expired. Please request a new one.", 400);

    const isValid = await bcrypt.compare(otp, user.otp);
    if (!isValid) {
      await prisma.user.update({
        where: { id: user.id },
        data:  { otp_attempts: { increment: 1 } },
      });
      return sendError(res, "Invalid OTP.", 400);
    }

    const hashed = await bcrypt.hash(newPassword, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data:  { password: hashed, otp: null, otp_expires: null, otp_purpose: null, otp_attempts: 0 },
      }),
      prisma.session.deleteMany({ where: { userId: user.id } }),
    ]);

    await sendPasswordChangedEmail(normalizedEmail, user.name);

    return sendSuccess(res, "Password reset successfully. Please log in with your new password.");
  } catch (err) {
    console.error("resetPassword:", err);
    return sendError(res, "Password reset failed. Please try again.", 500);
  }
};

/* ─── CHANGE PASSWORD (authenticated) ─────────────────── */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return sendError(res, "User not found.", 404);

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) return sendError(res, "Current password is incorrect.", 401);

    if (currentPassword === newPassword)
      return sendError(res, "New password must be different from your current password.", 400);

    const hashed = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data:  { password: hashed },
    });

    await sendPasswordChangedEmail(user.email, user.name);

    return sendSuccess(res, "Password updated successfully.");
  } catch (err) {
    console.error("changePassword:", err);
    return sendError(res, "Failed to update password. Please try again.", 500);
  }
};