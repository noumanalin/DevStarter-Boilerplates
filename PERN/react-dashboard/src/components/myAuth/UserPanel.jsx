/**
 * src/components/myAuth/UserPanel.jsx
 *
 * Clerk-style floating panel — everything inline, no page redirects.
 * Uses semantic HTML5 elements with proper ARIA labels.
 * ─────────────────────────────────────────────────────────────────────
 */
import { Component, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { selectUser, selectUserRole } from "../../store/user";
import {
  useLogout,
  useChangePassword,
  useRefreshSession,
} from "./hooks/useAuthForms";
import {
  useGetActiveSessions,
  useRevokeSession,
  useLogoutAllDevices,
  useGetLoginHistory,
  useUpdateProfile,
} from "../../api/user/useUser";
import UserAvatar from "./UserAvatar";
import { Spinner } from './ui/AuthUI';
import Icons from './ui/icons';
import FileModal from "../FileModal";

/* ── constants ───────────────────────────────────────── */
const ROLE_LABELS = {
  USER: "Member", ADMIN: "Admin", SUPER_ADMIN: "Super Admin",
  MODERATOR: "Moderator", SUPPORT: "Support", OTHER: "Other",
};
const TABS = ["Account", "Security", "History", "Sessions"];

const BROWSER_ICON_MAP = {
  Chrome: Icons.Chrome,
  Firefox: Icons.Firefox,
  Edge: Icons.Edge,
  Safari: Icons.Safari,
  "Mobile Safari": Icons.Safari,
  Brave: Icons.Brave,
  Opera: Icons.Opera,
};

const OS_ICON_MAP = {
  Windows: Icons.Windows,
  macOS: Icons.MacOS,
  "Mac OS": Icons.MacOS,
  iOS: Icons.MacOS,
  Linux: Icons.Linux,
  Ubuntu: Icons.Ubuntu,
  Android: Icons.Android,
};

/* ── Local error boundary ────────────────────────────── */
class PanelErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { console.error("UserPanel tab crashed:", error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <section
          className="p-6 text-center space-y-1"
          role="alert"
          aria-live="polite"
        >
          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            Something went wrong.
          </p>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Close and reopen this panel. If your session expired, please sign in again.
          </p>
        </section>
      );
    }
    return this.props.children;
  }
}

/* ══════════════════════════════════════════════════════
   MAIN PANEL
══════════════════════════════════════════════════════ */
export default function UserPanel({ onClose, anchor = "right" }) {
  const ref = useRef(null);
  const [tab, setTab] = useState("Account");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <>
      {/* Scoped styles */}
      <style>{`
        .panel-scroll {
          scrollbar-gutter: stable;
          scrollbar-width: thin;
          scrollbar-color: var(--border) transparent;
        }
        .panel-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .panel-scroll::-webkit-scrollbar-track { background: transparent; }
        .panel-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 8px; }
        .panel-scroll::-webkit-scrollbar-thumb:hover { background: var(--text-secondary); }
        .panel-tab:focus-visible {
          outline: 2px solid var(--brand-primary);
          outline-offset: -2px;
          border-radius: 4px;
        }
        @media (prefers-reduced-motion: reduce) {
          .panel-fade { transition: none !important; }
        }
        summary::-webkit-details-marker { display: none; }
        summary { cursor: pointer; list-style: none; }
      `}</style>

      {/* Backdrop */}
      <div
        className="panel-fade fixed inset-0 z-40 sm:hidden"
        style={{
          background: "rgba(0,0,0,0.45)",
          opacity: mounted ? 1 : 0,
          transition: "opacity 150ms ease",
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        ref={ref}
        role="dialog"
        aria-label="User account panel"
        aria-modal="true"
        className={[
          "panel-fade fixed sm:absolute z-50 flex flex-col w-[98vw] sm:w-[388px]",
          "left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2",
          "sm:left-auto sm:translate-x-0 sm:top-full sm:translate-y-0 sm:mt-3",
          anchor === "left" ? "sm:left-0" : "sm:right-0",
        ].join(" ")}
        style={{
          maxHeight: "min(600px, calc(100vh - 4rem))",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)",
          overflow: "hidden",
          opacity: mounted ? 1 : 0,
          transition: "opacity 150ms ease",
        }}
      >
        {/* Header - Always visible */}
        <PanelHeader onClose={onClose} />

        {/* Tab Bar - Always visible */}
        <TabBar tab={tab} setTab={setTab} />

        {/* Content - Scrollable with max height */}
        <section
          className="flex-1 overflow-y-auto panel-scroll"
          style={{
            overscrollBehavior: "contain",
            maxHeight: "calc(100% - 180px)",
          }}
          role="tabpanel"
          id={`panel-content-${tab}`}
          aria-labelledby={`panel-tab-${tab}`}
          tabIndex={-1}
        >
          <PanelErrorBoundary key={tab}>
            {tab === "Account" && <AccountTab onClose={onClose} />}
            {tab === "Security" && <SecurityTab />}
            {tab === "History" && <HistoryTab />}
            {tab === "Sessions" && <SessionsTab onClose={onClose} />}
          </PanelErrorBoundary>
        </section>

        {/* Footer - Always visible with Sign Out */}
        <PanelFooter onClose={onClose} />
      </aside>
    </>
  );
}

