import { useEffect } from "react";
import { X } from "lucide-react";

const Model = ({ open, onClose, title, children, size = "lg" }) => {
  if (!open) return null;

  /* ESC KEY SUPPORT */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Size classes for different modal widths
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    full: "max-w-[90vw]",
  };

  return (
    <section
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <article
        className={`
          ${sizeClasses[size]}
          w-full
          max-h-[90vh]
          flex flex-col
          rounded-xl
          border border-[var(--border)]
          bg-[var(--surface)]
          shadow-xl
          overflow-hidden
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER (fixed) */}
        <header className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4 shrink-0">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </header>

        {/* BODY (SCROLL FIX) */}
        <main className="p-6 overflow-y-auto flex-1">
          {children}
        </main>
      </article>
    </section>
  );
};

export default Model;