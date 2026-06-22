const brand = {
  primary: "#3b82f6",
  secondary: "#2563eb",
  dark: "#111827",
  gray: "#6b7280",
  light: "#f9fafb",
};

const escapeHtml = (str = "") =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

// Email template for candidate (without resume)
export const getCareerApplicationUserTemplate = (data) => {
  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;background:${brand.light};padding:20px 0;">
    <div style="max-width:680px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
      
      <!-- HEADER -->
      <div style="background:${brand.primary};padding:26px 20px;text-align:center;color:#fff;">
        <h1 style="margin:0;font-size:22px;letter-spacing:0.5px;">
          Application Received!
        </h1>
        <p style="margin:8px 0 0;font-size:13px;opacity:0.95;">
          Thank you for applying at The Nexora Digital
        </p>
      </div>

      <!-- BODY -->
      <div style="padding:28px 24px;">
        <p style="font-size:15px;color:${brand.dark};margin:0 0 20px;">
          Dear <strong>${escapeHtml(data?.name)}</strong>,
        </p>
        
        <p style="font-size:14px;color:${brand.gray};margin:0 0 20px;line-height:1.6;">
          Thank you for showing interest in joining our team. We have successfully received your application 
          for the position of <strong>${escapeHtml(data?.position_applied_for)}</strong>.
        </p>

        <div style="background:#f0fdf4;border-left:4px solid #22c55e;padding:14px;border-radius:6px;margin-bottom:24px;">
          <p style="margin:0;font-size:13px;color:#166534;">
            ✓ Our HR team will review your application and get back to you within 5-7 business days.
          </p>
        </div>

        <!-- APPLICATION SUMMARY -->
        <h3 style="font-size:16px;margin:0 0 12px;color:${brand.dark};border-bottom:2px solid #e5e7eb;padding-bottom:8px;">
          Application Summary
        </h3>
        
        <div style="border:1px solid #eee;border-radius:10px;overflow:hidden;margin-bottom:20px;">
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <tr>
              <td style="padding:10px 12px;background:#fafafa;width:40%;"><strong>Position Applied</strong></td>
              <td style="padding:10px 12px;">${escapeHtml(data?.position_applied_for)}</td>
            </tr>
            <tr>
              <td style="padding:10px 12px;background:#fafafa;"><strong>Email</strong></td>
              <td style="padding:10px 12px;">${escapeHtml(data?.email)}</td>
            </tr>
            <tr>
              <td style="padding:10px 12px;background:#fafafa;"><strong>Phone</strong></td>
              <td style="padding:10px 12px;">${escapeHtml(data?.phone) || "-"}</td>
            </tr>
            <tr>
              <td style="padding:10px 12px;background:#fafafa;"><strong>Expected Salary</strong></td>
              <td style="padding:10px 12px;">${escapeHtml(data?.expected_salary) || "-"}</td>
            </tr>
            <tr>
              <td style="padding:10px 12px;background:#fafafa;"><strong>Availability</strong></td>
              <td style="padding:10px 12px;">${escapeHtml(data?.availability) || "-"}</td>
            </tr>
          </table>
        </div>

        <p style="font-size:13px;color:${brand.gray};margin:20px 0 0;padding:12px 0 0;border-top:1px solid #e5e7eb;">
          <strong>Next Steps:</strong> We'll review your qualifications and experience. If shortlisted, 
          you'll hear from us for an interview. Meanwhile, feel free to check our website for updates.
        </p>
      </div>

      <!-- FOOTER -->
      <div style="padding:14px 20px;background:#fafafa;text-align:center;font-size:12px;color:${brand.gray};">
        <p style="margin:0 0 5px;">The Nexora Digital - Building Digital Excellence</p>
        <p style="margin:0;">This is an automated confirmation, please do not reply directly to this email.</p>
      </div>
    </div>
  </div>
  `;
};

// Short email template for admin notification
export const getCareerApplicationAdminTemplate = (data) => {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;background:${brand.light};padding:20px 0;">
    <div style="max-width:550px;margin:auto;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;">
      
      <div style="background:${brand.primary};padding:18px 20px;text-align:center;color:#fff;">
        <h2 style="margin:0;font-size:18px;">📄 New Job Application</h2>
      </div>

      <div style="padding:20px 24px;">
        <p style="margin:0 0 15px;font-size:14px;">
          A new application has been submitted for:
        </p>
        
        <div style="background:#fafafa;padding:12px;border-radius:6px;margin-bottom:15px;">
          <p style="margin:0 0 5px;"><strong>Position:</strong> ${escapeHtml(data?.position_applied_for)}</p>
          <p style="margin:0 0 5px;"><strong>Name:</strong> ${escapeHtml(data?.name)}</p>
          <p style="margin:0 0 5px;"><strong>Email:</strong> ${escapeHtml(data?.email)}</p>
          <p style="margin:0;"><strong>Experience:</strong> ${data?.years_of_experience || "Not specified"} years</p>
        </div>

        <div style="margin-top:15px;">
          <a href="${process.env.ADMIN_DASHBOARD_URL || '#'}/career/applications" 
             style="display:inline-block;background:${brand.primary};color:#fff;padding:8px 16px;text-decoration:none;border-radius:5px;font-size:13px;">
            View All Applications
          </a>
        </div>
      </div>
    </div>
  </div>
  `;
};