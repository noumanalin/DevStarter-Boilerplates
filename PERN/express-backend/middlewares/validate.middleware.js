/**
 * Validates that required fields are present and non-empty in req.body.
 * Usage: validateBody("email", "password")
 */
export const validateBody = (...fields) => {
  return (req, res, next) => {
    const missing = fields.filter((f) => {
      const val = req.body?.[f];
      return val === undefined || val === null || String(val).trim() === "";
    });

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(", ")}.`,
      });
    }

    next();
  };
};