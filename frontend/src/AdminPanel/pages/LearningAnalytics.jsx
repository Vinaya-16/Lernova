import { useState, useEffect, useCallback } from "react";
import { TrendingUp, Users, Award, Clock } from "lucide-react";
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

function AnalyticsSkeleton() {
    return (
        <div className="space-y-6">
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <SkeletonBlock key={i} className="h-24" />
                ))}
            </div>
            {/* Chart */}
            <SkeletonBlock className="h-64 w-full" />
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function LearningAnalytics() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAnalytics = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await adminService.getLearningAnalytics();
            setAnalytics(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load learning analytics.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    if (loading) return <AnalyticsSkeleton />;

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center space-y-2">
                    <p className="text-body text-error font-semibold">⚠ Error loading analytics</p>
                    <p className="text-caption text-text-secondary">{error}</p>
                    <button
                        className="mt-3 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
                        onClick={fetchAnalytics}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const {
        completionRate = 0,
        activeLearners = 0,
        certificatesIssued = 0,
        avgTimeOnPlatform = "0h/wk",
        monthlyGrowth = []
    } = analytics || {};

    const maxGrowth = monthlyGrowth.length > 0 ? Math.max(...monthlyGrowth.map((m) => m.users)) : 1;
    const max = maxGrowth > 0 ? maxGrowth : 1;

    return (
        <div className="space-y-6">
            {/* ── Stat Cards ──────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={TrendingUp}
                    label="Completion Rate"
                    value={`${completionRate}%`}
                    accent="success"
                />
                <StatCard
                    icon={Users}
                    label="Active Learners"
                    value={activeLearners.toLocaleString()}
                    accent="primary"
                />
                <StatCard
                    icon={Award}
                    label="Certificates Issued"
                    value={certificatesIssued.toLocaleString()}
                    accent="secondary"
                />
                <StatCard
                    icon={Clock}
                    label="Avg. Time on Platform"
                    value={avgTimeOnPlatform}
                    accent="info"
                />
            </div>

            {/* ── User Growth Trend Chart ──────────────────────────────────── */}
            <Card>
                <h3 className="text-h3 text-text-primary mb-6">User Growth Trend (Last 6 Months)</h3>
                {monthlyGrowth.every((m) => m.users === 0) ? (
                    <div className="flex items-center justify-center h-48 text-caption text-text-secondary">
                        No registrations recorded in the last 6 months.
                    </div>
                ) : (
                    <div className="flex items-end gap-4 h-48 px-2 sm:px-6">
                        {monthlyGrowth.map((m) => (
                            <div key={m.month} className="flex-1 flex flex-col items-center justify-end gap-2">
                                <span className="text-caption text-text-secondary font-medium">
                                    {m.users}
                                </span>
                                <div
                                    className="w-full rounded-t-xl bg-primary-gradient transition-all duration-700"
                                    style={{
                                        height: `${(m.users / max) * 100}%`,
                                        minHeight: m.users > 0 ? "6px" : "0"
                                    }}
                                />
                                <span className="text-caption text-text-secondary">{m.month}</span>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}
