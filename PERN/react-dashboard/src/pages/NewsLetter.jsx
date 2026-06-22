import { useState } from "react";
import {
  Mail,
  Trash2,
  Send,
  ExternalLink,
  CircleCheck,
  Users,
  BadgeCheck,
  Inbox,
  Sparkles,
  TrendingUp,
  RefreshCw,
  Copy, // ← added
} from "lucide-react";

import DataTable from "../components/DataTable";
import {
  useGetAllSubscribers,
  useDeleteSubscriber,
} from "../api/newsletter/useNewsletter";

const Newsletter = () => {
  const { data, isLoading, isError, error, refetch } = useGetAllSubscribers();

  const {
    mutate: deleteSubscriber,
    isPending: isDeleting,
  } = useDeleteSubscriber();

  const [subscriberToDelete, setSubscriberToDelete] = useState(null);
  const [copiedId, setCopiedId] = useState(null); // ← track copied email

  /* ─────────────────────────────────────────────
     DELETE HANDLERS
  ───────────────────────────────────────────── */

  const handleDelete = (id, subscriber) => {
    setSubscriberToDelete(subscriber);
  };

  const confirmDelete = () => {
    if (!subscriberToDelete?.id) return;

    deleteSubscriber(subscriberToDelete?.id, {
      onSuccess: () => {
        setSubscriberToDelete(null);
      },
    });
  };

  /* ─────────────────────────────────────────────
     EMAIL CLICK & COPY
  ───────────────────────────────────────────── */

  const handleEmailClick = (email) => {
    window.location.href = `mailto:${email}`;
  };

  const handleCopy = (email, id) => {
    navigator.clipboard.writeText(email).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000); // reset after 2s
    }).catch((err) => {
      console.error("Failed to copy:", err);
      // fallback (optional)
    });
  };

  /* ─────────────────────────────────────────────
     DATE FORMAT
  ───────────────────────────────────────────── */

  const formatDate = (dateString) => {
    if (!dateString) return "-";

    const date = new Date(dateString);

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  /* ─────────────────────────────────────────────
     TABLE COLUMNS
  ───────────────────────────────────────────── */

  const columns = [
    {
      key: "serial",
      label: "S.No",
      type: "number",

      render: (item, index) => (
        <span className="font-medium">
          {(index || 0) + 1}
        </span>
      ),
    },

    {
      key: "email",
      label: "Email Address",
      type: "text",

      render: (item) => (
        <div className="flex items-center gap-2">
          {/* Mailto button */}
          <button
            onClick={() => handleEmailClick(item?.email)}
            className="inline-flex items-center gap-2 text-[var(--brand-primary)] transition-colors hover:underline"
          >
            <Mail size={14} />
            <span className="font-bold">{item?.email}</span>
            <ExternalLink size={12} />
          </button>

          {/* Copy button */}
          <button
            onClick={(e) => {
              e.stopPropagation(); // prevent mailto from triggering
              handleCopy(item?.email, item?.id);
            }}
            className="rounded p-1 text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--brand-primary)]"
            title="Copy email"
          >
            {copiedId === item?.id ? (
              <CircleCheck size={14} className="text-green-500" />
            ) : (
              <Copy size={14} />
            )}
          </button>
        </div>
      ),
    },

    {
      key: "created_at",
      label: "Subscribed On",
      type: "date",

      render: (item) => formatDate(item?.created_at),
    },

    {
      key: "actions",
      label: "Actions",
      type: "actions",
    },
  ];

  const subscribers = data?.subscribers || [];

  /* ─────────────────────────────────────────────
     NEWSLETTER BENEFITS (kept for reference)
  ───────────────────────────────────────────── */

  const newsletterBenefits = [
    {
      title: "Lead Collection",
      description: "Collect potential customers and grow your audience.",
    },

    {
      title: "Email Retargeting",
      description: "Reconnect with visitors through email campaigns.",
    },

    {
      title: "Brand Trust",
      description: "Regular emails keeps our brand remembered.",
    },
  ];

  const miniFeatures = [
    {
      title: "Marketing",
      icon: TrendingUp,
    },

    {
      title: "Audience Growth",
      icon: Users,
    },

    {
      title: "Better Reach",
      icon: Send,
    },

    {
      title: "Brand Value",
      icon: BadgeCheck,
    },

    {
      title: "Email Updates",
      icon: Inbox,
    },

    {
      title: "Engagement",
      icon: Sparkles,
    },
  ];

  return (
    <main className="h-full p-6">

      {/* STATS */}
      <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-[var(--brand-primary)]/10 p-3">
              <Users
                size={22}
                className="text-[var(--brand-primary)]"
              />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                {subscribers?.length || 0}
              </h2>

              <p className="text-sm text-[var(--text-secondary)]">
                Total Subscribers
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-green-500/10 p-3">
              <Send
                size={22}
                className="text-green-500"
              />
            </div>

            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                Email Reach
              </h2>

              <p className="text-sm text-[var(--text-secondary)]">
                Improve customer engagement
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-purple-500/10 p-3">
              <BadgeCheck
                size={22}
                className="text-purple-500"
              />
            </div>

            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                Brand Trust
              </h2>

              <p className="text-sm text-[var(--text-secondary)]">
                Keep your audience connected
              </p>
            </div>
          </div>
        </article>
      </section>

      {/* ─── REFRESH BUTTON + DATA TABLE ─── */}
      <section>
        <div className="mb-4 flex items-center gap-4">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={isLoading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        <DataTable
          title="All Subscribers"
          columns={columns}
          data={subscribers}
          loading={isLoading}
          error={
            isError
              ? error?.message || "Failed to load subscribers"
              : null
          }
          onDelete={handleDelete}
          csv={true}
        />
      </section>

      {/* DELETE MODAL */}
      {subscriberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
            <header className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                Remove Subscriber
              </h2>

              <button
                onClick={() => setSubscriberToDelete(null)}
                className="rounded-lg p-1 text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                aria-label="Close modal"
              >
                ✕
              </button>
            </header>

            <main className="p-6">
              <p className="text-[var(--text-primary)]">
                Are you sure you want to remove{" "}
                <strong>{subscriberToDelete?.email}</strong> ?
              </p>

              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                This action cannot be undone.
              </p>
            </main>

            <footer className="flex gap-3 border-t border-[var(--border)] px-6 py-4">
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 font-medium text-white transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={16} />

                {isDeleting ? "Removing..." : "Remove"}
              </button>

              <button
                onClick={() => setSubscriberToDelete(null)}
                className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 font-medium text-[var(--text-secondary)] transition-all hover:border-[var(--brand-primary)] hover:text-[var(--text-primary)]"
              >
                Cancel
              </button>
            </footer>
          </div>
        </div>
      )}
    </main>
  );
};
 
export default Newsletter;