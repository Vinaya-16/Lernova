import { useState, useEffect, useCallback } from "react";
import { Search, Star, Users, CreditCard, Gift, TrendingUp, BookOpen } from "lucide-react";
import { Card, StatCard, Badge, ProgressBar, PageHeader, EmptyState } from "../../components/ui";
import { adminService } from "../../services/adminService";

// ── Skeleton placeholder ──────────────────────────────────────────────────────
function SkeletonBlock({ className = "" }) {
    return (
        <div
            className={`animate-pulse rounded-xl bg-surface-secondary ${className}`}
        />
    );
}

function ReportSkeleton() {
    return (
        <div className="space-y-6">
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <SkeletonBlock key={i} className="h-24" />
                ))}
            </div>
            {/* Chart + table */}
            <div className="space-y-6">
                <SkeletonBlock className="h-64 w-full" />
                <SkeletonBlock className="h-96 w-full" />
            </div>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function EnrollmentReports() {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState("");
    const [search, setSearch] = useState(""); // debounced

    // ── Debounce search input ──────────────────────────────────────────────
    useEffect(() => {
        const t = setTimeout(() => setSearch(query), 350);
        return () => clearTimeout(t);
    }, [query]);

    const fetchReport = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await adminService.getEnrollmentReport();
            setReport(res);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load enrollment reports.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    if (loading) return <ReportSkeleton />;

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center space-y-2">
                    <p className="text-body text-error font-semibold">⚠ Error loading report</p>
                    <p className="text-caption text-text-secondary">{error}</p>
                    <button
                        className="mt-3 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
                        onClick={fetchReport}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const { summary, courses = [] } = report || {
        summary: { totalEnrollments: 0, paidEnrollments: 0, freeEnrollments: 0, avgCompletionRate: 0 },
        courses: []
    };

    // Filter courses based on search
    const filteredCourses = courses.filter((c) => {
        const term = search.toLowerCase();
        return (
            c.title.toLowerCase().includes(term) ||
            c.category.toLowerCase().includes(term) ||
            c.instructorName.toLowerCase().includes(term)
        );
    });

    // Top 10 courses for the bar chart (pre-sorted from backend by totalEnrolled)
    const topCourses = courses.slice(0, 10).filter(c => c.totalEnrolled > 0);
    const maxEnrollment = topCourses.length > 0 ? Math.max(...topCourses.map(c => c.totalEnrolled)) : 1;

    const formatCurrency = (val) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    return (
        <div className="space-y-6">
            

            {/* ── Stat Cards ──────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={Users}
                    label="Total Enrollments"
                    value={summary.totalEnrollments.toLocaleString()}
                    accent="primary"
                />
                <StatCard
                    icon={CreditCard}
                    label="Paid Enrollments"
                    value={summary.paidEnrollments.toLocaleString()}
                    accent="success"
                />
                <StatCard
                    icon={Gift}
                    label="Free Enrollments"
                    value={summary.freeEnrollments.toLocaleString()}
                    accent="info"
                />
                <StatCard
                    icon={TrendingUp}
                    label="Avg. Completion Rate"
                    value={`${summary.avgCompletionRate}%`}
                    accent="warning"
                />
            </div>

            {/* ── Visual Bar Chart / Leaderboard ────────────────────────────── */}
            {topCourses.length > 0 && (
                <Card>
                    <h3 className="text-h3 text-text-primary mb-6">Top Enrolled Courses (Leaderboard)</h3>
                    <div className="space-y-5">
                        {topCourses.map((c, index) => {
                            const pct = (c.totalEnrolled / maxEnrollment) * 100;
                            return (
                                <div key={c._id} className="space-y-1.5">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="font-semibold text-text-secondary w-5">#{index + 1}</span>
                                            <span className="text-text-primary font-medium truncate">{c.title}</span>
                                        </div>
                                        <span className="text-caption text-text-secondary font-medium shrink-0">
                                            {c.totalEnrolled.toLocaleString()} enrolled
                                        </span>
                                    </div>
                                    <div className="w-full h-7 rounded-lg bg-surface-secondary overflow-hidden relative flex items-center px-3">
                                        <div
                                            className="absolute left-0 top-0 h-full bg-primary-gradient rounded-lg transition-all duration-700"
                                            style={{ width: `${pct}%` }}
                                        />
                                        <span className={`relative z-10 text-xs font-semibold ${pct > 25 ? "text-white" : "text-text-primary"}`}>
                                            {pct.toFixed(0)}% of peak
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            )}

            {/* ── Detailed Breakdown Table ─────────────────────────────────── */}
            <div className="space-y-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="relative max-w-sm w-full">
                        <Search
                            size={16}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
                        />
                        <input
                            id="course-search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search courses, instructors or categories…"
                            className="w-full h-11 rounded-input border border-border-light pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                        />
                    </div>
                    <span className="text-caption text-text-secondary shrink-0">
                        Showing {filteredCourses.length} of {courses.length} course{courses.length !== 1 ? "s" : ""}
                    </span>
                </div>

                <Card className="overflow-x-auto">
                    <table className="w-full text-left text-sm min-w-[800px]">
                        <thead>
                            <tr className="text-caption text-text-secondary border-b border-border-light border-solid">
                                <th className="py-3 pr-4 font-medium">Course Title</th>
                                <th className="py-3 pr-4 font-medium">Instructor</th>
                                <th className="py-3 pr-4 font-medium">Category</th>
                                <th className="py-3 pr-4 font-medium text-right">Enrolled</th>
                                <th className="py-3 pr-4 font-medium text-right">Completed</th>
                                <th className="py-3 pr-4 font-medium">Completion %</th>
                                <th className="py-3 pr-4 font-medium">Avg Rating</th>
                                <th className="py-3 pr-4 font-medium text-right">Revenue</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCourses.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-12">
                                        <EmptyState
                                            icon={BookOpen}
                                            title="No Courses Found"
                                            sub={search ? `No results matched your search "${search}"` : "No approved courses available."}
                                        />
                                    </td>
                                </tr>
                            ) : (
                                filteredCourses.map((c) => (
                                    <tr
                                        key={c._id}
                                        className="border-b border-border-light border-solid last:border-0 hover:bg-surface-secondary/40 transition-colors"
                                    >
                                        <td className="py-3 pr-4 text-text-primary font-medium max-w-xs truncate">
                                            {c.title}
                                        </td>
                                        <td className="py-3 pr-4 text-text-secondary">
                                            {c.instructorName}
                                        </td>
                                        <td className="py-3 pr-4">
                                            <Badge tone="neutral">{c.category}</Badge>
                                        </td>
                                        <td className="py-3 pr-4 text-right text-text-primary font-medium">
                                            {c.totalEnrolled.toLocaleString()}
                                        </td>
                                        <td className="py-3 pr-4 text-right text-text-secondary">
                                            {c.completed.toLocaleString()}
                                        </td>
                                        <td className="py-3 pr-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-text-primary font-medium w-10 shrink-0">
                                                    {c.completionRate}%
                                                </span>
                                                <div className="w-16 hidden sm:block">
                                                    <ProgressBar value={c.completionRate} tone="success" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 pr-4">
                                            {c.reviewCount > 0 ? (
                                                <span className="flex items-center gap-1 text-text-primary font-medium">
                                                    <Star size={14} className="fill-amber-400 text-amber-400 shrink-0" />
                                                    {c.avgRating.toFixed(1)}
                                                    <span className="text-caption text-text-secondary font-normal">
                                                        ({c.reviewCount})
                                                    </span>
                                                </span>
                                            ) : (
                                                <span className="text-caption text-text-secondary">—</span>
                                            )}
                                        </td>
                                        <td className="py-3 pr-4 text-right text-text-primary font-semibold">
                                            {formatCurrency(c.revenue)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </Card>
            </div>
        </div>
    );
}
