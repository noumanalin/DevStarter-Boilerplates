// src/components/functional/ThemeColorPicker.jsx
import { useState, useRef, useEffect, useCallback } from "react";
import { Palette, ChevronDown } from "lucide-react";

const themes = [
    { id: "blue", name: "Blue", colors: ["#2563eb", "#1d4ed8", "#93c5fd"] },
    { id: "red", name: "Red", colors: ["#f21e26", "#d41a22", "#f87171"] },
    { id: "green", name: "Green", colors: ["#16a34a", "#15803d", "#86efac"] },
    { id: "purple", name: "Purple", colors: ["#9333ea", "#7e22ce", "#c4b5fd"] },
    { id: "orange", name: "Orange", colors: ["#ea580c", "#c2410c", "#fdba74"] },
    { id: "pink", name: "Pink", colors: ["#ec4899", "#db2777", "#f9a8d4"] },
    { id: "teal", name: "Teal", colors: ["#14b8a6", "#0d9488", "#99f6e4"] },
    { id: "gold", name: "Gold", colors: ["#d4a843", "#b8942e", "#f4d68c"] },
];

const ThemeColorPicker = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentTheme, setCurrentTheme] = useState("blue"); // default to blue
    const dropdownRef = useRef(null);
    const triggerRef = useRef(null);
    const closeTimeoutRef = useRef(null);

    // Load saved theme on mount
    useEffect(() => {
        const saved = localStorage.getItem("ali-color");
        if (saved) {
            setCurrentTheme(saved);
            document.documentElement.setAttribute("data-color", saved);
        } else {
            // If no saved, set default (blue)
            document.documentElement.setAttribute("data-color", "blue");
        }
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Clear any pending hover-close timer on unmount
    useEffect(() => {
        return () => {
            if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
        };
    }, []);

    const openDropdown = useCallback(() => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
        setIsOpen(true);
    }, []);

    const scheduleClose = useCallback(() => {
        closeTimeoutRef.current = setTimeout(() => setIsOpen(false), 150);
    }, []);

    const closeDropdown = useCallback(() => {
        setIsOpen(false);
        triggerRef.current?.focus();
    }, []);

    const handleThemeChange = (themeId) => {
        setCurrentTheme(themeId);
        document.documentElement.setAttribute("data-color", themeId);
        localStorage.setItem("ali-color", themeId);
        setIsOpen(false);
    };

    const handleMenuKeyDown = (e) => {
        if (e.key === "Escape") {
            e.preventDefault();
            closeDropdown();
            return;
        }

        const options = Array.from(
            dropdownRef.current?.querySelectorAll('[role="menuitemradio"]') || []
        );
        if (options.length === 0) return;

        const currentIndex = options.indexOf(document.activeElement);

        if (e.key === "ArrowDown") {
            e.preventDefault();
            options[(currentIndex + 1) % options.length]?.focus();
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            options[(currentIndex - 1 + options.length) % options.length]?.focus();
        } else if (e.key === "Home") {
            e.preventDefault();
            options[0]?.focus();
        } else if (e.key === "End") {
            e.preventDefault();
            options[options.length - 1]?.focus();
        }
    };

    return (
        <div
            className="relative"
            ref={dropdownRef}
            onMouseEnter={openDropdown}
            onMouseLeave={scheduleClose}
        >
            <button
                ref={triggerRef}
                onClick={() => setIsOpen((prev) => !prev)}
                className="flex h-10 items-center gap-1.5 px-3 rounded-full border border-[var(--border)] bg-[var(--surface)] transition-colors duration-200 hover:border-[var(--brand-primary)] hover:bg-[var(--surface-hover)]"
                aria-label="Change theme color"
                aria-haspopup="menu"
                aria-expanded={isOpen}
                aria-controls="theme-color-menu"
            >
                <Palette size={17} style={{ color: "var(--text-secondary)" }} />
                <ChevronDown
                    size={14}
                    style={{ color: "var(--text-secondary)" }}
                    className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    aria-hidden="true"
                />
            </button>

            {isOpen && (
                <div
                    id="theme-color-menu"
                    role="menu"
                    aria-label="Pick a theme color"
                    onKeyDown={handleMenuKeyDown}
                    className="absolute right-[-80px] mt-2 py-2 w-56 bg-[var(--background)] border border-[var(--border)] rounded-lg shadow-lg z-[999]"
                >
                    <div
                        className="px-3 pb-2 text-xs font-medium uppercase tracking-wider"
                        style={{ color: "var(--muted)" }}
                    >
                        Pick a color
                    </div>

                    <div className="space-y-1">
                        {themes.map((theme) => (
                            <button
                                key={theme.id}
                                role="menuitemradio"
                                aria-checked={currentTheme === theme.id}
                                onClick={() => handleThemeChange(theme.id)}
                                className={`w-full flex items-center gap-3 px-3 py-1.5 hover:bg-[var(--surface-hover)] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-inset ${currentTheme === theme.id ? "bg-[var(--surface-hover)]" : ""
                                    }`}
                            >
                                <div className="flex gap-1.5">
                                    {theme.colors.map((color, index) => (
                                        <span
                                            key={index}
                                            className="w-5 h-5 rounded-full border border-[var(--border)]"
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                                    {theme.name}
                                </span>
                                {currentTheme === theme.id && (
                                    <span
                                        className="ml-auto w-2 h-2 rounded-full"
                                        style={{ backgroundColor: "var(--brand-primary)" }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThemeColorPicker;