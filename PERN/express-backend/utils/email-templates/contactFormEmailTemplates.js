const brand = {
  primary: "#3b82f6",
  secondary: "#2563eb",
  dark: "#111827",
  gray: "#6b7280",
  light: "#f9fafb",
};

/* =========================================================
   SAFE HTML ESCAPE (IMPORTANT SECURITY IMPROVEMENT)
========================================================= */
const escapeHtml = (str = "") =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

/* =========================================================
   ADMIN EMAIL TEMPLATE (UPGRADED)
========================================================= */
export const getContactFormAdminTemplate = (data) => {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;background:${brand.light};padding:20px 0;">

    <div style="max-width:680px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">

      <!-- HEADER -->
      <div style="background:${brand.primary};padding:26px 20px;text-align:center;color:#fff;">
        <h1 style="margin:0;font-size:20px;letter-spacing:0.5px;">
          New Lead Received
        </h1>
        <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">
          Contact Form Submission Notification
        </p>
      </div>

      <!-- BODY -->
      <div style="padding:28px 24px;">

        <p style="font-size:14px;color:${brand.gray};margin:0 0 18px;">
          A new inquiry has been submitted from your website dashboard.
        </p>

        <!-- INFO CARD -->
        <div style="border:1px solid #eee;border-radius:10px;overflow:hidden;">

          <table style="width:100%;border-collapse:collapse;font-size:14px;">

            <tr>
              <td style="padding:10px 12px;background:#fafafa;"><strong>Name</strong></td>
              <td style="padding:10px 12px;">${escapeHtml(data?.name)}</td>
            </tr>

            <tr>
              <td style="padding:10px 12px;background:#fafafa;"><strong>Email</strong></td>
              <td style="padding:10px 12px;">
                <a href="mailto:${data?.email}" style="color:${brand.primary};text-decoration:none;">
                  ${escapeHtml(data?.email)}
                </a>
              </td>
            </tr>

            <tr>
              <td style="padding:10px 12px;background:#fafafa;"><strong>Phone</strong></td>
              <td style="padding:10px 12px;">
                <a href="tel:${data?.phone}" style="color:${brand.primary};text-decoration:none;">
                  ${escapeHtml(data?.phone)}
                </a>
              </td>
            </tr>

            <tr>
              <td style="padding:10px 12px;background:#fafafa;"><strong>Interested</strong></td>
              <td style="padding:10px 12px;">
                ${escapeHtml(data?.interested_in?.join(", ") || "-")}
              </td>
            </tr>

            <tr>
              <td style="padding:10px 12px;background:#fafafa;"><strong>Budget</strong></td>
              <td style="padding:10px 12px;">${escapeHtml(data?.budget)}</td>
            </tr>

            <tr>
              <td style="padding:10px 12px;background:#fafafa;"><strong>Subject</strong></td>
              <td style="padding:10px 12px;">${escapeHtml(data?.subject)}</td>
            </tr>

          </table>
        </div>

        <!-- MESSAGE -->
        <div style="margin-top:20px;">
          <h3 style="font-size:15px;margin-bottom:8px;color:${brand.dark};">
            Message
          </h3>

          <div style="background:#eff6ff;border-left:4px solid ${brand.primary};padding:14px;border-radius:6px;font-size:14px;line-height:1.5;color:${brand.dark};">
            ${escapeHtml(data?.message)}
          </div>
        </div>

      </div>

      <!-- FOOTER -->
      <div style="padding:14px 20px;background:#fafafa;text-align:center;font-size:12px;color:${brand.gray};">
        This email was generated automatically from your website contact system.
      </div>

    </div>
  </div>
  `;
};

/* =========================================================
   USER EMAIL TEMPLATE (UPGRADED)
========================================================= */
export const getContactFormUserTemplate = (data) => {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;background:${brand.light};padding:20px 0;">

    <div style="max-width:640px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">

      <!-- HEADER -->
      <div style="background:${brand.primary};padding:26px 20px;text-align:center;color:#fff;">
        <h1 style="margin:0;font-size:19px;">
          We've Received Your Message
        </h1>
        <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">
          Our team will respond shortly
        </p>
      </div>

      <!-- BODY -->
      <div style="padding:28px 24px;">

        <p style="font-size:14px;color:${brand.gray};margin:0 0 18px;">
          Hi <strong>${escapeHtml(data?.name || "there")}</strong>,
          thank you for reaching out. We've received your inquiry and our team is reviewing it.
        </p>

        <!-- SUMMARY CARD -->
        <div style="background:#fafafa;border:1px solid #eee;border-radius:10px;padding:16px;font-size:14px;">

          <p style="margin:6px 0;"><strong>Subject:</strong> ${escapeHtml(data?.subject)}</p>
          <p style="margin:6px 0;"><strong>Budget:</strong> ${escapeHtml(data?.budget)}</p>
          <p style="margin:6px 0;"><strong>Interested In:</strong> ${escapeHtml(data?.interested_in?.join(", ") || "-")}</p>

        </div>

        <!-- MESSAGE -->
        <div style="margin-top:18px;">
          <div style="padding:14px;background:#f9fafb;border-radius:8px;font-size:14px;line-height:1.5;color:${brand.dark};">
            ${escapeHtml(data?.message)}
          </div>
        </div>

        <!-- CTA NOTE -->
        <p style="margin-top:18px;font-size:13px;color:${brand.gray};">
          We typically respond within 24 hours.
        </p>

      </div>

      <!-- FOOTER -->
      <div style="padding:14px 20px;background:#fafafa;text-align:center;font-size:12px;color:${brand.gray};">
        © ${new Date().getFullYear()} The Nexora Digital. All rights reserved.
      </div>

    </div>
  </div>
  `;
};