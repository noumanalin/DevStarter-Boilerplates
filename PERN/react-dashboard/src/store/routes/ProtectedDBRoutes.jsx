import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
    LayoutDashboard, FolderTree, Star, FileUser,
    Images, ClipboardPlus, Layers, UserPlus,
    ChartNoAxesCombined, ChevronDown,ChevronLeft, ChevronRight,
    LogOut, User, Mail, Shield,  X, PlusCircle,  Users, MessageSquare, Mail as MailIcon,  Newspaper,
    Menu, Clock
} from "lucide-react";

import ThemeToggle from "../../components/functional/ThemeToggle";
import ThemeColorPicker from "../../components/functional/ThemeColorPicker";

/* ─────────────────────────────────────────────
   SIDEBAR NAV ITEMS (auth‑free)
───────────────────────────────────────────── */
const NAV_ITEMS = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Add Blog", icon: PlusCircle, path: "/dashboard/add-blog" },
    { label: "Manage Blogs", icon: Newspaper, path: "/dashboard/manage-blogs" },
    { label: "Manage Blog Category", icon: FolderTree, path: "/dashboard/manage-blogs-catgories" },
    { label: "Newsletter", icon: MailIcon, path: "/dashboard/newsletter" },
    { label: "Manage Media", icon: Images, path: "/dashboard/manage-media" },
];

/* ─────────────────────────────────────────────
   DUMMY USER (replace with redux auth state later)
───────────────────────────────────────────── */
const DUMMY_USER = {
    name: "Nauman Ali",
    email: "naumanalin865@example.com",
    role: "Administrator",
    joinedAt: "Jan 2024",
    initials: "JD",
};

