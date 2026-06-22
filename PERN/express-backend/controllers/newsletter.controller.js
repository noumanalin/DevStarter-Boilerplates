import { prisma } from "../config/db.js";
import { sendNewsletterWelcomeEmail } from "../services/emailNotifications.js";

/** Sanitize string: trim + strip dangerous characters */
const sanitize = (value) =>
  typeof value === "string" ? value.trim().replace(/[<>"'`;]/g, "") : "";

const SITE_NAME = "Project Name";   
/* ─────────────────────────────────────────────
   1. SUBSCRIBE TO NEWSLETTER
───────────────────────────────────────────── */
export const subscribe = async (req, res) => {
  try {
    const email = sanitize(req.body?.email ?? "").toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    /* Validate email format */
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format.",
      });
    }

    /* Check if already subscribed — unique index on email */
    const existing = await prisma.newsletter.findUnique({ where: { email } });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: "You are already subscribed to our newsletter. Thank you!",
      });
    }

    /* Save new subscriber */
    const subscriber = await prisma.newsletter.create({
      data: { email },
      select: { id: true, email: true, created_at: true },
    });

    /* Send welcome email — non-blocking */
    sendNewsletterWelcomeEmail(email).catch((err) =>
      console.error("Newsletter welcome email failed:", err)
    );

    // ✅ Now using the SITE_NAME variable
    return res.status(201).json({
      success: true,
      message: `You have successfully subscribed to ${SITE_NAME} newsletter!`,
      data: { subscriber },
    });
  } catch (error) {
    console.error("Newsletter Subscribe Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

/* ─────────────────────────────────────────────
   2. GET ALL SUBSCRIBERS (Admin only)
───────────────────────────────────────────── */
export const getAllSubscribers = async (req, res) => {
  try {
    const subscribers = await prisma.newsletter.findMany({
      orderBy: { created_at: "desc" },
    });

    return res.status(200).json({
      success: true,
      message: "Subscribers retrieved successfully.",
      data: {
        total: subscribers.length,
        subscribers,
      },
    });
  } catch (error) {
    console.error("Get All Subscribers Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

/* ─────────────────────────────────────────────
   3. DELETE SUBSCRIBER (Admin only)
───────────────────────────────────────────── */
export const deleteSubscriber = async (req, res) => {
  try {
    const id = parseInt(req.params?.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscriber ID.",
      });
    }

    const existing = await prisma.newsletter.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Subscriber not found.",
      });
    }

    await prisma.newsletter.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: "Subscriber removed successfully.",
    });
  } catch (error) {
    console.error("Delete Subscriber Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

/* ─────────────────────────────────────────────
   4. UNSUBSCRIBE BY EMAIL (Self-service)
───────────────────────────────────────────── */
export const unsubscribeByEmail = async (req, res) => {
  try {
    const email = sanitize(req.body?.email ?? "").toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const existing = await prisma.newsletter.findUnique({ where: { email } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "This email is not subscribed to our newsletter.",
      });
    }

    await prisma.newsletter.delete({ where: { email } });

    return res.status(200).json({
      success: true,
      message: "You have been unsubscribed successfully. We're sorry to see you go!",
    });
  } catch (error) {
    console.error("Unsubscribe Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};