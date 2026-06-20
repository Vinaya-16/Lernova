import { TrendingUp, Users, Award, Clock } from "lucide-react";
import { Card, StatCard } from "../../components/ui";
import { platformStats } from "../../mockData/lmsData";

export default function LearningAnalytics() {
    const max = Math.max(...platformStats.monthlyGrowth.map((m) => m.users));
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={TrendingUp} label="Completion Rate" value={`${platformStats.completionRate}%`} accent="success" />
                <StatCard icon={Users} label="Active Learners" value={platformStats.activeEnrollments.toLocaleString()} accent="primary" />
                <StatCard icon={Award} label="Certificates Issued" value="1,204" accent="secondary" />
                <StatCard icon={Clock} label="Avg. Time on Platform" value="4.2h/wk" accent="info" />
            </div>
            <Card>
                <h3 className="text-h3 text-text-primary mb-6">User Growth Trend</h3>
                <div className="flex items-end gap-4 h-48">
                    {platformStats.monthlyGrowth.map((m) => (
                        <div key={m.month} className="flex-1 flex flex-col items-center justify-end gap-2">
                            <div className="w-full rounded-t-xl bg-primary-gradient" style={{ height: `${(m.users / max) * 100}%` }} />
                            <span className="text-caption text-text-secondary">{m.month}</span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
