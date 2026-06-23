/**
 * src/components/myAuth/SignupForm.jsx
 * Optional avatar upload at registration.
 * - If a photo is chosen  → shows the preview image
 * - If no photo (or name typed) → shows initials derived from the name field
 * - Clicking the circle opens the hidden file input
 * - An ✕ button removes the chosen file
 */
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AuthCard, AuthHeader, AuthBody,
  AuthInput, AuthButton, AuthErrorBanner,
} from "./ui/AuthUI";
import { useRegister } from "./hooks/useAuthForms";

/* ─── initials helper (mirrors UserAvatar.jsx) ──────────── */
function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/* ─── password strength ─────────────────────────────────── */
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
            style={{ background: i <= strength ? colors[strength] : "var(--border)" }}
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

/* ─── avatar picker ─────────────────────────────────────── */
function AvatarPicker({ name, file, preview, onFileChange, onRemove }) {
  const inputRef = useRef(null);
  const initials = getInitials(name);
  const hasPreview = !!preview;

  return (
    <div className="flex flex-col items-center gap-2 pb-1">
      {/* Circle — click to pick file */}
      <div className="relative group">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          aria-label="Upload profile picture"
          className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center
                     font-bold text-xl select-none transition-all duration-200
                     ring-2 ring-offset-2 focus:outline-none"
          style={{
            background: hasPreview ? "transparent" : "var(--brand-primary)",
            color: "var(--brand-primary-foreground, #fff)",
            ringColor: "var(--brand-primary)",
          }}
        >
          {hasPreview ? (
            <img
              src={preview}
              alt="Avatar preview"
              className="w-full h-full object-cover"
            />
          ) : (
            initials
          )}

          {/* Hover overlay */}
          <span
            className="absolute inset-0 rounded-full flex items-center justify-center
                       opacity-0 group-hover:opacity-100 transition-opacity duration-200
                       text-xs font-semibold"
            style={{
              background: "rgba(0,0,0,0.45)",
              color: "#fff",
            }}
          >
            {hasPreview ? "Change" : "Upload"}
          </span>
        </button>

        {/* Remove button — only when a file is selected */}
        {hasPreview && (
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove photo"
            className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center
                       justify-center text-xs font-bold shadow-md transition-colors"
            style={{
              background: "var(--error)",
              color: "#fff",
            }}
          >
            ✕
          </button>
        )}
      </div>

      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
        {hasPreview
          ? file?.name?.length > 22
            ? file.name.slice(0, 19) + "…"
            : file?.name
          : "Click to add photo"}
      </p>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={onFileChange}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════
   SIGNUP FORM
═══════════════════════════════════════════ */
export default function SignupForm() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  // Avatar state
  const [avatarFile, setAvatarFile] = useState(null);    // File object
  const [avatarPreview, setAvatarPreview] = useState(""); // object URL for <img>

  const register = useRegister();

  /* ── field helpers ──────────────────────────────────── */
  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  /* ── avatar handlers ────────────────────────────────── */
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic client-side guard (backend also validates)
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setErrors((prev) => ({ ...prev, avatar: "Only JPG, PNG or WebP allowed." }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, avatar: "Image must be under 5 MB." }));
      return;
    }

    setErrors((prev) => ({ ...prev, avatar: "" }));
    setAvatarFile(file);

    // Revoke previous object URL to avoid memory leak
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(URL.createObjectURL(file));

    // Reset input value so choosing the same file again fires onChange
    e.target.value = "";
  };

  const handleRemoveAvatar = () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(null);
    setAvatarPreview("");
    setErrors((prev) => ({ ...prev, avatar: "" }));
  };

  /* ── validation ─────────────────────────────────────── */
  const validate = () => {
    const e = {};
    if (!form.name.trim())   e.name    = "Name is required.";
    if (!form.email.trim())  e.email   = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email.";
    if (!form.password)      e.password = "Password is required.";
    else if (form.password.length < 8) e.password = "At least 8 characters.";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match.";
    return e;
  };

  /* ── submit ─────────────────────────────────────────── */
  const handleSubmit = (e) => {
    e.preventDefault();
    setServerError("");
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    setErrors({});

    // Build FormData so we can include the optional avatar file.
    // The backend route now uses multer, so it expects multipart/form-data.
    const formData = new FormData();
    formData.append("name",     form.name.trim());
    formData.append("email",    form.email.trim());
    formData.append("password", form.password);
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    register.mutate(formData, {
      onError: (err) => {
        setServerError(err?.response?.data?.message || "Registration failed.");
      },
    });
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

          {/* Avatar picker — centred above the fields */}
          <AvatarPicker
            name={form.name}
            file={avatarFile}
            preview={avatarPreview}
            onFileChange={handleFileChange}
            onRemove={handleRemoveAvatar}
          />
          {errors.avatar && (
            <p className="text-xs text-center -mt-2" style={{ color: "var(--error)" }}>
              {errors.avatar}
            </p>
          )}

          <AuthInput
            id="name"
            label="Full name"
            placeholder="Enter Your Name"
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
            {form.password && <PasswordStrengthBar strength={strength} />}
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

        <p className="text-center text-sm" style={{ color: "var(--text-secondary)" }}>
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