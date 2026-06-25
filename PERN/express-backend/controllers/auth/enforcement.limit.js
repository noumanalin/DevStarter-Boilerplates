// controllers/auth/enforcement.limit.js
import { prisma } from "../../config/db.js"; // Fixed: added .js extension

const MAX_SESSIONS_PER_USER = 8;
const MAX_LOGIN_HISTORY = 8;

export const enforceSessionLimit = async (userId, keepSessionId = null) => {
  try {
    const where = {
      userId,
      expiresAt: { gt: new Date() }, // Only active sessions
    };

    // If we have a session to keep, exclude it from deletion
    if (keepSessionId) {
      where.id = { not: keepSessionId };
    }

    // Get all active sessions for this user, ordered by creation date (oldest first)
    const activeSessions = await prisma.session.findMany({
      where,
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });

    // If we have more than MAX_SESSIONS_PER_USER, delete the oldest ones
    if (activeSessions.length > MAX_SESSIONS_PER_USER) {
      const sessionsToDelete = activeSessions.slice(0, activeSessions.length - MAX_SESSIONS_PER_USER);
      const deleteIds = sessionsToDelete.map(s => s.id);

      if (deleteIds.length > 0) {
        await prisma.session.deleteMany({
          where: { id: { in: deleteIds } },
        });
        
        console.log(`[Enforcement] Deleted ${deleteIds.length} old sessions for user ${userId}`);
      }
    }
  } catch (err) {
    console.error("[Enforcement] enforceSessionLimit error:", err);
    // Don't throw - just log the error, we don't want to break the login flow
  }
};


export const enforceLoginHistoryLimit = async (userId) => {
  try {
    // Get all login history entries for this user, ordered by creation date (oldest first)
    const historyEntries = await prisma.loginHistory.findMany({
      where: { userId },
      orderBy: { created_at: "asc" },
      select: { id: true },
    });

    // If we have more than MAX_LOGIN_HISTORY, delete the oldest ones
    if (historyEntries.length > MAX_LOGIN_HISTORY) {
      const entriesToDelete = historyEntries.slice(0, historyEntries.length - MAX_LOGIN_HISTORY);
      const deleteIds = entriesToDelete.map(h => h.id);

      if (deleteIds.length > 0) {
        await prisma.loginHistory.deleteMany({
          where: { id: { in: deleteIds } },
        });
        
        console.log(`[Enforcement] Deleted ${deleteIds.length} old login history entries for user ${userId}`);
      }
    }
  } catch (err) {
    console.error("[Enforcement] enforceLoginHistoryLimit error:", err);
    // Don't throw - just log the error
  }
};