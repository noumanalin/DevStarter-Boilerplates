import { transporter } from "../config/nodemailer.js";
import {
  getOtpEmailTemplate,
  getNewUserEmailTemplate,
  getNewsletterEmailTemplate,
  getContactFormAdminTemplate,
  getContactFormUserTemplate,
  
  getCareerApplicationUserTemplate,
  getCareerApplicationAdminTemplate,

} from "../utils/email-templates/index.js";

/**
 * Generic send email function
 */
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


export const adminEmail = "naumanalin680@gmail.com"

/* =========================
   AUTH EMAILS
========================= */

export const sendOtpEmail = async (email, otp) => {
  return sendEmail({
    to: email,
    subject: "Your OTP Code - The Nexora Digital",
    html: getOtpEmailTemplate(otp),
  });
};

export const sendNewUserEmail = async ({ name, email, role, password }) => {
  return sendEmail({
    to: email,
    subject: "Your Account Has Been Created - The Nexora Digital",
    html: getNewUserEmailTemplate({ name, email, role, password }),
  });
};

/* =========================
   CONTACT FORM
========================= */

export const sendContactFormAdminEmail = async (data) => {
  return sendEmail({
    to: adminEmail,
    subject: `New Contact Form - ${data?.name}`,
    html: getContactFormAdminTemplate(data),
  });
};

export const sendContactFormUserEmail = async (data) => {
  return sendEmail({
    to: data?.email,
    subject: "We Received Your Message - The Nexora Digital",
    html: getContactFormUserTemplate(data),
  });
};

/* =========================
   NEWSLETTER
========================= */

export const sendNewsletterWelcomeEmail = async (email) => {
  return sendEmail({
    to: email,
    subject: "Welcome to The Nexora Newsletter",
    html: getNewsletterEmailTemplate(email),
  });
};

/* =========================
   CAREER APPLICATION
========================= */

export const sendCareerApplicationUserEmail = async (data) => {
  return sendEmail({
    to: data?.email,
    subject: `Application Received: ${data?.position_applied_for} - The Nexora Digital`,
    html: getCareerApplicationUserTemplate(data),
  });
};

export const sendCareerApplicationAdminEmail = async (data) => {
  return sendEmail({
    to: adminEmail,
    subject: `New Job Application: ${data?.position_applied_for} from ${data?.name}`,
    html: getCareerApplicationAdminTemplate(data),
  });
};