/* ── Panel header ────────────────────────────────────── */
function PanelHeader({ onClose }) {
  const user = useSelector(selectUser);
  const role = useSelector(selectUserRole);
  return (
    <header
      className="px-5 py-4 flex items-center gap-3 flex-shrink-0"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      <BorderedAvatar size={44} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate leading-tight" style={{ color: "var(--text-primary)" }}>
          {user?.name ?? "User"}
        </p>
        <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-secondary)" }}>
          {user?.email}
        </p>
        {role && <RoleBadge role={role} />}
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--surface-hover)]"
        style={{ color: "var(--text-secondary)" }}
        aria-label="Close panel"
      >
        <Icons.X className="w-4 h-4" strokeWidth={2.5} />
      </button>
    </header>
  );
}

/* ── Tab bar ──────────────────────────────────────────── */
function TabBar({ tab, setTab }) {
  const tabRefs = useRef({});

  const onKeyDown = (e, index) => {
    let nextIndex = null;
    if (e.key === "ArrowRight") nextIndex = (index + 1) % TABS.length;
    if (e.key === "ArrowLeft") nextIndex = (index - 1 + TABS.length) % TABS.length;
    if (e.key === "Home") nextIndex = 0;
    if (e.key === "End") nextIndex = TABS.length - 1;
    if (nextIndex !== null) {
      e.preventDefault();
      const nextTab = TABS[nextIndex];
      setTab(nextTab);
      tabRefs.current[nextTab]?.focus();
    }
  };

  return (
    <nav
      role="tablist"
      aria-label="Account settings"
      className="flex px-2 overflow-x-auto overflow-y-hidden panel-scroll h-10 flex-shrink-0"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      {TABS.map((t, i) => (
        <button
          key={t}
          ref={(el) => { tabRefs.current[t] = el; }}
          role="tab"
          id={`panel-tab-${t}`}
          aria-selected={tab === t}
          aria-controls={`panel-content-${t}`}
          tabIndex={tab === t ? 0 : -1}
          onClick={() => setTab(t)}
          onKeyDown={(e) => onKeyDown(e, i)}
          className="panel-tab px-3 py-2.5 text-xs font-medium transition-colors whitespace-nowrap hover:text-[var(--brand-primary)]"
          style={{
            color: tab === t ? "var(--brand-primary)" : "var(--text-secondary)",
            background: "transparent",
            borderBottom: tab === t ? "2px solid var(--brand-primary)" : "2px solid transparent",
            marginBottom: -1,
          }}
        >
          <strong>{t}</strong>
        </button>
      ))}
    </nav>
  );
}

/* ── Panel Footer ────────────────────────────────────── */
function PanelFooter({ onClose }) {
  const logout = useLogout();

  return (
    <footer
      className="px-5 py-3 flex-shrink-0"
      style={{
        borderTop: "1px solid var(--border)",
        background: "var(--surface)",
      }}
    >
      <button
        onClick={() => { onClose(); logout.mutate(); }}
        disabled={logout.isPending}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg
                   text-sm font-medium transition-all hover:bg-[color-mix(in_srgb,var(--danger)_8%,transparent)]"
        style={{
          color: "var(--danger)",
          background: "transparent",
          border: "1px solid transparent",
        }}
        aria-label="Sign out of your account"
      >
        <Icons.Logout className="w-4 h-4" />
        {logout.isPending ? "Signing out…" : "Sign out"}
      </button>
    </footer>
  );
}

