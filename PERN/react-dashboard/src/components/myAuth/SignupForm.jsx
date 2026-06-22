/**
 * src/components/myAuth/SignupForm.jsx
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AuthCard, AuthHeader, AuthBody,
  AuthInput, AuthButton, AuthErrorBanner,
} from "./ui/AuthUI";
import { useRegister } from "./hooks/useAuthForms";

export default function SignupForm() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  const register = useRegister();

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email.";
    if (!form.password) e.password = "Password is required.";
    else if (form.password.length < 8) e.password = "At least 8 characters.";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match.";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setServerError("");
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    setErrors({});

    const { confirm, ...payload } = form;
    register.mutate(payload, {
      onError: (err) => {
        setServerError(err?.response?.data?.message || "Registration failed.");
      },
    });
  };

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const strength = getPasswordStrength(form.password);

  return (
    <AuthCard>
      <AuthHeader
        title="Create an account"
        subtitle="Start your journey today"
      />
      <AuthBody>
        <AuthErrorBanner message={serverError} />

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <AuthInput
            id="name"
            label="Full name"
            placeholder="Jane Smith"
            value={form.name}
            onChange={set("name")}
            error={errors.name}
            autoComplete="name"
            autoFocus
          />
          <AuthInput
            id="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={set("email")}
            error={errors.email}
            autoComplete="email"
          />
          <div className="space-y-1">
            <AuthInput
              id="password"
              label="Password"
              type="password"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={set("password")}
              error={errors.password}
              autoComplete="new-password"
            />
            {form.password && (
              <PasswordStrengthBar strength={strength} />
            )}
          </div>
          <AuthInput
            id="confirm"
            label="Confirm password"
            type="password"
            placeholder="••••••••"
            value={form.confirm}
            onChange={set("confirm")}
            error={errors.confirm}
            autoComplete="new-password"
          />

          <AuthButton type="submit" loading={register.isPending}>
            Create account
          </AuthButton>
        </form>

        <p
          className="text-center text-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium hover:underline underline-offset-2"
            style={{ color: "var(--brand-primary)" }}
          >
            Sign in
          </Link>
        </p>
      </AuthBody>
    </AuthCard>
  );
}

/* ─── Password Strength ─────────────────────────────── */
function getPasswordStrength(password) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

function PasswordStrengthBar({ strength }) {
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = [
    "",
    "var(--error)",
    "var(--warning, orange)",
    "var(--brand-secondary, #16a34a)",
    "var(--success, #15803d)",
  ];

  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{
              background: i <= strength ? colors[strength] : "var(--border)",
            }}
          />
        ))}
      </div>
      {strength > 0 && (
        <p className="text-xs" style={{ color: colors[strength] }}>
          {labels[strength]}
        </p>
      )}
    </div>
  );
}