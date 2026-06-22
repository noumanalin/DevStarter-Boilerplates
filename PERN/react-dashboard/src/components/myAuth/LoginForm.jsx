/**
 * src/components/myAuth/LoginForm.jsx
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AuthCard, AuthHeader, AuthBody,
  AuthInput, AuthButton, AuthLink, AuthErrorBanner,
} from "./ui/AuthUI";
import { useLogin } from "./hooks/useAuthForms";

export default function LoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  const login = useLogin();

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email.";
    if (!form.password) e.password = "Password is required.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    setErrors({});

    login.mutate(form, {
      onError: (err) => {
        setServerError(err?.response?.data?.message || "Login failed.");
      },
    });
  };

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <AuthCard>
      <AuthHeader
        title="Welcome back"
        subtitle="Sign in to your account to continue"
      />
      <AuthBody>
        <AuthErrorBanner message={serverError} />

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <AuthInput
            id="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={set("email")}
            error={errors.email}
            autoComplete="email"
            autoFocus
          />
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium hover:underline underline-offset-2"
                style={{ color: "var(--brand-primary)" }}
              >
                Forgot password?
              </Link>
            </div>
            <AuthInput
              id="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={set("password")}
              error={errors.password}
              autoComplete="current-password"
            />
          </div>

          <AuthButton type="submit" loading={login.isPending}>
            Sign in
          </AuthButton>
        </form>

        <p
          className="text-center text-sm mt-2"
          style={{ color: "var(--text-secondary)" }}
        >
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium hover:underline underline-offset-2"
            style={{ color: "var(--brand-primary)" }}
          >
            Sign up
          </Link>
        </p>
      </AuthBody>
    </AuthCard>
  );
}