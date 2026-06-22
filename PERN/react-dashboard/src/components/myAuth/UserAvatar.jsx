/**
 * src/components/myAuth/UserAvatar.jsx
 * Shows avatar image or initials fallback.
 * Props: size (number, px), user (object), className
 */
import { useSelector } from "react-redux";
import { selectUser } from "../../store/user";

export default function UserAvatar({ user: propUser, size = 36, className = "" }) {
  const storeUser = useSelector(selectUser);
  const user = propUser ?? storeUser;

  const initials = getInitials(user?.name);
  const hasAvatar = !!user?.avatar_url;

  return (
    <div
      className={`relative rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 font-semibold select-none ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(10, size * 0.36),
        background: hasAvatar ? "transparent" : "var(--brand-primary)",
        color: hasAvatar ? "transparent" : "var(--brand-primary-foreground, #fff)",
      }}
      aria-label={user?.name ?? "User"}
    >
      {hasAvatar ? (
        <img
          src={user.avatar_url}
          alt={user?.name ?? "User avatar"}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      ) : (
        initials
      )}
    </div>
  );
}

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}