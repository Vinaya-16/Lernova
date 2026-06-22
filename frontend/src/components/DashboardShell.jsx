import { useState } from "react";
import { Menu, X, Bell, LogOut } from "lucide-react";
import { Avatar } from "./ui";

// Generic role-aware dashboard shell: collapsible sidebar + topbar + content slot.
// Used by StudentDashboard, InstructorDashboard, and AdminDashboard so all three
// role panels share one consistent, responsive layout.
export default function DashboardShell({
    brandLabel = "Lernova",
    roleLabel,
    navItems,
    active,
    onNavigate,
    userName = "User",
    children,
}) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);

    const activeLabel = navItems.find((n) => n.id === active)?.label;

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        window.location.href = "/login";
    };

    const SidebarContent = (
        <>
            <div className="px-6 py-5 border-b border-border-light">
                <span className="text-xl font-extrabold text-primary tracking-tight">
                    {brandLabel}
                </span>
                <p className="text-caption text-text-secondary mt-0.5">{roleLabel}</p>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navItems.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => {
                            onNavigate(id);
                            setMobileOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-sidebar text-sm font-medium transition-all
              ${active === id
                                ? "bg-active-bg text-primary"
                                : "text-text-secondary hover:bg-active-bg hover:text-primary"
                            }`}
                    >
                        <Icon size={18} />
                        {label}
                    </button>
                ))}
            </nav>

            <div className="px-3 py-4 border-t border-border-light">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-sidebar text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </>
    );

    return (
        <div className="flex h-screen bg-app font-sans overflow-hidden">
            {/* Desktop sidebar */}
            <aside
                className={`${sidebarOpen ? "w-sidebar" : "w-0 overflow-hidden"
                    } hidden lg:flex transition-all duration-300 bg-sidebar border-r border-border-light flex-col shrink-0`}
            >
                {SidebarContent}
            </aside>

            {/* Mobile drawer */}
            {mobileOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
                    <aside className="absolute left-0 top-0 h-full w-72 bg-sidebar flex flex-col shadow-soft">
                        {SidebarContent}
                    </aside>
                </div>
            )}

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-surface border-b border-border-light px-4 sm:px-6 py-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                setSidebarOpen((s) => !s);
                                setMobileOpen((m) => !m);
                            }}
                            className="p-2 rounded-lg hover:bg-active-bg text-text-secondary hover:text-primary transition"
                        >
                            <Menu size={20} className="hidden lg:block" />
                            {mobileOpen ? <X size={20} className="lg:hidden" /> : <Menu size={20} className="lg:hidden" />}
                        </button>
                        <h1 className="text-h3 sm:text-h2 text-text-primary truncate">{activeLabel}</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="relative p-2 rounded-lg hover:bg-active-bg text-text-secondary hover:text-primary transition">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-secondary rounded-full" />
                        </button>
                        <Avatar name={userName} size={36} />
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
            </div>
        </div>
    );
}
