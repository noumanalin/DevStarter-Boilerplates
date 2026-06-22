/**
 * src/components/myAuth/index.js
 * Single import point for all auth components and hooks.
 *
 * Usage:
 *   import { LoginForm, ProtectedRoute, UserButton } from "./components/myAuth";
 */

// ── Layout ────────────────────────────────────────────
export { default as AuthLayout } from "./AuthLayout";

// ── Forms ─────────────────────────────────────────────
export { default as LoginForm } from "./LoginForm";
export { default as SignupForm } from "./SignupForm";
export { default as VerifyOtpForm } from "./VerifyOtpForm";
export { default as ForgotPasswordForm } from "./ForgotPasswordForm";
export { default as ResetPasswordForm } from "./ResetPasswordForm";

// ── User UI ───────────────────────────────────────────
export { default as UserAvatar } from "./UserAvatar";
export { default as UserButton } from "./UserButton";
export { default as UserDropdown } from "./UserDropdown";

// ── Guards / Routing ──────────────────────────────────
export { default as AuthProvider } from "./AuthProvider";
export { default as ProtectedRoute } from "./ProtectedRoute";
export { default as RoleGuard } from "./RoleGuard";

// ── Data Components ───────────────────────────────────
export { default as SessionManager } from "./SessionManager";
export { default as LoginHistory } from "./LoginHistory";

// ── Shared UI Primitives ──────────────────────────────
export {
  AuthCard,
  AuthHeader,
  AuthBody,
  AuthInput,
  AuthButton,
  AuthDivider,
  AuthLink,
  AuthErrorBanner,
  AuthSuccessBanner,
  OtpInputGroup,
  Spinner,
} from "./ui/AuthUI";

// ── Hooks ─────────────────────────────────────────────
export {
  useLogin,
  useRegister,
  useVerifyOtp,
  useResendOtp,
  useLogout,
  useForgotPassword,
  useResetPassword,
} from "./hooks/useAuthForms";