/**
 * src/components/myAuth/UserDropdown.jsx
 * Clerk-style dropdown with profile info, navigation links, and logout.
 * Rendered by UserButton — do not use standalone.
 */
import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser, selectUserRole } from "@/store/user";
import { useLogout } from "./hooks/useAuthForms";
import UserAvatar from "./UserAvatar";

const ROLE_LABELS = {
  USER: "Member",
  ADMIN: "Admin",
  SUPER_ADMIN: "Super Admin",
  MODERATOR: "Moderator",
  SUPPORT: "Support",
  OTHER: "Other",
};

export default function UserDropdown({ onClose, links = [] }) {
  const user = useSelector(selectUser);
  const role = useSelector(selectUserRole);
  const logout = useLogout();
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleLogout = () => {
    onClose();
    logout.mutate();
  };

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-64 rounded-xl shadow-2xl z-50 overflow-hidden"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
      role="menu"
      aria-label="User menu"
    >
      {/* Profile section */}
      <div
        className="px-4 py-4 flex items-center gap-3"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <UserAvatar size={40} />
        <div className="min-w-0">
          <p
            className="text-sm font-semibold truncate"
            style={{ color: "var(--text-primary)" }}
          >
            {user?.name ?? "User"}
          </p>
          <p
            className="text-xs truncate"
            style={{ color: "var(--text-secondary)" }}
          >
            {user?.email}
          </p>
          {role && (
            <span
              className="inline-block text-xs px-2 py-0.5 rounded-full mt-1 font-medium"
              style={{
                background: "color-mix(in srgb, var(--brand-primary) 12%, transparent)",
                color: "var(--brand-primary)",
              }}
            >
              {ROLE_LABELS[role] ?? role}
            </span>
          )}
        </div>
      </div>

      {/* Nav links */}
      <div className="py-1">
        <DropdownItem to="/profile" onClick={onClose} icon={<PersonIcon />}>
          Manage account
        </DropdownItem>
        <DropdownItem to="/profile/sessions" onClick={onClose} icon={<DevicesIcon />}>
          Active sessions
        </DropdownItem>
        <DropdownItem to="/profile/history" onClick={onClose} icon={<ClockIcon />}>
          Login history
        </DropdownItem>

        {/* Custom links injected by the consumer */}
        {links.map((link) => (
          <DropdownItem key={link.to} to={link.to} onClick={onClose} icon={link.icon}>
            {link.label}
          </DropdownItem>
        ))}
      </div>

      {/* Logout */}
      <div style={{ borderTop: "1px solid var(--border)" }} className="py-1">
        <button
          onClick={handleLogout}
          disabled={logout.isPending}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left"
          style={{ color: "var(--error)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background =
              "color-mix(in srgb, var(--error) 8%, transparent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
          role="menuitem"
        >
          <LogoutIcon />
          {logout.isPending ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </div>
  );
}

function DropdownItem({ to, onClick, icon, children }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
      style={{ color: "var(--text-primary)" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--surface-hover)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
      role="menuitem"
    >
      <span style={{ color: "var(--text-secondary)" }}>{icon}</span>
      {children}
    </Link>
  );
}

/* ─── Icons ─────────────────────────────────────────── */
function PersonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

function DevicesIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}