const brand = {
  primary: "#3b82f6",
  secondary: "#2563eb",
  dark: "#111827",
  gray: "#6b7280",
  light: "#f9fafb",
};

export const getOtpEmailTemplate = (otp) => {
  return `
  <div style="font-family:Arial,sans-serif;background:${brand.light};padding:20px 0;">
    <div style="max-width:600px;margin:auto;background:#fff;border-radius:10px;overflow:hidden;border:1px solid #eee;">
      
      <div style="background:${brand.primary};padding:24px;text-align:center;color:white;">
        <h2 style="margin:0;font-size:22px;letter-spacing:1px;">The Nexora Digital</h2>
      </div>

      <div style="padding:28px 24px;">
        <h2 style="color:${brand.dark};margin-top:0;">Password Reset Request</h2>

        <p style="color:${brand.gray};font-size:15px;line-height:1.6;">
          We received a request to reset your password. Use the OTP code below to proceed.
          This code is valid for <strong>10 minutes</strong> only.
        </p>

        <div style="text-align:center;margin:28px 0;">
          <span style="
            font-size:32px;
            letter-spacing:10px;
            font-weight:bold;
            color:${brand.primary};
            background:#eff6ff;
            padding:14px 28px;
            border-radius:8px;
            display:inline-block;
            border:2px dashed ${brand.primary};
          ">
            ${otp}
          </span>
        </div>

        <div style="background:#eff6ff;padding:14px 16px;border-left:4px solid ${brand.primary};border-radius:4px;">
          <p style="color:${brand.dark};font-size:13px;margin:0;">
            ⚠️ If you did not request a password reset, please ignore this email or contact support immediately.
          </p>
        </div>
      </div>

      <div style="background:#f3f4f6;padding:14px;text-align:center;font-size:12px;color:#6b7280;">
        © ${new Date().getFullYear()} The Nexora Digital — All rights reserved.
      </div>
    </div>
  </div>
  `;
};

export const getNewUserEmailTemplate = ({ name, email, role, password }) => {
  return `
  <div style="font-family:Arial,sans-serif;background:${brand.light};padding:20px 0;">
    <div style="max-width:600px;margin:auto;background:#fff;border-radius:10px;overflow:hidden;border:1px solid #eee;">

      <div style="background:${brand.primary};padding:24px;text-align:center;color:white;">
        <h2 style="margin:0;font-size:22px;letter-spacing:1px;">Welcome to The Nexora Digital</h2>
      </div>

      <div style="padding:28px 24px;">
        <h2 style="color:${brand.dark};margin-top:0;">Hello, ${name}! 👋</h2>

        <p style="color:${brand.gray};font-size:15px;line-height:1.6;">
          We are thrilled to welcome you to <strong>The Nexora Digital</strong> family. Your account has been 
          successfully created by our administrator. Below are your official login credentials to get you started.
        </p>

        <div style="background:#f9fafb;padding:20px;border-radius:8px;margin:24px 0;border:1px solid #e5e7eb;">
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr>
              <td style="padding:8px 0;color:${brand.gray};width:100px;"><strong>Name</strong></td>
              <td style="padding:8px 0;color:${brand.dark};">${name}</td>
            </tr>
            <tr style="border-top:1px solid #e5e7eb;">
              <td style="padding:8px 0;color:${brand.gray};"><strong>Email</strong></td>
              <td style="padding:8px 0;color:${brand.dark};">${email}</td>
            </tr>
            <tr style="border-top:1px solid #e5e7eb;">
              <td style="padding:8px 0;color:${brand.gray};"><strong>Role</strong></td>
              <td style="padding:8px 0;color:${brand.dark};">
                <span style="background:${brand.primary};color:white;padding:2px 10px;border-radius:20px;font-size:12px;">${role}</span>
              </td>
            </tr>
            <tr style="border-top:1px solid #e5e7eb;">
              <td style="padding:8px 0;color:${brand.gray};"><strong>Password</strong></td>
              <td style="padding:8px 0;color:${brand.dark};font-family:monospace;font-size:15px;font-weight:bold;">${password}</td>
            </tr>
          </table>
        </div>

        <div style="background:#eff6ff;padding:16px;border-left:4px solid ${brand.primary};border-radius:4px;margin-bottom:20px;">
          <p style="color:${brand.dark};font-size:13px;font-weight:bold;margin:0 0 6px;">🔒 Important Security Notice</p>
          <p style="color:${brand.gray};font-size:13px;margin:0;line-height:1.6;">
            This password is being shared with you <strong>only once</strong>. It is <strong>encrypted and never stored</strong> 
            in plain text in our system. We strongly recommend that you <strong>reset your password immediately</strong> 
            after your first login to ensure your account remains secure.
          </p>
        </div>

        <p style="color:${brand.gray};font-size:13px;line-height:1.6;">
          If you did not expect this account creation or believe this was done in error, 
          please contact our support team immediately.
        </p>

        <p style="color:${brand.dark};font-size:14px;margin-top:24px;">
          Warm regards,<br/>
          <strong>The Nexora Digital Team</strong>
        </p>
      </div>

      <div style="background:#f3f4f6;padding:14px;text-align:center;font-size:12px;color:#6b7280;">
        © ${new Date().getFullYear()} The Nexora Digital — All rights reserved.
      </div>
    </div>
  </div>
  `;
};