/**
 * src/components/myAuth/VerifyOtpForm.jsx
 * Handles both EMAIL_VERIFICATION and PASSWORD_RESET OTP flows.
 * Reads email + purpose from React Router location state.
 */
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AuthCard, AuthHeader, AuthBody,
  AuthButton, AuthLink, AuthErrorBanner, OtpInputGroup,
} from "./ui/AuthUI";
import { useVerifyOtp, useResendOtp } from "./hooks/useAuthForms";

const RESEND_COOLDOWN = 60;

export default function VerifyOtpForm() {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email ?? "";
  const purpose = location.state?.purpose ?? "EMAIL_VERIFICATION";

  const [otp, setOtp] = useState("");
  const [serverError, setServerError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  // If no email in state, go back to appropriate page
  useEffect(() => {
    if (!email) {
      navigate(purpose === "PASSWORD_RESET" ? "/forgot-password" : "/register");
    }
  }, [email, purpose, navigate]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const verifyOtp = useVerifyOtp({
    onSuccess: (_data, variables) => {
      if (purpose === "PASSWORD_RESET") {
        navigate("/reset-password", { state: { email: variables.email, otp: variables.otp } });
      } else {
        navigate("/login");
      }
    },
  });

  const resendOtp = useResendOtp();

  const handleSubmit = (e) => {
    e.preventDefault();
    setServerError("");
    if (otp.length < 6) return setServerError("Enter the 6-digit code.");

    verifyOtp.mutate(
      { email, otp },
      {
        onError: (err) => {
          setServerError(err?.response?.data?.message || "Invalid code. Try again.");
          setOtp("");
        },
      }
    );
  };

  const handleResend = () => {
    if (cooldown > 0) return;
    resendOtp.mutate({ email, purpose });
    setCooldown(RESEND_COOLDOWN);
  };

  const isEmailVerification = purpose === "EMAIL_VERIFICATION";

  return (
    <AuthCard>
      <AuthHeader
        title={isEmailVerification ? "Verify your email" : "Reset your password"}
        subtitle={
          <>
            We sent a 6-digit code to{" "}
            <span
              className="font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {email}
            </span>
          </>
        }
      />
      <AuthBody>
        <AuthErrorBanner message={serverError} />

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <OtpInputGroup
            length={6}
            value={otp}
            onChange={setOtp}
            disabled={verifyOtp.isPending}
          />

          <AuthButton
            type="submit"
            loading={verifyOtp.isPending}
            disabled={otp.length < 6}
          >
            {isEmailVerification ? "Verify email" : "Continue"}
          </AuthButton>
        </form>

        <div className="text-center space-y-2">
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Didn't receive a code?{" "}
            {cooldown > 0 ? (
              <span style={{ color: "var(--muted)" }}>
                Resend in {cooldown}s
              </span>
            ) : (
              <AuthLink
                onClick={handleResend}
                disabled={resendOtp.isPending}
              >
                {resendOtp.isPending ? "Sending…" : "Resend code"}
              </AuthLink>
            )}
          </p>

          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Wrong email?{" "}
            <AuthLink
              onClick={() =>
                navigate(isEmailVerification ? "/register" : "/forgot-password")
              }
            >
              Go back
            </AuthLink>
          </p>
        </div>
      </AuthBody>
    </AuthCard>
  );
}