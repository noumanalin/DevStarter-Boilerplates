// src/components/functional/ThemeToggle.jsx
import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

const ThemeToggle = ({ className = "" }) => {
  const [theme, setTheme] = useState("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("ali-theme");
    const initialTheme = stored || "dark";
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("ali-theme", newTheme);
  };

  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        className={`relative flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] transition-all duration-300 hover:border-[var(--brand-primary)] hover:bg-[var(--surface-hover)] ${className}`}
      >
        <Sun size={17} className="absolute transition-all duration-300 rotate-0 opacity-100" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      className={`relative flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] transition-all duration-300 hover:border-[var(--brand-primary)] hover:bg-[var(--surface-hover)] ${className}`}
    >
      <Sun
        size={17}
        className={`absolute transition-all duration-300 ${
          theme === "light" ? "rotate-0 opacity-100" : "rotate-90 opacity-0"
        }`}
      />
      <Moon
        size={17}
        className={`absolute transition-all duration-300 ${
          theme === "dark" ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"
        }`}
      />
    </button>
  );
};

export default ThemeToggle;