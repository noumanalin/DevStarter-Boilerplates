/**
 * src/components/myAuth/UserButton.jsx
 * Clerk-style avatar button that opens UserDropdown.
 * Usage: <UserButton /> anywhere in your layout/navbar.
 * Optional: <UserButton links={[{ to: "/settings", label: "Settings", icon: <SettingsIcon /> }]} />
 */
import { useState } from "react";
import { useSelector } from "react-redux";
import { selectUser, selectIsAuthenticated } from "../../store/user";
import UserAvatar from "./UserAvatar";
import UserDropdown from "./UserDropdown";
import { Link } from "react-router-dom";

export default function UserButton({ size = 36, links = [] }) {
  const [open, setOpen] = useState(false);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Link
          to="/login"
          className="text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
          style={{
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--surface-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          Sign in
        </Link>
        <Link
          to="/register"
          className="text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
          style={{
            background: "var(--brand-primary)",
            color: "var(--brand-primary-foreground, #fff)",
          }}
        >
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 p-1 rounded-full transition-all outline-none cursor-pointer
        border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--brand-primary)] hover:bg-[var(--surface-hover)]"
       
        aria-label="Open user menu"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <UserAvatar size={size} />
      </button>

      {open && (
        <UserDropdown
          onClose={() => setOpen(false)}
          links={links}
        />
      )}
    </div>
  );
}