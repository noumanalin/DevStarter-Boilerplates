import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";

const isLoggedIn = (requiredRoles = []) => {
  return async (req, res, next) => {
    try {
      /* Get Authorization Header */
      const authHeader = req.headers?.authorization;

      if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          message: "Access token missing or malformed.",
        });
      }

      /* Extract Token */
      const token = authHeader.split(" ")[1];

      /* Verify JWT */
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      /* Validate User ID in payload */
      if (!decoded?.user_id) {
        return res.status(401).json({
          success: false,
          message: "Invalid token payload.",
        });
      }

      /* Find User in DB — indexed on primary key (id) */
      const user = await prisma.user.findUnique({
        where: { id: decoded.user_id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          created_at: true,
        },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found or account has been deleted.",
        });
      }

      /* Role Authorization */
      if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to access this resource.",
        });
      }

      /* Attach User to Request */
      req.user = user;

      next();
    } catch (error) {
      console.error("Auth Middleware Error:", error);

      if (error?.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Session expired. Please log in again.",
        });
      }

      return res.status(401).json({
        success: false,
        message: "Invalid or expired token.",
      });
    }
  };
};

export default isLoggedIn;