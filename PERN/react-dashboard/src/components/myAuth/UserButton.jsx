/**
 * src/components/myAuth/UserButton.jsx
 *
 * Clerk-style avatar trigger. Opens <UserPanel /> inline — no page redirects.
 * All account management, sessions, and history live inside the panel.
 *
 * Usage:
 *   <UserButton />                  — right-aligned panel (default)
 *   <UserButton anchor="left" />    — left-aligned panel
 *   <UserButton size={40} />        — custom avatar size
 */
import { useState } from "react";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../../store/user";
import { Link } from "react-router-dom";
import UserAvatar from "./UserAvatar";
import UserPanel from "./UserPanel";

export default function UserButton({ size = 36, anchor = "right" }) {
  const [open, setOpen]  = useState(false);
  const isAuthenticated  = useSelector(selectIsAuthenticated);

  /* ── Logged-out state ── */
  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Link
          to="/login"
          className="text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
          style={{ color: "var(--text-primary)", border: "1px solid var(--border)" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-hover)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
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

  /* ── Logged-in state: avatar → panel ── */
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open account panel"
        aria-expanded={open}
        aria-haspopup="dialog"
        className="flex items-center rounded-full transition-all outline-none cursor-pointer"
        style={{
          padding: 2,
          border: open
            ? "2px solid var(--brand-primary)"
            : "2px solid var(--border)",
          background: "var(--surface)",
        }}
      >
        <UserAvatar size={size} />
      </button>

      {open && (
        <UserPanel
          onClose={() => setOpen(false)}
          anchor={anchor}
        />
      )}
    </div>
  );
}