/* ══════════════════════════════════════════════════════
   TAB 1 — ACCOUNT
══════════════════════════════════════════════════════ */
function AccountTab({ onClose }) {
  const user = useSelector(selectUser);
  const role = useSelector(selectUserRole);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const fileRef = useRef(null);

  const updateProfile = useUpdateProfile();
  const hasImage = !removeAvatar && Boolean(avatarPreview || user?.avatar_url);
  const avatarSrc = avatarPreview || user?.avatar_url;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) return;
    if (file.size > 5 * 1024 * 1024) return;
    setAvatarFile(file);
    setRemoveAvatar(false);
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleRemoveAvatar = () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview("");
    setAvatarFile(null);
    setRemoveAvatar(true);
  };

  const handleSave = () => {
    const fd = new FormData();
    fd.append("name", name.trim());
    if (avatarFile) fd.append("avatar", avatarFile);
    else if (removeAvatar) fd.append("removeAvatar", "true");

    updateProfile.mutate(fd, {
      onSuccess: () => {
        setEditing(false);
        setAvatarFile(null);
        setRemoveAvatar(false);
        if (avatarPreview) { URL.revokeObjectURL(avatarPreview); setAvatarPreview(""); }
      },
    });
  };

  const handleCancel = () => {
    setEditing(false);
    setName(user?.name ?? "");
    setAvatarFile(null);
    setRemoveAvatar(false);
    if (avatarPreview) { URL.revokeObjectURL(avatarPreview); setAvatarPreview(""); }
  };

  return (
    <section className="p-5 space-y-4" aria-label="Account settings">
      {/* Avatar */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative">
          {editing ? (
            <>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center select-none hover:opacity-90 transition-opacity"
                style={{
                  background: hasImage ? "transparent" : "var(--brand-primary)",
                  color: "var(--brand-primary-foreground, #fff)",
                  fontSize: 28, fontWeight: 700,
                  border: "1px solid var(--border)",
                }}
                aria-label="Change profile photo"
              >
                {hasImage ? (
                  <img
                    src={avatarSrc}
                    alt="Profile photo"
                    className="w-full h-full object-cover"
                  />
                ) : getInitials(user?.name)}
              </button>

              {hasImage && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  aria-label="Remove photo"
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center transition-all hover:border-[var(--danger)] hover:text-[var(--danger)]"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    color: "var(--text-secondary)"
                  }}
                >
                  <Icons.X className="w-3 h-3" strokeWidth={2.5} />
                </button>
              )}

              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                aria-label="Change avatar"
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                style={{
                  background: "var(--brand-primary)",
                  color: "var(--brand-primary-foreground, #fff)",
                  border: "2px solid var(--surface)",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                }}
              >
                <Icons.Pencil className="w-3.5 h-3.5" />
              </button>

              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
                aria-label="Upload profile photo"
              />
            </>
          ) : (
            <div 
              className="w-20 h-20 rounded-full overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
              style={{ border: "1px solid var(--border)" }}
              onClick={() => {
                if (avatarSrc) {
                  // Open FileModal for avatar preview
                  const modal = document.createElement('div');
                  modal.style.position = 'fixed';
                  modal.style.inset = '0';
                  modal.style.zIndex = '9999';
                  modal.style.pointerEvents = 'none';
                  document.body.appendChild(modal);
                  // Close modal on click outside
                  const closeModal = () => {
                    document.body.removeChild(modal);
                    document.removeEventListener('click', closeModal);
                  };
                  document.addEventListener('click', closeModal);
                }
              }}
            >
              <FileModal
                src={avatarSrc || ''}
                alt="Profile photo"
                type="IMAGE"
                containerClassName="w-full h-full"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* Info rows */}
      <dl className="space-y-1">
        <InfoRow label="Name">
          {editing ? (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-sm px-2 py-1 rounded-md outline-none"
              style={{
                background: "var(--background)",
                border: "1px solid var(--brand-primary)",
                color: "var(--text-primary)",
                boxShadow: "0 0 0 3px color-mix(in srgb, var(--brand-primary) 15%, transparent)",
              }}
              autoFocus
              aria-label="Your name"
            />
          ) : (
            <span className="text-sm" style={{ color: "var(--text-primary)" }}>{user?.name ?? "—"}</span>
          )}
        </InfoRow>

        <InfoRow label="Email">
          <span className="text-sm truncate" style={{ color: "var(--text-primary)" }}>{user?.email}</span>
        </InfoRow>

        <InfoRow label="Role">
          <RoleBadge role={role} />
        </InfoRow>

        <InfoRow label="User ID">
          <span className="text-xs font-mono truncate" style={{ color: "var(--text-secondary)" }}>
            {user?.id}
          </span>
        </InfoRow>
      </dl>

      {/* Buttons */}
      {editing ? (
        <div className="flex gap-2">
          <PanelButton onClick={handleSave} loading={updateProfile.isPending} variant="primary">
            Save changes
          </PanelButton>
          <PanelButton onClick={handleCancel} variant="outline">Cancel</PanelButton>
        </div>
      ) : (
        <PanelButton onClick={() => setEditing(true)} variant="outline">Edit profile</PanelButton>
      )}
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   TAB 2 — SECURITY
══════════════════════════════════════════════════════ */
function SecurityTab() {
  return (
    <section className="p-5 space-y-5" aria-label="Security settings">
      <RefreshSessionCard />
      <hr style={{ borderTop: "1px solid var(--border)" }} />
      <ChangePasswordForm />
    </section>
  );
}

