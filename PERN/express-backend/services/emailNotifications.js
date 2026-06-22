import { transporter } from "../config/nodemailer.js";
import {
  getOtpEmailTemplate,
  getWelcomeEmailTemplate,
  getPasswordChangedEmailTemplate,
  getSuspiciousLoginEmailTemplate,
} from "./emailTemplates/auth.emails.js";

import { getNewsletterEmailTemplate } from "./emailTemplates/newsletter.emails.js"

import { adminEmail, projectName } from "../utils/info.js";

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_EMAIL}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
};

// -------------------------------- Auth System --------------------------------------------------------
export const sendOtpEmail = (email, otp, purpose = "EMAIL_VERIFICATION") =>
  sendEmail({
    to: email,
    subject: purpose === "PASSWORD_RESET" ? "Reset Your Password" : "Verify Your Email",
    html: getOtpEmailTemplate(otp, purpose),
  });

export const sendWelcomeEmail = (email, name) =>
  sendEmail({
    to: email,
    subject: `Welcome to ${process.env.SMTP_FROM_NAME}!`,
    html: getWelcomeEmailTemplate(name),
  });

export const sendPasswordChangedEmail = (email, name) =>
  sendEmail({
    to: email,
    subject: "Your Password Was Changed",
    html: getPasswordChangedEmailTemplate(name),
  });

export const sendLoginAlertEmail = (email, name, meta) =>
  sendEmail({
    to: email,
    subject: "New Login to Your Account",
    html: getSuspiciousLoginEmailTemplate(name, meta),
  });


  /* =========================
   NEWSLETTER
========================= */

export const sendNewsletterWelcomeEmail = async (email) => {
  return sendEmail({
    to: email,
    subject: `Welcome to ${projectName} Newsletter`,
    html: getNewsletterEmailTemplate(email),
  });
};