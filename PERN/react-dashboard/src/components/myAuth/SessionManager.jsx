/**
 * src/components/myAuth/SessionManager.jsx
 * Displays active sessions and allows revoking individual ones or all.
 */
import { useGetActiveSessions, useRevokeSession, useLogoutAllDevices } from "../../api/user/useUser";
import { Spinner } from "./ui/AuthUI";

export default function SessionManager() {
  const { data: sessions = [], isLoading, isError } = useGetActiveSessions();
  const revokeSession = useRevokeSession();
  const logoutAll = useLogoutAllDevices();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size={24} />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-center py-6" style={{ color: "var(--error)" }}>
        Failed to load sessions.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2
          className="text-base font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Active sessions ({sessions.length})
        </h2>
        {sessions.length > 1 && (
          <button
            onClick={() => logoutAll.mutate()}
            disabled={logoutAll.isPending}
            className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            style={{
              border: "1px solid var(--error)",
              color: "var(--error)",
            }}
          >
            {logoutAll.isPending ? "Logging out…" : "Sign out all devices"}
          </button>
        )}
      </div>

      {sessions.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          No active sessions found.
        </p>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onRevoke={() => revokeSession.mutate(session.id)}
              revoking={revokeSession.isPending && revokeSession.variables === session.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SessionCard({ session, onRevoke, revoking }) {
  const deviceIcon = getDeviceIcon(session.deviceType);
  const createdAt = new Date(session.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className="flex items-start gap-3 p-4 rounded-xl"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      <div
        className="mt-0.5 p-2 rounded-lg flex-shrink-0"
        style={{
          background: "color-mix(in srgb, var(--brand-primary) 10%, transparent)",
          color: "var(--brand-primary)",
        }}
      >
        {deviceIcon}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium truncate"
          style={{ color: "var(--text-primary)" }}
        >
          {session.deviceType ?? "Unknown device"}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
          {session.ipAddress && `${session.ipAddress} · `}{createdAt}
        </p>
        {session.userAgent && (
          <p
            className="text-xs mt-0.5 truncate"
            style={{ color: "var(--muted)" }}
          >
            {session.userAgent}
          </p>
        )}
      </div>

      <button
        onClick={onRevoke}
        disabled={revoking}
        className="text-xs font-medium px-2.5 py-1 rounded-lg flex-shrink-0 transition-colors"
        style={{
          border: "1px solid var(--border)",
          color: "var(--text-secondary)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--error)";
          e.currentTarget.style.color = "var(--error)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--border)";
          e.currentTarget.style.color = "var(--text-secondary)";
        }}
      >
        {revoking ? "…" : "Revoke"}
      </button>
    </div>
  );
}

function getDeviceIcon(deviceType) {
  switch (deviceType) {
    case "MOBILE":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2" />
          <circle cx="12" cy="18" r="1" />
        </svg>
      );
    case "TABLET":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <circle cx="12" cy="17" r="1" />
        </svg>
      );
    default:
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
      );
  }
}