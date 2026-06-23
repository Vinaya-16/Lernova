import { useState, useEffect } from "react";
import { Users, BookOpen, ClipboardCheck, TrendingUp, Star } from "lucide-react";
import { Card, StatCard } from "../../components/ui";
import { adminService } from "../../services/adminService";

// ── Skeleton placeholder ──────────────────────────────────────────────────────
function SkeletonBlock({ className = "" }) {
    return (
        <div
            className={`animate-pulse rounded-xl bg-surface-secondary ${className}`}
        />
    );
}

function OverviewSkeleton() {
    return (
        <div className="space-y-6">
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <SkeletonBlock key={i} className="h-24" />
                ))}
            </div>
            {/* Chart + top instructors */}
            <div className="grid lg:grid-cols-3 gap-6">
                <SkeletonBlock className="lg:col-span-2 h-64" />
                <SkeletonBlock className="h-64" />
            </div>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Overview() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const fetchStats = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await adminService.getDashboardStats();
                if (!cancelled) {
                    setStats(res.data);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.response?.data?.message || "Failed to load dashboard stats.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchStats();
        return () => { cancelled = true; };
    }, []);

    if (loading) return <OverviewSkeleton />;

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center space-y-2">
                    <p className="text-body text-error font-semibold">⚠ Error loading dashboard</p>
                    <p className="text-caption text-text-secondary">{error}</p>
                    <button
                        className="mt-3 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
                        onClick={() => window.location.reload()}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const {
        totalUsers,
        totalCourses,
        activeEnrollments,
        completionRate,
        monthlyGrowth,
        topInstructors,
    } = stats;

    const max = Math.max(...monthlyGrowth.map((m) => m.users), 1);

    return (
        <div className="space-y-6">
            {/* ── Stat Cards ──────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={Users}
                    label="Total Users"
                    value={totalUsers.toLocaleString()}
                    accent="primary"
                />
                <StatCard
                    icon={BookOpen}
                    label="Total Courses"
                    value={totalCourses.toLocaleString()}
                    accent="info"
                />
                <StatCard
                    icon={ClipboardCheck}
                    label="Active Enrollments"
                    value={activeEnrollments.toLocaleString()}
                    accent="success"
                />
                <StatCard
                    icon={TrendingUp}
                    label="Completion Statistics"
                    value={`${completionRate}%`}
                    accent="warning"
                />
            </div>

            {/* ── Chart + Top Instructors ──────────────────────────────────── */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Monthly Enrollment Growth Chart */}
                <Card className="lg:col-span-2">
                    <h3 className="text-h3 text-text-primary mb-6">
                        Monthly Enrollment Growth
                    </h3>
                    {monthlyGrowth.every((m) => m.users === 0) ? (
                        <div className="flex items-center justify-center h-48 text-caption text-text-secondary">
                            No enrollment data yet.
                        </div>
                    ) : (
                        <div className="flex items-end gap-4 h-48">
                            {monthlyGrowth.map((m) => (
                                <div
                                    key={m.month}
                                    className="flex-1 flex flex-col items-center justify-end gap-2"
                                >
                                    <span className="text-caption text-text-secondary font-medium">
                                        {m.users}
                                    </span>
                                    <div
                                        className="w-full rounded-t-xl bg-primary-gradient transition-all duration-700"
                                        style={{ height: `${(m.users / max) * 100}%`, minHeight: m.users > 0 ? "6px" : "0" }}
                                    />
                                    <span className="text-caption text-text-secondary">
                                        {m.month}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Top Instructors */}
                <Card>
                    <h3 className="text-h3 text-text-primary mb-4">Top Instructors</h3>
                    {topInstructors.length === 0 ? (
                        <p className="text-caption text-text-secondary">
                            No instructor ratings yet.
                        </p>
                    ) : (
                        <ul className="space-y-4">
                            {topInstructors.map((instructor, idx) => (
                                <li
                                    key={`${instructor.name}-${idx}`}
                                    className="flex items-center justify-between"
                                >
                                    <div>
                                        <p className="text-body text-text-primary font-medium">
                                            {instructor.name}
                                        </p>
                                        <p className="text-caption text-text-secondary">
                                            {instructor.students.toLocaleString()} students
                                        </p>
                                    </div>
                                    <span className="flex items-center gap-1 text-caption text-warning font-semibold">
                                        <Star size={13} className="fill-warning" />
                                        {instructor.rating.toFixed(1)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            </div>
        </div>
    );
}
