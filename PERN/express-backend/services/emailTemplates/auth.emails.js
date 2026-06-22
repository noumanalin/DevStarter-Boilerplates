// services/emailTemplate/auth.emails.js file is
import { siteUrl, projectName, brandColors } from "../../utils/info.js";

const baseLayout = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${projectName}</title>
</head>
<body style="margin:0;padding:0;background-color:${brandColors.light};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${brandColors.light};padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">

          <!-- HEADER -->
          <tr>
            <td style="background:${brandColors.primary};padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">
                ${projectName}
              </h1>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:40px 40px 32px;">
              ${content}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:${brandColors.light};padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:${brandColors.gray};">
                This email was sent by <strong>${projectName}</strong>. If you didn't request this, you can safely ignore it.
              </p>
              <p style="margin:8px 0 0;font-size:12px;color:${brandColors.gray};">
                &copy; ${new Date().getFullYear()} ${projectName}. All rights reserved.
              </p>
              <p style="margin:8px 0 0;">
                <a href="${siteUrl}" style="font-size:12px;color:${brandColors.primary};text-decoration:none;">${siteUrl}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/* ─── OTP EMAIL ─────────────────────────────────────────────── */
export const getOtpEmailTemplate = (otp, purpose = "EMAIL_VERIFICATION") => {
  const isReset = purpose === "PASSWORD_RESET";
  const heading = isReset ? "Reset Your Password" : "Verify Your Email";
  const intro = isReset
    ? "We received a request to reset your password. Use the OTP below to proceed."
    : "Welcome! Please use the OTP below to verify your email address and activate your account.";

  const content = `
    <h2 style="margin:0 0 8px;font-size:22px;color:${brandColors.dark};font-weight:700;">${heading}</h2>
    <p style="margin:0 0 28px;font-size:15px;color:${brandColors.gray};line-height:1.6;">${intro}</p>

    <div style="background:${brandColors.light};border:2px dashed ${brandColors.primary};border-radius:10px;padding:28px;text-align:center;margin-bottom:28px;">
      <p style="margin:0 0 6px;font-size:12px;color:${brandColors.gray};text-transform:uppercase;letter-spacing:1px;font-weight:600;">Your OTP Code</p>
      <p style="margin:0;font-size:42px;font-weight:800;color:${brandColors.primary};letter-spacing:10px;">${otp}</p>
    </div>

    <p style="margin:0 0 6px;font-size:14px;color:${brandColors.gray};line-height:1.6;">
      ⏱ This code expires in <strong>10 minutes</strong>.
    </p>
    <p style="margin:0;font-size:14px;color:${brandColors.gray};line-height:1.6;">
      🔒 Never share this code with anyone — ${projectName} will never ask for it.
    </p>
  `;

  return baseLayout(content);
};

/* ─── WELCOME EMAIL ─────────────────────────────────────────── */
export const getWelcomeEmailTemplate = (name) => {
  const content = `
    <h2 style="margin:0 0 8px;font-size:22px;color:${brandColors.dark};font-weight:700;">Welcome to ${projectName}, ${name || "there"}! 🎉</h2>
    <p style="margin:0 0 28px;font-size:15px;color:${brandColors.gray};line-height:1.6;">
      Your account has been verified and is ready to go. We're excited to have you on board.
    </p>

    <div style="text-align:center;margin-bottom:28px;">
      <a href="${siteUrl}" style="display:inline-block;background:${brandColors.primary};color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;letter-spacing:0.2px;">
        Get Started →
      </a>
    </div>

    <p style="margin:0;font-size:14px;color:${brandColors.gray};line-height:1.6;">
      If you have any questions, just reply to this email — we're always happy to help.
    </p>
  `;

  return baseLayout(content);
};

/* ─── PASSWORD CHANGED EMAIL ────────────────────────────────── */
export const getPasswordChangedEmailTemplate = (name) => {
  const content = `
    <h2 style="margin:0 0 8px;font-size:22px;color:${brandColors.dark};font-weight:700;">Password Changed Successfully</h2>
    <p style="margin:0 0 28px;font-size:15px;color:${brandColors.gray};line-height:1.6;">
      Hi ${name || "there"}, your password for your <strong>${projectName}</strong> account has been updated.
    </p>

    <div style="background:#fef2f2;border-left:4px solid #ef4444;border-radius:6px;padding:16px 20px;margin-bottom:28px;">
      <p style="margin:0;font-size:14px;color:#b91c1c;line-height:1.6;">
        ⚠️ If you did not make this change, please <a href="${siteUrl}" style="color:#b91c1c;font-weight:600;">secure your account immediately</a> or contact support.
      </p>
    </div>

    <p style="margin:0;font-size:14px;color:${brandColors.gray};line-height:1.6;">
      For security reasons, you have been logged out of all other devices.
    </p>
  `;

  return baseLayout(content);
};

/* ─── SUSPICIOUS LOGIN EMAIL ────────────────────────────────── */
export const getSuspiciousLoginEmailTemplate = (name, meta = {}) => {
  const content = `
    <h2 style="margin:0 0 8px;font-size:22px;color:${brandColors.dark};font-weight:700;">New Login Detected</h2>
    <p style="margin:0 0 24px;font-size:15px;color:${brandColors.gray};line-height:1.6;">
      Hi ${name || "there"}, a new sign-in to your ${projectName} account was detected.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:${brandColors.light};border-radius:8px;padding:20px;margin-bottom:24px;">
      <tr><td style="font-size:13px;color:${brandColors.gray};padding:6px 0;">🌐 <strong>IP Address</strong></td><td style="font-size:13px;color:${brandColors.dark};text-align:right;">${meta.ip || "—"}</td></tr>
      <tr><td style="font-size:13px;color:${brandColors.gray};padding:6px 0;">🖥 <strong>Device</strong></td><td style="font-size:13px;color:${brandColors.dark};text-align:right;">${meta.device || "—"}</td></tr>
      <tr><td style="font-size:13px;color:${brandColors.gray};padding:6px 0;">🌍 <strong>Browser</strong></td><td style="font-size:13px;color:${brandColors.dark};text-align:right;">${meta.browser || "—"}</td></tr>
      <tr><td style="font-size:13px;color:${brandColors.gray};padding:6px 0;">🕐 <strong>Time</strong></td><td style="font-size:13px;color:${brandColors.dark};text-align:right;">${new Date().toUTCString()}</td></tr>
    </table>

    <p style="margin:0;font-size:14px;color:${brandColors.gray};line-height:1.6;">
      If this was you, no action is needed. If not, please reset your password immediately.
    </p>
  `;

  return baseLayout(content);
};