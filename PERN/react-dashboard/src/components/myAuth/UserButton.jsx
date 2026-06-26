/**
 * src/components/myAuth/UserButton.jsx
 *
 * Clerk-style avatar trigger. Opens <UserPanel /> inline — no page redirects.
 * All account management, sessions, and history live inside the panel.
 *
 * Usage:
 *   <UserButton />                                  — right-aligned panel (default)
 *   <UserButton anchor="left" />                    — left-aligned panel
 *   <UserButton size={40} />                        — custom avatar size
 *   <UserButton linksTabName="Apps" />              — custom tab name
 *   <UserButton linksTabName="Quick Links" />       — custom tab name
 *
 *   <UserButton linksTabName="Apps">
 *     <UserButton.LinksTab className="flex flex-col gap-2 min-h-[45vh]">
 *       <a href="/help" target="_blank" rel="noopener noreferrer" className="text-sm flex items-center gap-1.5 hover:text-[var(--brand-primary)]">
 *         Open help <ArrowUpIcon className="w-3.5 h-3.5" />
 *       </a>
 *       <button type="button" onClick={() => alert("clicked")} className="text-sm text-left hover:text-[var(--brand-primary)]">
 *         Trigger something
 *       </button>
 *       <Link to="/bookings" className="text-sm hover:text-[var(--brand-primary)]">
 *         My bookings
 *       </Link>
 *     </UserButton.LinksTab>
 *   </UserButton>
 *
 * The custom tab (named via linksTabName prop) only appears when a 
 * <UserButton.LinksTab> child is passed. Defaults to "Links" if no name provided.
 *
 * You fully own the markup and styling of every item inside it — UserButton
 * only reads it and renders it inside the panel, it never wraps or restyles
 * your <a>/<button>/<Link> elements.
 */
import { Children, useState } from "react";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../../store/user";
import { Link } from "react-router-dom";
import UserAvatar from "./UserAvatar";
import UserPanel from "./UserPanel";

export default function UserButton({ 
  size = 36, 
  anchor = "right", 
  linksTabName = "Links",
  className = "",
  children 
}) {
  const [open, setOpen] = useState(false);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  /* ── Extract <UserButton.LinksTab> from children, if present ── */
  const linksTabElement = Children.toArray(children).find(
    (child) => child?.type === UserButton.LinksTab
  );
  const customLinksContent = linksTabElement?.props?.children ?? null;
  const customLinksClassName = linksTabElement?.props?.className ?? "";

  /* ── Logged-out state ── */
  if (!isAuthenticated) {
    return (
      <nav className="flex items-center gap-3" aria-label="Authentication">
        <Link
          to="/login"
          className="text-sm font-medium px-5 py-2.5 rounded-xl border transition-all duration-200 hover:shadow-md hover:scale-[1.02] hover:border-[var(--brand-primary)]"
          style={{ 
            color: "var(--text-primary)", 
            borderColor: "var(--border)",
            background: "var(--surface)",
          }}
        >
          Sign in
        </Link>
        <Link
          to="/register"
          className="text-sm font-medium px-5 py-2.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
          style={{
            background: "linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))",
            color: "#fff",
            boxShadow: "0 2px 8px color-mix(in srgb, var(--brand-primary) 30%, transparent)",
          }}
        >
          Sign up
        </Link>
      </nav>
    );
  }

  /* ── Logged-in state: avatar → panel ── */
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open account panel"
        aria-expanded={open}
        aria-haspopup="dialog"
        className="flex items-center rounded-full transition-all duration-200 outline-none cursor-pointer hover:shadow-lg"
        style={{
          padding: 2,
          border: open ? "2px solid var(--brand-primary)" : "2px solid transparent",
          background: open ? "var(--surface)" : "transparent",
          boxShadow: open ? `0 0 0 4px color-mix(in srgb, var(--brand-primary) 20%, transparent)` : "none",
        }}
      >
        <UserAvatar size={size} />
      </button>

      {open && (
        <UserPanel
          onClose={() => setOpen(false)}
          anchor={anchor}
          customLinksContent={customLinksContent}
          customLinksClassName={customLinksClassName}
          customLinksTabName={linksTabName}
        />
      )}
    </div>
  );
}

/**
 * Marker component — never actually rendered to the DOM directly.
 * UserButton reads its `children` and `className` via React.Children
 * and passes them straight through to UserPanel's Links tab.
 */
UserButton.LinksTab = function LinksTab({ children, className = "" }) {
  return children ?? null;
};
UserButton.LinksTab.displayName = "UserButton.LinksTab";