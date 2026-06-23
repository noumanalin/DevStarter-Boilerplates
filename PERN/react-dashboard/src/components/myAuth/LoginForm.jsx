/**
 * src/components/myAuth/LoginForm.jsx
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import {
  AuthCard, AuthHeader, AuthBody,
  AuthInput, AuthButton, AuthLink, AuthErrorBanner,
} from "./ui/AuthUI";
import { useLogin } from "./hooks/useAuthForms";

export default function LoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();

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
        const message = err?.response?.data?.message || "Login failed.";
        setServerError(message);
        
        // Check if the error is about email verification
        if (message.includes("verify your email")) {
          // Navigate to verify-otp page with email
          navigate("/verify-otp", { 
            state: { 
              email: form.email, 
              purpose: "EMAIL_VERIFICATION" 
            } 
          });
        }
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
            icon={<Mail className="w-4 h-4" />}
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
              icon={<Lock className="w-4 h-4" />}
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