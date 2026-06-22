/**
 * src/components/myAuth/ui/AuthUI.jsx
 * Shared primitives used by all auth forms.
 * Uses only CSS variables — zero hardcoded colors.
 */
import { useState } from "react";

/* ─── AUTH CARD ─────────────────────────────────────── */
export function AuthCard({ children, className = "" }) {
  return (
    <div
      className={`w-full max-w-md mx-auto rounded-2xl shadow-xl border overflow-hidden ${className}`}
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      {children}
    </div>
  );
}

/* ─── AUTH HEADER ───────────────────────────────────── */
export function AuthHeader({ title, subtitle, logo }) {
  return (
    <div className="px-8 pt-8 pb-4 text-center">
      {logo && <div className="mb-4 flex justify-center">{logo}</div>}
      <h1
        className="text-2xl font-bold tracking-tight mb-1"
        style={{ color: "var(--text-primary)" }}
      >
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ─── AUTH BODY ─────────────────────────────────────── */
export function AuthBody({ children }) {
  return <div className="px-8 pb-8 space-y-4">{children}</div>;
}

/* ─── AUTH INPUT ────────────────────────────────────── */
export function AuthInput({
  label,
  id,
  error,
  type = "text",
  className = "",
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium"
          style={{ color: "var(--text-primary)" }}
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={inputType}
          className={`w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all ${className}`}
          style={{
            background: "var(--background)",
            border: `1px solid ${error ? "var(--error)" : "var(--border)"}`,
            color: "var(--text-primary)",
            boxShadow: "none",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = error
              ? "var(--error)"
              : "var(--brand-primary)";
            e.target.style.boxShadow = `0 0 0 3px ${error ? "color-mix(in srgb, var(--error) 15%, transparent)" : "color-mix(in srgb, var(--brand-primary) 15%, transparent)"}`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error
              ? "var(--error)"
              : "var(--border)";
            e.target.style.boxShadow = "none";
          }}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs select-none"
            style={{ color: "var(--text-secondary)" }}
            tabIndex={-1}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {error && (
        <p className="text-xs mt-1" style={{ color: "var(--error)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

/* ─── AUTH BUTTON ───────────────────────────────────── */
export function AuthButton({
  children,
  loading = false,
  variant = "primary",
  className = "",
  ...props
}) {
  const isPrimary = variant === "primary";

  return (
    <button
      disabled={loading}
      className={`w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${className}`}
      style={
        isPrimary
          ? {
              background: loading
                ? "var(--muted)"
                : "var(--brand-primary)",
              color: "var(--brand-primary-foreground, #fff)",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }
          : {
              background: "transparent",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
              cursor: loading ? "not-allowed" : "pointer",
            }
      }
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

/* ─── AUTH DIVIDER ──────────────────────────────────── */
export function AuthDivider({ label = "or" }) {
  return (
    <div className="flex items-center gap-3 my-1">
      <div
        className="flex-1 h-px"
        style={{ background: "var(--border)" }}
      />
      <span className="text-xs" style={{ color: "var(--muted)" }}>
        {label}
      </span>
      <div
        className="flex-1 h-px"
        style={{ background: "var(--border)" }}
      />
    </div>
  );
}

/* ─── AUTH LINK ─────────────────────────────────────── */
export function AuthLink({ children, ...props }) {
  return (
    <button
      type="button"
      className="text-sm font-medium underline-offset-2 hover:underline transition-colors"
      style={{ color: "var(--brand-primary)" }}
      {...props}
    >
      {children}
    </button>
  );
}

/* ─── AUTH ERROR BANNER ─────────────────────────────── */
export function AuthErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div
      className="px-4 py-3 rounded-lg text-sm"
      style={{
        background: "color-mix(in srgb, var(--error) 10%, transparent)",
        border: "1px solid color-mix(in srgb, var(--error) 30%, transparent)",
        color: "var(--error)",
      }}
    >
      {message}
    </div>
  );
}

/* ─── AUTH SUCCESS BANNER ───────────────────────────── */
export function AuthSuccessBanner({ message }) {
  if (!message) return null;
  return (
    <div
      className="px-4 py-3 rounded-lg text-sm"
      style={{
        background: "color-mix(in srgb, var(--success) 10%, transparent)",
        border: "1px solid color-mix(in srgb, var(--success) 30%, transparent)",
        color: "var(--success)",
      }}
    >
      {message}
    </div>
  );
}

/* ─── SPINNER ───────────────────────────────────────── */
export function Spinner({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="animate-spin"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

/* ─── OTP INPUT GROUP ───────────────────────────────── */
export function OtpInputGroup({ length = 6, value, onChange, disabled }) {
  const digits = value.split("").concat(Array(length).fill("")).slice(0, length);

  const handleChange = (i, char) => {
    const newDigits = [...digits];
    newDigits[i] = char.replace(/\D/, "").slice(-1);
    onChange(newDigits.join(""));
    // Auto focus next
    if (char && i < length - 1) {
      document.getElementById(`otp-${i + 1}`)?.focus();
    }
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      document.getElementById(`otp-${i - 1}`)?.focus();
    }
    if (e.key === "ArrowLeft" && i > 0) {
      document.getElementById(`otp-${i - 1}`)?.focus();
    }
    if (e.key === "ArrowRight" && i < length - 1) {
      document.getElementById(`otp-${i + 1}`)?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    onChange(pasted.padEnd(length, "").slice(0, length));
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((digit, i) => (
        <input
          key={i}
          id={`otp-${i}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="w-11 h-12 text-center text-lg font-bold rounded-lg outline-none transition-all"
          style={{
            background: "var(--background)",
            border: `2px solid ${digit ? "var(--brand-primary)" : "var(--border)"}`,
            color: "var(--text-primary)",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "var(--brand-primary)";
            e.target.style.boxShadow =
              "0 0 0 3px color-mix(in srgb, var(--brand-primary) 15%, transparent)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = digit
              ? "var(--brand-primary)"
              : "var(--border)";
            e.target.style.boxShadow = "none";
          }}
        />
      ))}
    </div>
  );
}