/**
 * src/components/myAuth/ForgotPasswordForm.jsx
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AuthCard, AuthHeader, AuthBody,
  AuthInput, AuthButton, AuthErrorBanner, AuthSuccessBanner,
} from "./ui/AuthUI";
import { useForgotPassword } from "./hooks/useAuthForms";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const forgotPassword = useForgotPassword();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) return setError("Email is required.");
    if (!/\S+@\S+\.\S+/.test(email)) return setError("Enter a valid email.");

    forgotPassword.mutate(
      { email },
      {
        onError: (err) => {
          setError(err?.response?.data?.message || "Request failed.");
        },
      }
    );
  };

  return (
    <AuthCard>
      <AuthHeader
        title="Forgot password?"
        subtitle="Enter your email and we'll send you a reset code"
      />
      <AuthBody>
        <AuthErrorBanner message={error} />
        <AuthSuccessBanner message={success} />

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <AuthInput
            id="email"
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError("");
            }}
            error={error && !email ? error : ""}
            autoComplete="email"
            autoFocus
          />

          <AuthButton type="submit" loading={forgotPassword.isPending}>
            Send reset code
          </AuthButton>
        </form>

        <p
          className="text-center text-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          Remember it?{" "}
          <Link
            to="/login"
            className="font-medium hover:underline underline-offset-2"
            style={{ color: "var(--brand-primary)" }}
          >
            Back to sign in
          </Link>
        </p>
      </AuthBody>
    </AuthCard>
  );
}