function RefreshSessionCard() {
  const refreshSession = useRefreshSession();

  return (
    <details
      className="group p-2 rounded-xl space-y-2.5"
      style={{ background: "var(--background)", border: "1px solid var(--border)" }}
    >
      <summary
        className="flex items-center justify-between cursor-pointer list-none"
        style={{ color: "var(--text-primary)" }}
        aria-label="Toggle session refresh details"
      >
        <strong>Refresh session</strong>
        <span className="transition-transform duration-200 group-open:rotate-180">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </span>
      </summary>

      <div className="space-y-3 pt-1">
        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
          Your session renews itself automatically when needed. Use this only if you're
          being signed out unexpectedly and want to extend your access right now without
          logging in again.
        </p>
        <PanelButton
          onClick={() => refreshSession.mutate()}
          loading={refreshSession.isPending}
          variant="outline"
        >
          Refresh now
        </PanelButton>
      </div>
    </details>
  );
}

function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState("");

  const changePassword = useChangePassword({
    onSuccess: () => {
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      setError("");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPassword.length < 8) return setError("New password must be at least 8 characters.");
    if (newPassword !== confirmPassword) return setError("New passwords do not match.");
    setError("");
    changePassword.mutate({ currentPassword, newPassword });
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Update password</p>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
          Use a strong password you don't use anywhere else.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3" aria-label="Change password form">
        <PasswordField
          label="Current password"
          value={currentPassword}
          onChange={setCurrentPassword}
          show={showCurrent}
          onToggleShow={() => setShowCurrent((v) => !v)}
          autoComplete="current-password"
        />

        <div>
          <PasswordField
            label="New password"
            value={newPassword}
            onChange={setNewPassword}
            show={showNew}
            onToggleShow={() => setShowNew((v) => !v)}
            autoComplete="new-password"
          />
          <PasswordStrengthMeter password={newPassword} />
        </div>

        <PasswordField
          label="Confirm new password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          show={showNew}
          autoComplete="new-password"
        />

        {error && <p className="text-xs" style={{ color: "var(--danger)" }} role="alert">{error}</p>}

        <PanelButton type="submit" loading={changePassword.isPending} variant="primary">
          Update password
        </PanelButton>
      </form>
    </div>
  );
}

function getPasswordStrength(pw) {
  if (!pw) return null;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  const levels = [
    { label: "Very weak", color: "#ef4444" },
    { label: "Weak", color: "#f97316" },
    { label: "Fair", color: "#eab308" },
    { label: "Good", color: "#22c55e" },
    { label: "Strong", color: "#16a34a" },
  ];
  const idx = Math.min(score, levels.length - 1);
  return { filled: idx + 1, total: levels.length, ...levels[idx] };
}

