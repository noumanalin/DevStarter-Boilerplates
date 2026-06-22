import { getOtpEmailTemplate, getNewUserEmailTemplate } from "./email-templates/email-templates/authEmailTemplates.js";
import fs from "fs";

// OTP preview
const html = getOtpEmailTemplate("123456");
const html2 = getNewUserEmailTemplate({
  name: "Ali Khan",
  email: "ali@test.com",
  role: "ADMIN",
  password: "12345678",
});

fs.writeFileSync("new-user-preview.html", html2);

// save as HTML file
fs.writeFileSync("otp-preview.html", html);

console.log("OTP email preview generated: open otp-preview.html in browser");

// Run:
// node test-email.js

// Then open:

// otp-preview.html

// ✔ This is the simplest way to SEE design in browser.