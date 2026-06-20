import { Users, BookOpen, ClipboardCheck, TrendingUp, Star } from "lucide-react";
import { Card, StatCard } from "../../components/ui";
import { platformStats } from "../../mockData/lmsData";

export default function Overview() {
    const max = Math.max(...platformStats.monthlyGrowth.map((m) => m.users));

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Users} label="Total Users" value={platformStats.totalUsers.toLocaleString()} accent="primary" />
                <StatCard icon={BookOpen} label="Total Courses" value={platformStats.totalCourses} accent="info" />
                <StatCard icon={ClipboardCheck} label="Active Enrollments" value={platformStats.activeEnrollments.toLocaleString()} accent="success" />
                <StatCard icon={TrendingUp} label="Completion Statistics" value={`${platformStats.completionRate}%`} accent="warning" />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <h3 className="text-h3 text-text-primary mb-6">Platform Growth Metrics</h3>
                    <div className="flex items-end gap-4 h-48">
                        {platformStats.monthlyGrowth.map((m) => (
                            <div key={m.month} className="flex-1 flex flex-col items-center justify-end gap-2">
                                <div
                                    className="w-full rounded-t-xl bg-primary-gradient"
                                    style={{ height: `${(m.users / max) * 100}%` }}
                                />
                                <span className="text-caption text-text-secondary">{m.month}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card>
                    <h3 className="text-h3 text-text-primary mb-4">Top Instructors</h3>
                    <ul className="space-y-4">
                        {platformStats.topInstructors.map((i) => (
                            <li key={i.name} className="flex items-center justify-between">
                                <div>
                                    <p className="text-body text-text-primary">{i.name}</p>
                                    <p className="text-caption text-text-secondary">{i.students.toLocaleString()} students</p>
                                </div>
                                <span className="flex items-center gap-1 text-caption text-warning font-semibold">
                                    <Star size={13} className="fill-warning" /> {i.rating}
                                </span>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>
        </div>
    );
}
