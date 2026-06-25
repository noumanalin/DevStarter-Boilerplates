// controllers/auth/user.controller.js
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
  deleteFromCloudinary,
  getResourceType,
  getUploadFormat,
  extractPublicId,
} from "../../config/cloudinary.js";

/* ─── helpers ──────────────────────────────────────────── */
const buildSessionPayload = (req, body, userId) => {
  const { browser, os, deviceType, screenWidth, screenHeight, userAgent } = body;
  return {
    userId,
    refreshToken: "", // set after token generation
    ipAddress: getIpAddress(req),
    userAgent: userAgent || req.headers["user-agent"] || null,
    deviceType: normalizeDeviceType(deviceType),
    expiresAt: refreshTokenExpiresAt(),
  };
};

const buildLoginHistoryPayload = (req, body, userId) => {
  const { browser, os, deviceType, screenWidth, screenHeight, userAgent } = body;
  return {
    userId,
    ipAddress: getIpAddress(req),
    browser: browser || null,
    os: os || null,
    deviceType: normalizeDeviceType(deviceType),
    screenWidth: screenWidth ? parseInt(screenWidth) : null,
    screenHeight: screenHeight ? parseInt(screenHeight) : null,
    userAgent: userAgent || req.headers["user-agent"] || null,
  };
};

/* ─── REGISTER ────────────────────────────────────────── */
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
        "avatars",           // Cloudinary folder
        undefined,           // let Cloudinary auto-generate the public_id
        resourceType,
        format
      );

      avatar_url = result.secure_url;
    }

    const hashed = await bcrypt.hash(password, 12);
    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);

    await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashed,
        avatar_url,
        otp: hashedOtp,
        otp_expires: otpExpiresAt(10),
        otp_purpose: "EMAIL_VERIFICATION",
        otp_attempts: 0,
      },
    });

    await sendOtpEmail(normalizedEmail, otp, "EMAIL_VERIFICATION");

    return sendSuccess(res, "Account created. Please check your email for the verification code.", {}, 201);
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

    if (user.otp_attempts >= 5) return sendError(res, "Too many failed attempts. Please request a new OTP.", 429);
    if (!user.otp || !user.otp_expires) return sendError(res, "No OTP found. Please request a new one.", 400);
    if (new Date() > new Date(user.otp_expires)) return sendError(res, "OTP has expired. Please request a new one.", 400);

    const isValid = await bcrypt.compare(otp, user.otp);
    if (!isValid) {
      await prisma.user.update({ where: { id: user.id }, data: { otp_attempts: { increment: 1 } } });
      return sendError(res, "Invalid OTP. Please try again.", 400);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { is_verified: true, otp: null, otp_expires: null, otp_purpose: null, otp_attempts: 0 },
    });

    // Send welcome email only on initial email verification
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
    const normalizedEmail = email.toLowerCase().trim();

    const validPurposes = ["EMAIL_VERIFICATION", "PASSWORD_RESET"];
    if (!validPurposes.includes(purpose)) return sendError(res, "Invalid OTP purpose.", 400);

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) return sendError(res, "No account found with this email.", 404);
    if (purpose === "EMAIL_VERIFICATION" && user.is_verified)
      return sendError(res, "Email is already verified.", 400);

    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { otp: hashedOtp, otp_expires: otpExpiresAt(10), otp_purpose: purpose, otp_attempts: 0 },
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

    await prisma.$transaction([
      prisma.session.create({
        data: { ...sessionBase, refreshToken: hashedRefreshToken },
      }),
      prisma.loginHistory.create({ data: historyPayload }),
      prisma.user.update({
        where: { id: user.id },
        data: { last_login_at: new Date() },
      }),
    ]);

    return sendSuccess(res, "Logged in successfully.", {
      data: {
        accessToken,
        refreshToken: rawRefreshToken,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar_url: user.avatar_url },
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
      where: { refreshToken: hashedToken },
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

    const newAccessToken = generateAccessToken(user.id, user.role);
    const newRawRefreshToken = generateRefreshToken();
    const newHashedRefreshToken = hashToken(newRawRefreshToken);

    await prisma.session.update({
      where: { id: session.id },
      data: { refreshToken: newHashedRefreshToken, expiresAt: refreshTokenExpiresAt() },
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
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    // Always return success to prevent email enumeration
    if (!user || user.deleted_at) {
      return sendSuccess(res, "If an account with that email exists, an OTP has been sent.");
    }

    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { otp: hashedOtp, otp_expires: otpExpiresAt(10), otp_purpose: "PASSWORD_RESET", otp_attempts: 0 },
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
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) return sendError(res, "User not found.", 404);

    if (user.otp_purpose !== "PASSWORD_RESET") return sendError(res, "No password reset was requested.", 400);
    if (user.otp_attempts >= 5) return sendError(res, "Too many failed attempts. Please request a new OTP.", 429);
    if (!user.otp || !user.otp_expires) return sendError(res, "No OTP found. Please request a new one.", 400);
    if (new Date() > new Date(user.otp_expires)) return sendError(res, "OTP has expired. Please request a new one.", 400);

    const isValid = await bcrypt.compare(otp, user.otp);
    if (!isValid) {
      await prisma.user.update({ where: { id: user.id }, data: { otp_attempts: { increment: 1 } } });
      return sendError(res, "Invalid OTP.", 400);
    }

    const hashed = await bcrypt.hash(newPassword, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashed, otp: null, otp_expires: null, otp_purpose: null, otp_attempts: 0 },
      }),
      // Invalidate all sessions on password reset
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
      data: { password: hashed },
    });

    await sendPasswordChangedEmail(user.email, user.name);

    return sendSuccess(res, "Password updated successfully.");
  } catch (err) {
    console.error("changePassword:", err);
    return sendError(res, "Failed to update password. Please try again.", 500);
  }
};

