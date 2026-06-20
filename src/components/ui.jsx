// ── Shared LMS design-system components ────────────────────────────────────
// Reused across Student / Instructor / Admin panels to keep the UI
// consistent with the Skillio-inspired purple/pink design system.

export function Card({ children, className = "" }) {
    return (
        <div
            className={`bg-surface rounded-card shadow-card border border-border-light p-5 sm:p-6 ${className}`}
        >
            {children}
        </div>
    );
}

export function StatCard({ icon: Icon, label, value, sub, accent = "primary" }) {
    const accents = {
        primary: "bg-active-bg text-primary",
        success: "bg-green-50 text-success",
        warning: "bg-amber-50 text-warning",
        info: "bg-blue-50 text-info",
        secondary: "bg-pink-50 text-secondary",
    };
    return (
        <Card className="flex items-center gap-4">
            {Icon && (
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${accents[accent]}`}>
                    <Icon size={22} />
                </div>
            )}
            <div className="min-w-0">
                <p className="text-caption text-text-secondary truncate">{label}</p>
                <p className="text-h3 text-text-primary leading-tight">{value}</p>
                {sub && <p className="text-caption text-text-secondary mt-0.5">{sub}</p>}
            </div>
        </Card>
    );
}

export function Button({ children, onClick, variant = "primary", type = "button", full, className = "", disabled }) {
    const base = "h-11 px-5 rounded-btn font-semibold text-sm inline-flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed";
    const variants = {
        primary: "bg-primary-gradient text-white shadow-soft hover:opacity-90",
        outline: "border border-primary text-primary hover:bg-active-bg",
        ghost: "text-text-secondary hover:bg-active-bg hover:text-primary",
        danger: "bg-red-50 text-red-600 hover:bg-red-100",
        subtle: "bg-active-bg text-primary hover:bg-purple-100",
    };
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${base} ${variants[variant]} ${full ? "w-full" : ""} ${className}`}
        >
            {children}
        </button>
    );
}

export function Badge({ children, tone = "primary" }) {
    const tones = {
        primary: "bg-active-bg text-primary",
        success: "bg-green-50 text-success",
        warning: "bg-amber-50 text-warning",
        info: "bg-blue-50 text-info",
        secondary: "bg-pink-50 text-secondary",
        neutral: "bg-gray-100 text-text-secondary",
    };
    return (
        <span className={`px-2.5 py-1 rounded-full text-caption font-semibold ${tones[tone]}`}>
            {children}
        </span>
    );
}

export function Input({ label, value, onChange, type = "text", placeholder, required, as, rows = 3, children }) {
    const cls = "w-full h-12 rounded-input border border-border-light px-4 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition";
    return (
        <label className="block mb-4">
            {label && <span className="block text-caption font-semibold text-text-secondary mb-1.5">{label}</span>}
            {as === "select" ? (
                <select value={value} onChange={onChange} required={required} className={cls}>
                    {children}
                </select>
            ) : as === "textarea" ? (
                <textarea
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    rows={rows}
                    className="w-full rounded-input border border-border-light px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition resize-none"
                />
            ) : (
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    className={cls}
                />
            )}
        </label>
    );
}

export function ProgressBar({ value, tone = "primary" }) {
    const tones = {
        primary: "bg-primary-gradient",
        success: "bg-success",
        info: "bg-info",
        warning: "bg-warning",
    };
    return (
        <div className="w-full h-2 rounded-full bg-active-bg overflow-hidden">
            <div className={`h-full rounded-full ${tones[tone]}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
        </div>
    );
}

export function PageHeader({ title, sub, action }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
                <h1 className="text-h2 text-text-primary">{title}</h1>
                {sub && <p className="text-body text-text-secondary mt-1">{sub}</p>}
            </div>
            {action}
        </div>
    );
}

export function EmptyState({ icon: Icon, title, sub }) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-16 px-4">
            {Icon && (
                <div className="w-14 h-14 rounded-2xl bg-active-bg text-primary flex items-center justify-center mb-4">
                    <Icon size={26} />
                </div>
            )}
            <p className="text-h3 text-text-primary">{title}</p>
            {sub && <p className="text-body text-text-secondary mt-1 max-w-sm">{sub}</p>}
        </div>
    );
}

export function Avatar({ name = "U", size = 36 }) {
    const initial = name.trim().charAt(0).toUpperCase();
    return (
        <div
            style={{ width: size, height: size }}
            className="rounded-full bg-primary-gradient text-white flex items-center justify-center font-bold shrink-0"
        >
            {initial}
        </div>
    );
}
