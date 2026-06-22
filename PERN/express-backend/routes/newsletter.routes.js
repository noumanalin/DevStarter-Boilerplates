import express from "express";
import isLoggedIn from "../middlewares/isLoggedIn.js";
import {
  subscribe,
  getAllSubscribers,
  deleteSubscriber,
  unsubscribeByEmail,
} from "../controllers/newsletter.controller.js";

const router = express.Router();

/* ─────────────────────────────────────────────
   PUBLIC ROUTES
───────────────────────────────────────────── */

/** POST /api/newsletter/subscribe */
router.post("/subscribe", subscribe);
router.post("/unsubscribe", unsubscribeByEmail);

/* ─────────────────────────────────────────────
   PROTECTED — Admin & Super Admin only
───────────────────────────────────────────── */
 
router.get(
  "/",
  
  getAllSubscribers
);
 
router.delete(
  "/:id",
  
  deleteSubscriber
);

export default router;