/* ─── USER PROFILE ────────────────────────────────────── */
export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatar_url: true,
        is_verified: true,
        last_login_at: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) return sendError(res, "User not found.", 404);
    if (user.deleted_at) return sendError(res, "This account no longer exists.", 404);

    return sendSuccess(res, "Profile retrieved successfully.", { data: user });
  } catch (err) {
    console.error("getProfile:", err);
    return sendError(res, "Failed to get profile.", 500);
  }
};

/* ─── UPDATE PROFILE ────────────────────────────────────── */
export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    // Check if user exists and is not deleted
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        deleted_at: true,
        avatar_url: true,
      },
    });

    if (!existingUser || existingUser.deleted_at) {
      return sendError(res, "User not found or account is deleted.", 404);
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    
    // Handle avatar upload if file is present
    if (req.file) {
      // Delete previous avatar if exists
      if (existingUser.avatar_url) {
        try {
          const publicId = extractPublicId(existingUser.avatar_url);
          if (publicId) {
            // Determine resource type from the URL or use default
            const resourceType = existingUser.avatar_url.includes('/image/upload/') ? 'image' : 'image';
            await deleteFromCloudinary(publicId, resourceType);
          }
        } catch (deleteErr) {
          console.error("Failed to delete old avatar:", deleteErr);
          // Continue with upload even if deletion fails
        }
      }

      // Upload new avatar to Cloudinary
      const mime = req.file.mimetype;
      const resourceType = getResourceType(mime);
      const format = getUploadFormat(mime, req.file.originalname);

      const result = await uploadToCloudinary(
        req.file.buffer,
        "avatars",
        undefined, // auto-generate public_id
        resourceType,
        format
      );

      updateData.avatar_url = result.secure_url;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatar_url: true,
        is_verified: true,
        last_login_at: true,
        updated_at: true,
      },
    });

    return sendSuccess(res, "Profile updated successfully.", { data: updatedUser });
  } catch (err) {
    console.error("updateProfile:", err);
    return sendError(res, "Failed to update profile.", 500);
  }
};

/* ─── GET LOGIN HISTORY ────────────────────────────────── */
export const getLoginHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const MAX_LIMIT = 8;

    const requestedLimit = parseInt(req.query.limit, 10);
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), MAX_LIMIT)
      : MAX_LIMIT;
    const offset = parseInt(req.query.offset, 10) || 0;

    const [logins, total] = await Promise.all([
      prisma.loginHistory.findMany({
        where: { userId },
        orderBy: { created_at: "desc" },
        take: limit,
        skip: offset,
        select: {
          id: true,
          ipAddress: true,
          browser: true,
          os: true,
          deviceType: true,
          userAgent: true,
          created_at: true,
        },
      }),
      prisma.loginHistory.count({ where: { userId } }),
    ]);

    return sendSuccess(res, "Login history retrieved successfully.", {
      data: logins,
      pagination: { total, limit, offset },
    });
  } catch (err) {
    console.error("getLoginHistory:", err);
    return sendError(res, "Failed to get login history.", 500);
  }
};

/* ─── ADMIN FUNCTIONS ──────────────────────────────────── */

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      role, 
      status, 
      is_verified,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = {
      deleted_at: null, // Exclude soft-deleted users
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) where.role = role;
    if (status) where.status = status;
    if (is_verified !== undefined) where.is_verified = is_verified === 'true';

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          avatar_url: true,
          is_verified: true,
          last_login_at: true,
          created_at: true,
          updated_at: true,
          _count: {
            select: {
              sessions: true,
              logins: true,
            },
          },
        },
        orderBy: { [sort_by]: sort_order },
        skip,
        take,
      }),
      prisma.user.count({ where }),
    ]);

    return sendSuccess(res, "Users retrieved successfully.", {
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("getAllUsers:", err);
    return sendError(res, "Failed to get users.", 500);
  }
};