function PasswordStrengthMeter({ password }) {
  const strength = getPasswordStrength(password);
  if (!strength) return null;
  return (
    <div className="mt-1.5 space-y-1" aria-live="polite" role="progressbar" aria-valuenow={strength.filled} aria-valuemax={strength.total}>
      <div className="flex gap-1">
        {Array.from({ length: strength.total }).map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-colors"
            style={{ background: i < strength.filled ? strength.color : "var(--border)" }}
          />
        ))}
      </div>
      <p className="text-xs" style={{ color: strength.color }}>{strength.label}</p>
    </div>
  );
}

function PasswordField({ label, value, onChange, show, onToggleShow, autoComplete }) {
  return (
    <label className="block">
      <span className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>
        {label}
      </span>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          required
          className="w-full text-sm px-3 py-2 pr-9 rounded-lg outline-none transition-shadow"
          style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--brand-primary)";
            e.currentTarget.style.boxShadow = "0 0 0 3px color-mix(in srgb, var(--brand-primary) 15%, transparent)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
        {onToggleShow && (
          <button
            type="button"
            onClick={onToggleShow}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:text-[var(--text-primary)]"
            style={{ color: "var(--text-secondary)" }}
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <Icons.EyeOff className="w-4 h-4" /> : <Icons.Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </label>
  );
}

/* ══════════════════════════════════════════════════════
   TAB 3 — LOGIN HISTORY
══════════════════════════════════════════════════════ */
function HistoryTab() {
  const user = useSelector(selectUser);
  const { data: history = [], isLoading, isError, refetch, isRefetching } = useGetLoginHistory({ enabled: true });

  const downloadCSV = () => {
    if (!history.length) return;

    // Headers
    const headers = [
      "Date/Time",
      "IP Address",
      "Browser",
      "OS",
      "Device Type",
      "Screen Resolution"
    ];

    // Rows
    const rows = history.map(entry => [
      entry.created_at ? new Date(entry.created_at).toLocaleString() : "",
      entry.ipAddress || "",
      entry.browser || "",
      entry.os || "",
      entry.deviceType || "",
      entry.screenWidth && entry.screenHeight ? `${entry.screenWidth}×${entry.screenHeight}` : ""
    ]);

    // Combine user info + table
    const userInfo = [
      ["User Information"],
      ["Name", user?.name || ""],
      ["Email", user?.email || ""],
      ["Role", user?.role || ""],
      [""], // empty row separator
      ["Login History"],
      headers,
      ...rows
    ];

    // Convert to CSV
    const csvContent = userInfo
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    // Download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `login-history-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="p-4 space-y-2" aria-label="Login history">
      <div className="flex items-center justify-between pb-1">
        <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
          {isLoading ? "Loading…" : `${history.length} recent logins`}
        </p>
        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <button
              onClick={downloadCSV}
              className="p-1.5 rounded-md transition-colors hover:bg-[var(--surface-hover)]"
              aria-label="Download CSV"
              title="Download CSV"
            >
              <Icons.Download className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
            </button>
          )}
          <button
            onClick={() => refetch()}
            disabled={isRefetching || isLoading}
            className="p-1.5 rounded-md transition-colors hover:bg-[var(--surface-hover)] disabled:opacity-50"
            aria-label="Refresh login history"
          >
            <Icons.Refresh
              className="w-4 h-4"
              spinning={isRefetching || isLoading}
              style={{ color: "var(--text-secondary)" }}
            />
          </button>
        </div>
      </div>

      {isLoading && <PanelSkeleton rows={3} />}
      {isError && <ErrorMsg>Failed to load history.</ErrorMsg>}
      {!isLoading && !isError && history.length === 0 && (
        <EmptyMsg>No login history found.</EmptyMsg>
      )}

      {history.map((entry) => (
        <HistoryCard key={entry.id} entry={entry} />
      ))}
    </section>
  );
}

