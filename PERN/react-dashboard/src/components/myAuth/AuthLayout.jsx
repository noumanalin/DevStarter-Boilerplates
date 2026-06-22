/**
 * src/components/myAuth/AuthLayout.jsx
 * Centered full-page wrapper for auth forms.
 * Usage: Wrap LoginPage, RegisterPage, etc. with this.
 */
export default function AuthLayout({ children, showBranding = true }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: "var(--background)" }}
    >
      {showBranding && (
        <div className="mb-8 text-center">
          {/* Replace with your actual logo */}
          <div
            className="inline-flex items-center gap-2 text-xl font-bold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black"
              style={{
                background: "var(--brand-primary)",
                color: "var(--brand-primary-foreground, #fff)",
              }}
            >
              A
            </div>
            MyApp
          </div>
        </div>
      )}

      <div className="w-full max-w-md">{children}</div>

      <p
        className="mt-8 text-xs text-center"
        style={{ color: "var(--muted)" }}
      >
        By continuing, you agree to our{" "}
        <a
          href="/terms"
          className="underline underline-offset-2 hover:opacity-80"
          style={{ color: "var(--text-secondary)" }}
        >
          Terms
        </a>{" "}
        and{" "}
        <a
          href="/privacy"
          className="underline underline-offset-2 hover:opacity-80"
          style={{ color: "var(--text-secondary)" }}
        >
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
}