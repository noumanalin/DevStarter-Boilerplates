// controllers/auth/session.controller.js
import { prisma } from "../../config/db.js";
import { sendSuccess, sendError } from "../../utils/helper.js";

/* ─── GET ACTIVE SESSIONS ─────────────────────────── */
export const getActiveSessions = async (req, res) => {
  try {
    const sessions = await prisma.session.findMany({
      where:   { userId: req.user.id, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
      select: {
        id:         true,
        ipAddress:  true,
        userAgent:  true,
        deviceType: true,
        createdAt:  true,
        expiresAt:  true,
      },
    });

    return sendSuccess(res, "Active sessions fetched.", { data: sessions });
  } catch (err) {
    console.error("getActiveSessions:", err);
    return sendError(res, "Failed to fetch sessions.", 500);
  }
};

/* ─── REVOKE SESSION ──────────────────────────────── */
export const revokeSession = async (req, res) => {
  try {
    const session = await prisma.session.findUnique({ where: { id: req.params.id } });

    if (!session) return sendError(res, "Session not found.", 404);
    if (session.userId !== req.user.id)
      return sendError(res, "You do not have permission to revoke this session.", 403);

    await prisma.session.delete({ where: { id: req.params.id } });

    return sendSuccess(res, "Session revoked successfully.");
  } catch (err) {
    console.error("revokeSession:", err);
    return sendError(res, "Failed to revoke session.", 500);
  }
};