/* ─────────────────────────────────────────────
   USER DROPDOWN (dummy – wire up to redux later)
───────────────────────────────────────────── */
const UserDropdown = () => {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        // TODO: dispatch real logout action once auth slice exists
        console.log("Logout clicked (dummy)");
        setOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setOpen((p) => !p)}
                className="flex items-center gap-2 pl-2 pr-1.5 py-1.5 rounded-md hover:bg-[var(--surface-hover)] transition-colors"
            >
                <span className="w-8 h-8 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center text-xs font-semibold shrink-0">
                    {DUMMY_USER.initials}
                </span>
                <span className="hidden sm:flex flex-col items-start leading-tight">
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                        {DUMMY_USER.name}
                    </span>
                    <span className="text-xs text-[var(--text-secondary)]">
                        {DUMMY_USER.role}
                    </span>
                </span>
                <ChevronDown
                    size={16}
                    className={`text-[var(--text-secondary)] transition-transform duration-150 ${open ? "rotate-180" : ""
                        }`}
                />
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-md border border-[var(--border)] bg-[var(--surface)] shadow-lg overflow-hidden z-50">
                    <div className="flex items-center gap-3 p-3 border-b border-[var(--border)]">
                        <span className="w-10 h-10 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center text-sm font-semibold shrink-0">
                            {DUMMY_USER.initials}
                        </span>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                                {DUMMY_USER.name}
                            </p>
                            <p className="text-xs text-[var(--text-secondary)] truncate flex items-center gap-1">
                                <Mail size={12} /> {DUMMY_USER.email}
                            </p>
                        </div>
                    </div>

                    <div className="px-3 py-2 space-y-1.5 border-b border-[var(--border)]">
                        <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                            <Shield size={13} />
                            Role:&nbsp;
                            <span className="text-[var(--text-primary)] font-medium">
                                {DUMMY_USER.role}
                            </span>
                        </p>
                        <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                            <Clock size={13} />
                            Joined&nbsp;{DUMMY_USER.joinedAt}
                        </p>
                    </div>

                    <ul className="py-1">
                        <li>
                            <button
                                onClick={() => setOpen(false)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors text-left"
                            >
                                <User size={15} /> Profile
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors text-left"
                            >
                                <LogOut size={15} /> Logout
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────
   SIDEBAR
───────────────────────────────────────────── */
const Sidebar = ({ collapsed, onToggle, mobileOpen, onMobileClose }) => {
    const location = useLocation();

    const sidebarContent = (
        <aside
            className={`
        h-full flex flex-col bg-[var(--surface)] border-r border-[var(--border)]
        transition-all duration-300 ease-in-out relative
        ${collapsed ? "w-[70px]" : "w-[240px]"}
      `}
        >
            <div className="h-16 flex items-center px-4 border-b border-[var(--border)] shrink-0 overflow-hidden">
                {!collapsed && (
                    <span className="font-bold text-lg text-[var(--brand-primary)] whitespace-nowrap">
                        Logo
                    </span>
                )}
                {collapsed && (
                    <span className="font-bold text-lg text-[var(--brand-primary)] mx-auto">L</span>
                )}
            </div>

            <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
                <ul className="space-y-1 px-2">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    onClick={onMobileClose}
                                    title={collapsed ? item.label : undefined}
                                    className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium
                    transition-all duration-150 group relative
                    ${isActive
                                            ? "bg-[var(--brand-primary)] text-white shadow-sm"
                                            : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                                        }
                    ${collapsed ? "justify-center" : ""}
                  `}
                                >
                                    <Icon
                                        size={19}
                                        className={`shrink-0 ${isActive
                                            ? "text-white"
                                            : "text-[var(--text-secondary)] group-hover:text-[var(--brand-primary)]"
                                            }`}
                                    />
                                    {!collapsed && <span className="truncate">{item.label}</span>}

                                    {collapsed && (
                                        <span
                                            className="
                        absolute left-full ml-3 px-2 py-1 rounded-md text-xs font-medium
                        bg-[var(--text-primary)] text-[var(--background)]
                        opacity-0 group-hover:opacity-100 pointer-events-none
                        whitespace-nowrap transition-opacity duration-150 z-50
                      "
                                        >
                                            {item.label}
                                        </span>
                                    )}
                                </NavLink>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="p-3 border-t border-[var(--border)] shrink-0">
                <button
                    onClick={onToggle}
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    className="
            w-full flex items-center justify-center h-9 rounded-md
            border bg-[var(--surface)]
            text-[var(--brand-primary)]
            border-[var(--brand-primary)] transition-all duration-150
          "
                >
                    {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </div>
        </aside>
    );

    return (
        <>
            <div className="hidden lg:flex h-full shrink-0">{sidebarContent}</div>

            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={onMobileClose}
                        aria-hidden="true"
                    />
                    <div className="relative w-[240px] h-full shrink-0">
                        <aside className="h-full flex flex-col bg-[var(--surface)] border-r border-[var(--border)] w-[240px]">
                            <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--border)] shrink-0">
                                <span className="font-bold text-lg text-[var(--brand-primary)]">Nexora</span>
                                <button
                                    onClick={onMobileClose}
                                    aria-label="Close sidebar"
                                    className="w-8 h-8 flex items-center justify-center rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <nav className="flex-1 py-4 overflow-y-auto">
                                <ul className="space-y-1 px-2">
                                    {NAV_ITEMS.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = location.pathname === item.path;
                                        return (
                                            <li key={item.path}>
                                                <NavLink
                                                    to={item.path}
                                                    onClick={onMobileClose}
                                                    className={`
                            flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all
                            ${isActive
                                                            ? "bg-[var(--brand-primary)] text-white"
                                                            : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                                                        }
                          `}
                                                >
                                                    <Icon size={19} className="shrink-0" />
                                                    <span>{item.label}</span>
                                                </NavLink>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </nav>

                            <div className="p-3 border-t border-[var(--border)]" />
                        </aside>
                    </div>
                </div>
            )}
        </>
    );
};

/* ─────────────────────────────────────────────
   NAVBAR (auth‑free, dummy user dropdown)
───────────────────────────────────────────── */
const Navbar = ({ onMobileMenuClick }) => {
    const location = useLocation();
    const currentPage =
        NAV_ITEMS.find((item) => item.path === location.pathname)?.label ||
        "Dashboard";

    return (
        <header className="h-16 shrink-0 flex items-center justify-between px-4 sm:px-6 bg-[var(--surface)] border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
                <button
                    onClick={onMobileMenuClick}
                    aria-label="Open sidebar"
                    className="lg:hidden w-9 h-9 flex items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
                >
                    <Menu size={18} />
                </button>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                    {currentPage}
                </h2>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
                <ThemeToggle />
                <ThemeColorPicker />
                <div className="w-px h-8 bg-[var(--border)] mx-1" />
                <UserDropdown />
            </div>
        </header>
    );
};

/* ─────────────────────────────────────────────
   MAIN LAYOUT (no auth checks)
───────────────────────────────────────────── */
const ProtectedDBRoutes = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
 
    return (
        <div className="flex h-screen overflow-hidden bg-[var(--background)]">
            <Sidebar
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed((p) => !p)}
                mobileOpen={mobileMenuOpen}
                onMobileClose={() => setMobileMenuOpen(false)}
            />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Navbar onMobileMenuClick={() => setMobileMenuOpen(true)} />

                <main className="flex-1 overflow-y-auto p-1 md:p-5">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default ProtectedDBRoutes;