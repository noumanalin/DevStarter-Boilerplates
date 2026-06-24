/**
 * src/components/myAuth/UserPanel.jsx
 *
 * Clerk-style floating panel — everything inline, no page redirects.
 * ─────────────────────────────────────────────────────────────────────
 */
import { Component, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { selectUser, selectUserRole } from "../../store/user";
import {
  useLogout,
  useChangePassword,
} from "./hooks/useAuthForms";
import {
  useGetActiveSessions,
  useRevokeSession,
  useLogoutAllDevices,
  useGetLoginHistory,
  useUpdateProfile,
} from "../../api/user/useUser";
import UserAvatar from "./UserAvatar";
import Icons from "./ui/icons";

/* ── constants ───────────────────────────────────────── */
const ROLE_LABELS = {
  USER: "Member", ADMIN: "Admin", SUPER_ADMIN: "Super Admin",
  MODERATOR: "Moderator", SUPPORT: "Support", OTHER: "Other",
};
const TABS = ["Account", "Security", "Sessions", "History"];

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

/* ── Local error boundary — keeps a tab's failure from
   ever taking the whole panel (or page) down with it ── */
class PanelErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { console.error("UserPanel tab crashed:", error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center space-y-1">
          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            Something went wrong.
          </p>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Close and reopen this panel. If your session expired, please sign in again.
          </p>
        </div>
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
      {/* Backdrop — mobile only, panel becomes a centered sheet there */}
      <div
        className="fixed inset-0 z-40 sm:hidden"
        style={{
          background: "rgba(0,0,0,0.45)",
          opacity: mounted ? 1 : 0,
          transition: "opacity 150ms ease",
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={ref}
        role="dialog"
        aria-label="User account panel"
        className={[
          "fixed sm:absolute z-50 flex flex-col",
          "left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2",
          "sm:left-auto sm:translate-x-0 sm:top-full sm:translate-y-0 sm:mt-3",
          anchor === "left" ? "sm:left-0" : "sm:right-0",
        ].join(" ")}
        style={{
          width: "min(360px, calc(100vw - 2rem))",
          maxHeight: "min(560px, calc(100vh - 4rem))",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)",
          overflow: "hidden",
          opacity: mounted ? 1 : 0,
          transition: "opacity 150ms ease",
        }}
      >
        <PanelHeader onClose={onClose} />
        <TabBar tab={tab} setTab={setTab} />
        <div className="flex-1 overflow-y-auto" style={{ overscrollBehavior: "contain" }}>
          <PanelErrorBoundary>
            {tab === "Account"  && <AccountTab  onClose={onClose} />}
            {tab === "Security" && <SecurityTab />}
            {tab === "Sessions" && <SessionsTab onClose={onClose} />}
            {tab === "History"  && <HistoryTab />}
          </PanelErrorBoundary>
        </div>
      </div>
    </>
  );
}

/* ── Panel header ────────────────────────────────────── */
function PanelHeader({ onClose }) {
  const user = useSelector(selectUser);
  const role = useSelector(selectUserRole);
  return (
    <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: "1px solid var(--border)" }}>
      <UserAvatar size={44} />
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
        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
        style={{ color: "var(--text-secondary)" }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-hover)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        aria-label="Close panel"
      >
        <CloseIcon />
      </button>
    </div>
  );
}

