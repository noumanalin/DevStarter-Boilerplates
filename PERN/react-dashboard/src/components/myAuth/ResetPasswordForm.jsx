/**
 * src/components/myAuth/ResetPasswordForm.jsx
 * Receives email + otp from router state (set by VerifyOtpForm).
 */
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AuthCard, AuthHeader, AuthBody,
  AuthInput, AuthButton, AuthErrorBanner,
} from "./ui/AuthUI";
import { useResetPassword } from "./hooks/useAuthForms";

export default function ResetPasswordForm() {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email ?? "";
  const otp = location.state?.otp ?? "";

  const [form, setForm] = useState({ newPassword: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (!email || !otp) navigate("/forgot-password");
  }, [email, otp, navigate]);

  const resetPassword = useResetPassword();

  const validate = () => {
    const e = {};
    if (!form.newPassword) e.newPassword = "Password is required.";
    else if (form.newPassword.length < 8) e.newPassword = "At least 8 characters.";
    if (form.newPassword !== form.confirm) e.confirm = "Passwords do not match.";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setServerError("");
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    setErrors({});

    resetPassword.mutate(
      { email, otp, newPassword: form.newPassword },
      {
        onError: (err) => {
          setServerError(err?.response?.data?.message || "Reset failed.");
        },
      }
    );
  };

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <AuthCard>
      <AuthHeader
        title="Set new password"
        subtitle="Choose a strong password for your account"
      />
      <AuthBody>
        <AuthErrorBanner message={serverError} />

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <AuthInput
            id="newPassword"
            label="New password"
            type="password"
            placeholder="At least 8 characters"
            value={form.newPassword}
            onChange={set("newPassword")}
            error={errors.newPassword}
            autoComplete="new-password"
            autoFocus
          />
          <AuthInput
            id="confirm"
            label="Confirm new password"
            type="password"
            placeholder="••••••••"
            value={form.confirm}
            onChange={set("confirm")}
            error={errors.confirm}
            autoComplete="new-password"
          />

          <AuthButton type="submit" loading={resetPassword.isPending}>
            Reset password
          </AuthButton>
        </form>
      </AuthBody>
    </AuthCard>
  );
}