// Get single user by ID (admin only)
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatar_url: true,
        is_verified: true,
        last_login_at: true,
        created_at: true,
        updated_at: true,
        deleted_at: true,
        _count: {
          select: {
            sessions: true,
            logins: true,
          },
        },
      },
    });

    if (!user) return sendError(res, "User not found.", 404);
    if (user.deleted_at) return sendError(res, "This account has been deleted.", 404);

    return sendSuccess(res, "User retrieved successfully.", { data: user });
  } catch (err) {
    console.error("getUserById:", err);
    return sendError(res, "Failed to get user.", 500);
  }
};

// Update user role (SUPER_ADMIN only)
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ["USER", "ADMIN", "SUPER_ADMIN", "MODERATOR", "SUPPORT", "OTHER"];
    if (!validRoles.includes(role)) {
      return sendError(res, "Invalid role. Valid roles are: " + validRoles.join(", "), 400);
    }

    // Check if user exists and is not deleted
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, deleted_at: true, role: true },
    });

    if (!user) return sendError(res, "User not found.", 404);
    if (user.deleted_at) return sendError(res, "Cannot update role of deleted account.", 404);

    // Prevent downgrading SUPER_ADMIN (optional safety)
    if (user.role === "SUPER_ADMIN" && role !== "SUPER_ADMIN") {
      return sendError(res, "Cannot change role of SUPER_ADMIN.", 403);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        updated_at: true,
      },
    });

    return sendSuccess(res, "User role updated successfully.", { data: updatedUser });
  } catch (err) {
    console.error("updateUserRole:", err);
    return sendError(res, "Failed to update user role.", 500);
  }
};

// Update user status (ADMIN, SUPER_ADMIN)
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ["ACTIVE", "SUSPENDED", "BANNED"];
    if (!validStatuses.includes(status)) {
      return sendError(res, "Invalid status. Valid statuses are: " + validStatuses.join(", "), 400);
    }

    // Check if user exists and is not deleted
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, deleted_at: true, role: true, status: true },
    });

    if (!user) return sendError(res, "User not found.", 404);
    if (user.deleted_at) return sendError(res, "Cannot update status of deleted account.", 404);

    // Prevent SUPER_ADMIN from being suspended/banned (optional safety)
    if (user.role === "SUPER_ADMIN" && status !== "ACTIVE") {
      return sendError(res, "Cannot suspend or ban SUPER_ADMIN account.", 403);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        updated_at: true,
      },
    });

    // If status is BANNED or SUSPENDED, invalidate all sessions
    if (status === "BANNED" || status === "SUSPENDED") {
      await prisma.session.deleteMany({ where: { userId: id } });
    }

    return sendSuccess(res, "User status updated successfully.", { data: updatedUser });
  } catch (err) {
    console.error("updateUserStatus:", err);
    return sendError(res, "Failed to update user status.", 500);
  }
};

// Delete user (soft delete) - SUPER_ADMIN only
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, deleted_at: true, role: true, avatar_url: true },
    });

    if (!user) return sendError(res, "User not found.", 404);
    if (user.deleted_at) return sendError(res, "User already deleted.", 400);

    // Prevent deleting SUPER_ADMIN (optional safety)
    if (user.role === "SUPER_ADMIN") {
      return sendError(res, "Cannot delete SUPER_ADMIN account.", 403);
    }

    // Delete avatar from Cloudinary if exists
    if (user.avatar_url) {
      try {
        const publicId = extractPublicId(user.avatar_url);
        if (publicId) {
          const resourceType = user.avatar_url.includes('/image/upload/') ? 'image' : 'image';
          await deleteFromCloudinary(publicId, resourceType);
        }
      } catch (deleteErr) {
        console.error("Failed to delete avatar:", deleteErr);
        // Continue with user deletion even if avatar deletion fails
      }
    }

    // Soft delete - set deleted_at and status to DELETED
    const deletedUser = await prisma.user.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        status: "DELETED",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        deleted_at: true,
      },
    });

    // Delete all sessions for this user
    await prisma.session.deleteMany({ where: { userId: id } });

    return sendSuccess(res, "User deleted successfully.", { data: deletedUser });
  } catch (err) {
    console.error("deleteUser:", err);
    return sendError(res, "Failed to delete user.", 500);
  }
};