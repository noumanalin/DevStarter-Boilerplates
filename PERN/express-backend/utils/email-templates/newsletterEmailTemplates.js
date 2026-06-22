const brand = {
  primary: "#3b82f6",
  secondary: "#2563eb",
  dark: "#111827",
  gray: "#6b7280",
  light: "#f9fafb",
};

export const getNewsletterEmailTemplate = (email) => {
  return `
  <div style="font-family:Arial,sans-serif;background:${brand.light};padding:20px 0;">
    <div style="max-width:600px;margin:auto;background:#fff;border-radius:10px;overflow:hidden;border:1px solid #eee;">

      <div style="background:${brand.primary};padding:24px;text-align:center;color:white;">
        <h2 style="margin:0;font-size:22px;letter-spacing:1px;">The Nexora Digital</h2>
        <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">Newsletter Subscription Confirmed</p>
      </div>

      <div style="padding:28px 24px;">
        <h2 style="color:${brand.dark};margin-top:0;">You're In! 🎉</h2>

        <p style="color:${brand.gray};font-size:15px;line-height:1.6;">
          Thank you for subscribing to <strong>The Nexora Digital Newsletter</strong>. 
          We're excited to have you on board.
        </p>

        <p style="color:${brand.gray};font-size:15px;line-height:1.6;">
          As a subscriber, you'll be the first to receive:
        </p>

        <ul style="color:${brand.gray};font-size:14px;line-height:2;">
          <li>🚀 Latest industry insights & digital trends</li>
          <li>💡 Expert tips on SEO, development & analytics</li>
          <li>📊 Exclusive case studies and success stories</li>
          <li>🎯 Special offers and early access announcements</li>
        </ul>

        <div style="background:#eff6ff;padding:14px 16px;border-left:4px solid ${brand.primary};border-radius:4px;margin-top:20px;">
          <p style="color:${brand.gray};font-size:13px;margin:0;">
            Subscribed with: <strong>${email}</strong>
          </p>
        </div>

        <p style="color:${brand.dark};font-size:14px;margin-top:24px;">
          Warm regards,<br/>
          <strong>The Nexora Digital Team</strong>
        </p>
      </div>

      <div style="background:#f3f4f6;padding:14px;text-align:center;font-size:12px;color:#6b7280;">
        © ${new Date().getFullYear()} The Nexora Digital — All rights reserved.<br/>
        If you didn't subscribe, you can safely ignore this email.
      </div>
    </div>
  </div>
  `;
};