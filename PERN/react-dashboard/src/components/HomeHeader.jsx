import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "./functional/ThemeToggle";
import ThemeColorPicker from "./functional/ThemeColorPicker";

const HomeHeader = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const location = useLocation();
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Escape key to close
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsOpen(false);
    setTimeout(() => {
      buttonRef.current?.focus();
    }, 100);
  };

  // Navigation items
  const navItems = [
    { name: "Home", href: "/" },
    { name: "Features", href: "/features" },
    { name: "Contact", href: "/contact" },
    { name: "Login", href: "/login" },

  ];

  return (
    <header
      className="sticky top-4 z-50 mx-4 rounded-2xl border border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md shadow-lg"
      role="banner"
      aria-label="Site header"
    >
      <nav
        className="flex items-center justify-between px-4 py-3 sm:px-6"
        role="navigation"
        aria-label="Main Navigation"
      >
        {/* Logo */}
        <Link
          to="/"
          aria-label="Homepage"
          className="flex-shrink-0 transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 rounded-lg"
        >
          <div
            className="flex items-center gap-2"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black"
              style={{
                background: "var(--brand-primary)",
                color: "#fff",
              }}
            >
              A
            </div>
            <span className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              MyApp
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <ul
          className="hidden lg:flex items-center gap-1"
          role="menubar"
        >
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name} role="none">
                <Link
                  to={item.href}
                  role="menuitem"
                  className={`relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 hover:bg-[var(--surface-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 ${
                    isActive
                      ? "text-[var(--brand-primary)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.name}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full"
                      style={{ background: "var(--brand-primary)" }}
                      aria-hidden="true"
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Theme Controls and CTA */}
        <div
          className="flex items-center gap-2"
          role="toolbar"
          aria-label="Theme and actions"
        >
          <ThemeToggle />
          <ThemeColorPicker />

          <Link
            to="/register"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white rounded-full transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2"
            style={{
              background: "var(--brand-primary)",
              boxShadow: "0 2px 12px rgba(37,99,235,0.3)",
            }}
            aria-label="Get started"
          >
            Get Started
          </Link>

          {/* Mobile Menu Button */}
          <button
            ref={buttonRef}
            onClick={toggleMenu}
            className="lg:hidden flex flex-col space-y-1 p-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-haspopup="true"
          >
            <span
              className={`w-6 h-0.5 bg-[var(--text-primary)] rounded-full transition-all duration-300 ${
                isOpen ? "rotate-45 translate-y-1.5" : ""
              }`}
            />
            <span
              className={`w-6 h-0.5 bg-[var(--text-primary)] rounded-full transition-all duration-300 ${
                isOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`w-6 h-0.5 bg-[var(--text-primary)] rounded-full transition-all duration-300 ${
                isOpen ? "-rotate-45 -translate-y-1.5" : ""
              }`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div
          id="mobile-menu"
          ref={menuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
          className="lg:hidden border-t border-[var(--border)] px-4 py-4"
        >
          <ul
            className="space-y-1"
            role="menu"
          >
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name} role="none">
                  <Link
                    to={item.href}
                    role="menuitem"
                    className={`block px-4 py-3 text-base font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] ${
                      isActive
                        ? "text-[var(--brand-primary)] bg-[var(--surface-hover)]"
                        : "text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                    }`}
                    onClick={closeMenu}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span className="flex items-center gap-2">
                      {item.name}
                      {isActive && (
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: "var(--brand-primary)" }}
                          aria-hidden="true"
                        />
                      )}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <Link
              to="/get-started"
              className="block w-full text-center px-4 py-3 text-sm font-semibold text-white rounded-full transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2"
              style={{
                background: "var(--brand-primary)",
                boxShadow: "0 2px 12px rgba(37,99,235,0.3)",
              }}
              onClick={closeMenu}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default HomeHeader;