/* ── Tab bar ─────────────────────────────────────────── */
function TabBar({ tab, setTab }) {
  return (
    <div className="flex px-2 overflow-x-auto" style={{ borderBottom: "1px solid var(--border)" }}>
      {TABS.map((t) => (
        <button
          key={t}
          onClick={() => setTab(t)}
          className="px-3 py-2.5 text-xs font-medium transition-colors whitespace-nowrap"
          style={{
            color: tab === t ? "var(--brand-primary)" : "var(--text-secondary)",
            background: "transparent",
            borderBottom: tab === t ? "2px solid var(--brand-primary)" : "2px solid transparent",
            marginBottom: -1,
          }}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   TAB 1 — ACCOUNT
══════════════════════════════════════════════════════ */
function AccountTab({ onClose }) {
  const user   = useSelector(selectUser);
  const role   = useSelector(selectUserRole);
  const logout = useLogout();

  const [editing,       setEditing]       = useState(false);
  const [name,          setName]          = useState(user?.name ?? "");
  const [avatarFile,    setAvatarFile]    = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const fileRef = useRef(null);

  const updateProfile = useUpdateProfile();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg","image/jpg","image/png","image/webp"].includes(file.type)) return;
    if (file.size > 5 * 1024 * 1024) return;
    setAvatarFile(file);
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleSave = () => {
    const fd = new FormData();
    fd.append("name", name.trim());
    if (avatarFile) fd.append("avatar", avatarFile);
    updateProfile.mutate(fd, {
      onSuccess: () => {
        setEditing(false);
        setAvatarFile(null);
        if (avatarPreview) { URL.revokeObjectURL(avatarPreview); setAvatarPreview(""); }
      },
    });
  };

  const handleCancel = () => {
    setEditing(false);
    setName(user?.name ?? "");
    setAvatarFile(null);
    if (avatarPreview) { URL.revokeObjectURL(avatarPreview); setAvatarPreview(""); }
  };

  return (
    <div className="p-5 space-y-4">

      {/* Avatar */}
      <div className="flex flex-col items-center gap-2">
        {editing ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center select-none"
              style={{
                background: avatarPreview || user?.avatar_url ? "transparent" : "var(--brand-primary)",
                color: "var(--brand-primary-foreground, #fff)",
                fontSize: 28, fontWeight: 700,
              }}
            >
              {(avatarPreview || user?.avatar_url) ? (
                <img
                  src={avatarPreview || user.avatar_url}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : getInitials(user?.name)}
            </button>

            {/* Pencil badge — only visible while editing */}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              aria-label="Change avatar"
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center transition-transform"
              style={{
                background: "var(--brand-primary)",
                color: "var(--brand-primary-foreground, #fff)",
                border: "2px solid var(--surface)",
                boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.08)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              <PencilIcon className="w-3.5 h-3.5" />
            </button>

            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
              className="hidden" onChange={handleFileChange} />
          </div>
        ) : (
          <UserAvatar size={72} />
        )}
      </div>

      {/* Info rows */}
      <div className="space-y-1">
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
      </div>

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

      {/* Sign out */}
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
        <button
          onClick={() => { onClose(); logout.mutate(); }}
          disabled={logout.isPending}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg
                     text-sm font-medium transition-colors"
          style={{ color: "var(--error)" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "color-mix(in srgb, var(--error) 8%, transparent)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          <LogoutIcon />
          {logout.isPending ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   TAB 2 — SECURITY (update password)
══════════════════════════════════════════════════════ */
function SecurityTab() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent]         = useState(false);
  const [showNew, setShowNew]                 = useState(false);
  const [error, setError]                     = useState("");

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
    <div className="p-5 space-y-4">
      <div>
        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Update password</p>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
          Use a strong password you don't use anywhere else.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <PasswordField
          label="Current password"
          value={currentPassword}
          onChange={setCurrentPassword}
          show={showCurrent}
          onToggleShow={() => setShowCurrent((v) => !v)}
          autoComplete="current-password"
        />
        <PasswordField
          label="New password"
          value={newPassword}
          onChange={setNewPassword}
          show={showNew}
          onToggleShow={() => setShowNew((v) => !v)}
          autoComplete="new-password"
        />
        <PasswordField
          label="Confirm new password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          show={showNew}
          autoComplete="new-password"
        />

        {error && <p className="text-xs" style={{ color: "var(--error)" }}>{error}</p>}

        <PanelButton type="submit" loading={changePassword.isPending} variant="primary">
          Update password
        </PanelButton>
      </form>
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
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md"
            style={{ color: "var(--text-secondary)" }}
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
    </label>
  );
}

/* ══════════════════════════════════════════════════════
   TAB 3 — SESSIONS
══════════════════════════════════════════════════════ */
function SessionsTab({ onClose }) {
  const { data: sessions = [], isLoading, isError } = useGetActiveSessions({ enabled: true });
  const revokeSession = useRevokeSession();
  const logoutAll     = useLogoutAllDevices();

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
          {isLoading ? "Loading…" : `${sessions.length} active session${sessions.length !== 1 ? "s" : ""}`}
        </p>
        {sessions.length > 1 && (
          <button
            onClick={() => { onClose(); logoutAll.mutate(); }}
            disabled={logoutAll.isPending}
            className="text-xs font-medium px-2 py-1 rounded-md transition-colors"
            style={{ color: "var(--error)", border: "1px solid var(--error)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "color-mix(in srgb, var(--error) 8%, transparent)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            Sign out all
          </button>
        )}
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
    </div>
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
    <div
      className="flex items-start gap-3 p-3 rounded-xl"
      style={{ background: "var(--background)", border: "1px solid var(--border)" }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: "color-mix(in srgb, var(--brand-primary) 10%, transparent)", color: "var(--brand-primary)" }}
      >
        <DeviceIcon type={session.deviceType} />
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
        className="text-xs font-medium px-2 py-1 rounded-md flex-shrink-0 transition-colors"
        style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--error)"; e.currentTarget.style.color = "var(--error)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
      >
        {revoking ? "…" : "Revoke"}
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   TAB 4 — LOGIN HISTORY
══════════════════════════════════════════════════════ */
function HistoryTab() {
  const { data: history = [], isLoading, isError } = useGetLoginHistory({ enabled: true });

  return (
    <div className="p-4 space-y-2">
      <p className="text-xs font-medium pb-1" style={{ color: "var(--text-secondary)" }}>
        {isLoading ? "Loading…" : `${history.length} recent logins`}
      </p>

      {isLoading && <PanelSkeleton rows={3} />}
      {isError && <ErrorMsg>Failed to load history.</ErrorMsg>}
      {!isLoading && !isError && history.length === 0 && (
        <EmptyMsg>No login history found.</EmptyMsg>
      )}

      {history.map((entry) => (
        <HistoryCard key={entry.id} entry={entry} />
      ))}
    </div>
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
    <div
      className="p-3 rounded-xl space-y-2"
      style={{ background: "var(--background)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
          style={{ background: "color-mix(in srgb, var(--brand-primary) 10%, transparent)", color: "var(--brand-primary)" }}
        >
          <DeviceIcon type={entry.deviceType} />
        </div>

        <div className="flex-1 min-w-0 flex items-center gap-1.5 flex-wrap">
          {entry.browser && <BrowserBadge name={entry.browser} />}
          {entry.os && <OsBadge name={entry.os} />}
        </div>

        <span
          className="text-xs flex-shrink-0 px-1.5 py-0.5 rounded-full"
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
            <IpIcon />
            <span className="text-xs font-mono" style={{ color: "var(--text-secondary)" }}>
              {entry.ipAddress}
            </span>
          </div>
        )}
        {resolution && (
          <div className="flex items-center gap-1">
            <ScreenIcon />
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {resolution}
            </span>
          </div>
        )}
      </div>

      <p className="text-xs" style={{ color: "var(--muted, var(--text-secondary))" }}>
        {when}
      </p>
    </div>
  );
}

/* ── Browser / OS badges — real brand logos from ui/icons.jsx ── */
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
   SHARED PRIMITIVES
══════════════════════════════════════════════════════ */
function InfoRow({ label, children }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg" style={{ background: "var(--background)" }}>
      <span className="text-xs font-medium flex-shrink-0 w-14" style={{ color: "var(--text-secondary)" }}>
        {label}
      </span>
      <div className="flex-1 min-w-0">{children}</div>
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
      className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors
                 flex items-center justify-center gap-2"
      style={isPrimary
        ? { background: loading ? "var(--muted)" : "var(--brand-primary)", color: "var(--brand-primary-foreground, #fff)", opacity: loading ? 0.7 : 1 }
        : { background: "transparent", border: "1px solid var(--border)", color: "var(--text-primary)" }}
    >
      {loading && <SmallSpinner />}
      {children}
    </button>
  );
}

function PanelSkeleton({ rows = 2 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 rounded-xl animate-pulse"
          style={{ background: "var(--surface-hover, var(--border))" }} />
      ))}
    </div>
  );
}

function ErrorMsg({ children }) {
  return <p className="text-xs text-center py-4" style={{ color: "var(--error)" }}>{children}</p>;
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

/* ─── Icons ──────────────────────────────────────────── */
function DeviceIcon({ type }) {
  const Icon = type === "MOBILE" || type === "TABLET" ? Icons.Mobile : Icons.Desktop;
  return <Icon className="w-3.5 h-3.5" />;
}

function IpIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );
}

function ScreenIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}

function PencilIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 4.22-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function SmallSpinner() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" className="animate-spin">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}