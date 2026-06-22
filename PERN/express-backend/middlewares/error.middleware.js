export const errorHandler = (err, req, res, next) => {
  console.error("Global Error Handler:", err);

  /* Prisma Known Request Errors */
  if (err?.code?.startsWith("P")) {
    switch (err.code) {
      case "P2002":
        return res.status(409).json({
          success: false,
          message: `A record with this ${err?.meta?.target?.[0] ?? "field"} already exists.`,
        });
      case "P2025":
        return res.status(404).json({
          success: false,
          message: "Record not found.",
        });
      case "P2003":
        return res.status(400).json({
          success: false,
          message: "Invalid reference: related record not found.",
        });
      default:
        return res.status(500).json({
          success: false,
          message: "Database error occurred.",
        });
    }
  }

  /* JWT Errors */
  if (err?.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token.",
    });
  }

  if (err?.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token has expired.",
    });
  }

  /* Default fallback */
  const statusCode = err?.statusCode ?? 500;
  const message = err?.message ?? "Internal Server Error";

  return res.status(statusCode).json({
    success: false,
    message,
  });
};

/**
 * 404 Not Found Handler
 */
export const notFoundHandler = (req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};