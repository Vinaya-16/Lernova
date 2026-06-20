import { useState } from "react";
import { Search, MoreVertical } from "lucide-react";
import { Card, Badge } from "../../components/ui";
import { students } from "../../mockData/lmsData";

export default function ManageStudents() {
    const [query, setQuery] = useState("");
    const filtered = students.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()));

    return (
        <div className="space-y-4">
            <div className="relative max-w-sm">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search students..."
                    className="w-full h-11 rounded-input border border-border-light pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
            </div>

            <Card className="overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[640px]">
                    <thead>
                        <tr className="text-caption text-text-secondary border-b border-border-light">
                            <th className="py-3 pr-4">Name</th>
                            <th className="py-3 pr-4">Email</th>
                            <th className="py-3 pr-4">Courses Enrolled</th>
                            <th className="py-3 pr-4">Joined</th>
                            <th className="py-3 pr-4">Status</th>
                            <th className="py-3 pr-4"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((s) => (
                            <tr key={s.id} className="border-b border-border-light last:border-0">
                                <td className="py-3 pr-4 text-text-primary">{s.name}</td>
                                <td className="py-3 pr-4 text-text-secondary">{s.email}</td>
                                <td className="py-3 pr-4 text-text-secondary">{s.coursesEnrolled}</td>
                                <td className="py-3 pr-4 text-text-secondary">{s.joined}</td>
                                <td className="py-3 pr-4">
                                    <Badge tone={s.status === "Active" ? "success" : "warning"}>{s.status}</Badge>
                                </td>
                                <td className="py-3 pr-4 text-text-secondary"><MoreVertical size={16} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}