function HistoryCard({ entry }) {
  const when = entry.created_at
    ? new Date(entry.created_at).toLocaleDateString(undefined, {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    })
    : "—";

  const resolution =
    entry.screenWidth && entry.screenHeight
      ? `${entry.screenWidth}×${entry.screenHeight}`
      : null;

  return (
    <article
      className="p-3 rounded-xl space-y-2"
      style={{ background: "var(--background)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-start gap-2">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: "color-mix(in srgb, var(--brand-primary) 10%, transparent)", color: "var(--brand-primary)" }}
          aria-hidden="true"
        >
          <Icons.Device type={entry.deviceType} className="w-3.5 h-3.5" />
        </div>

        <div className="flex-1 min-w-0 flex items-center gap-1.5 flex-wrap">
          {entry.browser && <BrowserBadge name={entry.browser} />}
          {entry.os && <OsBadge name={entry.os} />}
        </div>

        <span
          className="text-xs flex-shrink-0 px-1.5 py-0.5 rounded-full mt-0.5"
          style={{
            background: "color-mix(in srgb, var(--border) 70%, transparent)",
            color: "var(--text-secondary)",
          }}
        >
          {entry.deviceType ?? "OTHER"}
        </span>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {entry.ipAddress && (
          <div className="flex items-center gap-1">
            <Icons.Ip className="w-3.5 h-3.5" />
            <span className="text-xs font-mono" style={{ color: "var(--text-secondary)" }}>
              {entry.ipAddress}
            </span>
          </div>
        )}
        {resolution && (
          <div className="flex items-center gap-1">
            <Icons.Screen className="w-3.5 h-3.5" />
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {resolution}
            </span>
          </div>
        )}
      </div>

      <p className="text-xs" style={{ color: "var(--muted, var(--text-secondary))" }}>
        {when}
      </p>
    </article>
  );
}

function InfoBadge({ icon: Icon, label }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md font-medium"
      style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
    >
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      {label}
    </span>
  );
}

function BrowserBadge({ name }) {
  return <InfoBadge icon={BROWSER_ICON_MAP[name] || Icons.Globe} label={name} />;
}

function OsBadge({ name }) {
  return <InfoBadge icon={OS_ICON_MAP[name] || Icons.Desktop} label={name} />;
}

