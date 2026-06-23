import express from "express";
import isLoggedIn from "../../middlewares/isLoggedIn.js";
import { getActiveSessions, revokeSession } from "../../controllers/auth/session.controller.js";

const router = express.Router();

router.get("/active",      isLoggedIn(), getActiveSessions);
router.delete("/:id", isLoggedIn(), revokeSession);

export default router;