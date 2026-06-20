import { useEffect, useState } from "react";
import { Card, Badge, Button } from "../../components/ui";
import { instructorService } from "../../services/instructorService";

export default function ManageInstructors() {
    const [instructors, setInstructors] = useState([]);

    useEffect(() => {
        fetchInstructors();
    }, []);

    const fetchInstructors = async () => {
        try {
            const response = await instructorService.getInstructors();
            setInstructors(response.instructors || []);
        } catch (error) {
            console.error("Failed to fetch instructors:", error);
        }
    };

    const approveInstructor = async (id) => {
        try {
            await instructorService.approveInstructor(id);

            setInstructors((prev) =>
                prev.map((inst) =>
                    inst._id === id
                        ? { ...inst, status: "approved" }
                        : inst
                )
            );
        } catch (error) {
            console.error("Approval failed:", error);
        }
    };

    const updateInstructorStatus = async (id, status) => {
        try {
            await instructorService.updateInstructorStatus(id, status);

            setInstructors((prev) =>
                prev.map((inst) =>
                    inst._id === id
                        ? { ...inst, status }
                        : inst
                )
            );
        } catch (error) {
            console.error("Status update failed:", error);
        }
    };

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
                        <th className="py-3 pr-4">Action</th>
                    </tr>
                </thead>

                <tbody>
                    {instructors.map((i) => (
                        <tr
                            key={i._id}
                            className="border-b border-border-light last:border-0"
                        >
                            <td className="py-3 pr-4 text-text-primary">
                                {i.name}
                            </td>

                            <td className="py-3 pr-4 text-text-secondary">
                                {i.email}
                            </td>

                            <td className="py-3 pr-4 text-text-secondary">
                                {i.courses || 0}
                            </td>

                            <td className="py-3 pr-4 text-text-secondary">
                                {(i.students || 0).toLocaleString()}
                            </td>

                            <td className="py-3 pr-4">
                                <Badge
                                    tone={
                                        i.status === "approved"
                                            ? "success"
                                            : i.status === "rejected"
                                                ? "danger"
                                                : "warning"
                                    }
                                >
                                    {i.status}
                                </Badge>
                            </td>

                            <td className="py-3 pr-4">
                                <div className="flex gap-2">
                                    {i.status !== "approved" && (
                                        <Button
                                            variant="outline"
                                            className="h-8 px-3 text-xs"
                                            onClick={() =>
                                                updateInstructorStatus(i._id, "approved")
                                            }
                                        >
                                            Approve
                                        </Button>
                                    )}

                                    {i.status !== "rejected" && (
                                        <Button
                                            variant="destructive"
                                            className="h-8 px-3 text-xs"
                                            onClick={() =>
                                                updateInstructorStatus(i._id, "rejected")
                                            }
                                        >
                                            Reject
                                        </Button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Card>
    );
}