import { useState } from "react";
import { Menu, X, Bell, LogOut, User, GraduationCap } from "lucide-react";
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
    userRole = "student", // Add userRole prop
    children,
    notificationCount = 0,
    onNotificationClick,
}) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    const activeLabel = navItems.find((n) => n.id === active)?.label;

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        window.location.href = "/login";
    };

    const handleNotificationClick = () => {
        if (onNotificationClick) {
            onNotificationClick();
        }
        setShowNotifications(false);
    };

    // Get user initials
    const getInitials = (name) => {
        if (!name) return "U";
        const parts = name.split(" ");
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    // Get avatar styles based on role
    const getAvatarStyles = (role) => {
        switch (role) {
            case "instructor":
            case "admin":
            case "teacher":
                return {
                    bg: "bg-blue-100",
                    text: "text-blue-600",
                    border: "border-blue-200",
                };
            case "student":
                return {
                    bg: "bg-green-100",
                    text: "text-green-600",
                    border: "border-green-200",
                };
            default:
                return {
                    bg: "bg-gray-100",
                    text: "text-gray-600",
                    border: "border-gray-200",
                };
        }
    };

    // Get role icon
    const getRoleIcon = (role) => {
        switch (role) {
            case "instructor":
            case "admin":
            case "teacher":
                return <GraduationCap size={16} className="text-blue-500" />;
            case "student":
                return <User size={16} className="text-green-500" />;
            default:
                return <User size={16} className="text-gray-500" />;
        }
    };

    const initials = getInitials(userName);
    const avatarStyles = getAvatarStyles(userRole);
    const roleIcon = getRoleIcon(userRole);

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
                        {/* Notification Bell */}
                        <div className="relative">
                            <button 
                                onClick={() => {
                                    setShowNotifications(!showNotifications);
                                }}
                                className="relative p-2 rounded-lg hover:bg-active-bg text-text-secondary hover:text-primary transition"
                            >
                                <Bell size={20} />
                                {notificationCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                        {notificationCount}
                                    </span>
                                )}
                            </button>
                            
                            {/* Notification Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-border-light z-50 max-h-96 overflow-y-auto">
                                    <div className="p-3 border-b border-border-light font-semibold text-text-primary flex justify-between items-center">
                                        <span>Notifications</span>
                                        <button 
                                            onClick={handleNotificationClick}
                                            className="text-xs text-primary hover:underline"
                                        >
                                            View all
                                        </button>
                                    </div>
                                    {notificationCount === 0 ? (
                                        <div className="p-4 text-center text-text-secondary">
                                            No new notifications
                                        </div>
                                    ) : (
                                        <div className="p-4 text-center text-text-secondary">
                                            You have {notificationCount} notification(s)
                                            <br />
                                            <button 
                                                onClick={handleNotificationClick}
                                                className="text-xs text-primary hover:underline mt-1"
                                            >
                                                Click here to view them
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        {/* Avatar with Role Badge */}
                        <div className="relative">
                            <div className="flex items-center gap-2">
                                <div 
                                    className={`w-9 h-9 rounded-full border-2 ${avatarStyles.border} ${avatarStyles.bg} ${avatarStyles.text} flex items-center justify-center font-semibold text-sm relative`}
                                    title={`${userName} (${userRole})`}
                                >
                                    {initials}
                                    {/* Role indicator dot */}
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-white border border-border-light flex items-center justify-center">
                                        {roleIcon}
                                    </div>
                                </div>
                                <div className="hidden sm:block">
                                    <p className="text-sm font-medium text-text-primary">{userName}</p>
                                    <p className="text-xs text-text-secondary capitalize">{userRole}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
            </div>
        </div>
    );
}