/* ══════════════════════════════════════════════════════
   TAB 4 — SESSIONS
══════════════════════════════════════════════════════ */
function SessionsTab({ onClose }) {
  const user = useSelector(selectUser);
  const { data: sessions = [], isLoading, isError, refetch, isRefetching } = useGetActiveSessions({ enabled: true });
  const revokeSession = useRevokeSession();
  const logoutAll = useLogoutAllDevices();

  const downloadCSV = () => {
    if (!sessions.length) return;

    const headers = [
      "Device Type",
      "IP Address",
      "Started",
      "Expires",
      "Status"
    ];

    const rows = sessions.map(session => [
      session.deviceType || "Unknown",
      session.ipAddress || "",
      session.createdAt ? new Date(session.createdAt).toLocaleString() : "",
      session.expiresAt ? new Date(session.expiresAt).toLocaleString() : "",
      new Date(session.expiresAt) > new Date() ? "Active" : "Expired"
    ]);

    const userInfo = [
      ["User Information"],
      ["Name", user?.name || ""],
      ["Email", user?.email || ""],
      ["Role", user?.role || ""],
      [""],
      ["Active Sessions"],
      headers,
      ...rows
    ];

    const csvContent = userInfo
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `sessions-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="p-4 space-y-3" aria-label="Active sessions">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
          {isLoading ? "Loading…" : `${sessions.length} active session${sessions.length !== 1 ? "s" : ""}`}
        </p>
        <div className="flex items-center gap-2">
          {sessions.length > 0 && (
            <button
              onClick={downloadCSV}
              className="p-1.5 rounded-md transition-colors hover:bg-[var(--surface-hover)]"
              aria-label="Download CSV"
              title="Download CSV"
            >
              <Icons.Download className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
            </button>
          )}
          <button
            onClick={() => refetch()}
            disabled={isRefetching || isLoading}
            className="p-1.5 rounded-md transition-colors hover:bg-[var(--surface-hover)] disabled:opacity-50"
            aria-label="Refresh sessions"
          >
            <Icons.Refresh
              className="w-4 h-4"
              spinning={isRefetching || isLoading}
              style={{ color: "var(--text-secondary)" }}
            />
          </button>
          {sessions.length > 1 && (
            <button
              onClick={() => { onClose(); logoutAll.mutate(); }}
              disabled={logoutAll.isPending}
              className="text-xs font-medium px-2 py-1 rounded-md transition-all hover:bg-[color-mix(in_srgb,var(--danger)_8%,transparent)]"
              style={{ color: "var(--danger)", border: "1px solid var(--danger)", background: "transparent" }}
              aria-label="Sign out from all devices"
            >
              Sign out all
            </button>
          )}
        </div>
      </div>

      {isLoading && <PanelSkeleton rows={2} />}
      {isError && <ErrorMsg>Failed to load sessions.</ErrorMsg>}
      {!isLoading && !isError && sessions.length === 0 && (
        <EmptyMsg>No active sessions found.</EmptyMsg>
      )}

      {sessions.map((session) => (
        <SessionCard
          key={session.id}
          session={session}
          onRevoke={() => revokeSession.mutate(session.id)}
          revoking={revokeSession.isPending && revokeSession.variables === session.id}
        />
      ))}
    </section>
  );
}

function SessionCard({ session, onRevoke, revoking }) {
  const when = session.createdAt
    ? new Date(session.createdAt).toLocaleDateString(undefined, {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    })
    : "—";
  const expires = session.expiresAt
    ? new Date(session.expiresAt).toLocaleDateString(undefined, {
      month: "short", day: "numeric", year: "numeric",
    })
    : null;

  return (
    <article
      className="flex items-start gap-3 p-3 rounded-xl"
      style={{ background: "var(--background)", border: "1px solid var(--border)" }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: "color-mix(in srgb, var(--brand-primary) 10%, transparent)", color: "var(--brand-primary)" }}
        aria-hidden="true"
      >
        <Icons.Device type={session.deviceType} className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0 space-y-0.5">
        <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
          {session.deviceType ?? "Unknown device"}
        </p>
        {session.ipAddress && (
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{session.ipAddress}</p>
        )}
        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Started: {when}</p>
        {expires && (
          <p className="text-xs" style={{ color: "var(--muted, var(--text-secondary))" }}>
            Expires: {expires}
          </p>
        )}
      </div>
      <button
        onClick={onRevoke}
        disabled={revoking}
        className="text-xs font-medium px-2 py-1 rounded-md flex-shrink-0 transition-all hover:border-[var(--danger)] hover:text-[var(--danger)]"
        style={{ border: "1px solid var(--border)", color: "var(--text-secondary)", background: "transparent" }}
        aria-label={`Revoke session from ${session.deviceType || 'unknown device'}`}
      >
        {revoking ? "…" : "Revoke"}
      </button>
    </article>
  );
}

/* ══════════════════════════════════════════════════════
   SHARED PRIMITIVES
══════════════════════════════════════════════════════ */
function BorderedAvatar({ size }) {
  return (
    <div className="rounded-full inline-flex" style={{ border: "1px solid var(--border)", lineHeight: 0 }}>
      <UserAvatar size={size} />
    </div>
  );
}

function InfoRow({ label, children }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg" style={{ background: "var(--background)" }}>
      <dt className="text-xs font-medium flex-shrink-0 w-14" style={{ color: "var(--text-secondary)" }}>
        {label}
      </dt>
      <dd className="flex-1 min-w-0">{children}</dd>
    </div>
  );
}

function RoleBadge({ role }) {
  return (
    <span
      className="inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-1"
      style={{
        background: "color-mix(in srgb, var(--brand-primary) 12%, transparent)",
        color: "var(--brand-primary)",
      }}
    >
      {ROLE_LABELS[role] ?? role}
    </span>
  );
}

function PanelButton({ children, onClick, variant = "primary", loading = false, type = "button" }) {
  const isPrimary = variant === "primary";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 hover:opacity-90"
      style={isPrimary
        ? { background: loading ? "var(--muted)" : "var(--brand-primary)", color: "var(--brand-primary-foreground, #fff)", opacity: loading ? 0.7 : 1 }
        : { background: "transparent", border: "1px solid var(--border)", color: "var(--text-primary)" }}
    >
      {loading && <Spinner size={16} />}
      {children}
    </button>
  );
}

function PanelSkeleton({ rows = 2 }) {
  return (
    <div className="space-y-2" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 rounded-xl animate-pulse"
          style={{ background: "var(--surface-hover, var(--border))" }} />
      ))}
    </div>
  );
}

function ErrorMsg({ children }) {
  return <p className="text-xs text-center py-4" style={{ color: "var(--danger)" }} role="alert">{children}</p>;
}

function EmptyMsg({ children }) {
  return <p className="text-xs text-center py-4" style={{ color: "var(--text-secondary)" }}>{children}</p>;
}

/* ─── Helpers ────────────────────────────────────────── */
function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}