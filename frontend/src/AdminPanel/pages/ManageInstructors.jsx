import { Card, Badge, Button } from "../../components/ui";
import { instructors } from "../../mockData/lmsData";

export default function ManageInstructors() {
    return (
        <Card className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[640px]">
                <thead>
                    <tr className="text-caption text-text-secondary border-b border-border-light">
                        <th className="py-3 pr-4">Name</th>
                        <th className="py-3 pr-4">Email</th>
                        <th className="py-3 pr-4">Courses</th>
                        <th className="py-3 pr-4">Students</th>
                        <th className="py-3 pr-4">Status</th>
                        <th className="py-3 pr-4"></th>
                    </tr>
                </thead>
                <tbody>
                    {instructors.map((i) => (
                        <tr key={i.id} className="border-b border-border-light last:border-0">
                            <td className="py-3 pr-4 text-text-primary">{i.name}</td>
                            <td className="py-3 pr-4 text-text-secondary">{i.email}</td>
                            <td className="py-3 pr-4 text-text-secondary">{i.courses}</td>
                            <td className="py-3 pr-4 text-text-secondary">{i.students.toLocaleString()}</td>
                            <td className="py-3 pr-4">
                                <Badge tone={i.status === "Approved" ? "success" : "warning"}>{i.status}</Badge>
                            </td>
                            <td className="py-3 pr-4">
                                {i.status === "Pending" && <Button variant="outline" className="h-8 px-3 text-xs">Approve</Button>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Card>
    );
}
