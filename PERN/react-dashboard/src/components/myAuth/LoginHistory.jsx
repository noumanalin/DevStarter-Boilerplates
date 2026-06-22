/**
 * src/components/myAuth/LoginHistory.jsx
 * Displays a user's login history (device, browser, IP, time).
 */
import { useGetLoginHistory } from "../../api/user/useUser";
import { Spinner } from "./ui/AuthUI";

export default function LoginHistory() {
  const { data: history = [], isLoading, isError } = useGetLoginHistory();

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
        Failed to load login history.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <h2
        className="text-base font-semibold"
        style={{ color: "var(--text-primary)" }}
      >
        Login history
      </h2>

      {history.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          No login history found.
        </p>
      ) : (
        <div className="space-y-2">
          {history.map((entry) => (
            <LoginHistoryRow key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}

function LoginHistoryRow({ entry }) {
  const date = new Date(entry.created_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{
          background: "color-mix(in srgb, var(--brand-primary) 10%, transparent)",
          color: "var(--brand-primary)",
        }}
      >
        <DeviceTypeIcon type={entry.deviceType} />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="font-medium truncate"
          style={{ color: "var(--text-primary)" }}
        >
          {[entry.browser, entry.os].filter(Boolean).join(" on ") || "Unknown"}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
          {entry.ipAddress && `${entry.ipAddress} · `}{date}
        </p>
      </div>
      <span
        className="text-xs flex-shrink-0 px-2 py-0.5 rounded-full"
        style={{
          background: "color-mix(in srgb, var(--muted) 20%, transparent)",
          color: "var(--muted)",
        }}
      >
        {entry.deviceType ?? "OTHER"}
      </span>
    </div>
  );
}

function DeviceTypeIcon({ type }) {
  if (type === "MOBILE" || type === "TABLET") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}